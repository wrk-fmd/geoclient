import {circle, Circle, Control, easyButton, ErrorEvent, LatLng, LayerGroup, layerGroup, LocationEvent, Map, marker, Marker} from 'leaflet';

import {i18n} from '../i18n';
import {AppState} from '../state';
import {toApiTimestamp} from '../util';

/**
 * This class handles locating the client itself on the map
 */
export class Locator {

  readonly layer: LayerGroup;
  private marker?: Marker;
  private accuracy?: Circle;

  private follow: boolean = true;
  private readonly followButton: Control.EasyButton;
  private readonly locationButton: Control.EasyButton;

  private position?: LatLng;

  constructor(private readonly state: AppState, private readonly map: Map) {
    // Create the layer for the position marker
    this.layer = layerGroup();

    // Create the button for enabling/disabling auto-follow
    this.followButton = easyButton({
      tagName: 'a',
      states: [
        {
          stateName: 'follow-enabled',
          icon: 'fa-map-marker',
          title: i18n('locator.follow.disable'),
          onClick: () => this.disableFollow(),
        }, {
          stateName: 'follow-disabled',
          icon: 'fa-crosshairs',
          title: i18n('locator.follow.enable'),
          onClick: () => this.enableFollow(),
        }
      ],
    }).addTo(map);

    // Create the button for displaying the location status
    this.locationButton = easyButton({
      position: 'bottomleft',
      tagName: 'a',
      states: [
        {
          stateName: 'location-success',
          icon: 'fa-globe state-success',
          title: i18n('locator.location.success'),
          onClick: () => {
          },
        }, {
          stateName: 'location-error',
          icon: 'fa-globe state-error',
          title: i18n('locator.location.error'),
          onClick: () => this.state.errorService.reload(),
        }
      ],
    }).addTo(map);

    // Disable automatic follow after manual map dragging
    map.on('dragstart', () => this.disableFollow());
    state.keyboardService.registerCallback(state.config.shortcuts.panW, () => this.disableFollow());
    state.keyboardService.registerCallback(state.config.shortcuts.panE, () => this.disableFollow());
    state.keyboardService.registerCallback(state.config.shortcuts.panN, () => this.disableFollow());
    state.keyboardService.registerCallback(state.config.shortcuts.panS, () => this.disableFollow());

    // Initialize location handling
    state.logger?.info('Trying to locate client...');
    map
      .on('locationfound', e => this.handleLocation(e))
      .on('locationerror', e => this.handleLocationError(e))
      .locate({
        watch: true,
        enableHighAccuracy: true,
      });
  }

  private enableFollow() {
    this.follow = true;
    this.followButton.state('follow-enabled');
    this.centerMap();
  }

  private disableFollow() {
    this.follow = false;
    this.followButton.state('follow-disabled');
  }

  private handleLocation(e: LocationEvent) {
    this.state.logger?.info('Location found: ', e);

    // Set location indicator to success state
    this.locationButton.state('location-success');

    // Store the position
    this.position = e.latlng;

    // Send to GeoBroker
    if (this.state.session.sendLocation) {
      this.state.apiService.updatePosition({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
        timestamp: toApiTimestamp(e.timestamp),
        accuracy: e.accuracy,
        heading: e.heading,
        speed: e.speed,
      });
    }

    // Update the marker and accuracy indicator
    const radius = e.accuracy / 2;
    const popup = i18n('locator.location.popup', {accuracy: Math.round(e.accuracy)});

    if (!this.marker || !this.accuracy) {
      this.marker = marker(e.latlng)
        .addTo(this.layer)
        .bindPopup(popup);
      this.accuracy = circle(e.latlng, {radius})
        .addTo(this.layer)
    } else {
      this.marker
        .setLatLng(e.latlng)
        .setPopupContent(popup);
      this.accuracy
        .setLatLng(e.latlng)
        .setRadius(radius);
    }

    // Move the new map to the new position if follow is enabled
    this.centerMap();
  }

  private handleLocationError(e: ErrorEvent) {
    // Set location indicator to error state
    this.locationButton.state('location-error');
    this.state.errorService.displayError('Error on obtaining location: ', e)
  }

  private centerMap() {
    if (this.follow && this.position) {
      this.map.panTo(this.position, {animate: true});
    }
  }
}
