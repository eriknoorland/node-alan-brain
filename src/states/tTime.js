const config = require('../config');
const rotate = require('../utils/motion/rotate');
const solveStartVector = require('../utils/solveStartVector');
const gotoStartPosition = require('../utils/motion/gotoStartPosition');
const isAtNumTicks = require('../utils/motion/isAtNumTicks');
const driveStraightUntil = require('../utils/motion/driveStraightUntil');
const isWithinDistance = require('../utils/sensor/lidar/isWithinDistance');

/**
 * tTime
 * @param {Object} options
 * @return {Object}
 */
module.exports = ({ logger, controllers, sensors }) => {
  const { obstacles, speed } = config;
  const { main } = controllers;
  const { lidar } = sensors;

  let encoderCountTemp;

  /**
   * Constructor
   */
  function constructor() {
    logger.log('constructor', 'tTime');
  }

  /**
   * Start
   */
  async function start() {
    logger.log('start', 'tTime');

    const driveUntillWallFast = isWithinDistance.bind(null, lidar, obstacles.wall.far, 0);
    const driveUntillWallSlow = isWithinDistance.bind(null, lidar, obstacles.wall.close, 0);
    let numTicks = 0;

    await solveStartVector(lidar, main);
    await gotoStartPosition(lidar, main);
    await main.enableTicks();
    await countTicks();
    await driveStraightUntil(speed.straight.fast, main, driveUntillWallFast);
    await driveStraightUntil(speed.straight.slow, main, driveUntillWallSlow);
    await main.stop();
    numTicks = await getCountedTicks();
    await rotate(main, -180);
    await main.stop(1);
    await driveUntillNumTicks(numTicks, 0.5);
    await main.stop();
    await rotate(main, 90);
    await main.stop(1);
    await countTicks();
    await driveStraightUntil(speed.straight.fast, main, driveUntillWallFast);
    await driveStraightUntil(speed.straight.slow, main, driveUntillWallSlow);
    await main.stop();
    numTicks = await getCountedTicks();
    await rotate(main, -180);
    await main.stop(1);
    await driveUntillNumTicks(numTicks, 1);
    await main.stop();
    await rotate(main, 90);
    await main.stop(1);
    await driveStraightUntil(speed.straight.fast, main, driveUntillWallFast);
    await driveStraightUntil(speed.straight.slow, main, driveUntillWallSlow);
    await main.stop();
    await main.disableTicks();

    missionComplete();
  }

  /**
   * Stop
   */
  function stop() {
    logger.log('stop', 'tTime');
    main.stop(1);
    encoderCountTemp = 0;
  }

  /**
   *
   * @param {Number} numTicks
   * @param {Number} multiplier
   * @return {Promise}
   */
  function driveUntillNumTicks(numTicks, multiplier) {
    const target = numTicks * multiplier;

    return driveStraightUntil(speed.straight.fast, main, isAtNumTicks.bind(null, main, target));
  }

  /**
   * Starts counting encoder ticks
   * @return {Promise}
   */
  function countTicks() {
    encoderCountTemp = 0;
    main.on('ticks', onTicksData);

    return Promise.resolve();
  }

  /**
   * Resolves the number of counted ticks
   * @return {Promise}
   */
  function getCountedTicks() {
    main.off('ticks', onTicksData);

    return Promise.resolve(encoderCountTemp);
  }

  /**
   * Ticks data event handler
   * @param {Object} data
   */
  function onTicksData({ right }) {
    encoderCountTemp += right;
  }

  /**
   * Mission complete
   */
  function missionComplete() {
    logger.log('mission complete', 'tTime');
    stop();
  }

  constructor();

  return {
    start,
    stop,
  };
};
