/**
 * BackAndForth
 * @param {Object} options
 * @return {Object}
 */
module.exports = (EventEmitter, log) => {
  return (options) => {
    const eventEmitter = new EventEmitter();
    const frontWallDistance = 10; // cm
    const actions = [
      { method: solveStartVector },
      { method: driveStraightUntil, arguments: [isWithinWallDistance] },
      { method: uTurn },
      { method: driveStraightUntil, arguments: [isWithinWallDistance] },
    ];

    let action;

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
      nextAction();
    }

    /**
     * Loop
     */
    function loop() {
      if (!action) {
        eventEmitter.emit('pause');
        return;
      }

      if (action.method.apply(null, action.arguments || [])) {
        nextAction();
      }
    }

    function solveStartVector() {
      return true;
    }

    function driveStraightUntil(callback) {
      motors.forward(80);

      return callback();
    }

    function isWithinWallDistance() {
      return false; // front distance < frontWallDistance
    }

    function uTurn() {
      // motors.rotate(180, 80, 'left');
    }

    function nextAction() {
      if (!actions.length) {
        action = null;
        return;
      }

      action = actions.shift();
    }

    constructor();

    return {
      start,
      loop,
    };
  };
};
