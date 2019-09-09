/**
 * backAndForthSuperSlalom
 * @param {Object} options
 * @return {Object}
 */
module.exports = (config, log) => {
  const { robot, distance, speed, timeout, obstacles } = config;
  const solveStartVector = require('../utils/solveStartVector');
  const gotoStartPosition = require('../utils/gotoStartPosition')(config);
  const driveStraightUntil = require('../utils/driveStraightUntil');
  const isWithinDistance = require('../utils/isWithinDistance');

  return ({ controllers, sensors }) => {
    const { main } = controllers;
    const { lidar } = sensors;
    const targetGapWidth = robot.diameter + distance.gap.width;
    const rotateLeft = main.rotateLeft.bind(null, speed.rotate.slow, 90);
    const rotateRight = main.rotateRight.bind(null, speed.rotate.slow, 90);
    const hardStop = main.stop.bind(null, 1);
    const lidarData = {};

    /**
     * Constructor
     */
    function constructor() {
      log('constructor', 'backAndForthSuperSlalom');
      lidar.on('data', onLidarData);
    }

    /**
     * Start
     */
    function start() {
      const driveToEndCondition = isWithinDistance.bind(null, lidar, distance.front.wall.close, 0);
      const driveToEnd = driveStraightUntil.bind(null, speed.straight.slow, main, driveToEndCondition);

      solveStartVector(lidar, main)
        .then(gotoStartPosition.bind(null, main, 'Right', robot.diameter))
        .then(slalom.bind(null, 'Left'))
        .then(slalom.bind(null, 'Right'))
        .then(driveToEnd)
        .then(main.stop.bind(null))
        .then(rotateLeft)
        .then(hardStop)
        .then(main.moveForward.bind(null, speed.straight.slow, Math.floor(robot.diameter + (obstacles.can.diameter * 2))))
        .then(main.stop.bind(null))
        .then(rotateLeft)
        .then(hardStop)
        .then(slalom.bind(null, 'Left'))
        .then(slalom.bind(null, 'Right'))
        .then(driveToEnd)
        .then(main.stop.bind(null))
        .then(missionComplete);
    }

    /**
     * Slalom
     * @param {String} side
     * @return {Promise}
     */
    async function slalom(side) {
      const referenceAngle = side === 'Left' ? 270 : 90;
      const referenceDistance = getAngleDistance(lidarData, referenceAngle);

      await findGap(side, targetGapWidth, referenceDistance);
      await moveThroughGap(side, targetGapWidth);

      return Promise.resolve();
    }

    /**
     * Resolves when the condition criteria are met
     * @param {Number} referenceDistance
     * @param {Number} angle
     */
    function driveToNextCanCondition(referenceDistance, angle) {
      let canDistance = referenceDistance;

      return new Promise((resolve) => {
        const interval = setInterval(() => {
          const distance = getAngleDistance(lidarData, angle);

          if (distance && distance < (referenceDistance - 100)) {
            canDistance = Math.min(canDistance, distance);
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
      const driveStraightCondition = driveToNextCanCondition.bind(null, referenceDistance, checkAngle);

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
      const getGapSize = (data, angle, correctedAngle) =>  {
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
          .filter(key => side === 'Left' ? key > 290 : key < 70)
          .reduce((acc, key) => {
            acc[key] = measurements[key];
            return acc;
          }, {});

        if (side === 'Left') {
          for (let angle = 290, x = Object.keys(filteredMeasurements).length; angle < 290 + x; angle++) {
            const gapSize = getGapSize(filteredMeasurements, angle, angle - 270);

            if (gapSize) {
              console.log(`it seems there is an obstacle at ${angle} degrees at a distance of ${gapSize} cm`);
              return Promise.resolve(gapSize);
            }
          }
        } else {
          for (let angle = 70, x = Object.keys(filteredMeasurements).length; angle >= 0; angle--) {
            const gapSize = getGapSize(filteredMeasurements, angle, 90 - angle);

            if (gapSize) {
              console.log(`it seems there is an obstacle at ${angle} degrees at a distance of ${gapSize} cm`);
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
    function moveThroughGap(side, targetGapWidth) {
      const rotateIn = side === 'Left' ? rotateLeft : rotateRight;
      const rotateOut = side === 'Left' ? rotateRight : rotateLeft;
      const obstacleAngle = side === 'Left' ? 270 : 90;
      const obstacleDistance = getAngleDistance(lidarData, obstacleAngle);
      const crossingDistance = Math.round(((obstacleDistance / 10) * 2) + Math.round(obstacles.can.diameter / 2));
      const gapCenter = Math.ceil(Math.round(obstacles.can.diameter / 2) + (targetGapWidth / 2));

      return new Promise((resolve) => {
        main.moveForward(5, gapCenter)
          .then(hardStop)
          .then(rotateIn)
          .then(hardStop)
          .then(main.moveForward.bind(null, 5, crossingDistance))
          .then(hardStop)
          .then(rotateOut)
          .then(hardStop)
          .then(resolve);
      });
    }

    /**
     * Returns the smallest distance measured for a given angle with a given range
     * @param {Object} data
     * @param {Number} angle
     * @param {Number} range
     * @return {Promise}
     */
    function getAngleDistance(data, angle, range = 5) {
      const distances = Object.keys(lidarData)
        .filter(a => a >= angle - 5 && a <= angle + 5)
        .map(a => data[a]);

      return Math.min(...distances);
    }

    /**
     * Lidar data event handler
     * @param {Object} data
     */
    function onLidarData({ quality, angle, distance }) {
      if (distance) {
        lidarData[Math.floor(angle)] = distance;
      }
    };

    /**
     * Stop
     */
    function stop() {
      log('stop', 'backAndForthSuperSlalom');
      
      lidar.off('data', onLidarData);
      main.stop(1);
    }

    /**
     * Mission complete
     */
    function missionComplete() {
      log('mission complete', 'backAndForthSuperSlalom');
      stop();
    }

    constructor();

    return {
      start,
      stop,
    };
  };
};
