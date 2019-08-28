const constrain = require('../utils/constrain');

/**
 * lineFollower
 * @param {Object} options
 * @return {Object}
 */
module.exports = (config, log) => {
  return ({ controllers, sensors }) => {
    const { speed, pid } = config;
    const { main } = controllers;
    const { camera } = sensors;
    const startDelay = 1500;

    let isRunning = false;
    let heartbeat;
    let centerX;

    /**
     * Constructor
     */
    function constructor() {
      log('constructor', 'lineFollower');
    }

    /**
     * Start
     */
    function start() {
      camera.on('line', onLineData);
      camera.on('stateChange', onStateChangeData);
      
      camera.setState('line', { tilt: 170 })
        .then(onLineStateSet);
    }

    /**
     * Line state set event handler
     */
    function onLineStateSet() {
      setTimeout(() => isRunning = true, startDelay);
    }

    /**
     * Stop
     */
    function stop() {
      isRunning = false;
      camera.setState('idle');
      main.stop();

      setTimeout(main.stop.bind(null, 1), 1000);
    }

    /**
     * Mission complete
     */
    function missionComplete() {
      log('mission complete', 'lineFollower');
      stop();
    }

    /**
     * Camera line data event handler
     * @param {Object} data
     */
    function onLineData({ x0, x1 }) {
      const error0 = (x0 - centerX);
      const error1 = (x1 - centerX);
      const error = error0 + error1;
      const leftSpeed = constrain(Math.round(speed.lineFollowing + (error * pid.lineFollowing.Kp)), 0, 20);
      const rightSpeed = constrain(Math.round(speed.lineFollowing - (error * pid.lineFollowing.Kp)), 0, 20);

      if (isRunning) {
        main.drive(leftSpeed, rightSpeed);
      }

      if (heartbeat) {
        clearTimeout(heartbeat);
      }

      heartbeat = setTimeout(missionComplete, 500);
    }

    /**
     * Camera state change data event handler
     * @param {Object} data
     */
    function onStateChangeData({ frameWidth }) {
      centerX = frameWidth * 0.5;
    }

    constructor();

    return {
      start,
      stop,
    };
  };
};
