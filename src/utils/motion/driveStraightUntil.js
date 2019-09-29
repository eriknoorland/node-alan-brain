/**
 * Drive straight until the given condition is resolved
 * @param {Number} speed
 * @param {Object} main
 * @param {Function} condition
 * @return {Promise}
 */
const driveStraightUntil = (speed, main, condition) => {
  main.moveForward(speed);

  return condition();
};

module.exports = driveStraightUntil;
