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

      socket.on('remote.forward', debounce(forward, 50));
      socket.on('remote.reverse', debounce(reverse, 50));
      socket.on('remote.stop', debounce(stop, 50));
      socket.on('remote.rotateLeft', debounce(rotateLeft, 50));
      socket.on('remote.rotateRight', debounce(rotateRight, 50));
    }

    function forward() {
      log('forward', 'remote');
      motors.forward();
    }

    function reverse() {
      log('reverse', 'remote');
      motors.reverse();
    }

    function stop() {
      log('stop', 'remote');
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
    };
  };
};
