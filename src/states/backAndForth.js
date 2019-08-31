const solveStartVector = require('../utils/solveStartVector');
const driveStraightUntil = require('../utils/driveStraightUntil');
const isWithinDistance = require('../utils/isWithinDistance');
const pause = require('../utils/pause');

/**
 * BackAndForth
 * @param {Object} options
 * @return {Object}
 */
module.exports = (config, log) => {
  return (options) => {
    const { distance, speed, timeout } = config;
    const { controllers, sensors } = options;
    const { main } = controllers;
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
      
      const driveStraightFastCondition = isWithinDistance.bind(null, lidar, distance.front.wall.far, 0);
      const driveStraightFast = driveStraightUntil.bind(null, speed.straight.fast, main, driveStraightFastCondition);
      
      const driveStraightSlowCondition = isWithinDistance.bind(null, lidar, distance.front.wall.close, 0);
      const driveStraightSlow = driveStraightUntil.bind(null, speed.straight.slow, main, driveStraightSlowCondition);
      
      solveStartVector(lidar, main)
        .then(pause.bind(null, timeout.pause))
        .then(driveStraightFast)
        .then(driveStraightSlow)
        .then(main.stop)
        .then(pause.bind(null, timeout.pause))
        .then(main.rotateLeft.bind(null, speed.rotate.fast, 180))
        .then(main.stop.bind(null, 1))
        .then(pause.bind(null, timeout.pause))
        .then(driveStraightFast)
        .then(driveStraightSlow)
        .then(main.stop)
        .then(missionComplete);
    }

    /**
     * Stop
     */
    function stop() {
      log('stop', 'backAndForth');
      main.stop(1);
    }

    /**
     * Mission complete
     */
    function missionComplete() {
      log('mission complete', 'backAndForth');
      main.stop(1);
    }

    constructor();

    return {
      start,
      stop,
    };
  };
};
