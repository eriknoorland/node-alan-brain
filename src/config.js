const startTimeout = 1000;
const loopTime = 20; // miliseconds
const wheelBase = 206; // mm
const wheelDiameter = 90; // mm
const wheelCircumference = wheelDiameter * Math.PI; // mm
const wheelBaseCircumference = wheelBase * Math.PI; // mm
const numTicksPerRevolution = 8245.92;
const numRevolutionsFullTurn = wheelBaseCircumference / wheelCircumference;
const straightLineSpeed = 100; // mm/s
const rotationSpeed = 25; // mm/s

/**
 * Returns the number of ticks per looptime based on the disired speed in mm/s
 * @param {Number} speed
 * @return {Number}
 */
const calcuateTicksPerLoopTime = (speed) => {
  const revolutionsPerSecond = (speed / wheelCircumference);
  const ticksPerSecond = numTicksPerRevolution * revolutionsPerSecond;

  return ticksPerSecond / (1000 / loopTime);
};

module.exports = {
  startTimeout,
  loopTime,
  encoders: {
    numFullRotationTicks: numRevolutionsFullTurn * numTicksPerRevolution,
  },
  speed: {
    straight: calcuateTicksPerLoopTime(straightLineSpeed),
    rotate: calcuateTicksPerLoopTime(rotationSpeed),
  },
};
