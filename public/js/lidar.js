((document, socket) => {
  const canvas = document.getElementById('lidar');
  const context = canvas.getContext('2d');
  const centerX = canvas.width * 0.5;
  const centerY = canvas.height * 0.5;
  const distanceCircles = [20, 40, 60, 80, 100, 120, 140, 160, 180]; // cm radius

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
  function onData({ lidar }) {
    clear();
    drawSurroundings(lidar);
    drawDistanceCircles();
    drawMe();
  }

  /**
   *
   */
  function drawMe() {
    context.fillStyle = '#f00';
    context.strokeStyle = '#f00';

    context.fillRect(centerX - 2, centerY - 2, 4, 4);
    context.beginPath();
    context.arc(centerX, centerY, 6, 0, 2 * Math.PI);
    context.stroke();
  }

  /**
   * 
   */
  function drawDistanceCircles() {
    context.strokeStyle = '#ccc';

    distanceCircles.forEach((distance) => {
      context.beginPath();
      context.arc(centerX, centerY, distance, 0, 2 * Math.PI);
      context.stroke();
    });

    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(centerX, 10);
    context.stroke();
  }

  /**
   *
   * @param {String} data
   */
  function drawSurroundings(data) {
    Object.keys(data).forEach((angle) => {
      const distance = data[angle];

      if (distance < 120) {
        return;
      }

      const posX = Math.cos((parseInt(angle - 90, 10) * Math.PI) / 180) * (distance / 10); // mm to cm conversion
      const posY = Math.sin((parseInt(angle - 90, 10) * Math.PI) / 180) * (distance / 10); // mm to cm conversion

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
})(document, window.socket);
