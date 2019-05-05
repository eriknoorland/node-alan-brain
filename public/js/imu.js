((document, socket) => {
  const element = document.getElementById('heading');
  const canvas = document.getElementById('imu');
  const context = canvas.getContext('2d');
  
  let centerX = canvas.width * 0.5;
  let centerY = canvas.height * 0.5;

  /**
   * Init
   */
  function init() {
    canvas.setAttribute('width', canvas.clientWidth);
    canvas.setAttribute('height', canvas.clientWidth);

    centerX = canvas.width * 0.5;
    centerY = canvas.height * 0.5;

    bindEvents();
  }

  /**
   * Bind handlers to events
   */
  function bindEvents() {
    socket.on('data', onData);
  }

  /**
   * On data even thandler
   */
  function onData({ imu }) {
    const { heading } = imu;

    element.innerText = `${heading}°`;

    clear();
    drawLine();
    drawLine(heading, '#f00');
  }

  /**
   *
   * @param {Number} angle
   * @param {String} color
   */
  function drawLine(angle = 0, color = '#ccc') {
    const posX = centerX + ((centerX - 10) * Math.cos(((angle - 90) * Math.PI) / 180));
    const posY = centerY + ((centerY - 10) * Math.sin(((angle - 90) * Math.PI) / 180));
    
    context.lineWidth = 3;
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(posX, posY);
    context.stroke();
  }

  /**
   *
   */
  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  init();
})(document, window.socket);
