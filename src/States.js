module.exports = (EventEmitter, log, debounce) => {
  return [
    require('./states/remote')(EventEmitter, log, debounce),
    require('./states/backAndForth')(EventEmitter, log),
    // require('./states/backAndForthSlalom')(EventEmitter),
    // require('./states/backAndForthSuperSlalom')(EventEmitter),
    // require('./states/lineFollower')(EventEmitter),
    // require('./states/lineFollowerObstacle')(EventEmitter),
    // require('./states/tTime')(EventEmitter),
    // require('./states/tTimeBonus')(EventEmitter),
    // require('./states/cans')(EventEmitter),
    // require('./states/cansPickupAndReturn')(EventEmitter),
  ];
};
