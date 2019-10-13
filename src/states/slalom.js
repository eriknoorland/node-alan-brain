/**
 * slalom
 * @param {Object} options
 * @return {Object}
 */
module.exports = ({ logger }) => {
  /**
   * Constructor
   */
  function constructor() {
    logger.log('constructor', 'slalom');
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
