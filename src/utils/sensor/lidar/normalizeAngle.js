/**
 * Normalize angle
 * @param {int} angle
 * @return {int}
 */
const normalizeAngle = (angle) => {
  if (angle >= 360) {
    return angle % 360;
  }

  if (angle < 0) {
    return angle + 360;
  }

  return angle;
};

module.exports = normalizeAngle;
