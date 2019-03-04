const Modes = require('../Modes');

/**
 * Remote
 * @param {Object} options
 * @return {Object}
 */
module.exports = (EventEmitter, log, debounce) => {
  return (options) => {
    const { controllers, sensors } = options;
    const { motors/*, buzzer*/ } = controllers;
    const { encoders, lidar } = sensors;
    const mode = Modes.MANUAL;
    const speed = 30;

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
    }

    /**
     * Set Socket
     * @param {Socket} socket
     */
    function setSocket(socket) {
      log('setSocket', 'remote');
      
      if (!socket) {
        return;
      }

      socket.on('forward', debounce(forward, 50));
      socket.on('reverse', debounce(reverse, 50));
      socket.on('stop', debounce(stop, 50));
      socket.on('rotateLeft', debounce(rotateLeft, 50));
      socket.on('rotateRight', debounce(rotateRight, 50));
      // socket.on('beep', buzzer.beep);
    }

    function forward() {
      log('forward', 'remote');
      
      motors.forward(speed);
    }

    function reverse() {
      log('reverse', 'remote');
      
      motors.reverse(speed);
    }

    function stop() {
      log('stop', 'remote');
      
      motors.stop();
    }

    function rotateLeft() {
      log('rotateLeft', 'remote');
      
      motors.rotate(90, speed, 'left')
        .then(motors.stop);
    }

    function rotateRight() {
      log('rotateRight', 'remote');

      motors.rotate(90, speed, 'right')
        .then(motors.stop);
    }

    constructor();

    return {
      mode,
      setSocket,
      start,
    };
  };
};
