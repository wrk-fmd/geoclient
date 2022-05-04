import {Layer} from 'leaflet';
import {MarkerProperties} from './geojson';

export interface OverlayOptions {
  /**
   * Whether the overlay should be ignored
   * This is essentially "commenting out", which is not otherwise possible in JSON
   */
  ignore?: boolean;

  /**
   * Whether the overlay requires authentication (id and token set)
   */
  authenticate?: boolean;

  /**
   * Type of the data, defaults to GeoJSON
   */
  type?: string;

  /**
   * The URL from which the data is loaded
   */
  url: string;

  /**
   * The layer name which overrides any name given in the data
   */
  name?: string;

  /**
   * An optional attribution string shown on the map
   */
  attribution?: string;

  /**
   * Whether the overlay should be shown by default
   */
  defaultShow?: boolean;

  /**
   * Optional keyboard shortcuts for toggling the overlay
   */
  shortcuts?: string[];
}

export interface GeoJsonOverlayOptions extends OverlayOptions {

  /**
   * GeoJSON is the default type, so the property is optional here
   */
  type?: 'geojson';

  /**
   * Default marker properties which override default properties given in the data
   */
  markerDefaults?: MarkerProperties;
}

export interface WmsOverlayOptions extends OverlayOptions {
  type: 'wms';
  layers: string;
}

export interface LoadedOverlay {
  layer: Layer;
  name: string;
  defaultShow?: boolean;
  shortcuts?: string[];
}
