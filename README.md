image_loader.js
=======

A class for handling keyboard input periodically, e.g. a game loop.

usage
-----

    var kh = new KeyboardHandler(
      // Element to listen on for key events.
      document.getElementById('my-element'),
      // Whether to prevent default (optional), e.g. keep arrows from scrolling.
      true
    );

    window.setInterval(
      function () {
        // Get a snapshot of the keyboard.
        var kbState = kh.getKeyboardState();
        // Get info on a specific key (in this example, the left arrow)..
        var keyState = kbState.getKeyState(37);
        // Use the key information
        if (keyState.pressed) {
          console.log('Left arrow is pressed right now.');
        }
        if (keyState.presses > 0) {
          console.log('Left arrow was pressed ' + keyState.presses + ' times ' +
              'since last snapshot (but may not be held down right now).');
        }
        if (keyState.duration > 0) {
          console.log('Left arrow has been held for ' + keyState.duration +
              ' snapshots.');
        }
      },
      100
    );

license
-------

See `LICENSE` file.

> Copyright (c) 2011 John Davidson
