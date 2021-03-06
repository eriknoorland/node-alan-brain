const normalizeAngle = require('./normalizeAngle');

/**
 * Scan accumulates lidar data for a set amount of time
 * @param {Object} lidar
 * @param {int} duration
 * @param {int} offset
 * @param {Object} acc
 * @return {Promise}
 */
const scan = (lidar, duration, offset = 0, acc = {}) => new Promise((resolve) => {
  const onLidarData = ({ angle, distance }) => {
    if (distance) {
      const index = normalizeAngle(Math.round(angle) + offset);

      if (!acc[index]) {
        acc[index] = [];
      }

      acc[index].push(distance);
    }
  };

  const onScanComplete = () => {
    lidar.off('data', onLidarData);
    resolve(acc);
  };

  lidar.on('data', onLidarData);

  setTimeout(onScanComplete, duration);
});

module.exports = scan;
