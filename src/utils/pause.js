/**
 * Pause
 * @param {int} timeout
 * @return {Promise}
 */
const pause = (timeout) => new Promise((resolve) => {
  setTimeout(resolve, timeout);
});

module.exports = pause;
