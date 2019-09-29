const EventEmitter = require('events');

/**
 * Countdown a second at a time until we hit 0
 * @param {Number} count
 * @return {Object}
 */
module.exports = (count) => {
  const eventEmitter = new EventEmitter();

  /**
   * Constructor
   */
  function constructor() {
    //
  }

  /**
   * Start
   */
  function start() {
    let remainingCount = count;

    eventEmitter.emit('count', remainingCount / 1000);

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        remainingCount -= 1000;
        eventEmitter.emit('count', remainingCount / 1000);

        if (remainingCount <= 0) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });
  }

  constructor();

  return {
    start,
    on: eventEmitter.on.bind(eventEmitter),
    off: eventEmitter.off.bind(eventEmitter),
  };
};
