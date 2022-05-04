import {LayerGroup} from 'leaflet';

import {LocatedEntity} from '../model';
import {DynamicMarker} from './dynamic.marker';

/**
 * This is the base class for managing a layer with dynamic markers
 */
export abstract class DynamicLayer<T extends LocatedEntity, M extends DynamicMarker<T>> extends LayerGroup {

  protected readonly markers = new Map<string, M>();

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
    if (this.markers.has(item.id)) {
      this.markers.get(item.id)?.setData(item);
    } else {
      const marker = this.createMarker(item);
      this.markers.set(item.id, marker);
      if (this.isVisible(item)) {
        this.addLayer(marker);
      }
    }
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
}
