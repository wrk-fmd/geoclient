import {Control, easyButton, Map} from 'leaflet';

import {i18n} from '../i18n';
import {AppState} from '../state';

/**
 * This class handles toggling the text markers mode
 */
export class TextToggle {

  private readonly button: Control.EasyButton;

  constructor(private readonly state: AppState, private readonly map: Map) {
    // Create the button for enabling/disabling auto-follow
    this.button = easyButton({
      tagName: 'a',
      states: [
        {
          stateName: 'text-markers-dots',
          icon: 'fa-comment-slash',
          title: i18n('text.mode.text'),
          onClick: () => this.showText(),
        }, {
          stateName: 'text-markers-text',
          icon: 'fa-comment',
          title: i18n('text.mode.dots'),
          onClick: () => this.showDots(),
        }
      ],
    }).addTo(map);

    // Initialize to mode
    state.session.showMarkerText ? this.showText() : this.showDots();
  }

  private showText() {
    this.state.session.setShowMarkerText(true);
    this.button.state('text-markers-text');
    this.map.getContainer().classList.remove('text-markers-dots');
    this.map.getContainer().classList.add('text-markers-text');
  }

  private showDots() {
    this.state.session.setShowMarkerText(false);
    this.button.state('text-markers-dots');
    this.map.getContainer().classList.remove('text-markers-text');
    this.map.getContainer().classList.add('text-markers-dots');
  }
}
