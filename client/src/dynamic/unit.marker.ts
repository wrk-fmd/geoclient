import {CircleMarker, LatLngExpression, layerGroup, LayerGroup, polyline, Polyline} from 'leaflet';

import {ExtendedUnit} from '../model';
import {TextUtils, timestampAge} from '../util';
import {DynamicMarker} from './dynamic.marker';

const fadeOptions = {
  interval: 15000,
  step: 0.1,
  defaultOpacity: 1,
  minOpacity: 0.3,
}

/**
 * A dynamic marker for a unit
 */
export class UnitMarker extends CircleMarker implements DynamicMarker<ExtendedUnit> {

  private unit: ExtendedUnit;

  private readonly fromLine: Polyline;
  private readonly targetLine: Polyline;
  private readonly linesLayer: LayerGroup;

  private fadeTimer?: number;

  constructor(unit: ExtendedUnit) {
    // At this point, latlng should never be null, but make sure anyway
    super(unit.latlng || [0, 0], {
      color: 'lightgray',
      weight: 5,
      fillColor: 'white',
      fillOpacity: fadeOptions.defaultOpacity,
      pane: 'markerPane',
    });

    // Initialize the popup and tooltip
    this.bindPopup('');
    this.bindTooltip('', {permanent: true});

    // Initialize the lines to origin and target
    this.fromLine = polyline([], {
      color: 'gray',
      interactive: false,
    });
    this.targetLine = polyline([], {
      color: 'green',
      interactive: false,
    });
    this.linesLayer = layerGroup([this.fromLine, this.targetLine]);

    // Show/hide the lines when hovered or popup is open
    this.on('popupopen', () => this.showLines());
    this.on('popupclose', () => this.hideLines(true));
    this.on('mouseover', () => this.showLines());
    this.on('mouseout', () => this.hideLines());

    // Store the unit data
    this.unit = unit;

    // Set interval for updating opacity when layer is added
    this.on('add', () => this.startFadeInterval());
    this.on('remove', () => this.stopFadeInterval());

    // Trigger update of the marker information
    this.updateMarker();
  }

  private showLines() {
    this.linesLayer.addTo(this._map);
  }

  private hideLines(force?: boolean) {
    if (force || !this.isPopupOpen()) {
      this.linesLayer.remove();
    }
  }

  private startFadeInterval() {
    if (!this.fadeTimer) {
      this.fadeTimer = window.setInterval(() => this.updateOpacity(), fadeOptions.interval);
    }
  }

  private stopFadeInterval() {
    if (this.fadeTimer) {
      window.clearInterval(this.fadeTimer);
      this.fadeTimer = undefined;
    }
  }

  private updateOpacity() {
    const age = this.unit.online ? timestampAge(this.unit.currentPosition?.timestamp) : 0;
    const opacity = fadeOptions.defaultOpacity - fadeOptions.step * age / fadeOptions.interval;
    this.setStyle({fillOpacity: Math.max(opacity, fadeOptions.minOpacity)});
  }

  getData(): ExtendedUnit {
    return this.unit;
  }

  setData(unit: ExtendedUnit) {
    // Store updated unit
    this.unit = unit;

    // Trigger marker update
    this.updateMarker();
  }

  private updateMarker() {
    // latlng should never be null, make sure anyway
    this.setLatLng(this.unit.latlng || [0, 0]);

    // Set formatted popup and tooltip text
    this.setPopupContent(TextUtils.forPopup(this.unit.name));
    this.setTooltipContent(TextUtils.forPopup(this.unit.name));

    // Update colors
    this.setStyle({
      fillColor: this.unit.colorFill,
      color: this.unit.colorOutline,
    });

    // Update lines
    this.fromLine.setLatLngs(this.getLine(this.unit.latlngLast, this.unit.latlng));
    this.targetLine.setLatLngs(this.getLine(this.unit.latlng, this.unit.latlngNext));
    this.targetLine.setStyle({
      color: this.unit.hasBlue ? 'blue' : 'green',
    });

    this.updateOpacity();
  }

  private getLine(a: LatLngExpression | null, b: LatLngExpression | null): LatLngExpression[] {
    return a && b ? [a, b] : [];
  }

  /**
   * Update whether the unit is highlighted
   * @param shouldHighlight True iff the unit is to be highlighted
   */
  highlight(shouldHighlight: boolean) {
    if (shouldHighlight) {
      this.getTooltip()?.getElement()?.classList.add('highlight');
    } else {
      this.getTooltip()?.getElement()?.classList.remove('highlight');
    }
  }
}
