/**
 * cans
 * @param {Object} options
 * @return {Object}
 */
module.exports = ({ logger }) => {
  /**
   * Constructor
   */
  function constructor() {
    logger.log('constructor', 'cans');

    // set pixy in right mode (s1)
  }

  /**
   * Start
   */
  function start() {

  }

  /**
   * Stop
   */
  function stop() {

  }

  constructor();

  return {
    start,
    stop,
  };
};
