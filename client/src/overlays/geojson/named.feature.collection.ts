import {FeatureCollection, GeoJsonProperties, Geometry} from "geojson";

/**
 * This interface represents a GeoJSON feature collection with added properties
 * ("Foreign Members" as specified in section 6.1 of RFC 7946)
 */
export interface NamedFeatureCollection<G extends Geometry | null = Geometry, P = GeoJsonProperties>
  extends FeatureCollection<G, P> {
  name: string;
  markerDefaults?: MarkerProperties;
}

export interface MarkerProperties {
  text?: string;
  titleTemplate?: string;
  popupTemplate?: string;
  color?: string;
  icon?: string;
  hAnchor?: string;
  vAnchor?: string;
}
