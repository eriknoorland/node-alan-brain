/**
 * Motors
 * @param {Object} options
 * @return {Object}
 */
const motors = ({ motors, encoders }) => {
  /**
   * Forward
   * @param {int} speed
   */
  function forward(speed) {
    motors[0].forward(speed);
    motors[1].forward(speed);

    // add PID controller to make sure we go straight
  }

  /**
   * Reverse
   * @param {int} speed
   */
  function reverse(speed) {
    motors[0].reverse(speed);
    motors[1].reverse(speed);

    // add PID controller to make sure we go straight
  }

  /**
   * Stop
   */
  function stop() {
    motors[0].stop();
    motors[1].stop();
  }

  /**
   * 
   * @param {int} angle
   * @param {int} speed
   * @param {String} direction
   */
  function rotate(angle, speed, direction = 'left') {
    if (direction === 'left') {
      motors[0].reverse(speed);
      motors[1].forward(speed);
    } else if (direction === 'right') {
      motors[0].forward(speed);
      motors[1].reverse(speed);
    }
  }

  return {
    forward,
    reverse,
    stop,
  };
};

module.exports = motors;
