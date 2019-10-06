require('dotenv').config();

const serialport = require('serialport');
const shell = require('shelljs');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const socketio = require('socket.io');
const rplidar = require('node-rplidar');
const pixy2 = require('node-pixy2');
const MainController = require('node-alan-main-controller');
const config = require('./config');
const Logger = require('./utils/logger');
const countdown = require('./utils/countdown');
const States = require('./States');
const telemetryController = require('./controllers/telemetry');

const app = express();
const server = http.Server(app);
const io = socketio(server);
const logger = Logger(io);
const telemetryOptions = { sensors: {} };
const defaultStateOptions = { logger, controllers: {}, sensors: {} };
const startCountDown = countdown(config.timeout.start);

let mainController;
let state;

app.use(express.static(process.env.TELEMETRY_PUBLIC_FOLDER));
app.use(bodyParser.json());
app.use('/api/v1', require('./api/v1'));

/**
 * Init
 */
function init() {
  logger.log('initialize');
  logger.log('server started', 'telemetry', 'green');

  getUSBDevicePorts()
    .then(initUSBDevices)
    .then(initTelemetry)
    .then(updateStateOptions);
}

/**
 * Socket connection event handler
 * @param {socket} socket
 */
function onSocketConnection(socket) {
  logger.log('client connected', 'telemetry', 'green');

  socket.on('disconnect', onSocketDisconnect);
  socket.on('start', onStart.bind(null, socket));
  socket.on('stop', onStop);
  socket.on('shutdown', onShutdown);
}

/**
 * Start event handler
 * @param {socket} socket
 * @param {int} stateIndex
 */
function onStart(socket, stateIndex) {
  if (stateIndex === null) {
    logger.log('State argument required', 'error', 'red');
    return;
  }

  logger.log(`state ${stateIndex} selected`);

  const stateOptions = {
    ...defaultStateOptions,
    socket,
  };

  state = States[stateIndex](stateOptions);

  logger.log('start countdown');

  startCountDown.on('count', (count) => logger.log(`countdown ${count}`, 'app', 'yellow'));
  startCountDown.start()
    .then(start);
}

/**
 * Countdown complete handler
 */
function start() {
  logger.log('start');

  state.start();
}

/**
 * Stop event handler
 */
function onStop() {
  return new Promise((resolve) => {
    logger.log('stop');

    if (state) {
      state.stop();
      state = null;
    }

    shell.exec('touch ./src/config.js');

    resolve();
  });
}

/**
 * Shutdown event handler
 */
function onShutdown() {
  logger.log('shutdown', 'app', 'red');

  mainController.setLedColor(0, 0, 0);
  shell.exec('sudo shutdown -h now');
}

/**
 *
 * @param {String} portName
 * @return {Object}
 */
function initMainController(portName) {
  mainController = MainController(portName);

  mainController.init()
    .then(() => {
      logger.log('main controller initialized!', 'app', 'cyan');
      mainController.setLedColor.apply(null, config.color.green);
    });

  return mainController;
}

/**
 *
 * @param {String} portName
 * @return {Object}
 */
function initLidar(portName) {
  const lidar = rplidar(portName);

  lidar.init()
    .then(lidar.health)
    .then(onLidarHealth)
    .then(lidar.scan)
    .catch(() => {
      logger.log('Lidar error', 'error', 'red');
      // process.exit(1);
    });

  return lidar;
}

/**
 *
 * @param {String} portName
 * @return {Object}
 */
function initCamera(portName) {
  const camera = pixy2(portName);

  camera.init()
    .then(() => {
      logger.log('pixy2 initialized!', 'app', 'cyan');
    });

  return camera;
}

/**
 *
 * @param {Object} usbPorts
 * @return {Promise}
 */
function initUSBDevices(usbPorts) {
  logger.log('initialize usb devices');

  return new Promise((resolve) => {
    const resolveObject = {};

    if (usbPorts.mainController) {
      resolveObject.mainController = initMainController(usbPorts.mainController);
    }

    if (usbPorts.lidar) {
      resolveObject.lidar = initLidar(usbPorts.lidar);
    }

    if (usbPorts.camera) {
      resolveObject.camera = initCamera(usbPorts.camera);
    }

    resolve(resolveObject);
  });
}

/**
 *
 * @param {Object} usbDevices
 * @return {Promise}
 */
function initTelemetry(usbDevices) {
  logger.log('initialize telemetry');

  return new Promise((resolve) => {
    telemetryOptions.sensors.lidar = usbDevices.lidar;
    telemetryOptions.sensors.camera = usbDevices.camera;
    telemetryOptions.sensors.main = usbDevices.mainController;

    telemetryController(io, config, telemetryOptions);
    resolve(usbDevices);
  });
}

/**
 *
 * @param {Object} usbDevices
 * @return {Promise}
 */
function updateStateOptions(usbDevices) {
  logger.log('update state options');

  return new Promise((resolve) => {
    defaultStateOptions.controllers.main = usbDevices.mainController;
    defaultStateOptions.sensors.lidar = usbDevices.lidar;
    defaultStateOptions.sensors.camera = usbDevices.camera;

    resolve();
  });
}

/**
 * Returns an object with a USB port name for each connected device
 * @return {Promise}
 */
function getUSBDevicePorts() {
  return new Promise((resolve) => {
    const usbPorts = {};

    serialport.list((error, ports) => {
      ports.forEach(({ comName, vendorId, productId }) => {
        switch (true) {
          case vendorId === '10c4' && productId === 'ea60':
            usbPorts.lidar = comName;
            break;

          case vendorId === '2341' && productId === '0042':
            usbPorts.mainController = comName;
            break;

          case vendorId === '0403' && productId === '6001':
            usbPorts.camera = comName;
            break;

          // no default
        }
      });
    }).then(resolve.bind(null, usbPorts));
  });
}

/**
 * Lidar health handler
 * @param {Object} health
 */
function onLidarHealth(health) {
  return new Promise((resolve, reject) => {
    if (health.status !== 0) { // 0 = good, 1 = warning, 2 = error
      logger.log(`lidar health: ${health.status}`, 'app', 'red');
      reject();
      return;
    }

    logger.log('lidar initialized!', 'app', 'cyan');
    resolve();
  });
}

/**
 * Socket disconnect event handler
 */
function onSocketDisconnect() {
  logger.log('client disconnected', 'telemetry', 'yellow');
}

/**
 * Before exit event handler
 */
process.on('beforeExit', () => {
  mainController.stop(1);
});

io.on('connection', onSocketConnection);

// Roll out!
server.listen(3000, init);
