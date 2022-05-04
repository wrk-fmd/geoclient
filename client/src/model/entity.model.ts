import {LatLngExpression} from 'leaflet';

export interface Entity {
  id: string;
}

export interface LocatedEntity extends Entity {
  latlng: LatLngExpression | null;
}
