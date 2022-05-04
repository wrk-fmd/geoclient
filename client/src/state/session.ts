import {LatLng, LatLngExpression} from 'leaflet';
import {TextUtils} from '../util';
import {Config} from './config';

/**
 * This class manages all configuration that is user-dependent
 * Data is read from and stored in query parameters of the browser URL
 */
export class Session {

  private readonly url: URL;
  private readonly overlays: { [key: string]: boolean } = {};

  constructor(private readonly config: Config) {
    this.url = new URL(window.location.href);
    this.overlays = this.parseOverlays();
  }

  /**
   * Obtains the unit id
   * @return The unit id, or null if none is set
   */
  get id(): string | null {
    return this.url.searchParams.get('id') || null;
  }

  /**
   * Obtains the unit token
   * @return The unit token, or null if none is set
   */
  get token(): string | null {
    return this.url.searchParams.get('token') || null;
  }

  /**
   * Checks whether the session is authenticated, i.e. unit id and token are provided
   * @return True iff both id and token are set
   */
  get authenticated(): boolean {
    return !!(this.id && this.token);
  }

  /**
   * Checks whether center mode is active
   * @return True iff the centerMode flag is given
   */
  get centerMode(): boolean {
    return this.url.searchParams.has('centerMode');
  }

  /**
   * Checks whether sending location is enabled
   * @return True iff the sendLocation flag is given
   */
  get sendLocation(): boolean {
    return this.url.searchParams.has('sendLocation');
  }

  /**
   * Checks whether the client location should be obtained
   * @return True iff in normal unit mode or sending location is explicitly requested
   */
  get doLocate(): boolean {
    return this.sendLocation || !this.centerMode;
  }

  /**
   * Checks whether debug mode is enabled
   * @return True iff the debug flag is given
   */
  get debug(): boolean {
    return this.url.searchParams.has('debug');
  }

  /**
   * Obtains the center of the map
   * @return The center of the map from the query params, or the default values from the static config
   */
  get center(): LatLngExpression {
    const lat = TextUtils.nullSafeParse(this.url.searchParams.get('lat'), parseFloat);
    const lng = TextUtils.nullSafeParse(this.url.searchParams.get('lng'), parseFloat);
    return isNaN(lat) || isNaN(lng) ? this.config.initialPosition : [lat, lng];
  }

  /**
   * Obtains the zoom level of the map
   * @return The zoom level from the query params, or the default value from the static config
   */
  get zoom(): number {
    const zoom = TextUtils.nullSafeParse(this.url.searchParams.get('zoom'), parseInt);
    return isNaN(zoom) ? this.config.initialZoom : zoom;
  }

  /**
   * Checks whether busy units should be hidden
   * @return True iff the hideBusyUnits flag is given
   */
  get hideBusyUnits(): boolean {
    return this.url.searchParams.has('hideBusyUnits');
  }

  /**
   * Checks whether text markers should be shown as text
   * @return True iff the showMarkerText flag is given
   */
  get showMarkerText(): boolean {
    return this.url.searchParams.has('showMarkerText');
  }

  /**
   * Obtains which base layer should be active
   * @return The name of the base layer
   */
  get baseLayer(): string | null {
    return this.url.searchParams.get('baseLayer');
  }

  /**
   * Checks whether a given overlay should be active
   * @param overlay The name of the overlay
   * @param defaultShow Whether the overlay should be shown by default
   * @return True iff the overlay should be active
   */
  getOverlayState(overlay: string, defaultShow?: boolean): boolean {
    const state = this.overlays[overlay];
    return state !== undefined ? state : !!defaultShow;
  }

  /**
   * Stores the center of the map
   * @param center The new center
   */
  setCenter(center: LatLng) {
    this.url.searchParams.set('lat', String(center.lat));
    this.url.searchParams.set('lng', String(center.lng));
    this.store();
  }

  /**
   * Stores the zoom level of the map
   * @param zoom The new zoom level
   */
  setZoom(zoom: number) {
    this.url.searchParams.set('zoom', String(zoom));
    this.store();
  }

  /**
   * Stores whether busy units are hidden
   * @param hideBusyUnits True iff busy units are hidden
   */
  setHideBusyUnits(hideBusyUnits: boolean) {
    hideBusyUnits
      ? this.url.searchParams.set('hideBusyUnits', '')
      : this.url.searchParams.delete('hideBusyUnits');
    this.store();
  }

  /**
   * Stores whether marker text is shown
   * @param showMarkerText True iff marker text should be shown
   */
  setShowMarkerText(showMarkerText: boolean) {
    showMarkerText
      ? this.url.searchParams.set('showMarkerText', '')
      : this.url.searchParams.delete('showMarkerText');
    this.store();
  }

  /**
   * Stores which base layer is active
   * @param layer The name of the new base layer
   */
  setBaseLayer(layer: string) {
    this.url.searchParams.set('baseLayer', layer);
    this.store();
  }

  /**
   * Stores whether a given overlay is active
   * @param overlay The name of the updated overlay
   * @param state The new state of the overlay
   */
  setOverlayState(overlay: string, state: boolean) {
    this.overlays[overlay] = state;
    this.url.searchParams.set('overlays', JSON.stringify(this.overlays));
    this.store();
  }

  private parseOverlays(): { [key: string]: boolean } {
    try {
      const json = this.url.searchParams.get('overlays');
      if (!json) {
        // No overlay data given, ignore
        return {};
      }

      // Parse JSON and store state
      return JSON.parse(json);
    } catch (_) {
      // Params not valid JSON, ignore
      return {};
    }
  }

  private store() {
    window.history.replaceState(null, '', this.url);
  }
}
