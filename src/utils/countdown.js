/**
 * Countdown a second at a time until we hit 0
 * @param {int} count
 * @param {Function} log
 * @return {Promise}
 */
const countdown = (count, log) => {
  let remainingCount = count;
  let interval;

  log(`countdown ${remainingCount / 1000}`, 'app', 'yellow');

  return new Promise((resolve) => {
    interval = setInterval(() => {
      remainingCount -= 1000;
      log(`countdown ${remainingCount / 1000}`, 'app', 'yellow');

      if (remainingCount <= 0) {
        clearInterval(interval);
        return resolve();
      }
    }, 1000);
  });
};

module.exports = countdown;
