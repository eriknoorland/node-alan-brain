/**
 * Motors
 * @param {Object} options
 * @return {Object}
 */
const motors = ({ motors, encoders }) => {
  const numTicksPerSecond = 1850;
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
   */
  function forward() {
    straight('forward');
  }

  /**
   * Reverse
   */
  function reverse() {
    straight('reverse');
  }

  /**
   * Stop
   * @returns {Promise}
   */
  function stop() {
    return new Promise((resolve) => {
      motors[0].stop();
      motors[1].stop();
      clearFeedbackLoopInterval();
      resolve();
    });
  }

  /**
   * Rotate
   * @param {Number} angle
   * @param {String} direction
   * @returns {Promise}
   */
  function rotate(angle, direction = 'left') {
    return new Promise((resolve) => {
      const K = { Kp: 0.5, Ki: 0.01, Kd: 0.05 };
      const motorLeftDirection = direction === 'left' ? 'reverse' : 'forward';
      const motorRightDirection = direction === 'right' ? 'reverse' : 'forward';
      const numTargetRotationTicks = Math.round(numFullRotationTicks / (360 / angle));
      const numAcceptableTargetTicks = Math.floor(numTargetRotationTicks * 0.975);
      const goal = 10;

      let encoderCountLeft = 0;
      let encoderCountRight = 0;

      clearFeedbackLoopInterval();
      leftData = resetData(leftData);
      rightData = resetData(rightData);

      feedbackLoopInterval = setInterval(() => {
        encoderCountLeft += leftData.encoderCount;
        encoderCountRight += rightData.encoderCount;

        leftData = { ...loop(K, goal, loopTime, leftData), encoderCount: 0 };
        rightData = { ...loop(K, goal, loopTime, rightData),  encoderCount: 0 };

        motors[0][motorLeftDirection](leftData.speed);
        motors[1][motorRightDirection](rightData.speed);

        if (encoderCountLeft >= numAcceptableTargetTicks
          || encoderCountRight >= numAcceptableTargetTicks) {
          resolve();
        }
      }, loopTime);
    });
  }

  /**
   * Straight
   * @param {String} direction
   */
  function straight(direction = 'forward') {
    const K = { Kp: 2, Ki: 0.01, Kd: 1 };
    const goal = 25; // numTicksPerSecond / 50;

    clearFeedbackLoopInterval();
    leftData = resetData(leftData);
    rightData = resetData(rightData);

    feedbackLoopInterval = setInterval(() => {
      leftData = { ...loop(K, goal, loopTime, leftData), encoderCount: 0 };
      rightData = { ...loop(K, goal, loopTime, rightData),  encoderCount: 0 };

      motors[0][direction](leftData.speed);
      motors[1][direction](rightData.speed);
    }, loopTime);
  }

  /**
   * Feedback loop
   * @param {Object} K
   * @param {Number} goal
   * @param {Number} loopTime
   * @param {Object} data
   * @return {Object}
   */
  function loop(K, goal, loopTime, { encoderCount, lastError, iAcc }) {
    const { p, i, d, error } = pid(K, goal, encoderCount, lastError, loopTime, iAcc);

    return {
      speed: (p + i + d),
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

  /**
   * Clear and reset the feedback loop interval
   */
  function clearFeedbackLoopInterval() {
    if (feedbackLoopInterval) {
      clearInterval(feedbackLoopInterval);
      feedbackLoopInterval = null;
    }
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
