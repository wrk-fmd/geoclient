import {LocalizedStrings} from './localized-strings';

const strings: LocalizedStrings = {
  'init.failed': 'Application failed to load!',
  'baselayer.attribution': 'Base Map',
  'baselayer.basemap': 'Map',
  'baselayer.ortho': 'Satellite Image',
  'baselayer.ortho-labels': 'Satellite Image with Labels',
  'baselayer.terrain': 'Terrain',
  'baselayer.osm': 'OpenStreetMap',
  'overlay.position': 'Own Position',
  'overlay.incidents': 'Incidents',
  'overlay.units': 'Units',
  'connection.success': 'Continuous communication with server',
  'connection.error': 'Connection failed: Click to reload',
  'locator.follow.disable': 'Disable automatic map movement',
  'locator.follow.enable': 'Enable automatic map movement to own location',
  'locator.location.success': 'Own location found',
  'locator.location.error': 'Own location not found: Click to reload',
  'locator.location.popup': 'You are here within {{accuracy}} meters.',
  'units.busy.show': 'Show all units',
  'units.busy.hide': 'Only show available units',
  'units.search.button': 'Search units',
  'units.search.prompt': 'Search units (case insensitive)',
  'units.cluster.activate': 'Cluster units with similar location',
  'units.cluster.deactivate': 'Always show individual units',
  'text.mode.dots': 'Hide POI text',
  'text.mode.text': 'Permanently show POI text',
  'help.title': 'Help',
  'modal.loading': 'Loading...',
};
export default strings;
