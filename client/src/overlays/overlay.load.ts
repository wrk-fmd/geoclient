import {AppState} from '../state';
import {GeoJsonOverlay} from './geojson.overlay';
import {GeoJsonOverlayOptions, LoadedOverlay, OverlayOptions, WmsOverlayOptions} from './overlay.options';
import {loadWmsOverlay} from './wms.overlay';

export async function loadOverlays(state: AppState, overlays: OverlayOptions[]): Promise<LoadedOverlay[]> {
  const results = await Promise.all(overlays.map(options => loadOverlay(state, options)));
  return results.filter((o): o is NonNullable<LoadedOverlay> => !!o);
}

export async function loadOverlay(state: AppState, options: OverlayOptions): Promise<LoadedOverlay | null> {
  try {
    if (options.ignore) {
      // Overlay is disabled, do not load anything
      return null;
    }

    if (options.authenticate && !state.session.authenticated) {
      // Overlay requires authentication, do not load anything
      return null;
    }

    // Load the overlay by type
    const overlay = await loadTypeSpecific(options);
    return {
      ...overlay,
      defaultShow: options.defaultShow,
      shortcuts: options.shortcuts,
    }
  } catch (e) {
    // TODO show in UI?
    state.logger?.warn('Failed to load overlay: ', options, e);
    return null;
  }
}

async function loadTypeSpecific(options: OverlayOptions): Promise<LoadedOverlay> {
  if (isGeojsonOverlayOptions(options)) {
    return GeoJsonOverlay.loadFromUrl(options);
  }
  if (isWmsOverlayOptions(options)) {
    return loadWmsOverlay(options);
  }
  throw new Error(`Unknown overlay type '${options.type}'`);
}

function isGeojsonOverlayOptions(options: OverlayOptions): options is GeoJsonOverlayOptions {
  return !options.type || options.type === 'geojson';
}

function isWmsOverlayOptions(options: OverlayOptions): options is WmsOverlayOptions {
  return options.type === 'wms';
}
