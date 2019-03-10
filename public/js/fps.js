((document, io) => {
  const socket = io();
  const element = document.getElementById('fps');

  /**
   * Init
   */
  function init() {
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
  function onData({ fps }) {
    element.innerText = `FPS: ${Math.floor(fps.actual)}/${fps.target}`;
  }

  init();
})(document, window.io);
