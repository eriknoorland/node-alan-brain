((document, socket) => {
  const stateSelect = document.querySelector('[data-js-controls-stateSelect]');
  const startButton = document.querySelector('[data-js-controls-startButton]');
  const stopButton = document.querySelector('[data-js-controls-stopButton]');
  const shutdownButton = document.querySelector('[data-js-controls-shutdownButton]');

  /**
   * Init
   */
  function init() {
    startButton.addEventListener('click', onStartClick);
    stopButton.addEventListener('click', onStopClick);
    shutdownButton.addEventListener('click', onShutdownClick);
  }

  /**
   * Start click event handler
   */
  function onStartClick() {
    const state = parseInt(stateSelect.value, 10);

    if (!isNaN(state)) {
      socket.emit('start', state);
    }
  }

  /**
   * Stop click event handler
   */
  function onStopClick() {
    socket.emit('stop');
  }

  /**
   * Shutdown click event handler
   */
  function onShutdownClick() {
    socket.emit('shutdown');
  }

  init();

})(document, window.socket);
