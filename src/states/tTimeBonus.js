const config = require('../config');
const rotate = require('../utils/motion/rotate');
const deg2rad = require('../utils/math/deg2rad');
const rad2deg = require('../utils/math/rad2deg');
const getAngleDistance = require('../utils/sensor/lidar/getAngleDistance');
const getShortestDistance = require('../utils/sensor/lidar/getShortestDistance');
const driveStraightUntil = require('../utils/motion/driveStraightUntil');
const isWithinDistance = require('../utils/sensor/lidar/isWithinDistance');

/**
 * tTimeBonus
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
    logger.log('constructor', 'tTimeBonus');
    lidar.on('data', onLidarData);
  }

  /**
   * Start
   */
  async function start() {
    const driveToEndCondition = isWithinDistance.bind(null, lidar, obstacles.wall.close, 0);
    const gap = { minAngle: 0, maxAngle: 0 };
    const scanRange = 50;

    // drive into t-area
    // main.stop();

    const getScanRange = (angle) => angle >= (360 - scanRange) || angle <= scanRange;

    const scanData2Array = (acc, a) => {
      const angle = a > 180 ? (360 - a) * -1 : parseInt(a, 10);
      const distance = lidarData[a];

      acc.push({ angle, distance });
      return acc;
    };

    const measurements = Object.keys(lidarData)
      .filter(getScanRange)
      .reduce(scanData2Array, [])
      .sort((a, b) => a.angle - b.angle);

    const shortestDistance = getShortestDistance(measurements);
    const distanceToObstacleLine = shortestDistance.distance * Math.cos(deg2rad(shortestDistance.angle));
    const obstacleMeasurements = measurements.filter(({ angle, distance }) => {
      const a = angle < 0 ? (360 + angle) : angle;
      const referenceS = distanceToObstacleLine / Math.cos(deg2rad(a));

      return distance < referenceS + 50;
    });

    for (let i = 1, x = obstacleMeasurements.length; i < x; i += 1) {
      const minAngle = obstacleMeasurements[i - 1].angle;
      const maxAngle = obstacleMeasurements[i].angle;
      const angleDiff = maxAngle - minAngle;

      if (angleDiff > gap.maxAngle - gap.minAngle) {
        gap.maxAngle = maxAngle;
        gap.minAngle = minAngle;
      }
    }

    const gapAngle = Math.round((gap.minAngle + gap.maxAngle) / 2);
    const normalizedGapAngle = (360 + gapAngle) % 360;
    const sideDistanceOffset = Math.floor(gapAngle / 12) * 10;
    const sideDistance = (distanceToObstacleLine * Math.tan(deg2rad(normalizedGapAngle))) + sideDistanceOffset;
    const forwardDistance = distanceToObstacleLine - 250;
    const turnAngle = Math.ceil(rad2deg(Math.atan(sideDistance / forwardDistance)));
    const driveDistance = Math.ceil((Math.sqrt(Math.pow(forwardDistance, 2) + Math.pow(sideDistance, 2))) / 10);

    await rotate(main, turnAngle);
    await main.moveForward(speed.straight.slow, driveDistance);
    await main.stop(1);
    await rotate(main, turnAngle * -1);
    await driveStraightUntil(speed.straight.medium, main, driveToEndCondition);
    await main.stop();
    await rotate(main, 180);
    await main.moveForward(speed.straight.medium, 90);
    await main.stop();
    await main.stop(1);

    missionComplete();
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
    logger.log('stop', 'tTimeBonus');
    lidar.off('data', onLidarData);
    main.stop(1);
  }

  /**
   * Mission complete
   */
  function missionComplete() {
    logger.log('mission complete', 'tTimeBonus');
    stop();
  }

  constructor();

  return {
    start,
    stop,
  };
};
