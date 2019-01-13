/**
 * backAndForth
 * @return {Object}
 */
const backAndForth = (log, options) => {

  /**
   * Constructor
   */
  function constructor() {
    log('constructor', 'backAndForth');
  }

  /**
   * Start
   */
  function start() {

  }

  /**
   * Loop
   */
  function loop() {
    // check start vector
    // drive straight (odometry, distance sensor(s)) until ...
    // stop x cm before end wall
    // turn 180 degrees (odometry)
    // drive straight (odometry, distance sensor(s)) until ...
    // stop x cm before end wall
  }

  constructor();

  return {
    start,
    loop,
  };
};

module.exports = backAndForth;
