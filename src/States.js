const remote = require('./states/remote');
const backAndForth = require('./states/backAndForth');
const slalom = require('./states/slalom');
const superSlalom = require('./states/superSlalom');
const lineFollower = require('./states/lineFollower');
const lineFollowerObstacle = require('./states/lineFollowerObstacle');
const tTime = require('./states/tTime');
const tTimeBonus = require('./states/tTimeBonus');
const cans = require('./states/cans');
const cansPickupAndReturn = require('./states/cansPickupAndReturn');

module.exports = [
  remote,
  backAndForth,
  slalom,
  superSlalom,
  lineFollower,
  lineFollowerObstacle,
  tTime,
  tTimeBonus,
  cans,
  cansPickupAndReturn,
];
