((document, socket) => {
  document.addEventListener('keydown', onKeyDown);

  function onKeyDown(event) {
    switch (event.keyCode) {
      case 32: // spacebar
        socket.emit('remote.stop');
        break;
      case 66: // b
        socket.emit('remote.beep');
        break;
      case 38: // arrow up
        socket.emit('remote.forward');
        break;
      case 40: // arrow down
        socket.emit('remote.reverse');
        break;
      case 37: // arrow left
        socket.emit('remote.rotateLeft');
        break;
      case 39: // arrow right
        socket.emit('remote.rotateRight');
        break;
    }
  }
})(document, window.socket);
