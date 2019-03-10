/**
 * Resolves the straight driving promise when within the set wall distance
 * @param {int} allowedDistance
 * @param {Function} resolve
 */
const isWithinDistance = (lidar, allowedDistance, checkAngle, resolve) => {
  let count = 0;

  lidar.on('data', ({ quality, angle, distance }) => {
    if (quality > 10 && Math.floor(angle) === checkAngle) {
      if (distance > 0 && distance < allowedDistance) {
        count += 1;

        if (count % 3 === 0) {
          resolve();
        }
      }
    }
  });
};

module.exports = isWithinDistance;
