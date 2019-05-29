const EventEmitter = require('events');
const serialport = require('serialport');
const Gpio = require('pigpio').Gpio;
const shell = require('shelljs');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const apiV1 = require('./src/api/v1');
const config = require('./src/config');
const log = require('./src/utils/log')(io);
const debounce = require('./src/utils/debounce');
const parseArgvs = require('./src/utils/parseArgvs');
const countdown = require('./src/utils/countdown')(log);
const States = require('./src/States')(config, log, debounce);

const telemetryController = require('./src/controllers/telemetry')(io, config);
const motor = require('./src/controllers/motor')(Gpio);
const motorController = require('./src/controllers/motors')(config);
// const buzzerController = require('./src/controllers/buzzer');
const rplidar = require('node-rplidar');
const pixy2 = require('node-pixy2');
const bno055 = require('node-imu');
const wheelEncoder = require('./src/sensors/wheelEncoder')(EventEmitter, Gpio);

// const buzzer = buzzerController({ triggerPin: 'pin#' });
const wheelEncoderLeft = wheelEncoder({ pinA: 19, pinB: 26 });
const wheelEncoderRight = wheelEncoder({ pinA: 23, pinB: 24 });
const motorLeft = motor({ enablePin: 20, in1Pin: 21, in2Pin: 13 });
const motorRight = motor({ enablePin: 17, in1Pin: 27, in2Pin: 22 });
const encoders = [wheelEncoderLeft, wheelEncoderRight];
const motors = motorController({ motors: [motorLeft, motorRight], encoders });

const telemetryOptions = {
  sensors: { encoders },
};

const defaultStateOptions = {
  controllers: { motors/*, buzzer*/ },
  sensors: { encoders },
};

let state;

app.use(express.static('public'));
app.use('/api/v1', apiV1);

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

    motors.stop();

    resolve();
  });
};

/**
 * Shutdown event handler
 */
function onShutdown() {
  log('shutdown', 'app', 'red');
  
  onStop()
    .then(() => {
      shell.exec('sudo shutdown -h now');
    });
}

/**
 * 
 * @param {Object} usbPorts
 * @return {Promise}
 */
function initUSBDevices(usbPorts) {
  log('init usb devices');

  return new Promise((resolve) => {
    const lidar = rplidar(usbPorts.lidar);
    const camera = pixy2(usbPorts.camera);
    const imu = bno055(usbPorts.imu);

    lidar.init()
      .then(lidar.health)
      .then(onLidarHealth)
      .then(lidar.scan)
      .catch(onLidarError);
    
    camera.init()
      .then(() => log('pixy2 initialized!', 'app', 'cyan'));

    imu.init()
      .then(() => log('BNO055 initialized!', 'app', 'cyan'));

    resolve({ lidar, camera, imu });
  });
};

/**
 * 
 * @param {Object} usbDevices
 * @return {Promise}
 */
function initTelemetry(usbDevices) {
  const { lidar, imu } = usbDevices;

  log('init sending telemetry data');

  return new Promise((resolve) => {
    telemetryOptions.sensors.lidar = lidar;
    telemetryOptions.sensors.imu = imu;

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
  const { lidar, camera, imu } = usbDevices;
  
  log('update state options');

  return new Promise((resolve) => {
    defaultStateOptions.sensors.lidar = lidar;
    defaultStateOptions.sensors.camera = camera;
    defaultStateOptions.sensors.imu = imu;
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
      ports.forEach((port) => {
        switch(port.pnpId) {
          case 'usb-Silicon_Labs_CP2102_USB_to_UART_Bridge_Controller_0001-if00-port0':
            usbPorts.lidar = port.comName;
            break;
          case 'usb-1a86_USB2.0-Serial-if00-port0':
            usbPorts.imu = port.comName;
            break;
          case 'usb-FTDI_FT232R_USB_UART_A9ITLJ7V-if00-port0':
            usbPorts.camera = port.comName;
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
 * Lidar health error handler
 */
function onLidarError() {
  log('Lidar error', 'error', 'red');
  process.exit(1);
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
  motors.stop();
});

io.on('connection', onSocketConnection);

// Roll out!
http.listen(3000, init);
