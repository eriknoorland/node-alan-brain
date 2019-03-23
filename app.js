const EventEmitter = require('events');
const Gpio = require('pigpio').Gpio;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const config = require('./src/config');
const log = require('./src/utils/log')(io);
const debounce = require('./src/utils/debounce');
const parseArgvs = require('./src/utils/parseArgvs');
const countdown = require('./src/utils/countdown')(log);

const telemetryController = require('./src/controllers/telemetry')(io, config);
const motor = require('./src/controllers/motor')(Gpio);
const motorController = require('./src/controllers/motors')(config);
// const buzzerController = require('./src/controllers/buzzer');
const rplidar = require('node-rplidar');
const pixy2 = require('node-pixy2');
const bno055 = require('node-imu');
const wheelEncoder = require('./src/sensors/wheelEncoder')(EventEmitter, Gpio);

const States = require('./src/States')(EventEmitter, log, debounce);

const lidar = rplidar('/dev/ttyUSB1');
const camera = pixy2('/dev/ttyUSB0');
const imu = bno055('/dev/ttyUSB2');
// const buzzer = buzzerController({ triggerPin: 'pin#' });
const wheelEncoderLeft = wheelEncoder({ pinA: 19, pinB: 26 });
const wheelEncoderRight = wheelEncoder({ pinA: 23, pinB: 24 });
const motorLeft = motor({ enablePin: 20, in1Pin: 21, in2Pin: 13 });
const motorRight = motor({ enablePin: 17, in1Pin: 27, in2Pin: 22 });
const motors = motorController({
  motors: [motorLeft, motorRight],
  encoders: [wheelEncoderLeft, wheelEncoderRight],
});

const telemetry = telemetryController({
  sensors: {
    encoders: [wheelEncoderLeft, wheelEncoderRight],
    lidar,
    imu,
  },
});

const defaultStateOptions = {
  controllers: { motors/*, buzzer*/ },
  sensors: {
    encoders: [wheelEncoderLeft, wheelEncoderRight],
    lidar,
    camera,
    imu,
  },
};

let state;

/**
 * Init
 */
const init = () => {
  log('init');
  log('server started', 'telemetry', 'green');

  lidar.init()
    .then(lidar.health)
    .then(onLidarHealth)
    .then(lidar.scan)
    .catch(onLidarError);
  
  camera.init()
    .then(() => log('pixy2 initialized!'));

  imu.init()
    .then(() => log('BNO055 initialized!'));
};

/**
 * Start countdown
 */
const startCountdown = () => {
  log('start countdown');

  countdown(config.startTimeout)
    .then(start);
};

/**
 * Countdown complete handler 
 */
const start = () => {
  log('start');
  
  state.start();
  // TODO show running status with active LED
};

/**
 * Socket connection event handler
 * @param {socket} socket
 */
const onSocketConnection = (socket) => {
  log('client connected', 'telemetry', 'green');

  socket.on('start', onStart.bind(null, socket));
  socket.on('stop', onStop);

  socket.on('disconnect', () => {
    log('client disconnected', 'telemetry', 'yellow');
  });
};

/**
 * Start event handler
 * @param {socket} socket
 * @param {int} stateIndex
 */
const onStart = (socket, stateIndex) => {
  if (stateIndex === null) {
    log('State argument required', 'error', 'red');
    return;
  }

  log(`state ${stateIndex} selected`);

  const stateOptions = Object.assign({ socket }, defaultStateOptions);
  state = States[stateIndex](stateOptions);

  startCountdown();
};

/**
 * Stop event handler
 */
const onStop = () => {
  log('stop');

  motors.stop();
  process.exit(1);
};

/**
 * Lidar health handler
 * @param {Object} health
 */
const onLidarHealth = (health) => {
  log(`lidar health: ${health.status}`);

  return new Promise((resolve, reject) => {
    // 0 = good, 1 = warning, 2 = error
    if (health.status !== 0) {
      reject();
      return;
    }

    log('ready to roll!');
      // TODO show ready status with LED
    resolve();
  });
};

/**
 * Lidar health error handler
 */
const onLidarError = () => {
  log('Lidar error', 'error', 'red');
  process.exit(1);
};

/**
 * Before exit event handler
 */
process.on('beforeExit', () => {
  motors.stop();
});

app.use(express.static('public'));
io.on('connection', onSocketConnection);

// Roll out!
http.listen(3000, init);
