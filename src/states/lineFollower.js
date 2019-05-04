/**
 * lineFollower
 * @param {Object} options
 * @return {Object}
 */
module.exports = (config, log) => {
  return ({ controllers, sensors }) => {
    const { motors } = controllers;
    const { camera } = sensors;
    const startDelay = 1500;
    const Kp = 4;

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
      camera.on('data', onCameraData);
      camera.setState('line')
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
      motors.stop();
      camera.setState('idle');
    }

    /**
     * Mission complete
     */
    function missionComplete() {
      log('mission complete', 'lineFollower');
      stop();
    }

    /**
     * Camera data event handler
     * @param {Object} data - { index, flags, x0, y0, x1, y1 }
     */
    function onCameraData(data) {
      if (data.code === 200) {
        centerX = data.frameWidth * 0.5;
        return;
      }

      const { x0, x1 } = data;
      const error0 = (x0 - centerX);
      const error1 = (x1 - centerX);
      const error = error0 + error1;
      const direction = 'forward';
      const baseSpeed = 200;
      const leftSpeed = baseSpeed + (error * Kp);
      const rightSpeed = baseSpeed - (error * Kp);
      
      if (isRunning) {
        motors.drive(
          { direction, speed: leftSpeed},
          { direction, speed: rightSpeed},
        );
      }

      if (heartbeat) {
        clearTimeout(heartbeat);
      }

      heartbeat = setTimeout(missionComplete, 500);
    }

    constructor();

    return {
      start,
      stop,
    };
  };
};
