/**
 * backAndForthSuperSlalom
 * @param {Object} options
 * @return {Object}
 */
module.exports = (config, log) => {
  const { robot, distance, speed, timeout, obstacles } = config;
  const solveStartVector = require('../utils/solveStartVector');
  const gotoStartPosition = require('../utils/gotoStartPosition')(config);
  const driveStraightUntil = require('../utils/driveStraightUntil');
  const isWithinDistance = require('../utils/isWithinDistance');
  // const averageMeasurements = require('../utils/averageMeasurements');
  // const scan = require('../utils/scan');
  const pause = require('../utils/pause');

  return ({ controllers, sensors }) => {
    const { main } = controllers;
    const { lidar } = sensors;
    const targetGapWidth = robot.diameter + distance.gap.width;
    const rotateLeft = main.rotateLeft.bind(null, speed.rotate.slow, 90);
    const rotateRight = main.rotateRight.bind(null, speed.rotate.slow, 90);
    const hardStop = main.stop.bind(null, 1);
    const delay = pause.bind(null, timeout.pause);
    const lidarData = {};
    let canDistance = 0;

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

      lidar.on('data', onLidarData);

      solveStartVector(lidar, main)
        .then(delay)
        .then(gotoStartPosition.bind(null, main, 'Right', robot.diameter))
        .then(delay)
        .then(slalom.bind(null, 'Left'))
        .then(delay)
        .then(slalom.bind(null, 'Right'))
        .then(delay)
        .then(driveToEnd)
        .then(main.stop.bind(null))
        .then(delay)
        .then(rotateLeft)
        .then(hardStop)
        .then(delay)
        .then(main.moveForward.bind(null, speed.straight.slow, Math.floor(robot.diameter + (obstacles.can.diameter * 2))))
        .then(main.stop.bind(null))
        .then(delay)
        .then(rotateLeft)
        .then(hardStop)
        .then(delay)
        .then(slalom.bind(null, 'Left'))
        .then(delay)
        .then(slalom.bind(null, 'Right'))
        .then(delay)
        .then(driveToEnd)
        .then(main.stop.bind(null))
        .then(missionComplete);
    }

    /**
     * Slalom
     * @param {String} side
     * @return {Promise}
     */
    async function slalom(side) {
      const referenceAngle = side === 'Left' ? 270 : 90;

      await delay();
      await findGap(side, targetGapWidth, lidarData[referenceAngle]);
      await moveThroughGap(side, targetGapWidth);

      return Promise.resolve();
    }

    /**
     * Resolves when the condition criteria are met
     * @param {Number} referenceDistance
     * @param {Number} angle
     */
    function driveToNextCanCondition(referenceDistance, angle) {
      canDistance = referenceDistance;

      return new Promise((resolve) => {
        const interval = setInterval(() => {
          const distance = lidarData[angle];

          if (distance && distance < (referenceDistance - 100) && distance < 300) {
            canDistance = Math.min(canDistance, distance);
            clearInterval(interval);
            resolve();
          }
        }, 30);
      });

      // let count = 0;

      // canDistance = referenceDistance;

      // const onLidarData = ({ quality, angle, distance }) => {
      //   if (quality > 10 && Math.floor(angle) === checkAngle) {
      //     if (distance && distance < (referenceDistance - 100) && distance < 300) {
      //       canDistance = Math.min(canDistance, distance);
      //       count += 1;

      //       if (count % 2 === 0) {
      //         lidar.off('data', onLidarData);
      //         resolve();
      //       }
      //     }
      //   }
      // };

      // lidar.on('data', onLidarData);
    }

    /**
     * Find gap
     * @param {String} side
     * @param {Number} targetGapWidth
     * @param {Number} referenceDistance
     * @param {Number} count
     * @return {Promise}
     */
    async function findGap(side, targetGapWidth, referenceDistance, count = 0) {
      const driveSpeed = 5; // count ? 5 : speed.straight.slow;
      const checkAngle = side === 'Left' ? 270 : 90;
      const driveStraightCondition = driveToNextCanCondition.bind(null, referenceDistance, checkAngle);

      if (count > 0) {
        await main.moveForward(driveSpeed, Math.round(obstacles.can.diameter));
      }

      await driveStraightUntil(driveSpeed, main, driveStraightCondition);
      await main.stop(1);
      
      if (await checkForGap(side, referenceDistance)) {
        await main.stop();
        await pause(timeout.pause);

        return Promise.resolve();
      }

      return findGap(side, targetGapWidth, referenceDistance, count + 1);
    }

    /**
     * 
     * @param {String} side
     * @return {Promise}
     */
    async function checkForGap(side, referenceDistance) {
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

      const gapSize = await getGapSize(lidarData);

      return Promise.resolve(gapSize >= robot.diameter);

      // return new Promise((resolve) => {
      //   scan(lidar, 250, 0, {})
      //     .then(averageMeasurements)
      //     .then(getGapSize)
      //     .then((size) => {
      //       resolve(size >= robot.diameter);
      //     });
      // });
    }

    /**
     * Move through gap
     * @param {String} side
     * @param {Number} targetGapWidth
     * @return {Promise}
     */
    function moveThroughGap(side, targetGapWidth) {
      const rotateIn = side === 'Left' ? rotateLeft : rotateRight;
      const rotateOut = side === 'Left' ? rotateRight : rotateLeft;
      const crossingDistance = Math.round(((canDistance / 10) * 2) + Math.round(obstacles.can.diameter / 2));
      const gapCenter = Math.ceil(Math.round(obstacles.can.diameter / 2) + (targetGapWidth / 2));

      return new Promise((resolve) => {
        main.moveForward(5, gapCenter)
          .then(hardStop)
          .then(delay)
          .then(rotateIn)
          .then(hardStop)
          .then(delay)
          .then(main.moveForward.bind(null, 5, crossingDistance))
          .then(hardStop)
          .then(delay)
          .then(rotateOut)
          .then(hardStop)
          .then(resolve);
      });
    }

    /**
     * Returns the distance measured for a given angle
     * @param {Number} angle
     * @return {Promise}
     */
    // function getReferenceDistance(angle) {
    //   const getDistance = measurements => Promise.resolve(measurements[angle]);

    //   return new Promise((resolve) => {
    //     scan(lidar, 250, 0, {})
    //       .then(averageMeasurements)
    //       .then(getDistance)
    //       .then(resolve);
    //   });
    // }

    /**
     * Lidar data event handler
     * @param {Object} data
     */
    function onLidarData({ quality, angle, distance }) {
      if (quality > 10) {
        lidarData[Math.floor(angle)] = distance;
      }
    };

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
      
      lidar.off('data', onLidarData);
      main.stop(1);
    }

    constructor();

    return {
      start,
      stop,
    };
  };
};
