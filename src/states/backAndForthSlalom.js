/**
 * backAndForthSlalom
 * @param {Object} options
 * @return {Object}
 */
module.exports = ({ logger }) => {
  /**
   * Constructor
   */
  function constructor() {
    logger.log('constructor', 'backAndForthSlalom');
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
