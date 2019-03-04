const MICROSECONDS_PER_CM = 1e6 / 34321;

/**
 * Ultrasonic
 * @param {Object} options
 * @return {Object}
 */
module.exports = (EventEmitter, Gpio) => {
  return ({ triggerPin, echoPin }) => {
    const eventEmitter = new EventEmitter();
    const trigger = new Gpio(triggerPin, { mode: Gpio.OUTPUT });
    const echo = new Gpio(echoPin, { mode: Gpio.INPUT, alert: true });
    
    /**
     * Constructor
     */
    function constructor() {
      trigger.digitalWrite(0);

      watch();

      setInterval(trigger.trigger.bind(null, 10, 1), 250);
    }

    /**
     * Watch
     */
    function watch() {
      let startTick;

      echo.on('alert', (level, tick) => {
        if (level == 1) {
          startTick = tick;
        } else {
          const endTick = tick;
          const diff = (endTick >> 0) - (startTick >> 0);
          const dist = diff / 2 / MICROSECONDS_PER_CM;

          eventEmitter.emit('data', dist);
          console.log(dist);
        }
      });
    };

    constructor();

    return {
      on: eventEmitter.on.bind(eventEmitter),
    };
  };
};
