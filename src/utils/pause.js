/**
 * Pause
 * @param {int} timeout
 * @return {Promise}
 */
const pause = (timeout) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

module.exports = pause;
