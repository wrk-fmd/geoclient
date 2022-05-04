import {LatLngExpression} from 'leaflet';

import {OverlayOptions} from '../overlays';
import {Http} from '../util';

const defaultConfig: ConfigInterface = {
  refreshInterval: 2000,
  onlineTimeout: 30 * 60000,

  initialPosition: {lat: 48.2089816, lng: 16.3710193},
  initialZoom: 14,

  apiUrl: '/api/v1/public',

  unitColors: {},

  overlays: [],

  shortcuts: {
    search: ['ctrl+f', '/'],
    resetLayers: ['ctrl+x', 'Home'],
    toggleBusyUnits: [' '],
    toggleLocationOverlay: ['l'],
    toggleIncidentsOverlay: ['i'],
    toggleUnitsOverlay: ['u'],
    zoomIn: ['PageUp', '+'],
    zoomOut: ['PageDown', '-'],
    panN: ['ArrowUp'],
    panE: ['ArrowRight'],
    panS: ['ArrowDown'],
    panW: ['ArrowLeft'],
  },
}

export interface ConfigInterface {
  /**
   * Interval for refreshing data in milliseconds
   */
  refreshInterval: number;

  /**
   * Timeout after which a unit is considered to be "offline" in milliseconds
   */
  onlineTimeout: number;

  /**
   * Initial map position
   */
  initialPosition: LatLngExpression;

  /**
   * Initial map zoom
   */
  initialZoom: number;

  /**
   * Base URL for the API
   */
  apiUrl: string;

  /**
   * Custom unit colors
   */
  unitColors: { [name: string]: string };

  /**
   * Custom overlays
   */
  overlays: OverlayOptions[];

  /**
   * Keyboard shortcuts
   */
  shortcuts: KeyboardShortcuts;
}

export interface KeyboardShortcuts {
  search?: string[];
  resetLayers?: string[];
  toggleBusyUnits?: string[];
  toggleLocationOverlay?: string[];
  toggleIncidentsOverlay?: string[];
  toggleUnitsOverlay?: string[];
  zoomIn?: string[];
  zoomOut?: string[];
  panN?: string[];
  panE?: string[];
  panS?: string[];
  panW?: string[];
}

export class Config implements ConfigInterface {

  readonly refreshInterval;
  readonly onlineTimeout;
  readonly initialPosition;
  readonly initialZoom;
  readonly apiUrl;
  readonly unitColors;
  readonly overlays;
  readonly shortcuts;

  constructor(config?: Partial<ConfigInterface>) {
    // Copy config values or use defaults
    this.refreshInterval = config?.refreshInterval || defaultConfig.refreshInterval;
    this.onlineTimeout = config?.onlineTimeout || defaultConfig.onlineTimeout;
    this.initialPosition = config?.initialPosition || defaultConfig.initialPosition;
    this.initialZoom = config?.initialZoom || defaultConfig.initialZoom;
    this.apiUrl = config?.apiUrl || defaultConfig.apiUrl;
    this.unitColors = config?.unitColors || defaultConfig.unitColors;
    this.overlays = config?.overlays || defaultConfig.overlays;
    this.shortcuts = config?.shortcuts ? {...defaultConfig.shortcuts, ...config?.shortcuts} : defaultConfig.shortcuts;
  }

  static async loadRemoteConfig(url: string): Promise<Config> {
    return Http.getJson<Partial<ConfigInterface>>(url).then(c => new Config(c));
  }
}
