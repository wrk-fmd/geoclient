type KeyboardCallback = () => void;

/**
 * This service provides an abstraction for keyboard shortcuts
 */
export class KeyboardService {

  private readonly callbacks: Map<string, KeyboardCallback[]>;

  constructor() {
    this.callbacks = new Map();

    // Listen for keyboard events
    document.body.addEventListener('keydown', e => this.onKeyDown(e));
  }

  /**
   * Register a callback for a key event
   * @param key The key or an array of keys to listen for as given
   * @param callback The callback to register
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values}
   */
  registerCallback(key: string | string[] | undefined, callback: () => void) {
    if (Array.isArray(key)) {
      key.forEach(k => this.registerCallback(k, callback));
    } else if (key !== undefined) {
      const callbacks = this.callbacks.get(key);
      if (callbacks) {
        callbacks.push(callback);
      } else {
        this.callbacks.set(key, [callback]);
      }
    }
  }

  private onKeyDown(e: KeyboardEvent) {
    // Build the string identifying the key
    let key = '';
    if (e.altKey) {
      key += 'alt+';
    }
    if (e.ctrlKey) {
      key += 'ctrl+';
    }
    // This also handles shift implicitly
    key += e.key;

    this.callbacks.get(key)?.forEach(callback => {
      // Trigger the callback and make sure the default action is not applied
      callback();
      e.preventDefault();
    });
  }
}
