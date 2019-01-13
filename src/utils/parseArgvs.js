/**
 * Returns an object with the given node arguments
 * @param {Array} args
 * @return {Object}
 */
const parseArgs = args => args
  .filter((arg, index) => index > 1)
  .reduce((acc, arg) => {
    const [key, value] = arg.split('=');
    acc[key] = value;
    return acc;
  }, {});

module.exports = parseArgs;
