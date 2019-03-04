/**
 * Returns an object containing averaged measured angle distances
 * @param {Object} angleMeasurements
 * @return {Promise}
 */
const averageMeasurements = (angleMeasurements) => {
  return Promise.resolve(Object.keys(angleMeasurements)
    .reduce((acc, angle) => {
      const measurements = angleMeasurements[angle];
      const total = measurements.reduce((acc, value) => (acc + value), 0);
      const average = Math.floor(total / measurements.length);

      acc[angle] = average;

      return acc;
    }, {}));
};

module.exports = averageMeasurements;
