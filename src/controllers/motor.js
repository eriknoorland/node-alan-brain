const constrain = require('../utils/constrain');

/**
 * Motor
 * @param {Object} options
 * @return {Object}
 */
const motor = ({ enable, in1, in2 }) => {
  /**
   * Forward
   * @param {int} speed
   */
  function forward(speed) {
    in1.digitalWrite(1);
    in2.digitalWrite(0);
    enable.pwmWrite(constrain(speed, 0, 255));
  }

  /**
   * Reverse
   * @param {int} speed
   */
  function reverse(speed) {
    in1.digitalWrite(0);
    in2.digitalWrite(1);
    enable.pwmWrite(constrain(speed, 0, 255));
  }

  /**
   * Stop
   */
  function stop() {
    enable.pwmWrite(0);
  }

  return {
    forward,
    reverse,
    stop,
  };
};

module.exports = motor;
