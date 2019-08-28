/**
 * Resolves the straight driving promise when the target nuber of ticks is reached
 * @param {Array} encoders
 * @param {Number} numTargetTicks
 * @param {Function} resolve
 */
const isAtNumTicks = (main, numTargetTicks, resolve) => {
  let accTicks = 0;

  const onTicksData = ({ right }) => {
    accTicks += right;

    if (accTicks >= numTargetTicks) {
      main.off('ticks', onTicksData);
      resolve();
    }
  };

  main.on('ticks', onTicksData);
};

module.exports = isAtNumTicks;
