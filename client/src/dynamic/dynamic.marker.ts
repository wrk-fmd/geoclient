import {Layer} from 'leaflet';
import {LocatedEntity} from '../model';

/**
 * This interface adds a method for updating item data to standard Leaflet layers
 */
export interface DynamicMarker<T extends LocatedEntity> extends Layer {
  getData(): T;
  setData(item: T): void;
}
