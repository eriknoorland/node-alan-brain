const EventEmitter = require('events');
const Gpio = require('pigpio').Gpio;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
// const RateLimiter = require('limiter').RateLimiter;
// const limiter = new RateLimiter(1, 250);

const config = require('./src/config');
const log = require('./src/utils/log')(io);
const debounce = require('./src/utils/debounce');
const parseArgvs = require('./src/utils/parseArgvs');
const countdown = require('./src/utils/countdown');

const telemetryController = require('./src/controllers/telemetry')(io, config);
// const button = require('./src/controllers/button')(EventEmitter, Gpio);
const motor = require('./src/controllers/motor')(Gpio);
const motorController = require('./src/controllers/motors')(config);
// const buzzerController = require('./src/controllers/buzzer');
const rplidar = require('node-rplidar');
// const pixy2 = require('node-pixy2-serial-json');
// const ultrasonic = require('./src/sensors/ultrasonic')(EventEmitter, Gpio);
const wheelEncoder = require('./src/sensors/wheelEncoder')(EventEmitter, Gpio);

const States = require('./src/States')(EventEmitter, log, debounce);
const Modes = require('./src/Modes');

const lidar = rplidar('/dev/ttyUSB0');
// const startButton = button({ pin: 4 });
// const buzzer = buzzerController({ triggerPin: 'pin#' });
// const ultrasonicFront = ultrasonic({ triggerPin: 'pin#', echoPin: 'pin#' });
// const ultrasonicLeft = ultrasonic({ triggerPin: 'pin#', echoPin: 'pin#' });
// const ultrasonicRight = ultrasonic({ triggerPin: 'pin#', echoPin: 'pin#' });
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
  },
});

let lastTimestamp = new Date();
let interval;
let state;

app.use(express.static('public'));

io.on('connection', (socket) => {
  log('client connected', 'telemetry', 'green');

  if (state.mode === Modes.MANUAL) {
    state.setSocket(socket);
  }

  socket.on('disconnect', () => {
    log('client disconnected', 'telemetry', 'yellow');
    state.setSocket(null);
  });
});

/**
 * Init
 */
const init = () => {
  const args = parseArgvs(process.argv);

  log('server started', 'telemetry', 'green');
  log('init');

  if (!args.state) {
    log('State argument required', 'error', 'red');
    process.exit(1);
  }

  const stateIndex = parseInt(args.state, 10);
  const stateOptions = {
    controllers: { motors/*, buzzer*/ },
    sensors: {
      encoders: [wheelEncoderLeft, wheelEncoderRight],
      lidar,
      // ultrasonic: {
      //   front: ultrasonicFront,
      //   left: ultrasonicLeft,
      //   right: ultrasonicRight,
      // },
    },
  };

  state = States[stateIndex](stateOptions);

  lidar
    .init()
    .then(lidar.health)
    .then(onLidarHealth)
    .catch(onLidarError);
};

/**
 * Start
 */
const startCountdown = () => {
  log('start countdown');

  countdown(config.startTimeout, log)
    .then(start);
};

/**
 * Countdown complete handler 
 */
const start = () => {
  log('start');
  
  state.start();
  interval = setInterval(fpsLoop, config.loopTime);
  
  // TODO show running status with active LED
};

/**
 * FPS loop
 */
const fpsLoop = () => {
  const currentTimestamp = new Date();
  const fps = 1000 / (currentTimestamp - lastTimestamp);
  
  lastTimestamp = currentTimestamp;
};

/**
 * Lidar health handler
 * @param {Object} health
 */
const onLidarHealth = (health) => {
  log(`lidar health: ${health.status}`);

  // 0 = good, 1 = warning, 2 = error
  if (health.status === 0) {
    log('ready to roll!');
    // TODO show ready status with LED

    lidar.scan();
    startCountdown(); // startButton.on('press', startCountdown);
  } else {
    onLidarError();
  }
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
  clearInterval(interval);
  motors.stop();
});

// Roll out!
http.listen(3000, init);
