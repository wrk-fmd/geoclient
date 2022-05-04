import {
  Feature,
  FeatureCollection,
  GeoJsonObject,
  Geometry,
  GeometryCollection,
  LineString,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
  Point,
  Polygon
} from "geojson";

/**
 * Check whether the GeoJson object is a feature collection
 */
export function isFeatureCollection(geojson: GeoJsonObject): geojson is FeatureCollection {
  return geojson.type === "FeatureCollection" && !!(<FeatureCollection>geojson).features;
}

/**
 * Check whether the GeoJson object is a feature
 */
export function isFeature(geojson: GeoJsonObject): geojson is Feature {
  return geojson.type === "Feature";
}

/**
 * Check whether the GeoJson object is a point feature
 */
export function isPointFeature(geojson: GeoJsonObject): geojson is Feature<Point> {
  return isFeature(geojson) && isPoint(geojson.geometry);
}

/**
 * Check whether the GeoJson object is a multipoint feature
 */
export function isMultiPointFeature(geojson: GeoJsonObject): geojson is Feature<MultiPoint> {
  return isFeature(geojson) && isMultiPoint(geojson.geometry);
}

/**
 * Check whether the GeoJson object is a line feature
 */
export function isLineStringFeature(geojson: GeoJsonObject): geojson is Feature<LineString> {
  return isFeature(geojson) && isLineString(geojson.geometry);
}

/**
 * Check whether the GeoJson object is a multiline feature
 */
export function isMultiLineStringFeature(geojson: GeoJsonObject): geojson is Feature<MultiLineString> {
  return isFeature(geojson) && isMultiLineString(geojson.geometry);
}

/**
 * Check whether the GeoJson object is a polygon feature
 */
export function isPolygonFeature(geojson: GeoJsonObject): geojson is Feature<Polygon> {
  return isFeature(geojson) && isPolygon(geojson.geometry);
}

/**
 * Check whether the GeoJson object is a multipolygon feature
 */
export function isMultiPolygonFeature(geojson: GeoJsonObject): geojson is Feature<MultiPolygon> {
  return isFeature(geojson) && isMultiPolygon(geojson.geometry);
}

/**
 * Check whether the GeoJson object is a geometry collection feature
 */
export function isGeometryCollectionFeature(geojson: GeoJsonObject): geojson is Feature<GeometryCollection> {
  return isFeature(geojson) && isGeometryCollection(geojson.geometry);
}

/**
 * Check whether the GeoJson object is a geometry object
 */
export function isGeometry(geojson: GeoJsonObject): geojson is Geometry {
  return isPoint(geojson) || isMultiPoint(geojson) || isLineString(geojson) || isMultiLineString(geojson)
    || isPolygon(geojson) || isMultiPolygon(geojson) || isGeometryCollection(geojson);
}

/**
 * Check whether the GeoJson object is a point
 */
export function isPoint(geojson: GeoJsonObject): geojson is Point {
  return geojson.type === "Point" && !!(<Point>geojson).coordinates;
}

/**
 * Check whether the GeoJson object is a multipoint
 */
export function isMultiPoint(geojson: GeoJsonObject): geojson is MultiPoint {
  return geojson.type === "MultiPoint" && !!(<MultiPoint>geojson).coordinates;
}

/**
 * Check whether the GeoJson object is a line
 */
export function isLineString(geojson: GeoJsonObject): geojson is LineString {
  return geojson.type === "LineString" && !!(<LineString>geojson).coordinates;
}

/**
 * Check whether the GeoJson object is a multiline
 */
export function isMultiLineString(geojson: GeoJsonObject): geojson is MultiLineString {
  return geojson.type === "MultiLineString" && !!(<MultiLineString>geojson).coordinates;
}

/**
 * Check whether the GeoJson object is a polygon
 */
export function isPolygon(geojson: GeoJsonObject): geojson is Polygon {
  return geojson.type === "Polygon" && !!(<Polygon>geojson).coordinates;
}

/**
 * Check whether the GeoJson object is a multipolygon
 */
export function isMultiPolygon(geojson: GeoJsonObject): geojson is MultiPolygon {
  return geojson.type === "MultiPolygon" && !!(<MultiPolygon>geojson).coordinates;
}

/**
 * Check whether the GeoJson object is a geometry collection
 */
export function isGeometryCollection(geojson: GeoJsonObject): geojson is GeometryCollection {
  return geojson.type === "GeometryCollection" && !!(<GeometryCollection>geojson).geometries;
}
