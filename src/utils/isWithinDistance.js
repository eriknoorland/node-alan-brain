/**
 * Resolves the straight driving promise when within the set wall distance
 * @param {int} allowedDistance
 * @param {Function} resolve
 */
const isWithinDistance = (lidar, allowedDistance, checkAngle, resolve) => {
  lidar.on('data', ({ quality, angle, distance }) => {
    if (quality > 10 && Math.floor(angle) === checkAngle) {
      if (distance < allowedDistance) {
        resolve();
      }
    }
  });
};

module.exports = isWithinDistance;
