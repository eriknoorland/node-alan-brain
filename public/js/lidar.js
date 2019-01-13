((document, io) => {
  const socket = io();
  const canvas = document.getElementById('lidar');
  const context = canvas.getContext('2d');
  const centerX = canvas.width * 0.5;
  const centerY = canvas.height * 0.5;

  /**
   *
   */
  function init() {
    bindEvents();
  }

  /**
   *
   */
  function bindEvents() {
    socket.on('data', onData);
  }

  /**
   *
   */
  function onData(data) {
    clear();
    drawSurroundings(data);
    drawMe();
  }

  /**
   *
   */
  function drawMe() {
    context.fillStyle = '#f00';
    context.fillRect(centerX, centerY, 3, 3);
  }

  /**
   *
   * @param {String} data
   */
  function drawSurroundings(data) {
    const parsedData = JSON.parse(data);
    
    parsedData.lidar.forEach((measurement) => {
      const angle = measurement[0];
      const distance = measurement[1];
      const posX = Math.sin(angle) * distance;
      const posY = Math.cos(angle) * distance;

      context.fillStyle = '#000';
      context.fillRect(centerX + posX, centerY + posY, 3, 3);
    });
  }

  /**
   *
   */
  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  init();
})(document, window.io);
