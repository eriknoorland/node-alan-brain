require('dotenv').config();

const EventEmitter = require('events');
const serialport = require('serialport');
const shell = require('shelljs');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const io = require('socket.io')(http);
const rplidar = require('node-rplidar');
const pixy2 = require('node-pixy2');
const MainController = require('node-alan-main-controller');

const config = require('./config');
const log = require('./utils/log')(io);
const debounce = require('./utils/debounce');
const countdown = require('./utils/countdown')(log);
const States = require('./States')(config, log, debounce);
const telemetryController = require('./controllers/telemetry')(io, config);

const telemetryOptions = {
  sensors: {},
};

const defaultStateOptions = {
  controllers: {},
  sensors: {},
};

let mainController;
let state;

app.use(express.static(process.env.TELEMETRY_PUBLIC_FOLDER));
app.use(bodyParser.json());
app.use('/api/v1', require('./api/v1'));

/**
 * Init
 */
function init() {
  log('init');
  log('server started', 'telemetry', 'green');

  getUSBDevicePorts()
    .then(initUSBDevices)
    .then(initTelemetry)
    .then(updateStateOptions);
};

/**
 * Socket connection event handler
 * @param {socket} socket
 */
function onSocketConnection(socket) {
  log('client connected', 'telemetry', 'green');

  socket.on('disconnect', onSocketDisconnect);
  socket.on('start', onStart.bind(null, socket));
  socket.on('stop', onStop);
  socket.on('shutdown', onShutdown);
};

/**
 * Start event handler
 * @param {socket} socket
 * @param {int} stateIndex
 */
function onStart(socket, stateIndex) {
  if (stateIndex === null) {
    log('State argument required', 'error', 'red');
    return;
  }

  log(`state ${stateIndex} selected`);

  const stateOptions = Object.assign({ socket }, defaultStateOptions);
  state = States[stateIndex](stateOptions);

  log('start countdown');

  countdown(config.timeout.start)
    .then(start);
};

/**
 * Countdown complete handler 
 */
function start() {
  log('start');
  
  state.start();
};

/**
 * Stop event handler
 */
function onStop() {
  return new Promise((resolve) => {
    log('stop');

    if (state) {
      state.stop();
      state = null;
    }

    resolve();
  });
};

/**
 * Shutdown event handler
 */
function onShutdown() {
  log('shutdown', 'app', 'red');
  
  mainController.setLedColor(0, 0, 0);
  
  onStop()
    .then(() => {
      shell.exec('sudo shutdown -h now');
    });
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
      log('main controller initialized!', 'app', 'cyan');
      mainController.setLedColor(0, 255, 0);
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
      log('Lidar error', 'error', 'red');
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
      log('pixy2 initialized!', 'app', 'cyan');
    });

  return camera;
}

/**
 * 
 * @param {Object} usbPorts
 * @return {Promise}
 */
function initUSBDevices(usbPorts) {
  log('init usb devices');

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
};

/**
 * 
 * @param {Object} usbDevices
 * @return {Promise}
 */
function initTelemetry(usbDevices) {
  const { lidar, camera, mainController } = usbDevices;

  log('init sending telemetry data');

  return new Promise((resolve) => {
    telemetryOptions.sensors.lidar = lidar;
    telemetryOptions.sensors.camera = camera;
    telemetryOptions.sensors.main = mainController;

    telemetryController(telemetryOptions);
    resolve(usbDevices);
  });
};

/**
 * 
 * @param {Object} usbDevices
 * @return {Promise}
 */
function updateStateOptions(usbDevices) {
  const { lidar, camera, mainController } = usbDevices;
  
  log('update state options');

  return new Promise((resolve) => {
    defaultStateOptions.controllers.main = mainController;
    defaultStateOptions.sensors.lidar = lidar;
    defaultStateOptions.sensors.camera = camera;
  });
};

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
        }
      });
    }).then(resolve.bind(null, usbPorts));
  });
};

/**
 * Lidar health handler
 * @param {Object} health
 */
function onLidarHealth(health) {
  return new Promise((resolve, reject) => {
    if (health.status !== 0) { // 0 = good, 1 = warning, 2 = error
      log(`lidar health: ${health.status}`, 'app', 'red');
      reject();
      return;
    }

    log('lidar initialized!', 'app', 'cyan');
    resolve();
  });
};

/**
 * Socket disconnect event handler
 */
function onSocketDisconnect() {
  log('client disconnected', 'telemetry', 'yellow');
}

/**
 * Before exit event handler
 */
process.on('beforeExit', () => {
  main.stop(1);
});

io.on('connection', onSocketConnection);

// Roll out!
http.listen(3000, init);
