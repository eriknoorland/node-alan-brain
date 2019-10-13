const assert = require('assert');
const scanObject2Array = require('../../../../src/utils/sensor/lidar/scanObject2Array');

describe('utils/sensor/lidar', function() {
  describe('#scanObject2Array', function() {
    it('should return an array with scan objects (angle, distance)', function() {
      const expected = [
        { angle: 0, distance: 10 },
        { angle: 1, distance: 10 },
        { angle: 2, distance: 20 },
      ];

      const actual = scanObject2Array({
        '0': 10,
        '1': 10,
        '2': 20 ,
      });

      assert.deepStrictEqual(actual, expected);
    });
  });
});
