const EventEmitter = require('events');
const Gpio = require('pigpio').Gpio;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
// const RateLimiter = require('limiter').RateLimiter;
// const limiter = new RateLimiter(1, 250);

const log = require('./src/utils/log')(io);
const debounce = require('./src/utils/debounce');
const States = require('./src/States')(EventEmitter, log, debounce);
const Modes = require('./src/Modes');

// const button = require('./src/controllers/button')(EventEmitter, Gpio);
const motor = require('./src/controllers/motor');
const motorController = require('./src/controllers/motors');
// const buzzerController = require('./src/controllers/buzzer');
// const rplidar = require('node-rplidar');
// const pixy2 = require('node-pixy2-serial-json');
// const ultrasonic = require('./src/sensors/ultrasonic')(EventEmitter);
const wheelEncoder = require('./src/sensors/wheelEncoder')(EventEmitter, Gpio);
const parseArgvs = require('./src/utils/parseArgvs');
const countdown = require('./src/utils/countdown');

// const lidar = rplidar('/dev/ttyUSB0');

const startDelay = 0;
// const startButton = button({ pin: 4 });

// const buzzer = buzzerController({
//   trigger: '', // new Gpio('pin#', Gpio.OUTPUT),
// });

const wheelEncoderLeft = wheelEncoder({ pinA: 19, pinB: 26 });
const wheelEncoderRight = wheelEncoder({ pinA: 23, pinB: 24 });

const motorLeft = motor({
  enable: new Gpio(20, { mode: Gpio.OUTPUT }),
  in1: new Gpio(21, { mode: Gpio.OUTPUT }),
  in2: new Gpio(13, { mode: Gpio.OUTPUT }),
});

const motorRight = motor({
  enable: new Gpio(17, { mode: Gpio.OUTPUT }),
  in1: new Gpio(27, { mode: Gpio.OUTPUT }),
  in2: new Gpio(22, { mode: Gpio.OUTPUT }),
});

const motors = motorController({
  motors: [motorLeft, motorRight],
  encoders: [wheelEncoderLeft, wheelEncoderRight],
});

// const ultrasonicFront = ultrasonic({
//   trigger: '', // new Gpio('pin#', { mode: Gpio.OUTPUT }),
//   echo: '', // new Gpio('pin#', { mode: Gpio.INPUT, alert: true }),
// });

// const ultrasonicLeft = ultrasonic({
//   trigger: '', // new Gpio('pin#', { mode: Gpio.OUTPUT }),
//   echo: '', // new Gpio('pin#', { mode: Gpio.INPUT, alert: true }),
// });

// const ultrasonicRight = ultrasonic({
//   trigger: '', // new Gpio('pin#', { mode: Gpio.OUTPUT }),
//   echo: '', // new Gpio('pin#', { mode: Gpio.INPUT, alert: true }),
// });

let lastLoop = new Date();
let interval;
let state;

app.use(express.static('public'));

io.on('connection', (socket) => {
  log('client-connected', 'telemetry', 'green');

  if (state.mode === Modes.MANUAL) {
    state.setSocket(socket);
  }

  socket.on('disconnect', () => {
    log('client-disconnected', 'telemetry', 'yellow');
    state.setSocket(null);
  });
});

process.on('beforeExit', () => {
  motors.stop();
});

/**
 * Init
 */
const init = () => {
  log('init');
  log('server-started', 'telemetry');

  const args = parseArgvs(process.argv);

  if (!args.state) {
    log('State argument required', 'error', 'red');
    process.exit(1);
  }

  const stateIndex = parseInt(args.state, 10);
  const stateOptions = {
    controllers: { motors/*, buzzer*/ },
    sensors: {
      encoders: [
        wheelEncoderLeft,
        wheelEncoderRight
      ],
      // ultrasonic: {
      //   front: ultrasonicFront,
      //   left: ultrasonicLeft,
      //   right: ultrasonicRight,
      // },
      // lidar,
    },
  };

  state = States[stateIndex](stateOptions);

  start();// startButton.on('press', start);
};

/**
 * Start
 */
const start = () => {
  log('start-countdown');

  countdown(startDelay, log)
    .then(() => {
      log('start');
      state.start();
      interval = setInterval(loop, 20);
      // show running status with active LED
    });
};

/**
 * Pause
 */
const pause = () => {
  log('pause');

  // state.pause();
  clearInterval(interval);

  // stop motors
  // stop sensor reading
  // show paused status with blinking LED
};

/**
 * Loop
 */
const loop = () => {
  const thisLoop = new Date();
  const fps = 1000 / (thisLoop - lastLoop);
  
  state.loop();
  lastLoop = thisLoop;
};

// Roll out!
http.listen(3000, init);
