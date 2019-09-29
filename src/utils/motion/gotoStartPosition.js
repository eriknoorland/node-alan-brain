const { speed } = require('../../config');

/**
 *
 * @param {Object} main
 * @param {Number} distanceFromCenter [-x / x]
 * @return {Promise}
 */
module.exports = async (main, distanceFromCenter) => {
  const angle1 = distanceFromCenter < 0 ? -90 : 90;
  const angle2 = angle1 * -1;

  if (!distanceFromCenter) {
    return Promise.resolve();
  }

  await main.rotate(speed.rotate.slow, angle1);
  await main.stop(1);
  await main.moveForward(speed.straight.slow, distanceFromCenter);
  await main.stop(1);
  await main.rotate(speed.rotate.slow, angle2);
  await main.stop(1);

  return Promise.resolve();
};
