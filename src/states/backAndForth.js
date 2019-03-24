const solveStartVector = require('../utils/solveStartVector');
const driveStraightUntil = require('../utils/driveStraightUntil');
const isWithinDistance = require('../utils/isWithinDistance');
const pause = require('../utils/pause');

/**
 * BackAndForth
 * @param {Object} options
 * @return {Object}
 */
module.exports = (EventEmitter, log) => {
  return (options) => {
    const { controllers, sensors } = options;
    const { motors/*, buzzer*/ } = controllers;
    const { lidar } = sensors;
    
    /**
     * Constructor
     */
    function constructor() {
      log('constructor', 'backAndForth');
    }

    /**
     * Start
     */
    function start() {
      log('start', 'backAndForth');

      const frontWallAngle = 0;
      const frontWallDistance = 300;
      const pauseTimeout = 500;
      
      const driveStraightCondition = isWithinDistance.bind(null, lidar, frontWallDistance, frontWallAngle);
      const driveStraight = driveStraightUntil.bind(null, motors, driveStraightCondition);
      
      // solveStartVector(lidar, motors)
      //   .then(pause.bind(null, pauseTimeout))
      //   .then(driveStraight)
      driveStraight()
        .then(motors.stop)
        .then(pause.bind(null, pauseTimeout))
        .then(motors.rotate.bind(null, 180, 'left'))
        .then(motors.stop)
        .then(pause.bind(null, pauseTimeout))
        .then(driveStraight)
        .then(motors.stop)
        .then(missionComplete);
    }

    /**
     * Stop
     */
    function stop() {
      log('stop', 'backAndForth');
    }

    /**
     * Mission complete
     */
    function missionComplete() {
      log('mission complete', 'backAndForth');
    }

    constructor();

    return {
      start,
      stop,
    };
  };
};
