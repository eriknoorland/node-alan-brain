/**
 * lineFollower
 * @param {Object} options
 * @return {Object}
 */
module.exports = (config, log) => {
  return ({ controllers, sensors }) => {
    const { motors } = controllers;
    const { camera } = sensors;

    let isRunning = false;
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
      camera.setState('line');

      setTimeout(() => {
        isRunning = true;
      }, 500);
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
     * Camera data event handler
     * @param {Object} data - { index: 153, flags: 0, x0: 44, y0: 51, x1: 49, y1: 0 }
     */
    function onCameraData(data) {
      if (data.code === 200) {
        centerX = data.frameWidth * 0.5;
        return;
      }

      const { x1 } = data;
      const error = x1 - centerX; // calculate error based on x center and x1
      const direction = 'forward';
      const baseSpeed = 200;
      const leftSpeed = baseSpeed + (error * 5);
      const rightSpeed = baseSpeed - (error * 5);

      // console.log(error);
      // p(id) calculation
      // set left / right motor speed based on pid
      // if error is bottom up
      // - if intersection - slow down for intersection
      // else reverse?
      // set motor left / right speed
      
      if (isRunning) {
        motors.drive(
          { direction, speed: leftSpeed},
          { direction, speed: rightSpeed},
        );
      }
    }

    constructor();

    return {
      start,
      stop,
    };
  };
};
