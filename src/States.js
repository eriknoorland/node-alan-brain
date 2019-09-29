const remote = require('./states/remote');
const backAndForth = require('./states/backAndForth');
const backAndForthSlalom = require('./states/backAndForthSlalom');
const backAndForthSuperSlalom = require('./states/backAndForthSuperSlalom');
const lineFollower = require('./states/lineFollower');
const lineFollowerObstacle = require('./states/lineFollowerObstacle');
const tTime = require('./states/tTime');
const tTimeBonus = require('./states/tTimeBonus');
const cans = require('./states/cans');
const cansPickupAndReturn = require('./states/cansPickupAndReturn');

module.exports = [
  remote,
  backAndForth,
  backAndForthSlalom,
  backAndForthSuperSlalom,
  lineFollower,
  lineFollowerObstacle,
  tTime,
  tTimeBonus,
  cans,
  cansPickupAndReturn,
];
