/**
 * Buzzer
 * @param {Object} options
 * @return {Object}
 */
module.exports = (Gpio) => {
  return ({ triggerPin }) => {
    const trigger = new Gpio(triggerPin, Gpio.OUTPUT);

    /**
     * Beep
     * @param {int} duration
     */
    function beep(duration = 10) {
      trigger.digitalWrite(1);
      setTimeout(trigger.digitalWrite.bind(null, 0), duration);
    }

    return {
      beep,
    };
  };
};
