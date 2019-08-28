/**
 * Remote
 * @param {Object} options
 * @return {Object}
 */
module.exports = (config, log, debounce) => {
  return ({ controllers, sensors, socket }) => {
    const { main } = controllers;

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
      main.moveForward(20);
    }

    function reverse() {
      log('reverse', 'remote');
      main.moveBackward(15);
    }

    function stopMotors() {
      log('stop motors', 'remote');
      main.stop();
    }

    function rotateLeft() {
      log('rotateLeft', 'remote');
      main.rotateLeft(10, 90)
        .then(main.stop.bind(null, 1));
    }

    function rotateRight() {
      log('rotateRight', 'remote');
      main.rotateRight(10, 90)
        .then(main.stop.bind(null, 1));
    }

    constructor();

    return {
      start,
      stop,
    };
  };
};
