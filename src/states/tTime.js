/**
 * tTime
 * @return {Object}
 */
module.exports = (EventEmitter, log) => {
  return (options) => {
    const { controllers, sensors } = options;
    const { motors/*, buzzer*/ } = controllers;
    const { encoders, lidar } = sensors;

    let leftEncoderCountTemp = 0;
    let rightEncoderCountTemp = 0;
    let leftEncoderCount = 0;
    let rightEncoderCount = 0;

    /**
     * Constructor
     */
    function constructor() {
      log('constructor', 'tTime');
    }

    /**
     * Start
     */
    function start() {
      const frontWallAngle = 0;
      const frontWallDistance = 300;
      const pauseTimeout = 500;
      
      const driveStraightToWallCondition = isWithinDistance.bind(null, lidar, frontWallDistance, frontWallAngle);
      const driveStraightToWall = driveStraightUntil.bind(null, motors, driveStraightToWallCondition);
      
      solveStartVector(lidar, motors)
        .then(countTicks)
        .then(driveStraightToWall)
        .then(motors.stop)
        .then(saveCountedTicks)
        .then(motors.rotate.bind(null, 180, 'left'))
        .then(motors.stop)
        .then(driveStraightNumTicks.bind(null, 0.5))
        .then(motors.stop)
        .then(motors.rotate.bind(null, 90, 'right'))
        .then(motors.stop)
        .then(countTicks)
        .then(driveStraightToWall)
        .then(motors.stop)
        .then(saveCountedTicks)
        .then(motors.rotate.bind(null, 180, 'left'))
        .then(motors.stop)
        .then(driveStraightNumTicks.bind(null), 1)
        .then(motors.stop)
        .then(motors.rotate.bind(null, 90, 'right'))
        .then(motors.stop)
        .then(driveStraightToWall)
        .then(motors.stop)
        .then(missionComplete);
    }

    function driveStraightNumTicks(multiplier) {
      const target = ((leftEncoderCount + rightEncoderCount) / 2) * multiplier;

      return new Promise((resolve) => {
        const encoderCounts = [leftEncoderCount, rightEncoderCount];
        const driveStraightNumTicksCondition = isAtNumTicks.bind(null, encoders, target);

        driveStraightUntil(motors, driveStraightNumTicksCondition);
      });
    }

    function countTicks() {
      leftEncoderCountTemp = 0;
      rightEncoderCountTemp = 0;

      encoders[0].on('tick', () => leftEncoderCountTemp++);
      encoders[1].on('tick', () => rightEncoderCountTemp++);

      return Promise.resolve();
    }

    function saveCountedTicks() {
      leftEncoderCount = leftEncoderCountTemp;
      rightEncoderCount = rightEncoderCountTemp;

      return Promise.resolve();
    }

    /**
     * Mission complete
     */
    function missionComplete() {
      log('mission complete', 'tTime');
    }

    constructor();

    return {
      start,
      loop,
    };
  };
};
