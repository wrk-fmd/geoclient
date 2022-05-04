import {Control, easyButton} from 'leaflet';

import {i18n} from '../i18n';
import {AppState} from '../state';

/**
 * This is a simple service for keeping track of connection errors
 */
export class ErrorService {

  readonly indicator: Control.EasyButton;

  constructor(private readonly state: AppState) {
    this.indicator = easyButton({
      position: 'bottomleft',
      tagName: 'a',
      states: [
        {
          stateName: 'connection-success',
          icon: 'fa-plug state-success',
          title: i18n('connection.success'),
          onClick: () => {
          },
        }, {
          stateName: 'connection-error',
          icon: 'fa-plug state-error',
          title: i18n('connection.error'),
          onClick: () => this.reload(),
        }
      ],
    });
  }

  clearConnectionError() {
    this.indicator.state('connection-success');
  }

  setConnectionError(message: string, e?: any) {
    // Update the indicator to error state
    this.indicator.state('connection-error');

    // Display the error
    this.displayError(message, e);
  }

  displayError(message: string, e?: any) {
    this.state.logger?.warn(message, e);
    // TODO report on UI?
  }

  reload() {
    window.location.reload();
  }
}
