const config = require('../config');
const rotate = require('../utils/motion/rotate');
// const solveStartVector = require('../utils/solveStartVector');
const driveStraightUntil = require('../utils/motion/driveStraightUntil');
const isWithinDistance = require('../utils/sensor/lidar/isWithinDistance');

/**
 * BackAndForth
 * @param {Object} options
 * @return {Object}
 */
module.exports = ({ logger, controllers, sensors }) => {
  const { obstacles, speed } = config;
  const { main } = controllers;
  const { lidar } = sensors;

  /**
   * Constructor
   */
  function constructor() {
    logger.log('constructor', 'backAndForth');
  }

  /**
   * Start
   */
  async function start() {
    logger.log('start', 'backAndForth');

    const straightFastUntil = isWithinDistance.bind(null, lidar, obstacles.wall.far, 0);
    const straightSlowUntil = isWithinDistance.bind(null, lidar, obstacles.wall.close, 0);

    // await solveStartVector(lidar, main);
    await driveStraightUntil(speed.straight.fast, main, straightFastUntil);
    await driveStraightUntil(speed.straight.slow, main, straightSlowUntil);
    await main.stop();
    await rotate(main, -180);
    await driveStraightUntil(speed.straight.fast, main, straightFastUntil);
    await driveStraightUntil(speed.straight.slow, main, straightSlowUntil);
    await main.stop();

    missionComplete();
  }

  /**
   * Stop
   */
  function stop() {
    logger.log('stop', 'backAndForth');
    main.stop(1);
  }

  /**
   * Mission complete
   */
  function missionComplete() {
    logger.log('mission complete', 'backAndForth');
    stop();
  }

  constructor();

  return {
    start,
    stop,
  };
};
