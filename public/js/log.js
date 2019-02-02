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
    socket.on('disconnect', () => {
      const disconnectMessage = '<span style="color: #f92472;">[app] terminated</span>';
      const currentLog = logElement.innerHTML;
      
      logElement.innerHTML = [disconnectMessage, currentLog].join('\n');
    });
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
