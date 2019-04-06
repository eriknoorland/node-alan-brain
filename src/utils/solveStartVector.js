const averageMeasurements = require('./averageMeasurements');
const scan = require('./scan');

const scanDuration = 2000;
const scanRotationOffset = 90;

/**
 * Resolve the angle from the given measurements
 * @param {Object} measurements
 * @return {Promise}
 */
const decideAngle = (measurements) => {
  let angle = 0 + scanRotationOffset;
  let direction = 'right';

  // TODO decide the angle
  console.log(measurements);

  if (angle > 180) {
    angle = 180 - (angle - 180);
    direction = 'left';
  }

  return Promise.resolve({ angle, direction });
};

/**
 * Rotate
 * @param {Object} motors
 * @param {int} angle
 * @param {String} direction
 * @param {Object} measurements
 * @return {Promise}
 */
const rotate = (motors, angle, direction, measurements = {}) => {
  return new Promise((resolve) => {
    motors.rotate(angle, direction)
      .then(motors.stop)
      .then(() => resolve(measurements));
  });
};

/**
 * Solve start vector
 * @param {Object} lidar
 * @param {Object} motors
 * @return {Promise}
 */
const solveStartVector = (lidar, motors) => {
  return new Promise((resolve) => {
    resolve();
    return;
    
    scan(lidar, scanDuration, 0, {})
      .then(rotate.bind(null, motors, scanRotationOffset, 'right'))
      .then(scan.bind(null, lidar, scanDuration, scanRotationOffset))
      .then(rotate.bind(null, motors, scanRotationOffset * 2, 'left'))
      .then(scan.bind(null, lidar, scanDuration, -scanRotationOffset))
      .then(averageMeasurements)
      .then(decideAngle)
      .then(({ angle, direction }) => rotate(motors, angle, direction))
      .then(resolve);
  });
};

module.exports = solveStartVector;
