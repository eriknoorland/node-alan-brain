const assert = require('assert');
const getAngleDistance = require('../../../../src/utils/sensor/lidar/getAngleDistance');

describe('utils/sensor/lidar', function() {
  describe('#getAngleDistance', function() {
    it('should return the shortest distance for a given angle range', function() {
      const expected = 11;
      const actual = getAngleDistance({
        '0': 10,
        '1': 11,
        '2': 12,
        '3': 13,
        '4': 14,
        '5': 15,
        '6': 16,
        '7': 17,
      }, 3, 2);

      assert.equal(actual, expected);
    });

    it('should return the shortest distance for a given angle range', function() {
      const expected = 14;
      const actual = getAngleDistance({
        '0': 12,
        '1': 13,
        '2': 14,
        '3': 14,
        '4': 15,
        '5': 16,
        '6': 16,
        '7': 17,
        '8': 16,
        '9': 16,
        '10': 15,
        '11': 15,
        '12': 14,
      }, 7);

      assert.equal(actual, expected);
    });
  });
});
