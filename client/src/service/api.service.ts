import {AppState} from '../state';
import {Position, Scope} from '../model';
import {Http} from '../util';

/**
 * This service provides methods for communicating with the Geobroker API
 */
export class ApiService {

  constructor(private readonly state: AppState) {
  }

  /**
   * Loads the scope data, i.e. all visible incidents and units
   * @return An object containing incidents and units, or null if none could be loaded
   */
  async getScope(): Promise<Scope | null> {
    const url = this.buildUrl('scope');
    if (!url) {
      return null;
    }

    try {
      const res = await Http.getJson<Scope>(url);
      this.onSuccess();
      return res;
    } catch (e) {
      this.onError(e);
      return null;
    }
  }

  /**
   * Updates the position of the authenticated unit
   * @param position The new position data
   */
  updatePosition(position: Position) {
    const url = this.buildUrl('positions');
    if (!url) {
      return;
    }

    Http.postJson(url, position)
      .then(() => this.onSuccess())
      .catch(e => this.onError(e));
  }

  private buildUrl(path: string): string | null {
    if (!this.state.session.id || !this.state.session.token) {
      // No ID or token, do not send anything
      return null;
    }

    const id = encodeURIComponent(this.state.session.id);
    const token = encodeURIComponent(this.state.session.token);
    return `${this.state.config.apiUrl}/${path}/${id}?token=${token}`
  }

  private onSuccess() {
    this.state.errorService.clearConnectionError();
  }

  private onError(e: any) {
    this.state.errorService.setConnectionError('Error on HTTP request: ', e)
  }
}
