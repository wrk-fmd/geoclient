import {LatLngExpression} from 'leaflet';

import {Entity, LocatedEntity} from './entity.model';
import {Point} from './position.model';

export interface Incident extends Entity {
  type?: string;
  priority?: boolean;
  blue?: boolean;
  info?: string;
  location?: Point;
  destination?: Point;
  assignedUnits?: { [id: string]: string };
}

export interface ExtendedIncident extends Incident, LocatedEntity {
  unitPositions: LatLngExpression[];
}
