// buttons
// 0: cross
// 1: circle
// 2: square
// 3: triangle
// 4: L1
// 5: R1
// 4: L2
// 5: R2
// 8: select
// 9: start
// 10: left stick press
// 11: right stick press
// 12: D-pad up
// 13: D-pad down
// 14: D-pad left
// 15: D-pad right
// 16: PS

((document, io) => {
  const socket = io();
  const haveEvents = 'ongamepadconnected' in window;
  const controllers = {};

  /**
   * 
   */
  function connecthandler(e) {
    addgamepad(e.gamepad);
  }

  /**
   * 
   */
  function addgamepad(gamepad) {
    controllers[gamepad.index] = gamepad;

    var d = document.createElement('div');
    d.setAttribute('id', 'controller' + gamepad.index);
    d.setAttribute('class', 'controller');

    // gamepad.id;

    var b = document.createElement('div');
    b.className = 'buttons';
    for (var i = 0; i < gamepad.buttons.length; i++) {
      var e = document.createElement('span');
      e.className = 'button';
      //e.id = 'b' + i;
      e.innerHTML = i;
      b.appendChild(e);
    }

    d.appendChild(b);

    var a = document.createElement('div');
    a.className = 'axes';

    for (var i = 0; i < gamepad.axes.length; i++) {
      var p = document.createElement('progress');
      p.className = 'axis';
      //p.id = 'a' + i;
      p.setAttribute('max', '2');
      p.setAttribute('value', '1');
      p.innerHTML = i;
      a.appendChild(p);
    }

    d.appendChild(a);

    // See https://github.com/luser/gamepadtest/blob/master/index.html
    var start = document.getElementById('start');

    if (start) {
      start.style.display = 'none';
    }

    document.body.appendChild(d);
    requestAnimationFrame(updateStatus);
  }

  /**
   * 
   */
  function disconnecthandler(e) {
    removegamepad(e.gamepad);
  }

  /**
   * 
   */
  function removegamepad(gamepad) {
    var d = document.getElementById('controller' + gamepad.index);
    
    document.body.removeChild(d);
    delete controllers[gamepad.index];
  }

  /**
   * 
   */
  function updateStatus() {
    if (!haveEvents) {
      scangamepads();
    }

    for (var j in controllers) {
      var controller = controllers[j];
      var d = document.getElementById('controller' + j);
      var buttons = d.getElementsByClassName('button');

      for (var i = 0; i < controller.buttons.length; i++) {
        var b = buttons[i];
        var val = controller.buttons[i];
        var pressed = val == 1.0;

        if (typeof(val) == 'object') {
          pressed = val.pressed;
          val = val.value;
        }

        var pct = Math.round(val * 100) + '%';

        b.style.backgroundSize = pct + ' ' + pct;
        b.className = pressed ? 'button pressed' : 'button';

        if (pressed) {
          triggerAction(i);
        }
      }

      var axes = d.getElementsByClassName('axis');

      for (i = 0; i < controller.axes.length; i++) {
        var a = axes[i];

        a.innerHTML = i + ': ' + controller.axes[i].toFixed(4);
        a.setAttribute('value', controller.axes[i] + 1);
      }
    }

    requestAnimationFrame(updateStatus);
  }

  /**
   * 
   */
  function scangamepads() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
    
    for (var i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        if (gamepads[i].index in controllers) {
          controllers[gamepads[i].index] = gamepads[i];
        } else {
          addgamepad(gamepads[i]);
        }
      }
    }
  }

  /**
   * 
   * @param {int} index
   */
  function triggerAction(index) {
    switch (index) {
      case 0: // cross
        socket.emit('stop');
        break;
      case 1: // circle
        // socket.emit('');
        break;
      case 2: // square
        socket.emit('beep');
        break;
      case 12: // D-pad up
        socket.emit('forward');
        break;
      case 13: // D-pad down
        socket.emit('reverse');
        break;
      case 14: // D-pad left
        socket.emit('rotateLeft');
        break;
      case 15: // D-pad right
        socket.emit('rotateRight');
        break;
    }
  }

  window.addEventListener('gamepadconnected', connecthandler);
  window.addEventListener('gamepaddisconnected', disconnecthandler);

  if (!haveEvents) {
    setInterval(scangamepads, 500);
  }
})(document, window.io);
