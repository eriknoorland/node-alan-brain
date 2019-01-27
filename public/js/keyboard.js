((document, io) => {
  document.addEventListener('keydown', onKeyDown);

  function onKeyDown(event) {
    switch (event.keyCode) {
      case 32: // spacebar
        socket.emit('stop');
        break;
      case 66: // b
        socket.emit('beep');
        break;
      case 38: // arrow up
        socket.emit('forward');
        break;
      case 40: // arrow down
        socket.emit('reverse');
        break;
      case 37: // arrow left
        socket.emit('rotateLeft');
        break;
      case 39: // arrow right
        socket.emit('rotateRight');
        break;
    }
  }
})(document, window.io);
