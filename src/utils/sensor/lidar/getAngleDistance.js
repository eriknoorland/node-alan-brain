/**
 * Returns the smallest distance measured for a given angle with a given opening range
 * @param {Object} data
 * @param {Number} angle
 * @param {Number} range
 * @return {Promise}
 */
function getAngleDistance(data, angle, range = 5) {
  const distances = Object.keys(data)
    .filter((a) => a >= angle - range && a <= angle + range)
    .map((a) => data[a]);

  return Math.min(...distances);
}

module.exports = getAngleDistance;
