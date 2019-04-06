/**
 * cansPickupAndReturn
 * @param {Object} options
 * @return {Object}
 */
module.exports = (config, log) => {
  return (options) => {
    /**
     * Constructor
     */
    function constructor() {
      log('constructor', 'cansPickupAndReturn');

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
};
