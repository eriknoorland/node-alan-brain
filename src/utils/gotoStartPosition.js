/**
 * 
 * @param {Object} main
 * @param {String} direction
 * @param {Number} distanceFromCenter
 * @return {Promise}
 */
module.exports = (config) => {
  return (main, direction, distanceFromCenter) => {
    const { speed, timeout } = config;
    const rotateLeft = main.rotateLeft.bind(null, speed.rotate.slow, 90);
    const rotateRight = main.rotateRight.bind(null, speed.rotate.slow, 90);
    const hardStop = main.stop.bind(null, 1);
    const delay = pause.bind(null, timeout.pause);

    return new Promise((resolve) => {
      rotateRight()
        .then(hardStop)
        .then(delay)
        .then(main.moveForward.bind(null, speed.straight.slow, distanceFromCenter))
        .then(hardStop)
        .then(delay)
        .then(rotateLeft)
        .then(hardStop)
        .then(resolve);
    });
};
