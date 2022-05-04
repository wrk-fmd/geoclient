import {LatLng, LatLngExpression} from 'leaflet';

import {ExtendedIncident, ExtendedUnit, Incident, Point, ExtendedScope, Scope, Unit} from '../model';
import {AppState} from '../state';
import {timestampAge} from '../util';

type ScopeCallback = (data: ExtendedScope) => void;

/**
 * This services stores a preprocessed version of loaded data and makes it available in a somewhat reactive way
 */
export class DataService {

  private data: ExtendedScope = {incidents: [], units: []};
  private readonly callbacks: ScopeCallback[] = [];

  constructor(private readonly state: AppState) {
  }

  /**
   * Registers a callback which is called whenever the data is updated
   * @param callback The callback function
   */
  registerCallback(callback: ScopeCallback) {
    // Store the callback
    this.callbacks.push(callback);
    // Immediately run the callback with already existing data
    callback(this.data);
  }

  /**
   * Sets the new data as obtained from the API
   * @param scope The new data from the API
   */
  updateAll(scope: Scope | null) {
    // Currently, we always load the full data
    // In the future it would be nice to support individual updates through WebSockets

    if (!scope) {
      // No data: Do nothing (i.e., keep old data on map)
      return;
    }

    // Construct a list of all units assigned to "blue" incidents
    const unitsWithBlue = new Set(scope.incidents.filter(i => i.blue).flatMap(i => this.getAssignedIds(i)));

    // Build list of units with additional properties
    const units = scope.units.map(unit => this.buildExtendedUnit(unit, unitsWithBlue));

    // Build a dictionary of unit positions
    const unitPositions = new Map(units.filter(u => u.latlng).map(u => [u.id, u.latlng]));

    // Build a list of incidents with additional properties
    const incidents = scope.incidents.map(incident => this.buildExtendedIncident(incident, unitPositions));

    // Store the data
    this.data = {incidents, units};

    // Trigger the callbacks
    this.callbacks.forEach(cb => cb(this.data));
  }

  private buildExtendedIncident(incident: Incident, unitPositions: Map<string, LatLngExpression | null>): ExtendedIncident {
    return {
      ...incident,
      // Build Leaflet LatLng object
      latlng: this.buildLatLng(incident.location),
      // Append all associated unit positions
      unitPositions: this.getAssignedIds(incident)
        .map(id => unitPositions.get(id))
        .filter((pos): pos is NonNullable<any> => !!pos),
    }
  }

  private buildExtendedUnit(unit: Unit, unitsWithBlue: Set<string>): ExtendedUnit {
    // Online: Current position set and not older than timeout
    const online = timestampAge(unit.currentPosition?.timestamp) < this.state.config.onlineTimeout;
    // Unit belongs to logged in client
    const isSelf = unit.id === this.state.session.id;
    // Unit has blue incidents assigned
    const hasBlue = unitsWithBlue.has(unit.id);

    // Determine fill color
    let colorFill;
    if (isSelf) {
      colorFill = 'yellow';
    } else if (!online) {
      colorFill = 'gray';
    } else if (unit.name) {
      colorFill = this.getColorForName(unit.name);
    } else {
      colorFill = 'white';
    }

    let colorOutline;
    if (unit.isAvailableForDispatching) {
      colorOutline = 'chartreuse';
    } else if (hasBlue) {
      colorOutline = 'blue';
    } else {
      colorOutline = 'lightgray';
    }

    return {
      ...unit, online, isSelf, hasBlue, colorFill, colorOutline,
      // Derived current position: Either GPS data or last known position
      latlng: this.buildLatLng(unit.currentPosition || unit.lastPoint),
      // Origin/Target
      latlngLast: this.buildLatLng(unit.lastPoint),
      latlngNext: this.buildLatLng(unit.targetPoint),
    }
  }

  private getColorForName(name: string) {
    // Perform case-insensitive search
    name = name.toLowerCase();
    for (const key of Object.keys(this.state.config.unitColors)) {
      if (name.includes(key.toLowerCase())) {
        return this.state.config.unitColors[key];
      }
    }

    // Default to white if nothing matched
    return 'white';
  }

  private getAssignedIds(incident: Incident): string[] {
    return incident.assignedUnits ? Object.keys(incident.assignedUnits) : []
  }

  private buildLatLng(point?: Point): LatLngExpression | null {
    return point && point.latitude !== undefined && point.longitude !== undefined
      ? new LatLng(point.latitude, point.longitude)
      : null;
  }
}
