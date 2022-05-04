import {tileLayer} from 'leaflet';

import {LoadedOverlay, WmsOverlayOptions} from './overlay.options';

export function loadWmsOverlay(options: WmsOverlayOptions): LoadedOverlay {
  const layer = tileLayer.wms(options.url, {
    attribution: options.attribution,
    layers: options.layers,
    format: 'image/png',
    transparent: true,
  });
  return {layer, name: options.name || 'Unnamed WMS layer'};
}
