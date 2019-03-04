/**
 * Drive straight
 * @param {Object} motors
 * @param {int} speed
 * @param {Function} checkCondition
 * @return {Promise}
 */
const driveStraightUntil = (motors, speed, checkCondition) => {
  return new Promise((resolve) => {
    motors.forward(speed);
    checkCondition(resolve);
  });
};

module.exports = driveStraightUntil;
