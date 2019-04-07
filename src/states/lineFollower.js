/**
 * lineFollower
 * @param {Object} options
 * @return {Object}
 */
module.exports = (config, log) => {
  return (options) => {
    const { controllers, sensors } = options;
    const { motors } = controllers;
    const { camera } = sensors;

    let interval;
    let vector;

    /**
     * Constructor
     */
    function constructor() {
      log('constructor', 'lineFollower');
    }

    /**
     * Start
     */
    function start() {
      camera.on('data', (data) => {
        vector = data;
      });

      camera.setState('line');

      interval = setInterval(loop, config.loopTime);
    }

    /**
     * Stop
     */
    function stop() {
      clearInterval(interval);
      camera.setState('idle');
    }

    /**
     * Loop
     */
    function loop() {
      // { index: 153, flags: 0, x0: 44, y0: 51, x1: 49, y1: 0 }
      // console.log(vector);
    }

    constructor();

    return {
      start,
      stop,
    };
  };
};
