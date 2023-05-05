import {Control, control, easyButton, Layer, LayersControlEvent, Map} from 'leaflet';

import {IncidentLayer, UnitLayer} from '../dynamic';
import {i18n} from '../i18n';
import {loadOverlays} from '../overlays';
import {AppState} from '../state';
import {Baselayers} from './baselayers';
import {Locator} from './locator';
import {Modal} from './modal';
import {TextToggle} from './text-toggle';

/**
 * This class displays the map and controls
 */
export class GeoclientMap extends Map {

  private readonly layersControl: Control.Layers;
  private readonly defaultLayers: Layer[];
  private readonly additionalLayers: Layer[];

  constructor(selector: string, private readonly state: AppState) {
    super(selector, {
      center: state.session.center,
      zoom: state.session.zoom,
    });

    this.getContainer().classList.add('text-markers-dots');

    // Listen to the map state and store it in the session
    this.on('moveend', () => state.session.setCenter(this.getCenter()));
    this.on('zoomend', () => state.session.setZoom(this.getZoom()));
    this.on('baselayerchange', (e: LayersControlEvent) => state.session.setBaseLayer(e.name))
    this.on('overlayadd', (e: LayersControlEvent) => state.session.setOverlayState(e.name, true));
    this.on('overlayremove', (e: LayersControlEvent) => state.session.setOverlayState(e.name, false));

    // Layers control with base layers
    const baselayers = {
      [i18n('baselayer.basemap')]: Baselayers.hidpi,
      [i18n('baselayer.ortho')]: Baselayers.ortho,
      [i18n('baselayer.ortho-labels')]: Baselayers.orthoLabels,
      [i18n('baselayer.terrain')]: Baselayers.terrain,
      [i18n('baselayer.osm')]: Baselayers.osm,
    };
    this.addLayer(baselayers[state.session.baseLayer || ''] || Baselayers.hidpi);
    this.layersControl = control.layers(baselayers).addTo(this);

    // Store a list of default and additional layers so that state can be restored
    this.defaultLayers = [Baselayers.hidpi];
    this.additionalLayers = [Baselayers.ortho, Baselayers.orthoLabels, Baselayers.terrain, Baselayers.osm];

    // Scale control
    control.scale({
      position: 'bottomright',
      metric: true,
      imperial: false,
      updateWhenIdle: true,
    }).addTo(this);

    // Connection state indicator
    state.errorService.indicator.addTo(this);

    // Initialize locator
    if (state.session.doLocate) {
      const locator = new Locator(state, this);
      this.addOverlay(locator.layer, i18n('overlay.position'), true, state.config.shortcuts.toggleLocationOverlay);
    }

    if (state.session.authenticated) {
      this.createPane('incidents');
      this.createPane('units');

      // Show incidents and units
      const incidentLayer = new IncidentLayer();
      this.addLayer(incidentLayer);
      this.addOverlay(incidentLayer, i18n('overlay.incidents'), true, state.config.shortcuts.toggleIncidentsOverlay);

      const unitLayer = new UnitLayer(state);
      this.addLayer(unitLayer);
      this.addOverlay(unitLayer, i18n('overlay.units'), true, state.config.shortcuts.toggleUnitsOverlay);

      // Register listener to the data service
      state.dataService.registerCallback(data => {
        incidentLayer.updateAll(data.incidents);
        unitLayer.updateAll(data.units);
      });

      // Add unit based buttons
      unitLayer.toggleBusyUnitsButton?.addTo(this);
      unitLayer.searchButton?.addTo(this);
    }

    // Load overlays specified in config file
    loadOverlays(state, state.config.overlays).then(overlays =>
      overlays.forEach(overlay => this.addOverlay(overlay.layer, overlay.name, overlay.defaultShow, overlay.shortcuts))
    );

    // Toggle how text markers are shown
    new TextToggle(state, this);

    // Help dialog
    const helpDialog = new Modal('help.html');
    easyButton({
      position: 'topright',
      tagName: 'a',
      states: [
        {
          stateName: 'help',
          icon: 'fa-question',
          title: i18n('help.title'),
          onClick: () => helpDialog.show(),
        }
      ],
    }).addTo(this);

    // Add keyboard shortcut for restoring default overlays
    state.keyboardService.registerCallback(state.config.shortcuts.resetLayers, () => this.restoreDefaultLayers());

    // Add custom keyboard shortcuts for moving/zooming
    state.keyboardService.registerCallback(state.config.shortcuts.zoomIn, () => this.zoomIn());
    state.keyboardService.registerCallback(state.config.shortcuts.zoomOut, () => this.zoomOut());
    state.keyboardService.registerCallback(state.config.shortcuts.panW, () => this.panBy([-100, 0]));
    state.keyboardService.registerCallback(state.config.shortcuts.panE, () => this.panBy([100, 0]));
    state.keyboardService.registerCallback(state.config.shortcuts.panN, () => this.panBy([0, -100]));
    state.keyboardService.registerCallback(state.config.shortcuts.panS, () => this.panBy([0, 100]));

    // Focus the map so default keyboard navigation can be used
    this.getContainer().focus();
  }

  private restoreDefaultLayers() {
    // Remove all non-default layers from the map and add all default layers
    this.additionalLayers.forEach(layer => this.removeLayer(layer));
    this.defaultLayers.forEach(layer => this.addLayer(layer));
  }

  private toggleOverlay(overlay: Layer) {
    this.hasLayer(overlay) ? this.removeLayer(overlay) : this.addLayer(overlay);
  }

  private addOverlay(overlay: Layer, name: string, defaultShow?: boolean, shortcuts?: string[]) {
    // Add to layer control
    this.layersControl.addOverlay(overlay, name);

    // Safe default state so it can be restored
    defaultShow ? this.defaultLayers.push(overlay) : this.additionalLayers.push(overlay);

    // Add to map if given in session
    if (this.state.session.getOverlayState(name, defaultShow)) {
      this.addLayer(overlay);
    }

    // Register keyboard shortcuts for toggling the overlay
    this.state.keyboardService.registerCallback(shortcuts, () => this.toggleOverlay(overlay));
  }
}
