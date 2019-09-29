const config = require('../config');
const rotate = require('../utils/motion/rotate');
// const solveStartVector = require('../utils/solveStartVector');
// const gotoStartPosition = require('../utils/gotoStartPosition');
const driveStraightUntil = require('../utils/motion/driveStraightUntil');
const isWithinDistance = require('../utils/sensor/lidar/isWithinDistance');
const getAngleDistance = require('../utils/sensor/lidar/getAngleDistance');

/**
 * backAndForthSuperSlalom
 * @param {Object} options
 * @return {Object}
 */
module.exports = ({ logger, controllers, sensors }) => {
  const { robot, speed, obstacles } = config;
  const { main } = controllers;
  const { lidar } = sensors;
  const lidarData = {};

  /**
   * Constructor
   */
  function constructor() {
    logger.log('constructor', 'backAndForthSuperSlalom');
    lidar.on('data', onLidarData);
  }

  /**
   * Start
   */
  async function start() {
    const driveToEndCondition = isWithinDistance.bind(null, lidar, obstacles.wall.close, 0);
    const crossingDistance = Math.floor(robot.diameter + (obstacles.can.diameter * 2));

    // await solveStartVector(lidar, main);
    // await gotoStartPosition(main, robot.diameter);
    await slalom('Left');
    await slalom('Right');
    await driveStraightUntil(speed.straight.medium, main, driveToEndCondition);
    await main.stop();
    await rotate(main, -90);
    await main.stop(1);
    await main.moveForward(speed.straight.slow, crossingDistance);
    await main.stop();
    await rotate(main, -90);
    await main.stop(1);
    await slalom('Left');
    await slalom('Right');
    await driveStraightUntil(speed.straight.medium, main, driveToEndCondition);
    await main.stop();

    missionComplete();
  }

  /**
   * Slalom
   * @param {String} side
   * @return {Promise}
   */
  async function slalom(side) {
    const referenceAngle = side === 'Left' ? 270 : 90;
    const referenceDistance = getAngleDistance(lidarData, referenceAngle);
    const targetGapWidth = robot.diameter + config.distance.gap.width;

    await findGap(side, targetGapWidth, referenceDistance);
    await moveThroughGap(side, targetGapWidth);

    return Promise.resolve();
  }

  /**
   * Resolves when the condition criteria are met
   * @param {Number} referenceDistance
   * @param {Number} angle
   */
  function driveToNextCan(referenceDistance, angle) {
    let canDistance = referenceDistance;

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const angleDistance = getAngleDistance(lidarData, angle);

        if (angleDistance && angleDistance < (referenceDistance - 100)) {
          canDistance = Math.min(canDistance, angleDistance);
          clearInterval(interval);
          resolve();
        }
      }, 30);
    });
  }

  /**
   * Find gap
   * @param {String} side
   * @param {Number} targetGapWidth
   * @param {Number} referenceDistance
   * @param {Number} count
   * @return {Promise}
   */
  async function findGap(side, targetGapWidth, referenceDistance, count = 0) {
    const driveSpeed = count ? speed.straight.precision : speed.straight.medium;
    const checkAngle = side === 'Left' ? 270 : 90;
    const driveStraightCondition = driveToNextCan.bind(null, referenceDistance, checkAngle);

    if (count > 0) {
      await main.moveForward(driveSpeed, Math.round(obstacles.can.diameter));
    }

    await driveStraightUntil(driveSpeed, main, driveStraightCondition);

    if (await checkForGap(side, referenceDistance)) {
      await main.stop();

      return Promise.resolve();
    }

    return findGap(side, targetGapWidth, referenceDistance, count + 1);
  }

  /**
   *
   * @param {String} side
   * @return {Promise}
   */
  async function checkForGap(side, referenceDistance) {
    const getGapSize = (data, angle, correctedAngle) => {
      const measuredS = data[angle]; // mm

      if (measuredS) {
        const referenceS = referenceDistance / Math.cos(correctedAngle * (Math.PI / 180)); // mm

        if (measuredS < (referenceS - 100)) {
          return (Math.sin(correctedAngle * (Math.PI / 180)) * measuredS) / 10; // cm
        }
      }

      return 0;
    };

    const checkAngles = (measurements) => {
      const filteredMeasurements = Object.keys(measurements)
        .filter((key) => (side === 'Left' ? key > 290 : key < 70))
        .reduce((acc, key) => {
          acc[key] = measurements[key];
          return acc;
        }, {});

      const numMeasurements = Object.keys(filteredMeasurements).length;

      if (side === 'Left') {
        for (let angle = 290; angle < 290 + numMeasurements; angle += 1) {
          const gapSize = getGapSize(filteredMeasurements, angle, angle - 270);

          if (gapSize) {
            logger.log(`it seems there is an obstacle at ${angle} degrees at a distance of ${gapSize} cm`);
            return Promise.resolve(gapSize);
          }
        }
      } else {
        for (let angle = 70; angle >= 0; angle -= 1) {
          const gapSize = getGapSize(filteredMeasurements, angle, 90 - angle);

          if (gapSize) {
            logger.log(`it seems there is an obstacle at ${angle} degrees at a distance of ${gapSize} cm`);
            return Promise.resolve(gapSize);
          }
        }
      }

      return Promise.resolve(0);
    };

    const gapSize = await checkAngles(lidarData);

    return Promise.resolve(gapSize >= robot.diameter);
  }

  /**
   * Move through gap
   * @param {String} side
   * @param {Number} targetGapWidth
   * @return {Promise}
   */
  async function moveThroughGap(side, targetGapWidth) {
    const inAngle = side === 'Left' ? -90 : 90;
    const outAngle = side === 'Left' ? 90 : -90;
    const obstacleAngle = side === 'Left' ? 270 : 90;
    const obstacleDistance = getAngleDistance(lidarData, obstacleAngle) / 10;
    const crossingDistance = Math.round((obstacleDistance * 2) + (obstacles.can.diameter / 2));
    const gapCenter = Math.ceil(Math.round(obstacles.can.diameter / 2) + (targetGapWidth / 2));

    await main.moveForward(speed.straight.precision, gapCenter);
    await main.stop(1);
    await rotate(main, inAngle);
    await main.stop(1);
    await main.moveForward(speed.straight.precision, crossingDistance);
    await main.stop(1);
    await rotate(main, outAngle);
    await main.stop(1);

    return Promise.resolve();
  }

  /**
   * Lidar data event handler
   * @param {Object} data
   */
  function onLidarData({ angle, distance }) {
    if (distance) {
      lidarData[Math.floor(angle)] = distance;
    }
  }

  /**
   * Stop
   */
  function stop() {
    logger.log('stop', 'backAndForthSuperSlalom');
    lidar.off('data', onLidarData);
    main.stop(1);
  }

  /**
   * Mission complete
   */
  function missionComplete() {
    logger.log('mission complete', 'backAndForthSuperSlalom');
    stop();
  }

  constructor();

  return {
    start,
    stop,
  };
};
