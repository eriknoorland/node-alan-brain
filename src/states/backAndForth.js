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
    const { encoders, lidar } = sensors;
    
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
      const frontWallAngle = 0;
      const frontWallDistance = 200;
      const pauseTimeout = 500;
      const speed = 30;
      
      const driveStraightCondition = isWithinDistance.bind(null, lidar, frontWallDistance, frontWallAngle);
      const driveStraight = driveStraightUntil.bind(null, motors, speed, driveStraightCondition);
      
      solveStartVector(lidar, motors, speed)
        .then(pause.bind(null, pauseTimeout))
        .then(driveStraight)
        .then(motors.stop)
        .then(pause.bind(null, pauseTimeout))
        .then(motors.rotate.bind(null, 180, 30, 'left'))
        .then(motors.stop)
        .then(pause.bind(null, pauseTimeout))
        .then(driveStraight)
        .then(motors.stop)
        .then(missionComplete);
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
    };
  };
};
