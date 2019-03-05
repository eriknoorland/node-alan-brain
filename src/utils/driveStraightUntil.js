/**
 * Drive straight
 * @param {Object} motors
 * @param {Function} checkCondition
 * @return {Promise}
 */
const driveStraightUntil = (motors, checkCondition) => {
  return new Promise((resolve) => {
    motors.forward();
    checkCondition(resolve);
  });
};

module.exports = driveStraightUntil;
