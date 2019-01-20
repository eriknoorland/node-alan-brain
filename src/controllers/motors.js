/**
 * Motors
 * @param {Object} options
 * @return {Object}
 */
const motors = ({ motors, encoders }) => {
  const revolutionsPerSecond = 1850; // depends on speed, voltage and type of motor
  const numFullRotationTicks = 5397;
  const loopTime = 20;

  let leftData = { encoderCount: 0, lastError: 0, iAcc: 0 };
  let rightData = { encoderCount: 0, lastError: 0, iAcc: 0 };
  let feedbackLoopInterval;

  /**
   * Constructor
   */
  function constructor() {
    encoders[0].on('tick', () => leftData.encoderCount++);
    encoders[1].on('tick', () => rightData.encoderCount++);
  }

  /**
   * Forward
   * @param {Number} speed
   */
  function forward(speed) {
    straight(speed, 'forward');
  }

  /**
   * Reverse
   * @param {Number} speed
   */
  function reverse(speed) {
    straight(speed, 'reverse');
  }

  /**
   * Stop
   */
  function stop() {
    motors[0].stop();
    motors[1].stop();

    if (feedbackLoopInterval) {
      clearInterval(feedbackLoopInterval);
    }
  }

  /**
   * Rotate
   * @param {Number} angle
   * @param {Number} speed
   * @param {String} direction
   */
  function rotate(angle, speed, direction = 'left') {
    const K = { Kp: 1, Ki: 0.01, Kd: 1 };
    const motorLeftDirection = direction === 'left' ? 'reverse' : 'forward';
    const motorRightDirection = direction === 'right' ? 'reverse' : 'forward';
    const numTargetRotationTicks = Math.round(numFullRotationTicks / (360 / angle));
    const numAcceptableTargetTicks = Math.floor(numTargetRotationTicks * 0.99);
    const goal = Math.round((numTargetRotationTicks / 20) / 6);

    let encoderCountLeft = 0;
    let encoderCountRight = 0;

    if (feedbackLoopInterval) {
      clearInterval(feedbackLoopInterval);
    }

    resetData(leftData);
    resetData(rightData);

    feedbackLoopInterval = setInterval(() => {
      encoderCountLeft += leftData.encoderCount;
      encoderCountRight += rightData.encoderCount;

      leftData = { ...loop(K, goal, speed, loopTime, leftData), encoderCount: 0 };
      rightData = { ...loop(K, goal, speed, loopTime, rightData),  encoderCount: 0 };

      motors[0][motorLeftDirection](leftData.speed);
      motors[1][motorRightDirection](rightData.speed);

      if (encoderCountLeft >= numAcceptableTargetTicks
        || encoderCountRight >= numAcceptableTargetTicks) {
        stop();
      }
    }, loopTime);
  }

  /**
   * Straight
   * @param {Number} speed
   * @param {String} direction
   */
  function straight(speed, direction = 'forward') {
    const K = { Kp: 2, Ki: 0.01, Kd: 1 };
    const goal = revolutionsPerSecond / 50;

    if (feedbackLoopInterval) {
      clearInterval(feedbackLoopInterval);
    }

    resetData(leftData);
    resetData(rightData);

    feedbackLoopInterval = setInterval(() => {
      leftData = { ...loop(K, goal, speed, loopTime, leftData), encoderCount: 0 };
      rightData = { ...loop(K, goal, speed, loopTime, rightData),  encoderCount: 0 };

      motors[0][direction](leftData.speed);
      motors[1][direction](rightData.speed);
    }, loopTime);
  }

  /**
   * Feedback loop
   * @param {Object} K
   * @param {Number} goal
   * @param {Number} speed
   * @param {Number} loopTime
   * @param {Object} data
   * @return {Object}
   */
  function loop(K, goal, speed, loopTime, { encoderCount, lastError, iAcc }) {
    const { p, i, d, error } = pid(K, goal, encoderCount, lastError, loopTime, iAcc);

    return {
      speed: speed + (p + i + d),
      lastError: error,
      iAcc: i,
    };
  }

  /**
   * PID calculator
   * @param {Object} K
   * @param {Number} goal
   * @param {Number} current
   * @param {Number} lastError
   * @param {Number} loopTime
   * @param {Number} iAcc
   * @return {Object}
   */
  function pid({ Kp, Ki, Kd }, goal, current, lastError, loopTime, iAcc = 0) {
    const error = goal - current;
    const p = Kp * error;
    const i = iAcc + (loopTime * error * Ki);
    const d = Kd * ((error - lastError) / loopTime);

    return { p, i, d, error };
  }

  /**
   * Resets the data object values with all 0's
   * @param {Object} data
   * @return {Object}
   */
  function resetData(data) {
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});
  }

  constructor();

  return {
    forward,
    reverse,
    rotate,
    stop,
  };
};

module.exports = motors;
