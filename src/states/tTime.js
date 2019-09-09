const solveStartVector = require('../utils/solveStartVector');
const driveStraightUntil = require('../utils/driveStraightUntil');
const isWithinDistance = require('../utils/isWithinDistance');
const isAtNumTicks = require('../utils/isAtNumTicks');
const pause = require('../utils/pause');

/**
 * tTime
 * @param {Object} options
 * @return {Object}
 */
module.exports = (config, log) => {
  return (options) => {
    const { distance, speed } = config;
    const { controllers, sensors } = options;
    const { main } = controllers;
    const { encoders, lidar } = sensors;

    let rightEncoderCountTemp
    let rightEncoderCount = 0;

    /**
     * Constructor
     */
    function constructor() {
      log('constructor', 'tTime');
    }

    /**
     * Start
     */
    function start() {
      log('start', 'tTime');
      
      const driveTillWallFastCondition = isWithinDistance.bind(null, lidar, distance.front.wall.far, 0);
      const driveTillWallFast = driveStraightUntil.bind(null, speed.straight.fast, main, driveTillWallFastCondition);
      
      const driveTillWallSlowCondition = isWithinDistance.bind(null, lidar, distance.front.wall.close, 0);
      const driveTillWallSlow = driveStraightUntil.bind(null, speed.straight.slow, main, driveTillWallSlowCondition);
      
      solveStartVector(lidar, main)
        .then(main.enableTicks)
        .then(countTicks)
        .then(driveTillWallFast)
        .then(driveTillWallSlow)
        .then(main.stop)
        .then(saveCountedTicks)
        .then(pause.bind(null, config.timeout.pause))
        .then(main.rotateLeft.bind(null, speed.rotate.fast, 180))
        .then(main.stop.bind(null, 1))
        .then(pause.bind(null, config.timeout.pause))
        .then(driveTillNumTicks.bind(null, 0.5))
        .then(main.stop)
        .then(pause.bind(null, config.timeout.pause))
        .then(main.rotateRight.bind(null, speed.rotate.fast, 90))
        .then(main.stop.bind(null, 1))
        .then(countTicks)
        .then(pause.bind(null, config.timeout.pause))
        .then(driveTillWallFast)
        .then(driveTillWallSlow)
        .then(main.stop)
        .then(pause.bind(null, config.timeout.pause))
        .then(saveCountedTicks)
        .then(main.rotateLeft.bind(null, speed.rotate.fast, 180))
        .then(main.stop.bind(null, 1))
        .then(pause.bind(null, config.timeout.pause))
        .then(driveTillNumTicks.bind(null, 1))
        .then(main.stop)
        .then(pause.bind(null, config.timeout.pause))
        .then(main.rotateRight.bind(null, speed.rotate.fast, 90))
        .then(main.stop.bind(null, 1))
        .then(pause.bind(null, config.timeout.pause))
        .then(driveTillWallFast)
        .then(driveTillWallSlow)
        .then(main.stop)
        .then(main.disableTicks)
        .then(missionComplete);
    }

    /**
     * Stop
     */
    function stop() {
      log('stop', 'tTime');

      main.stop(1);
      
      rightEncoderCount = 0;
      rightEncoderCountTemp = 0;
    }

    /**
     * 
     * @param {Number} multiplier
     * @return {Promise}
     */
    function driveTillNumTicks(multiplier) {
      const target = rightEncoderCount * multiplier;

      return driveStraightUntil(speed.straight.fast, main, isAtNumTicks.bind(null, main, target));
    }

    /**
     * 
     * @return {Promise}
     */
    function countTicks() {
      rightEncoderCountTemp = 0;

      main.on('ticks', onTicksData);

      return Promise.resolve();
    }

    /**
     * 
     * @return {Promise}
     */
    function saveCountedTicks() {
      main.off('ticks', onTicksData);
      rightEncoderCount = rightEncoderCountTemp;

      return Promise.resolve();
    }

    /**
     * Ticks data event handler
     * @param {Object} data
     */
    function onTicksData({ right }) {
      rightEncoderCountTemp += right;
    }

    /**
     * Mission complete
     */
    function missionComplete() {
      log('mission complete', 'tTime');
      stop();
    }

    constructor();

    return {
      start,
      stop,
    };
  };
};
