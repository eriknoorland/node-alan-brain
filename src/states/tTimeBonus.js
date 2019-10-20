const config = require('../config');
const rotate = require('../utils/motion/rotate');
const deg2rad = require('../utils/math/deg2rad');
const rad2deg = require('../utils/math/rad2deg');
const getAngleDistance = require('../utils/sensor/lidar/getAngleDistance');

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
    const scanRange = 50;

    // drive into t-area
    // main.stop();

    const referenceDistance = getAngleDistance(lidarData, 0, 5, 'max'); // mm
    const gap = { minAngle: 0, maxAngle: 0 };
    const obstacleDistances = [];

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
      .sort((a, b) => a.angle - b.angle)
      .filter(({ angle, distance }) => {
        const measuredA = angle < 0 ? (360 + angle) : angle;

        if (distance) {
          const referenceS = referenceDistance / Math.cos(deg2rad(measuredA)); // mm

          if (distance < (referenceS - 300)) {
            obstacleDistances.push(Math.cos(deg2rad(measuredA)) * distance);
            return true;
          }
        }

        return false;
      });

    for (let i = 1, x = measurements.length; i < x; i += 1) {
      const minAngle = measurements[i - 1].angle;
      const maxAngle = measurements[i].angle;
      const angleDiff = maxAngle - minAngle;

      if (angleDiff > gap.maxAngle - gap.minAngle) {
        gap.maxAngle = maxAngle;
        gap.minAngle = minAngle;
      }
    }

    const gapAngle = Math.round((gap.minAngle + gap.maxAngle) / 2);
    const normalizedGapAngle = (360 + gapAngle) % 360;
    const obstacleDistance = (obstacleDistances.reduce((acc, distance) => acc += distance, 0) / obstacleDistances.length) / 10;

    const sideDistance = obstacleDistance * Math.tan(deg2rad(normalizedGapAngle));
    const forwardDistance = obstacleDistance - 15;
    const turnAngle = Math.round(rad2deg(Math.atan(sideDistance / forwardDistance)));

    const driveDistance = Math.round(Math.sqrt(Math.pow(forwardDistance, 2) + Math.pow(sideDistance, 2)));
    console.log('gapAngle', gapAngle, 'normalizedGapAngle', normalizedGapAngle, 'turnAngle', turnAngle, 'driveDistance', driveDistance);

    await rotate(main, turnAngle);
    await main.moveForward(speed.straight.slow, driveDistance);
    await main.stop(1);
    await rotate(main, turnAngle * -1);
    await main.moveForward(speed.straight.slow, 20);
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
    // main.stop(1);
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
