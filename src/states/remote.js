/**
 * Remote
 * @param {Object} options
 * @return {Object}
 */
module.exports = (EventEmitter, log, debounce) => {
  return ({ controllers, sensors, socket }) => {
    const { motors/*, buzzer*/ } = controllers;
    const { encoders, lidar } = sensors;

    /**
     * Constructor
     */
    function constructor() {
      log('constructor', 'remote');
    }

    /**
     * Start
     */
    function start() {
      log('start', 'remote');

      socket.on('remote.forward', forward);
      socket.on('remote.reverse', reverse);
      socket.on('remote.stop', stopMotors);
      socket.on('remote.rotateLeft', rotateLeft);
      socket.on('remote.rotateRight', rotateRight);
    }

    /**
     * Start
     */
    function stop() {
      log('stop', 'remote');

      socket.removeListener('remote.forward', forward);
      socket.removeListener('remote.reverse', reverse);
      socket.removeListener('remote.stop', stopMotors);
      socket.removeListener('remote.rotateLeft', rotateLeft);
      socket.removeListener('remote.rotateRight', rotateRight);
    }

    function forward() {
      log('forward', 'remote');
      motors.forward();
    }

    function reverse() {
      log('reverse', 'remote');
      motors.reverse();
    }

    function stopMotors() {
      log('stop motors', 'remote');
      motors.stop();
    }

    function rotateLeft() {
      log('rotateLeft', 'remote');
      
      motors.rotate(90, 'left')
        .then(motors.stop);
    }

    function rotateRight() {
      log('rotateRight', 'remote');

      motors.rotate(90, 'right')
        .then(motors.stop);
    }

    constructor();

    return {
      start,
      stop,
    };
  };
};
