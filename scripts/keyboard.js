/**
 * Keyboard input handler
 * Tracks key press states for game controls
 */
class KeyBoard {
  constructor() {
    this.keys = {};
  }

  /**
   * Register keyboard event listeners
   * @returns {KeyBoard} this instance for chaining
   */
  addEvents() {
    window.addEventListener('keydown', (event) => {
      this.keys[event.code] = true;
    });

    window.addEventListener('keyup', (event) => {
      this.keys[event.code] = false;
    });

    return this;
  }

  /**
   * Get all tracked keys
   * @returns {Object} keys object
   */
  getKeys() {
    return this.keys;
  }

  /**
   * Check if a specific key is currently pressed
   * @param {string} key - The key code to check (e.g., 'ArrowLeft')
   * @returns {boolean} true if key is pressed
   */
  isKeyPress(key) {
    return this.getKeys()[key];
  }
}
