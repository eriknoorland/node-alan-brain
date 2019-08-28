const averageMeasurements = require('./averageMeasurements');
const scan = require('./scan');

const scanDuration = 2000;
const scanRotationOffset = 45;

/**
 * Resolve the angle from the given measurements
 * @param {Object} measurements
 * @return {Promise}
 */
const decideAngle = (measurements) => {
  let angle = 0 + scanRotationOffset;
  let direction = 'Right';

  // TODO decide the angle
  console.log(measurements);

  if (angle > 180) {
    angle = 180 - (angle - 180);
    direction = 'Left';
  }

  return Promise.resolve({ angle, direction });
};

/**
 * Rotate
 * @param {Object} main
 * @param {int} angle
 * @param {String} direction
 * @param {Object} measurements
 * @return {Promise}
 */
const rotate = (main, angle, direction, measurements = {}) => {
  return new Promise((resolve) => {
    main[`rotate${direction}`](10, angle)
      .then(main.stop.bind(null, 1))
      .then(() => resolve(measurements));
  });
};

/**
 * Solve start vector
 * @param {Object} lidar
 * @param {Object} main
 * @return {Promise}
 */
const solveStartVector = (lidar, main) => {
  return new Promise((resolve) => {
    resolve();
    return;
    
    scan(lidar, scanDuration, 0, {})
      .then(rotate.bind(null, main, scanRotationOffset, 'Right'))
      .then(scan.bind(null, lidar, scanDuration, scanRotationOffset))
      .then(rotate.bind(null, main, scanRotationOffset * 2, 'Left'))
      .then(scan.bind(null, lidar, scanDuration, -scanRotationOffset))
      .then(averageMeasurements)
      .then(decideAngle)
      .then(({ angle, direction }) => rotate(main, angle, direction))
      .then(resolve);
  });
};

module.exports = solveStartVector;
