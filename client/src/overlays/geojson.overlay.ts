import {Feature, Point, Polygon} from 'geojson';
import {divIcon, icon, ImageOverlay, LatLng, LatLngBoundsExpression, Layer, marker} from 'leaflet';

import {Http, TextUtils} from '../util';
import {FeatureCollectionLayer, MarkerProperties, NamedFeatureCollection} from './geojson';
import {GeoJsonOverlayOptions, LoadedOverlay} from './overlay.options';

export class GeoJsonOverlay extends FeatureCollectionLayer {

  static async loadFromUrl(options: GeoJsonOverlayOptions): Promise<LoadedOverlay> {
    const data = await Http.getJson<NamedFeatureCollection>(options.url);
    return {
      layer: new GeoJsonOverlay(data, options),
      name: options.name || data.name || 'Unnamed layer'
    }
  }

  private readonly url: string;
  private readonly markerDefaults: MarkerProperties;

  constructor(geojson: NamedFeatureCollection, options: GeoJsonOverlayOptions) {
    super(undefined, {
      attribution: options.attribution,
    });

    // Store the URL, we still need it for image overlays
    this.url = options.url;

    // Values from config.json have precedence over values from the GeoJSON file
    this.markerDefaults = {...geojson.markerDefaults, ...options.markerDefaults};

    // Some methods require the instance properties to be set, so we cannot just pass this to the super constructor
    this.addData(geojson);
  }

  protected pointToLayer(feature: Feature<Point, MarkerProperties>, latlng: LatLng): Layer | null {
    // Local properties have precedence over defaults from config.json or global GeoJSON object
    const markerProperties = {...this.markerDefaults, ...feature.properties};
    const title = markerProperties.titleTemplate
      ? TextUtils.templateReplace(markerProperties.titleTemplate, markerProperties).trim()
      : markerProperties.text?.trim();

    const markerLayer = marker(latlng, {
      title: title,
      riseOnHover: true,
      icon: this.getIcon(markerProperties, title),
    });

    const popup = markerProperties.popupTemplate
      ? TextUtils.templateReplace(markerProperties.popupTemplate, markerProperties).trim()
      : markerProperties.text?.trim();
    if (popup) {
      markerLayer.bindPopup(TextUtils.forPopup(popup), {maxWidth: undefined});
    }

    return markerLayer;
  }

  private getIcon(markerProperties: MarkerProperties, title?: string) {
    if (markerProperties.icon?.startsWith('url:')) {
      // Image icon from url
      return icon({
        iconUrl: markerProperties.icon?.substring(4),
        iconSize: [16, 16],
      });
    }

    // Create the HTML element for the marker
    // We need a nested element within the standard Leaflet icon to anchor it dynamically with CSS without knowing the size
    const iconHtml = document.createElement('span');

    if (markerProperties.icon === 'text-marker') {
      iconHtml.className = 'text-marker';
      iconHtml.dataset.text = title || '';
    } else {
      iconHtml.className = `fas fa-2x ${markerProperties.icon || 'fa-map-marker-alt'}`;

      // Move the icon so the anchor is placed on the coordinates
      // Default anchor is bottom center (50% horizontal, 100% vertical offset)
      const left = markerProperties.hAnchor ? parseFloat(markerProperties.hAnchor) + 0.5 : 0.5;
      const top = markerProperties.vAnchor ? parseFloat(markerProperties.vAnchor) + 1 : 1;
      iconHtml.style.transform = `translate(${-100 * left}%, ${-100 * top}%)`;
    }

    if (markerProperties.color) {
      iconHtml.style.color = markerProperties.color;
    }

    return divIcon({
      className: '',
      iconSize: undefined,
      html: iconHtml,
    });
  }

  protected polygonToLayer(feature: Feature<Polygon>, latlngs: LatLng[][]) {
    if (feature.properties?.overlayFile) {
      const bounds = this.getImageBounds(latlngs);
      if (bounds) {
        return new ImageOverlay(this.getRelativeToJson(feature.properties.overlayFile), bounds);
      }
    }

    // Not an image overlay: Just display the polygon
    return super.polygonToLayer(feature, latlngs);
  }

  private getImageBounds(polygon: LatLng[][]): LatLngBoundsExpression | null {
    if (polygon.length !== 1 || polygon[0].length !== 5) {
      // Not a bounding polygon for an image overlay
      return null;
    }

    let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity;
    polygon[0].forEach(latlng => {
      if (latlng.lat < minLat) {
        minLat = latlng.lat;
      }
      if (latlng.lat > maxLat) {
        maxLat = latlng.lat;
      }
      if (latlng.lng < minLng) {
        minLng = latlng.lng;
      }
      if (latlng.lng > maxLng) {
        maxLng = latlng.lng;
      }
    });

    // Check if we have an actual rectangle, otherwise return null
    return minLat < maxLat && minLng < maxLng
      ? [[minLat, minLng], [maxLat, maxLng]]
      : null;
  }


  private getRelativeToJson(path: string): string {
    const lastSep = this.url.lastIndexOf('/');
    return lastSep >= 0 ? this.url.substring(0, lastSep + 1) + path : path;
  }
}
