module.exports = {
  timeout: {
    start: 3000, // ms
    pause: 250, // ms
  },
  speed: {
    straight: {
      fast: 20, // cms/s
      slow: 10, // cms/s
    },
    turn: {
      fast: 15, // cms/s
      slow: 10, // cms/s
    },
    rotate: {
      fast: 10, // cms/s
      slow: 5, // cms/s
    },
    lineFollowing: 15, // cm/s
  },
  distance: {
    front: {
      wall: {
        far: 750, // mm
        close: 300, // mm
      },
    },
  },
  pid: {
    lineFollowing: {
      Kp: 0.25,
    },
  },
  loopTime: 1000 / 50, // ms
};
