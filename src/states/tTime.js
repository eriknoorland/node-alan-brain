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
    const { controllers, sensors } = options;
    const { motors/*, buzzer*/ } = controllers;
    const { encoders, lidar } = sensors;

    let leftEncoderCountTemp = 0;
    let rightEncoderCountTemp = 0;
    let leftEncoderCount = 0;
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

      const driveTillWallCondition = isWithinDistance.bind(null, lidar, config.distance.wall, 0);
      const driveTillWall = driveStraightUntil.bind(null, motors, driveTillWallCondition);
      
      solveStartVector(lidar, motors)
        .then(countTicks)
        .then(driveTillWall)
        .then(motors.stop)
        .then(saveCountedTicks)
        .then(pause.bind(null, config.timeout.pause))
        .then(motors.rotate.bind(null, 180, 'left'))
        .then(motors.stop)
        .then(pause.bind(null, config.timeout.pause))
        .then(driveTillNumTicks.bind(null, 0.5))
        .then(motors.stop)
        .then(pause.bind(null, config.timeout.pause))
        .then(motors.rotate.bind(null, 90, 'right'))
        .then(motors.stop)
        .then(countTicks)
        .then(pause.bind(null, config.timeout.pause))
        .then(driveTillWall)
        .then(motors.stop)
        .then(pause.bind(null, config.timeout.pause))
        .then(saveCountedTicks)
        .then(motors.rotate.bind(null, 180, 'left'))
        .then(motors.stop)
        .then(pause.bind(null, config.timeout.pause))
        .then(driveTillNumTicks.bind(null, 1))
        .then(motors.stop)
        .then(pause.bind(null, config.timeout.pause))
        .then(motors.rotate.bind(null, 90, 'right'))
        .then(motors.stop)
        .then(pause.bind(null, config.timeout.pause))
        .then(driveTillWall)
        .then(motors.stop)
        .then(missionComplete);
    }

    /**
     * Stop
     */
    function stop() {
      log('stop', 'tTime');
    }

    /**
     * 
     * @param {Number} multiplier
     * @return {Promise}
     */
    function driveTillNumTicks(multiplier) {
      const target = ((leftEncoderCount + rightEncoderCount) / 2) * multiplier;

      return driveStraightUntil(motors, isAtNumTicks.bind(null, encoders, target));
    }

    /**
     * 
     * @return {Promise}
     */
    function countTicks() {
      leftEncoderCountTemp = 0;
      rightEncoderCountTemp = 0;

      encoders[0].on('tick', () => leftEncoderCountTemp++);
      encoders[1].on('tick', () => rightEncoderCountTemp++);

      return Promise.resolve();
    }

    /**
     * 
     * @return {Promise}
     */
    function saveCountedTicks() {
      leftEncoderCount = leftEncoderCountTemp;
      rightEncoderCount = rightEncoderCountTemp;

      return Promise.resolve();
    }

    /**
     * Mission complete
     */
    function missionComplete() {
      log('mission complete', 'tTime');

      leftEncoderCount = 0;
      rightEncoderCount = 0;
      leftEncoderCountTemp = 0;
      rightEncoderCountTemp = 0;
    }

    constructor();

    return {
      start,
      stop,
    };
  };
};
