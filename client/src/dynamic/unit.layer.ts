import {Control, easyButton} from 'leaflet';

import {i18n} from '../i18n';
import {ExtendedUnit} from '../model';
import {AppState} from '../state';
import {DynamicLayer} from './dynamic.layer';
import {UnitMarker} from './unit.marker';

/**
 * A dynamic layer for units
 */
export class UnitLayer extends DynamicLayer<ExtendedUnit, UnitMarker> {

  private hideBusyUnits: boolean = false;
  readonly toggleBusyUnitsButton?: Control.EasyButton;

  private searchTerm?: string;
  readonly searchButton?: Control.EasyButton;

  constructor(private readonly state: AppState) {
    super();

    if (state.session.centerMode) {
      this.toggleBusyUnitsButton = easyButton({
        tagName: 'a',
        states: [
          {
            stateName: 'busyUnitsShown',
            icon: 'fa-thumbs-up',
            title: i18n('units.busy.hide'),
            onClick: () => this.setHideBusyUnits(true),
          }, {
            stateName: 'busyUnitsHidden',
            icon: 'fa-flag',
            title: i18n('units.busy.show'),
            onClick: () => this.setHideBusyUnits(false),
          }
        ],
      });
      this.setHideBusyUnits(state.session.hideBusyUnits);

      this.searchButton = easyButton({
        tagName: 'a',
        states: [
          {
            stateName: 'search',
            icon: 'fa-search',
            title: i18n('units.search.button'),
            onClick: () => this.search(),
          }
        ],
      });

      state.keyboardService.registerCallback(state.config.shortcuts.toggleBusyUnits, () => this.setHideBusyUnits(!this.hideBusyUnits));
      state.keyboardService.registerCallback(state.config.shortcuts.search, () => this.search());
    }
  }

  createMarker(item: ExtendedUnit): UnitMarker {
    return new UnitMarker(item);
  }

  isVisible(item: ExtendedUnit): boolean {
    // A unit is visible if it is not busy or if busy units are also shown
    return !this.hideBusyUnits || !!item.isAvailableForDispatching;
  }

  public setHideBusyUnits(hideBusyUnits: boolean) {
    this.hideBusyUnits = hideBusyUnits;
    // Update button state
    this.toggleBusyUnitsButton?.state(hideBusyUnits ? 'busyUnitsHidden' : 'busyUnitsShown');
    // Update existing markers
    this.markers.forEach(marker => this.isVisible(marker.getData()) ? this.addLayer(marker) : this.removeLayer(marker));
    // Store in session
    this.state.session.setHideBusyUnits(hideBusyUnits);
  }

  public search() {
    const input = prompt(i18n('units.search.prompt'), this.searchTerm);
    if (input === null) {
      return;
    }
    this.searchTerm = input;
    this.highlightResults();
  }

  private highlightResults() {
    const query = this.searchTerm?.toLowerCase();
    const bounds = this._map?.getBounds();
    this.markers.forEach(marker => {
      const shouldHighlight = query
        ? !!marker.getData().name?.toLowerCase().includes(query)
        : false;
      marker.highlight(shouldHighlight);
      if (shouldHighlight) {
        bounds?.extend(marker.getLatLng());
      }
    });
    this._map?.flyToBounds(bounds);
  }
}
