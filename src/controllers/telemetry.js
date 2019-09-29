const normalizeAngle = require('../utils/sensor/lidar/normalizeAngle');

/**
 * Telemetry
 * @param {Object} config
 * @return {Object}
 */
module.exports = (socket, config, { sensors }) => {
  const { lidar, camera, main } = sensors;

  let lidarData = {};
  let cameraData = {};
  let imuData = {};
  let tickData = {};
  let batteryData = {};
  let lastTimestamp = new Date();
  let fps = {};

  /**
   * Constructor
   */
  function constructor() {
    setInterval(setFps, config.loopTime);
    setInterval(emit, 100);

    if (lidar) {
      lidar.on('data', onLidarData);
    }

    if (camera) {
      camera.on('stateChange', (data) => { cameraData = data; });
      camera.on('line', (data) => { cameraData = data; });
    }

    if (main) {
      main.on('imu', ({ heading }) => { imuData = { heading }; });
      main.on('ticks', ({ right }) => { tickData = { right }; });
      main.on('battery', ({ voltage }) => { batteryData = { voltage }; });
    }
  }

  /**
   * Emit
   */
  function emit() {
    socket.emit('data', {
      lidar: lidarData,
      camera: cameraData,
      imu: imuData,
      ticks: tickData,
      battery: batteryData,
      fps,
    });

    lidarData = {};
    cameraData = {};
  }

  /**
   * Lidar data event handler
   * @param {Object} data
   */
  function onLidarData({ angle, distance }) {
    const index = normalizeAngle(Math.round(angle));

    lidarData[index] = distance;
  }

  /**
   * Sets the fps
   */
  function setFps() {
    const currentTimestamp = new Date();

    fps = {
      target: 1000 / config.loopTime,
      actual: 1000 / (currentTimestamp - lastTimestamp),
    };

    lastTimestamp = currentTimestamp;
  }

  constructor();

  return {};
};
