const assert = require('assert');
const getRelativeAngleDifference = require('../../../src/utils/math/getRelativeAngleDifference');

describe('utils/math', function() {
  describe('#getRelativeAngleDifference', function() {
    it('should return 0 when the target and current angles are the same', function() {
      const expected = 0;
      const actual = getRelativeAngleDifference(0, 0);

      assert.equal(actual, expected);
    });

    it('should return 2 when the target angle is larger by 2 than the current angle is', function() {
      const expected = 2;
      const actual = getRelativeAngleDifference(92, 90);

      assert.equal(actual, expected);
    });

    it('should return -4 when the current angle is larger by 4 than the target angle is', function() {
      const expected = -4;
      const actual = getRelativeAngleDifference(90, 94);

      assert.equal(actual, expected);
    });

    it('should return -1 when the current angle is 0 and the target angle is 359', function() {
      const expected = -1;
      const actual = getRelativeAngleDifference(359, 0);

      assert.equal(actual, expected);
    });

    it('should return 90 when the current angle is 179 and the target angle is 180', function() {
      const expected = 90;
      const actual = getRelativeAngleDifference(180, 90);

      assert.equal(actual, expected);
    });
  });
});
