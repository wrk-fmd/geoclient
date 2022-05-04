import {ExtendedIncident} from '../model';
import {DynamicLayer} from './dynamic.layer';
import {IncidentMarker} from './incident.marker';

/**
 * A dynamic layer for incidents
 */
export class IncidentLayer extends DynamicLayer<ExtendedIncident, IncidentMarker> {

  createMarker(item: ExtendedIncident): IncidentMarker {
    return new IncidentMarker(item);
  }

  isVisible(_: ExtendedIncident): boolean {
    return true;
  }
}
