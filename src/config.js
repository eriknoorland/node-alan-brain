module.exports = {
  robot: {
    diameter: 24, // cm
  },
  timeout: { // ms
    start: 1000,
    pause: 100,
  },
  speed: { // cms/s
    straight: {
      fast: 20,
      slow: 10,
    },
    turn: {
      fast: 15,
      slow: 10,
    },
    rotate: {
      fast: 10,
      slow: 5,
    },
    lineFollowing: 20,
  },
  distance: { // mm
    front: {
      wall: {
        far: 750,
        close: 300,
      },
    },
    gap: {
      width: 4, // cm (options: 30, 15, 8, 4)
    },
  },
  pid: {
    lineFollowing: {
      Kp: 0.25,
    },
  },
  obstacles: {
    can: {
      diameter: 6.5, // cm
    },
  },
  loopTime: 1000 / 50, // ms
};
