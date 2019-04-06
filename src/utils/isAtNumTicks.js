let leftEncoderCountTemp;

/**
 * Resolves the straight driving promise when the target nuber of ticks is reached
 * @param {Array} encoders
 * @param {Number} numTargetTicks
 * @param {Function} resolve
 */
const isAtNumTicks = (encoders, numTargetTicks, resolve) => {
  leftEncoderCountTemp = 0;
  encoders[0].on('tick', onEncoderTick.bind(null, encoders, numTargetTicks, resolve));
};

/**
 * Encoder tick event handler
 * @param {Array} encoders
 * @param {Number} numTargetTicks
 * @param {Function} resolve
 */
function onEncoderTick(encoders, numTargetTicks, resolve) {
  leftEncoderCountTemp++;

  if (leftEncoderCountTemp >= numTargetTicks) {
    encoders[0].removeListener('tick', onEncoderTick.bind(null, numTargetTicks, resolve));
    resolve();
  }
}

module.exports = isAtNumTicks;
