const averageMeasurements = require('./sensor/lidar/averageMeasurements');
const scan = require('./sensor/lidar/scan');

const scanDuration = 1000;
const scanRotationOffset = 20;

/**
 * Resolve the angle from the given measurements
 * @param {Object} measurements
 * @return {Promise}
 */
const decideAngle = (measurements) => {
  let angle = 0 + scanRotationOffset;

  if (angle > 180) {
    angle = 180 - (angle - 180); // FIXME should be a negative angle
  }

  return Promise.resolve({ angle });
};

/**
 * Rotate
 * @param {Object} main
 * @param {int} angle
 * @param {Object} measurements
 * @return {Promise}
 */
const rotate = (main, angle, measurements = {}) => new Promise((resolve) => {
  main.rotate(10, angle)
    .then(main.stop.bind(null, 1))
    .then(() => resolve(measurements));
});

/**
 * Solve start vector
 * @param {Object} lidar
 * @param {Object} main
 * @return {Promise}
 */
const solveStartVector = (lidar, main) => new Promise((resolve) => {
  scan(lidar, scanDuration, 0, {})
    .then(rotate.bind(null, main, scanRotationOffset))
    .then(scan.bind(null, lidar, scanDuration, scanRotationOffset))
    .then(rotate.bind(null, main, -(scanRotationOffset * 2)))
    .then(scan.bind(null, lidar, scanDuration, -scanRotationOffset))
    .then(averageMeasurements)
    .then(decideAngle)
    .then(({ angle }) => rotate(main, angle))
    .then(resolve);
});

module.exports = solveStartVector;
