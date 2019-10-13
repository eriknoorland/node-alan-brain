const assert = require('assert');
const normalizeAngle = require('../../../../src/utils/sensor/lidar/normalizeAngle');

describe('utils/sensor/lidar', function() {
  describe('#normalizeAngle', function() {
    it('should return an angle between 0 and 359', function() {
      const expected = 359;
      const actual = normalizeAngle(-1);

      assert.equal(actual, expected);
    });

    it('should return an angle between 0 and 359', function() {
      const expected = 180;
      const actual = normalizeAngle(180);

      assert.equal(actual, expected);
    });

    it('should return an angle between 0 and 359', function() {
      const expected = 10;
      const actual = normalizeAngle(370);

      assert.equal(actual, expected);
    });
  });
});
