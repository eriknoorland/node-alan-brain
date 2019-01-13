/**
 * Buzzer
 * @param {Object} options
 * @return {Object}
 */
const buzzer = ({ trigger }) => {
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

module.exports = buzzer;
