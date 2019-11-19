const remote = require('./states/remote');
const backAndForth = require('./states/backAndForth');
// const slalom = require('./states/slalom');
const superSlalom = require('./states/superSlalom');
const lineFollower = require('./states/lineFollower');
// const lineFollowerObstacle = require('./states/lineFollowerObstacle');
const tTime = require('./states/tTime');
const tTimeBonus = require('./states/tTimeBonus');
// const cans = require('./states/cans');
// const cansPickupAndReturn = require('./states/cansPickupAndReturn');

module.exports = [
  {
    name: 'Remote',
    module: remote,
  },
  {
    name: 'Heen & Weer',
    module: backAndForth,
  },
  // {
  //   name: 'Slalom',
  //   module: slalom,
  // },
  {
    name: 'Super Slalom',
    module: superSlalom,
  },
  {
    name: 'Lijnvolgen',
    module: lineFollower,
  },
  // {
  //   name: 'Lijnvolgen Obstakel',
  //   module: lineFollowerObstacle,
  // },
  {
    name: 'T-Tijd',
    module: tTime,
  },
  {
    name: 'T-Tijd Bonus',
    module: tTimeBonus,
  },
  // {
  //   name: 'Blikken',
  //   module: cans,
  // },
  // {
  //   name: 'Blikken Retour',
  //   module: cansPickupAndReturn,
  // },
];
