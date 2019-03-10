const normalizeAngle = require('./normalizeAngle');

/**
 * Scan
 * @param {Object} lidar
 * @param {int} duration
 * @param {int} offset
 * @param {Object} acc
 * @return {Promise}
 */
const scan = (lidar, duration, offset = 0, acc = {}) => {
  return new Promise((resolve) => {
    let takeReadings = true;

    lidar.on('data', ({ quality, angle, distance }) => {
      if (takeReadings && quality > 10) {
        const index = normalizeAngle(Math.round(angle) + offset);

        if (!acc[index]) {
          acc[index] = [];
        }

        acc[index].push(distance);
      }
    });

    setTimeout(() => {
      takeReadings = false;
      resolve(acc);
    }, duration);
  });
};

module.exports = scan;
