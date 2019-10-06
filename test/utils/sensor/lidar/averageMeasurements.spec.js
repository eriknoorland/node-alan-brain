const assert = require('assert');
const averageMeasurements = require('../../../../src/utils/sensor/lidar/averageMeasurements');

describe('utils/sensor/lidar', function() {
  describe('#averageMeasurements', function() {
    it('should return the average value of the sum of the array', async function() {
      const expected = { '0': 20 };
      const actual = await averageMeasurements({ '0': [10, 20, 30] });

      assert.deepStrictEqual(actual, expected);
    });

    it('should return the average value of the sum of the array', async function() {
      const expected = { '0': 10 };
      const actual = await averageMeasurements({ '0': [10, 10, 10] });

      assert.deepStrictEqual(actual, expected);
    });
  });
});
