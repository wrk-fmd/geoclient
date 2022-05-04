import {i18n} from './i18n';
import {AppState, Config, Session} from './state';
import {GeoclientMap} from './map';

// Make sure the EasyButton extension for Leaflet is loaded
import 'leaflet-easybutton';

// Make sure that the marker icons are included in the build
require('leaflet/dist/images/marker-icon-2x.png');
require('leaflet/dist/images/marker-icon.png');
require('leaflet/dist/images/marker-shadow.png');

async function init() {
  // Load remote config
  const config = await Config.loadRemoteConfig('config/config.json');

  // Load session data
  const session = new Session(config);

  // Build the app state with all the services from the config data
  const state = new AppState(config, session);

  if (session.authenticated) {
    // Initialize data loading
    setInterval(() => state.apiService.getScope().then(data => state.dataService.updateAll(data)), state.config.refreshInterval);
  }

  // Create the map
  new GeoclientMap('map', state);
}

init().catch(e => {
  console.error('Error on init: ', e);
  window.alert(i18n('init.failed'));
});
