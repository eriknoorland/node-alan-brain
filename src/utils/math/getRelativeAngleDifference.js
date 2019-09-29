/**
 * Returns a signed difference between the given angles
 * @param {Number} target
 * @param {Number} current
 * @return {Number}
 */
const getRelativeAngleDifference = (target, current) => (
  ((target - current + (360 + 180)) % 360) - 180
);

module.exports = getRelativeAngleDifference;
