const EventEmitter = require('events');
const Gpio = require('pigpio').Gpio;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
// const RateLimiter = require('limiter').RateLimiter;
// const limiter = new RateLimiter(1, 250);

const log = require('./src/utils/log')(io);
const States = require('./src/States');
const Modes = require('./src/Modes');

// const button = require('./src/controllers/button')(EventEmitter, Gpio);
const motor = require('./src/controllers/motor');
const motors = require('./src/controllers/motors');
// const buzzerController = require('./src/controllers/buzzer');
// const rplidar = require('node-rplidar');
// const pixy2 = require('node-pixy2-serial-json');
// const ultrasonic = require('./src/sensors/ultrasonic')(EventEmitter);
const wheelEncoder = require('./src/sensors/wheelEncoder');
const parseArgvs = require('./src/utils/parseArgvs');
const countdown = require('./src/utils/countdown');

// const lidar = rplidar('/dev/ttyUSB0');

const startDelay = 3000;
// const startButton = button({ pin: 4 });

// const buzzer = buzzerController({
//   trigger: '', // new Gpio('pin#', Gpio.OUTPUT),
// });

const wheelEncoderLeft = wheelEncoder({
  encoderA: new Gpio(23, { mode: Gpio.INPUT }),
  encoderB: new Gpio(24, { mode: Gpio.INPUT }),
});

const motorLeft = motor({
  enable: new Gpio(17, { mode: Gpio.OUTPUT }),
  in1: new Gpio(27, { mode: Gpio.OUTPUT }),
  in2: new Gpio(22, { mode: Gpio.OUTPUT }),
});

const wheelEncoderRight = wheelEncoder({
  encoderA: new Gpio(19, { mode: Gpio.INPUT }),
  encoderB: new Gpio(26, { mode: Gpio.INPUT }),
});

const motorRight = motor({
  enable: new Gpio(20, { mode: Gpio.OUTPUT }),
  in1: new Gpio(21, { mode: Gpio.OUTPUT }),
  in2: new Gpio(13, { mode: Gpio.OUTPUT }),
});

const motors = motors({
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
      // ultrasonic: {
      //   front: ultrasonicFront,
      //   left: ultrasonicLeft,
      //   right: ultrasonicRight,
      // },
      // lidar,
    },
  };

  state = States[stateIndex](log, stateOptions);

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
      // start loop(s)
      // show running status with active LED
    });
};

/**
 * Pause
 */
const pause = () => {
  log('pause');

  // stop loop(s)
  // stop motors
  // stop sensor reading
  // show paused status with blinking LED
};

/**
 * Loop
 */
const loop = () => {
  state.loop();
};

// Roll out!
http.listen(3000, init);
