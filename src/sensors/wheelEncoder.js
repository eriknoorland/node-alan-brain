/**
 * WheelEncoder
 * @param {Object} options
 * @return {Object}
 */
const wheelEncoder = ({ encoderA, encoderB }) => {
  /**
   * Constructor
   */
  function constructor() {
    encoderA.on('interrupt', console.log);
    encoderB.on('interrupt', console.log);
  }

  constructor();

  return {};
};

module.exports = wheelEncoder;
