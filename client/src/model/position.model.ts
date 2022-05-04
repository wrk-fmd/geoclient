import {ApiTimestamp} from '../util';

export interface Point {
  latitude: number;
  longitude: number;
}

export interface Position extends Point {
  timestamp: ApiTimestamp;
  accuracy: number;
  heading: number;
  speed: number;
}
