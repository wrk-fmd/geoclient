import {LatLng, Marker, polyline, Polyline} from 'leaflet';

import {ExtendedIncident} from '../model';
import {TextUtils} from '../util';
import {DynamicMarker} from './dynamic.marker';
import {getIncidentIcon} from './icons';

/**
 * A dynamic marker for an incidents
 */
export class IncidentMarker extends Marker implements DynamicMarker<ExtendedIncident> {

  private incident: ExtendedIncident;
  private latlng: LatLng;
  private readonly unitsLayer: Polyline;

  constructor(incident: ExtendedIncident) {
    // At this point, latlng should never be null, but make sure anyway
    super(incident.latlng || [0, 0], {
      icon: getIncidentIcon(false, false, false),
      pane: 'incidents',
    });
    this.latlng = this.getLatLng();

    // Initialize the popup
    this.bindPopup('');

    // Initialize the polyline to the units
    this.unitsLayer = polyline([], {
      color: 'gray',
      interactive: false,
    });

    // Show/hide the polyline when hovered or popup is open
    this.on('popupopen', () => this.showUnits());
    this.on('popupclose', () => this.hideUnits(true));
    this.on('mouseover', () => this.showUnits());
    this.on('mouseout', () => this.hideUnits());

    // Store the incident data
    this.incident = incident;

    // Trigger update of the marker information
    this.updateMarker();
  }

  private showUnits() {
    this.unitsLayer.addTo(this._map);
  }

  private hideUnits(force?: boolean) {
    if (force || !this.isPopupOpen()) {
      this.unitsLayer.remove();
    }
  }

  getData(): ExtendedIncident {
    return this.incident;
  }

  setData(incident: ExtendedIncident) {
    // Store updated incident
    this.incident = incident;

    // Trigger marker update
    this.updateMarker();
  }

  private updateMarker() {
    if (this.incident.latlng && !this.latlng?.equals(this.incident.latlng, 1E-4)) {
      // Only update if the current marker is off by about 10 meters, everything below that is not relevant
      this.setLatLng(this.incident.latlng);
      // Store the marker's current position
      this.latlng = this.getLatLng();
    }

    // Update icon based on properties
    this.setIcon(getIncidentIcon(
      !!this.incident.priority,
      !!this.incident.blue,
      this.incident.assignedUnits ? Object.keys(this.incident.assignedUnits).length === 0 : true,
    ));

    // Set formatted popup text
    this.setPopupContent(TextUtils.forPopup(this.incident.info));

    // Update assigned units
    const unitLines = this.incident.latlng
      ? this.incident.unitPositions.map(pos => [this.incident.latlng!, pos])
      : [];
    this.unitsLayer.setLatLngs(unitLines);
    this.unitsLayer.setStyle({
      color: this.incident.blue ? 'blue' : 'gray',
    });
  }
}
