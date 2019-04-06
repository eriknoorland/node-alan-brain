module.exports = (config, log, debounce) => {
  return [
    require('./states/remote')(config, log, debounce),
    require('./states/backAndForth')(config, log),
    require('./states/backAndForthSlalom')(config, log),
    require('./states/backAndForthSuperSlalom')(config, log),
    require('./states/lineFollower')(config, log),
    require('./states/lineFollowerObstacle')(config, log),
    require('./states/tTime')(config, log),
    require('./states/tTimeBonus')(config, log),
    require('./states/cans')(config, log),
    require('./states/cansPickupAndReturn')(config, log),
  ];
};
