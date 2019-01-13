/**
 * 
 * @param {Number} value
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 */
const constrain = (value, min, max) => {
  return Math.min(Math.max(parseInt(value), min), max);
}

module.exports = constrain;
