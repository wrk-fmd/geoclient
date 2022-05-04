import {LatLngExpression} from 'leaflet';

import {Entity, LocatedEntity} from './entity.model';
import {Point, Position} from './position.model';

export interface Unit extends Entity {
  name?: string;
  lastPoint?: Point;
  targetPoint?: Point;
  currentPosition?: Position;
  isAvailableForDispatching?: boolean;
}

export interface ExtendedUnit extends Unit, LocatedEntity {
  latlngLast: LatLngExpression | null;
  latlngNext: LatLngExpression | null;
  online: boolean;
  isSelf: boolean;
  hasBlue: boolean;
  colorFill: string;
  colorOutline: string;
}
