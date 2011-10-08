var KeyboardHandler, KeyboardState, KeyState;

/**
 * Creates an instance of the KeyboardHandler.
 *
 * @constructor
 * @param {Element} element The element to listen on.
 * @param {boolean=} opt_preventDefault If true, prevents default on events.
 */
KeyboardHandler = function (element, opt_preventDefault) {

  var add;

  /**
   * The element to listen on.
   *
   * @private
   * @type {Element}
   */
  this._element = element;

  /**
   * If true, prevent default on events.
   *
   * @private
   * @type {boolean}
   */
  this._prevent = !!opt_preventDefault;

  /**
   * A record of the keyboard state.
   *
   * @private
   * @type {KeyboardState}
   */
  this._keyboardState = new KeyboardState();
  add = element.addEventListener || element.attachEvent;
  // Intentionally avoiding Function.bind for compatibility.

  /**
   * @private
   * @type {function}
   */
  this._boundHandleKeyUp = (function (me) {
    return function (e) {
      me._handleKeyUp(e);
    };
  })(this);

  /**
   * @private
   * @type {function}
   */
  this._boundHandleKeyDown = (function (me) {
    return function (e) {
      me._handleKeyDown(e);
    };
  })(this);

  /**
   * @private
   * @type {function}
   */
  this._boundHandleKeyPress = (function (me) {
    return function (e) {
      me._handleKeyPress(e);
    };
  })(this);

  // Listen to key events.
  add.call(element, 'keydown', this._boundHandleKeyDown, false);
  add.call(element, 'keypress', this._boundHandleKeyPress, false);
  add.call(element, 'keyup', this._boundHandleKeyUp, false);
};

/**
 * @param {boolean=} opt_noHold If true, increment held time on buttons.
 * @return {KeyboardState}
 */
KeyboardHandler.prototype.getKeyboardState = function (opt_noHold) {

  var keyboardState;

  keyboardState = this._keyboardState.clone();
  if (!opt_noHold) {
    this._keyboardState.hold();
  }
  return keyboardState;
};

/**
 * Dispose of the KeyboardHandler.
 */
KeyboardHandler.prototype.dispose = function () {

  var remove;

  remove = this._element.removeEventListener || this._element.detachEvent;
  remove.call(this._element, 'keydown', this._boundKeyHandleKeyDown, false);
  remove.call(this._element, 'keypress', this._boundHandleKeyPress, false);
  remove.call(this._element, 'keyup', this._boundHandleKeyUp, false);
  this._element = null;
  delete this._boundHandleKeyDown;
  delete this._boundHandleKeyPress;
  delete this._boundHandleKeyUp;
};

/**
 * @private
 * @param {Event} e The key down event.
 */
KeyboardHandler.prototype._handleKeyDown = function (e) {
  this._keyboardState.press(KeyboardHandler.getKeyCode(e));
  if (this._prevent) {e.preventDefault();}
};

/**
 * @private
 * @param {Event} e The key up event.
 */
KeyboardHandler.prototype._handleKeyUp = function (e) {
  this._keyboardState.release(KeyboardHandler.getKeyCode(e));
  if (this._prevent) {e.preventDefault();}
};

/**
 * @private
 * @param {Event} e The key press event.
 */
KeyboardHandler.prototype._handleKeyPress = function (e) {
  console.log('asdf');
  if (this._prevent) {e.preventDefault();}
};

/**
 * Get the key code from the event (either from Event.keycode or Event.which).
 *
 * @param {Event} e The key event.
 * @return {number}
 */
KeyboardHandler.getKeyCode = function (e) {

  var ev;

  ev = e || window.event;
  return ev.keyCode || ev.which;
};

/**
 * Creates a KeyState, representing a single key's status.
 *
 * @constructor
 * @param {boolean=} opt_pressed If true, the button is considered pressed.
 * @param {number=} opt_presses Number of presses to report this cycle
 *     (default: 0).
 * @param {number=} opt_duration Number of cycles this button has been held
 *     (default: 0).
 */
KeyState = function (opt_pressed, opt_presses, opt_duration) {

  /**
   * Whether or not the button is considered pressed.
   *
   * @type {boolean}
   */
  this.pressed = !!opt_pressed;

  /**
   * Number of times this button was pressed this cycle.
   *
   * @type {boolean}
   */
  this.presses = opt_presses || 0;

  /**
   * Number of cycles this button has been held.
   *
   * @type {boolean}
   */
  this.duration = opt_duration || 0;
};

/**
 * @return {KeyState}
 */
KeyState.prototype.clone = function () {
  return new KeyState(this.pressed, this.presses, this.duration);
};

/**
 * Creates the KeyboardState, a collection of KeyStates.
 *
 * @constructor
 */
KeyboardState = function () {
  this._keyStates = [];
};

/**
 * @return {KeyboardState}
 */
KeyboardState.prototype.clone = function () {

  var i, keyState, clone;

  clone = new KeyboardState();
  i = this._keyStates.length;
  while (i--) {
    if (keyState = this._keyStates[i]) {
      clone.setKeyState(i, keyState.clone());
    }
  }
  return clone;
};

/**
 * Set a key state by key code.
 *
 * @param {number} keyCode The key's key code.
 * @param {KeyState} keyState The key's KeyState representation.
 */
KeyboardState.prototype.setKeyState = function (keyCode, keyState) {
  this._keyStates[keyCode] = keyState;
};

/**
 * Get a key state by key code.
 *
 * @param {number} keyCode The key's key code.
 * @return {KeyState}
 */
KeyboardState.prototype.getKeyState = function (keyCode) {
  return this._keyStates[keyCode] ||
      (this._keyStates[keyCode] = new KeyState());
};

/**
 * Set a key as pressed.
 *
 * @param {number} keyCode The key's key code.
 */
KeyboardState.prototype.press = function (keyCode) {

  var keyState;

  keyState = this.getKeyState(keyCode);
  keyState.pressed = true;
  keyState.presses++;
};

/**
 * Set a key as unpressed.
 *
 * @param {number} keyCode The key's key code.
 */
KeyboardState.prototype.release = function (keyCode) {

  var keyState;

  keyState = this.getKeyState(keyCode);
  keyState.pressed = false;
  keyState.duration = 0;
};

/**
 * Indicate the completion of a cycle, iterating all durations and resetting
 *   all pressed values.
 */
KeyboardState.prototype.hold = function () {

  var i, keyState;

  i = this._keyStates.length;
  while (i--) {
    if (keyState = this._keyStates[i]) {
      keyState.presses = 0;
      if (keyState.pressed) {
        keyState.duration++;
      }
    }
  }
};

/**
 * Tells whether a key is pressed, i.e. presently down.
 *
 * @param {number} keyCode The key's key code.
 * @return {boolean}
 */
KeyboardState.prototype.isPressed = function (keyCode) {

  var keyState;

  return (keyState = this._keyStates[keyCode]) ? keyState.pressed : false;
};

/**
 * Tells whether a key is held, e.g. has been down for more than one cycle.
 *
 * @param {number} keyCode The key's key code.
 * @return {boolean}
 */
KeyboardState.prototype.isHeld = function (keyCode) {

  var keyState;

  return this.isPressed(keyCode) &&
      ((keyState = this._keyStates[keyCode]) ? !!keyState.duration : false);
};
