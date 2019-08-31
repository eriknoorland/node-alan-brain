/**
 * Resolves when for the given angle the allowed distance is reacher or passed
 * @param {Object} lidar
 * @param {Number} allowedDistance
 * @param {Number} checkAngle
 * @param {Function} resolve
 */
const isWithinDistance = (lidar, allowedDistance, checkAngle, resolve) => {
  let count = 0;

  const onLidarData = ({ quality, angle, distance }) => {
    if (quality > 10 && Math.floor(angle) === checkAngle) {
      if (distance > 0 && distance <= allowedDistance) {
        count += 1;

        if (count % 3 === 0) {
          lidar.off('data', onLidarData);
          resolve();
        }
      }
    }
  };

  lidar.on('data', onLidarData);
};

module.exports = isWithinDistance;
