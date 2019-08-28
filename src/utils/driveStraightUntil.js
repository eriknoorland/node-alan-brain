/**
 * Drive straight
 * @param {Number} speed
 * @param {Object} main
 * @param {Function} checkCondition
 * @return {Promise}
 */
const driveStraightUntil = (speed, main, checkCondition) => {
  return new Promise((resolve) => {
    main.moveForward(speed);
    checkCondition(resolve);
  });
};

module.exports = driveStraightUntil;
