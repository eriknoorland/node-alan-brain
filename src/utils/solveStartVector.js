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
 * @param {int} speed
 * @param {int} angle
 * @param {String} direction
 * @param {Object} measurements
 * @return {Promise}
 */
const rotate = (motors, speed, angle, direction, measurements = {}) => {
  return new Promise((resolve) => {
    motors.rotate(angle, speed, direction)
      .then(motors.stop)
      .then(() => resolve(measurements));
  });
};

/**
 * Solve start vector
 * @param {Object} lidar
 * @param {Object} motors
 * @param {int} speed
 * @return {Promise}
 */
const solveStartVector = (lidar, motors, speed) => {
  return new Promise((resolve) => {
    scan(lidar, scanDuration, 0, {})
      .then(rotate.bind(null, motors, speed, scanRotationOffset, 'right'))
      .then(scan.bind(null, lidar, scanDuration, scanRotationOffset))
      .then(rotate.bind(null, motors, speed, scanRotationOffset * 2, 'left'))
      .then(scan.bind(null, lidar, scanDuration, -scanRotationOffset))
      .then(averageMeasurements)
      .then(decideAngle)
      .then(({ angle, direction }) => rotate(motors, speed, angle, direction))
      .then(resolve);
  });
};

module.exports = solveStartVector;
