import {LayerGroup} from 'leaflet';

import {LocatedEntity} from '../model';
import {DynamicMarker} from './dynamic.marker';

/**
 * This is the base class for managing a layer with dynamic markers
 */
export abstract class DynamicLayer<T extends LocatedEntity, M extends DynamicMarker<T>> extends LayerGroup {

  protected readonly markers = new Map<string, M>();
  protected markerGroup: LayerGroup = this;

  /**
   * Creates a new marker instance for the given item
   * @param item An entity instance
   * @return A marker instance
   * @protected
   */
  protected abstract createMarker(item: T): M;

  /**
   * Determines if the given item should be visible on the map
   * @param item An entity instance
   * @return A boolean indicating the visibility
   * @protected
   */
  protected abstract isVisible(item: T): boolean;

  /**
   * Updates the marker for a given item or creates it if none exists yet
   * @param item An entity instance
   */
  update(item: T) {
    let marker = this.markers.get(item.id);
    if (marker) {
      marker.setData(item);
    } else {
      marker = this.createMarker(item);
      this.markers.set(item.id, marker);
    }

    this.handleMarkerVisibility(item, marker);
  }

  /**
   * Replaces all data with the given list
   * @param data A list of entities
   */
  updateAll(data: T[]) {
    // Store a set of all unmodified units to be removed later
    const toBeRemoved = new Set<string>(this.markers.keys());

    // Update the markers
    data.forEach(item => {
      if (item.latlng) {
        this.update(item);
        toBeRemoved.delete(item.id);
      }
    });

    // Clear obsolete markers
    toBeRemoved.forEach(id => {
      this.markers.get(id)?.remove();
      this.markers.delete(id);
    });
  }

  protected setMarkerGroup(markerGroup: LayerGroup) {
    if (markerGroup === this.markerGroup) {
      return;
    }

    // Remove all currently existing layers
    this.clearLayers();
    this.markerGroup.clearLayers();

    // Set the new marker group
    this.markerGroup = markerGroup;
    if (this.markerGroup !== this) {
      this.addLayer(this.markerGroup);
    }

    // Add visible markers to the new marker group
    this.markers.forEach(marker => this.handleMarkerVisibility(marker.getData(), marker));
  }

  protected handleMarkerVisibility(data: T, marker: M) {
    if (this.isVisible(data)) {
      this.markerGroup.addLayer(marker);
    } else {
      this.markerGroup.removeLayer(marker);
    }
  }
}
