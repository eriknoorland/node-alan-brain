const assert = require('assert');
const getLongestDistance = require('../../../../src/utils/sensor/lidar/getLongestDistance');

describe('utils/sensor/lidar', function() {
  describe('#getLongestDistance', function() {
    it('should return the longest distance in an array of distance objects', function() {
      const expected = { angle: 3, distance: 40 };
      const actual = getLongestDistance([
        { angle: 0, distance: 10 },
        { angle: 1, distance: 20 },
        { angle: 2, distance: 30 },
        { angle: 3, distance: 40 },
      ]);

      assert.deepStrictEqual(actual, expected);
    });

    it('should return the longest distance in an array of distance objects', function() {
      const expected = { angle: 2, distance: 40 };
      const actual = getLongestDistance([
        { angle: 0, distance: 20 },
        { angle: 1, distance: 30 },
        { angle: 2, distance: 40 },
        { angle: 3, distance: 10 },
        { angle: 4, distance: 20 },
        { angle: 5, distance: 30 },
      ]);

      assert.deepStrictEqual(actual, expected);
    });
  });
});
