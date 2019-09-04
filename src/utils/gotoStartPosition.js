/**
 * 
 * @param {Object} main
 * @param {String} sideFromCenter
 * @param {Number} distanceFromCenter
 * @return {Promise}
 */
module.exports = ({ speed, timeout }) => {
  return (main, sideFromCenter, distanceFromCenter) => {
    return Promise.resolve();
    
    const rotateTo = sideFromCenter === 'left' ? 'rotateLeft' : 'rotateRight';
    const rotateBack = sideFromCenter === 'left' ? 'rotateRight' : 'rotateLeft';
    const hardStop = main.stop.bind(null, 1);
    const delay = pause.bind(null, timeout.pause);

    if (!distanceFromCenter) {
      return Promise.resolve();
    }

    // FIXME do an s-shape
    return new Promise((resolve) => {
      main[rotateTo](speed.rotate.slow, 90)
        .then(hardStop)
        .then(delay)
        .then(main.moveForward.bind(null, speed.straight.slow, distanceFromCenter))
        .then(hardStop)
        .then(delay)
        .then(main[rotateBack].bind(null, speed.rotate.slow, 90))
        .then(hardStop)
        .then(resolve);
    });
  };
};
