/**
 * WheelEncoder
 * @param {Object} options
 * @return {Object}
 */
module.exports = (EventEmitter, Gpio) => {
  return ({ pinA, pinB }) => {
    const eventEmitter = new EventEmitter();
    const gpioOptions = {
      pullUpDown: Gpio.PUD_DOWN,
      edge: Gpio.EITHER_EDGE,
      mode: Gpio.INPUT,
    };

    const encoderA = new Gpio(pinA, gpioOptions);
    const encoderB = new Gpio(pinB, gpioOptions);

    /**
     * Constructor
     */
    function constructor() {
      encoderA.on('interrupt', onInterrupt);
      encoderB.on('interrupt', onInterrupt);
    }

    /**
     * Interrupt event handler
     */
    function onInterrupt() {
      eventEmitter.emit('tick');
    }

    constructor();

    return {
      on: eventEmitter.on.bind(eventEmitter),
      removeListener: eventEmitter.removeListener.bind(eventEmitter),
    };
  };
};
