const config = require('../config');
const rad2deg = require('./math/rad2deg');
const rotate = require('./motion/rotate');
const averageMeasurements = require('./sensor/lidar/averageMeasurements');
const getAngleDistance = require('./sensor/lidar/getAngleDistance');
const getLongestDistance = require('./sensor/lidar/getLongestDistance');
const getShortestDistance = require('./sensor/lidar/getShortestDistance');
const normalizeAngle = require('./sensor/lidar/normalizeAngle');
const scanObject2Array = require('./sensor/lidar/scanObject2Array');
const scan = require('./sensor/lidar/scan');

const duration = 2000;
const rotationOffset = 20;

/**
 * Resolve the angle from the given measurements
 * @param {Object} measurements
 * @return {Promise}
 */
const decideAngle = (measurements) => {
  const minValue = getShortestDistance(scanObject2Array(measurements));
  const directions = [minValue];

  for (let i = 1; i <= 3; i += 1) {
    const angle = normalizeAngle(minValue.angle + (i * 90));
    const distance = measurements[angle];

    directions.push({ angle, distance });
  }

  const direction = getLongestDistance(directions);
  let { angle } = direction;

  if (angle > 180) {
    angle = (180 - (angle - 180)) * -1;
  }

  return Promise.resolve(angle);
};

/**
 * Returns a promise when the start vector is verified
 * @return {Promise}
 */
const verifyStartVector = async (lidar, main) => {
  const forwardDistance = 25;
  let measurements = {};
  let averagedMeasurements = {};

  measurements = await scan(lidar, duration, 0, {});
  averagedMeasurements = await averageMeasurements(measurements);

  const saveRearSpace = (config.robot.diameter / 2) + 4;
  const rearDistance = getAngleDistance(averagedMeasurements, 180) / 10;
  const reverseDistance = Math.floor(rearDistance - saveRearSpace);

  if (reverseDistance > 0) {
    await main.moveBackward(config.speed.straight.precision, reverseDistance);
    await main.stop(1);
  }

  measurements = await scan(lidar, duration, 0, {});
  averagedMeasurements = await averageMeasurements(measurements);

  const sideDistanceStart = getAngleDistance(averagedMeasurements, 90);

  await main.moveForward(config.speed.straight.slow, forwardDistance);
  await main.stop(1);

  measurements = await scan(lidar, duration, 0, {});
  averagedMeasurements = await averageMeasurements(measurements);

  const sideDistanceEnd = getAngleDistance(averagedMeasurements, 90);
  const sideDifference = (sideDistanceEnd - sideDistanceStart) / 10;
  const correctionAngle = Math.round(rad2deg(Math.sin(sideDifference / forwardDistance)));

  if (correctionAngle) {
    await rotate(main, correctionAngle);
  }

  return Promise.resolve();
};

/**
 * Solve start vector
 * @param {Object} lidar
 * @param {Object} main
 * @return {Promise}
 */
const solveStartVector = async (lidar, main) => {
  let isLedOn = true;

  main.setLedColor.apply(null, config.color.orange);

  const ledInterval = setInterval(() => {
    isLedOn = !isLedOn;
    main.setLedColor.apply(null, isLedOn ? config.color.orange: [0, 0, 01]);
  }, 600);

  let measurements = {};
  let averagedMeasurements = {};

  measurements = await scan(lidar, duration, 0, measurements);
  await rotate(main, rotationOffset);
  measurements = await scan(lidar, duration, rotationOffset, measurements);
  await rotate(main, -(rotationOffset * 2));
  measurements = await scan(lidar, duration, -rotationOffset, measurements);
  await rotate(main, rotationOffset);

  averagedMeasurements = await averageMeasurements(measurements);
  const angle = await decideAngle(averagedMeasurements);

  await rotate(main, angle);
  await verifyStartVector(lidar, main);

  clearInterval(ledInterval);
  main.setLedColor.apply(null, config.color.green);

  return Promise.resolve();
};

module.exports = solveStartVector;
