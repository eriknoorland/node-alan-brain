const solveStartVector = require('../utils/solveStartVector');
const driveStraightUntil = require('../utils/driveStraightUntil');
const isWithinDistance = require('../utils/isWithinDistance');
const averageMeasurements = require('../utils/averageMeasurements');
const scan = require('../utils/scan');
const pause = require('../utils/pause');

const baseWidth = 24; // cm FIXME to config!
const targetGapWidth = baseWidth + 4; // cm (30, 15, 8, 4)

/**
 * backAndForthSuperSlalom
 * @param {Object} options
 * @return {Object}
 */
module.exports = (config, log) => {
  return (options) => {
    const { distance, speed, timeout, obstacles } = config;
    const { controllers, sensors } = options;
    const { main } = controllers;
    const { lidar } = sensors;

    let referenceDistance = 0;
    let canDistance = 0;
    let numGapsHandled = 0;

    /**
     * Constructor
     */
    function constructor() {
      log('constructor', 'backAndForthSuperSlalom');
    }

    /**
     * Start
     */
    function start() {
      const driveToEndCondition = isWithinDistance.bind(null, lidar, distance.front.wall.close, 0);
      const driveToEnd = driveStraightUntil.bind(null, speed.straight.slow, main, driveToEndCondition);

      solveStartVector(lidar, main)
        // .then(pause.bind(null, config.timeout.pause))
        // .then(main.rotateRight.bind(null, speed.rotate.slow, 90))
        // .then(main.stop.bind(null, 1))
        // .then(pause.bind(null, timeout.pause))
        // .then(main.moveForward.bind(null, speed.straight.slow, 30)) // FIXME x cm distance
        // .then(main.stop.bind(null, 1))
        // .then(pause.bind(null, timeout.pause))
        // .then(main.rotateLeft.bind(null, speed.rotate.slow, 90))
        // .then(main.stop.bind(null, 1))
        // .then(pause.bind(null, timeout.pause))
        
        .then(setReferenceDistance.bind(null, 270))
        .then(findGap.bind(null, 'Left', targetGapWidth))
        .then(moveThroughGap.bind(null, 'Left', targetGapWidth))

        .then(setReferenceDistance.bind(null, 90))
        .then(findGap.bind(null, 'Right', targetGapWidth))
        .then(moveThroughGap.bind(null, 'Right', targetGapWidth))
        // .then(pause.bind(null, timeout.pause))

        // .then(driveToEnd)
        // .then(main.stop.bind(null, 1))
        // .then(main.rotateLeft.bind(null, speed.rotate.slow, 90))
        // .then(main.stop.bind(null, 1))
        // .then(pause.bind(null, timeout.pause))
        // .then(main.moveForward.bind(null, speed.straight.slow, 30)) // FIXME x cm distance
        // .then(main.stop.bind(null, 1))
        // .then(pause.bind(null, timeout.pause))
        // .then(main.rotateLeft.bind(null, speed.rotate.slow, 90))
        // .then(setReferenceDistance.bind(null, 270))
        
        // .then(findGap.bind(null, 'Left', targetGapWidth))
        // .then(pause.bind(null, timeout.pause))
        // .then(findGap.bind(null, 'Right', targetGapWidth))
        // .then(pause.bind(null, timeout.pause))

        // .then(driveToEnd)
        // .then(main.stop)
        .then(missionComplete);
    }

    function driveToNextCanCondition(lidar, referenceDistance, checkAngle, resolve) {
      let count = 0;

      canDistance = referenceDistance;

      const onLidarData = ({ quality, angle, distance }) => {
        if (quality > 10 && Math.floor(angle) === checkAngle) {
          if (distance && distance < (referenceDistance - 100) && distance < 300) {
            canDistance = Math.min(canDistance, distance);
            count += 1;

            if (count % 2 === 0) {
              lidar.off('data', onLidarData);
              resolve();
            }
          }
        }
      };

      lidar.on('data', onLidarData);
    }

    /**
     * Find gap
     * @param {String} side
     * @param {Number} targetGapWidth
     * @param {Number} count
     * @return {Promise}
     */
    async function findGap(side, targetGapWidth, count = 0) {
      const driveSpeed = 5; // count ? 5 : speed.straight.slow;
      const checkAngle = side === 'Left' ? 270 : 90;
      const condition = driveToNextCanCondition.bind(null, lidar, referenceDistance, checkAngle);
      const driveStraight = driveStraightUntil.bind(null, driveSpeed, main, condition);

      if (count > 0) {
        await main.moveForward(driveSpeed, Math.round(obstacles.can.diameter));
      }

      await driveStraight();
      await main.stop(1);
      // await pause(timeout.pause);
      
      if (await checkForGap(side)) {
        console.log('gap found!');

        await main.stop();
        await pause(timeout.pause);

        return Promise.resolve();
      }

      return findGap(side, targetGapWidth, count + 1);
    }

    /**
     * 
     * @param {String} side
     * @return {Promise}
     */
    function checkForGap(side) {
      const getGapSize = (measurements) => {
        let gapSize = 0;

        // FIXME calcuate how far (angle) to look ahead
        const filteredMeasurements = Object.keys(measurements)
          .filter(key => side === 'Left' ? key > 270 : key < 90)
          .reduce((acc, key) => {
            acc[key] = measurements[key];
            return acc;
          }, {});

        if (side === 'Left') {
          for (let i = 270, x = Object.keys(filteredMeasurements).length; i < 270 + x; i++) {
            const angle = i;

            if(angle >= 290) {
              const measuredS = filteredMeasurements[angle]; // mm

              if (measuredS) {
                const referenceS = referenceDistance / Math.cos((angle - 270) * (Math.PI / 180)); // mm

                if (measuredS < (referenceS - 100)) {
                  gapSize = (Math.sin((angle - 270) * (Math.PI / 180)) * measuredS) / 10; // cm
                  console.log(`it seems there is an obstacle at ${angle} degrees at a distance of ${gapSize} cm`);
                  break;
                }
              }
            }
          }
        } else {
          for (let i = 90, x = Object.keys(filteredMeasurements).length; i >= 0; i--) {
            const angle = i;

            if (angle <= 70) {
              const measuredS = filteredMeasurements[angle]; // mm

              if (measuredS) {
                const referenceS = referenceDistance / Math.cos((90 - angle) * (Math.PI / 180)); // mm

                if (measuredS < (referenceS - 100)) {
                  gapSize = (Math.sin((90 - angle) * (Math.PI / 180)) * measuredS) / 10; // cm
                  console.log(`it seems there is an obstacle at ${angle} degrees at a distance of ${gapSize} cm`);                  
                  break;
                }
              }
            }
          }
        }
        
        return Promise.resolve(gapSize);
      };

      return new Promise((resolve) => {
        scan(lidar, 250, 0, {})
          .then(averageMeasurements)
          .then(getGapSize)
          .then((size) => {
            resolve(size >= baseWidth);
          });
      });
    }

    /**
     * Move through gap
     * @param {String} side
     * @param {Number} targetGapWidth
     * @return {Promise}
     */
    function moveThroughGap(side, targetGapWidth) {
      const rotate = `rotate${side}`;
      const rotateBack = `rotate${side === 'Left' ? 'Right' : 'Left'}`;
      const crossingDistance = Math.round(((canDistance / 10) * 2) + Math.round(obstacles.can.diameter / 2));
      const gapCenter = Math.ceil(Math.round(obstacles.can.diameter / 2) + (targetGapWidth / 2));
      
      console.log('moveThroughGap');
      console.log('canDistance', canDistance);
      console.log('crossingDistance', crossingDistance);
      console.log('targetGapWidth', targetGapWidth, Math.ceil(targetGapWidth / 2));

      return new Promise((resolve) => {
        main.moveForward(5, gapCenter)
          .then(main.stop.bind(null, 1))
          .then(pause.bind(null, timeout.pause))
          .then(main[rotate].bind(null, 5, 90))
          .then(main.stop.bind(null, 1))
          .then(pause.bind(null, timeout.pause))
          .then(main.moveForward.bind(null, 5, crossingDistance))
          .then(main.stop.bind(null, 1))
          .then(pause.bind(null, timeout.pause))
          .then(main[rotateBack].bind(null, 5, 90))
          .then(main.stop.bind(null, 1))
          .then(pause.bind(null, timeout.pause))
          .then(resolve);
      });
    }

    /**
     * Sets the minimal reference distance for a given angle
     * @param {String} side
     * @return {Promise}
     */
    function setReferenceDistance(angle) {
      const getReferenceDistance = (measurements) => {
        const distance = measurements[angle];

        return Promise.resolve(distance);
      };

      return new Promise((resolve) => {
        scan(lidar, 500, 0, {})
          .then(averageMeasurements)
          .then(getReferenceDistance)
          .then((distance) => {
            referenceDistance = distance;
            console.log('referenceDistance', referenceDistance);
            resolve();
          })
      });
    }

    /**
     * Stop
     */
    function stop() {
      log('stop', 'backAndForthSuperSlalom');
      main.stop(1);
    }

    /**
     * Mission complete
     */
    function missionComplete() {
      log('mission complete', 'backAndForthSuperSlalom');
      main.stop(1);
    }

    constructor();

    return {
      start,
      stop,
    };
  };
};
