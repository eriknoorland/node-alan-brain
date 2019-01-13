const Modes = require('../Modes');

/**
 * Remote
 * @param {Function} log
 * @param {Object} options
 * @return {Object}
 */
const remote = (log, options) => {
  const { controllers } = options;
  const { motors, buzzer } = controllers;
  const mode = Modes.MANUAL;

  /**
   * Constructor
   */
  function constructor() {
    log('constructor', 'remote');
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

    socket.on('forward', () => log('forward', 'remote'));
    socket.on('reverse', () => log('reverse', 'remote'));
    socket.on('stop', () => log('stop', 'remote'));
    socket.on('rotateLeft', () => log('rotateLeft', 'remote'));
    socket.on('rotateRight', () => log('rotateRight', 'remote'));
    socket.on('beep', () => log('beep', 'remote'));

    // socket.on('forward', motors.forward.bind(null, 150));
    // socket.on('reverse', motors.reverse.bind(null, 100));
    // socket.on('stop', motors.stop);
    // socket.on('rotateLeft', motors.rotate.bind(null, 90, 150, 'left'));
    // socket.on('rotateRight', motors.rotate.bind(null, 90, 150, 'right'));
    // socket.on('beep', buzzer.beep);
  }

  constructor();

  return {
    mode,
    setSocket,
    start: () => {},
    loop: () => {},
  };
};

module.exports = remote;
