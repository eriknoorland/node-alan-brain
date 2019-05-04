((document, socket) => {
  const element = document.getElementById('battery');
  const indicatorElement = element.querySelector('[data-js-battery-indicator]');
  const percentageElement = element.querySelector('[data-js-battery-percentage]');
  const minVoltage = 3.2;
  const maxVoltage = 4.2;

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
  function onData({ battery }) {
    const { voltage } = battery;
    const level = Math.floor(((voltage - minVoltage) * 100) / (maxVoltage - minVoltage));

    if (level <= 20) {
      indicatorElement.classList.add('_is_too_low');
    }

    indicatorElement.style.width = `${level}%`;
    percentageElement.innerText = `${level}%`;
  }

  init();
})(document, window.socket);
