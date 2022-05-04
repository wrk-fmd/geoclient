import {DomUtil} from 'leaflet';
import {i18n} from '../i18n';
import {Http} from '../util';

/**
 * This class loads a modal dialog from a remote source dynamically
 */
export class Modal {

  private readonly container: HTMLElement;
  private readonly body: HTMLElement;
  private loaded: boolean = false;

  constructor(private readonly url: string) {
    // Wrappers
    this.container = DomUtil.create('div', 'modal', document.body);
    const content = DomUtil.create('div', 'modal-content', this.container);

    // Close button and event handler
    const close = DomUtil.create('button', 'close', content);
    close.innerHTML = '&times;';
    close.onclick = () => this.close();

    // Modal body
    this.body = DomUtil.create('div', 'modal-body', content);
    this.body.innerText = i18n('modal.loading');
  }

  /**
   * Remove the modal from the DOM
   */
  remove() {
    this.container.remove();
  }

  /**
   * Open the modal dialog
   */
  show() {
    if (!this.loaded) {
      Http.getText(this.url).then(text => {
        this.loaded = true;
        this.body.innerHTML = text;
      })
    }
    DomUtil.addClass(this.container, 'show');
  }

  /**
   * Close the modal dialog
   */
  close() {
    DomUtil.removeClass(this.container, 'show');
  }
}
