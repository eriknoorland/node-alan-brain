const normalizeAngle = require('../utils/normalizeAngle');

/**
 * Telemetry
 * @param {Object} config
 * @return {Object}
 */
module.exports = (socket, config) => {
  return ({ sensors }) => {
    const { encoders, lidar, imu } = sensors;

    let lidarData = {};
    let imuData = {};
    let lastTimestamp = new Date();
    let emitInterval;
    let fps = {};

    /**
     * Constructor
     */
    function constructor() {
      fpsInterval = setInterval(setFps, config.loopTime);
      emitInterval = setInterval(emit, 100);

      if (lidar) {
        lidar.on('data', onLidarData);
      }

      if (imu) {
        imu.on('data', onIMUData);
      }
    }

    /**
     * Emit
     */
    function emit() {
      socket.emit('data', {
        fps: fps,
        lidar: lidarData,
        imu: imuData,
      });

      lidarData = {};
    }

    /**
     * Lidar data event handler
     * @param {Object} data
     */
    function onLidarData({ quality, angle, distance }) {
      if (quality > 10) {
        const index = normalizeAngle(Math.round(angle));

        lidarData[index] = distance;
      }
    }

    /**
     * IMU data event handler
     * @param {Object} data
     */
    function onIMUData(data) {
      imuData = data;
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
};
