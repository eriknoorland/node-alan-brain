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
    const frontWallDistance = 200; // mm

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
      solveStartVector()
        .then(driveStraightUntil)
        .then(stop)
        .then(pause)
        .then(uTurn)
        .then(stop)
        .then(pause)
        .then(driveStraightUntil)
        .then(stop)
        .then(missionComplete);
    }

    /**
     * Loop
     */
    function loop() {
    }

    /**
     * Solve start vector
     * @return {Promise}
     */
    function solveStartVector() {
      log('solveStartVector', 'backAndForth');

      return new Promise((resolve) => {
        resolve();
      });
    }

    /**
     * Drive staright
     * @return {Promise}
     */
    function driveStraightUntil() {
      log('driveStraightUntil', 'backAndForth');

      return new Promise((resolve) => {
        motors.forward(30);

        lidar.on('data', (data) => {
          isWithinWallDistance(data, resolve);
        });
      });
    }

    /**
     * Resolves the straight driving promise when within the set wall distance
     * @param {Object} data
     * @param {Function} resolve
     */
    function isWithinWallDistance({ quality, angle, distance }, resolve) {
      if (quality > 10 && Math.floor(angle) === 0) {
        if (distance < frontWallDistance) {
          log('distance < frontWallDistance', 'backAndForth');

          resolve();
        }
      }
    }

    /**
     * Rotate 180 degrees
     * @return {Promise}
     */
    function uTurn() {
      log('u-turn', 'backAndForth');

      return motors.rotate(180, 30, 'left');
    }

    /**
     * Stop
     * @return {Promise}
     */
    function stop() {
      log('stop', 'backAndForth');

      return motors.stop();
    }

    /**
     * Pause
     * @return {Promise}
     */
    function pause() {
      log('pause', 'backAndForth');

      return new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
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
      loop,
    };
  };
};
