/**
 * Constrains the given number between the given min and max values
 * @param {Number} value
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 */
const constrain = (value, min, max) => Math.min(Math.max(parseInt(value, 10), min), max);

module.exports = constrain;
