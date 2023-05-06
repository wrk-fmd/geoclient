import {Control, easyButton, MarkerClusterGroup, MarkerClusterGroupOptions} from 'leaflet';

import {i18n} from '../i18n';
import {ExtendedUnit} from '../model';
import {AppState} from '../state';
import {DynamicLayer} from './dynamic.layer';
import {UnitMarker} from './unit.marker';

const clusterOptions: MarkerClusterGroupOptions = {
  spiderfyDistanceMultiplier: 5,
};

/**
 * A dynamic layer for units
 */
export class UnitLayer extends DynamicLayer<ExtendedUnit, UnitMarker> {

  private hideBusyUnits: boolean = false;
  readonly toggleBusyUnitsButton?: Control.EasyButton;

  private clusterUnits: boolean = false;
  readonly toggleClusterUnitsButton?: Control.EasyButton;

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

      this.toggleClusterUnitsButton = easyButton({
        tagName: 'a',
        states: [
          {
            stateName: 'clusterUnitsActive',
            icon: 'fa-circle-nodes',
            title: i18n('units.cluster.deactivate'),
            onClick: () => this.setClusterUnits(false),
          }, {
            stateName: 'clusterUnitsInactive',
            icon: 'fa-circle-dot',
            title: i18n('units.cluster.activate'),
            onClick: () => this.setClusterUnits(true),
          }
        ],
      });
      this.setClusterUnits(state.session.clusterUnits);

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
      state.keyboardService.registerCallback(state.config.shortcuts.toggleClusterUnits, () => this.setClusterUnits(!this.clusterUnits));
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
    this.markers.forEach(marker => this.handleMarkerVisibility(marker.getData(), marker));
    // Store in session
    this.state.session.setHideBusyUnits(hideBusyUnits);
  }

  public setClusterUnits(clusterUnits: boolean) {
    this.clusterUnits = clusterUnits;
    // Update button state
    this.toggleClusterUnitsButton?.state(clusterUnits ? 'clusterUnitsActive' : 'clusterUnitsInactive');
    // Update the marker layer group
    this.setMarkerGroup(clusterUnits ? new MarkerClusterGroup(clusterOptions) : this);
    // Store in session
    this.state.session.setClusterUnits(clusterUnits);
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
