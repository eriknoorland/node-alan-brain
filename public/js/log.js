((document, io) => {
  const socket = io();
  const logElement = document.getElementById('log');

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
    socket.on('log', onLog);
  }

  /**
   *
   */
  function onLog(log) {
    const body = log
      .split(',')
      .reverse()
      .join('\n');

    logElement.innerHTML = body;
  }

  init();
})(document, window.io);
