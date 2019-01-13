/**
 * Button
 * @param {Object} options
 * @return {Object}
 */
module.exports = (EventEmitter, Gpio) => {
  return ({ pin }) => {
    const eventEmitter = new EventEmitter();
    const button = new Gpio(pin, {
      mode: Gpio.INPUT,
      pullUpDown: Gpio.PUD_DOWN,
      edge: Gpio.EITHER_EDGE,
    });

    /**
     * Constructor
     */
    function constructor() {
      button.on('interrupt', onButtonPress);
    }

    /**
     * Button press event handler
     * @param {int} level
     */
    function onButtonPress(level) {
      eventEmitter.emit('press');
    }

    constructor();

    return {
      on: eventEmitter.on.bind(eventEmitter),
    };
  };
};
