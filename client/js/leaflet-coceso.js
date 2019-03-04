/*
 * Copyright (c) 2018 Red Cross Vienna and contributors. All rights reserved.
 *
 * This software may be modified and distributed under the terms of the MIT license. See the LICENSE file for details.
 */

// XXX assuming leaflet is loaded, no proper plugin structure

// icons
let cocesoIcons = {
  incident: L.icon({
    iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14'%3E"+
      "%3Cpath d='M1 1h12v12h-12z' fill='grey' stroke='white' stroke-width='2'/%3E"+
      "%3C/svg%3E",
    iconSize:    [14,14],
    iconAnchor:  [7,7],
    popupAnchor: [0,-7],
  }),
  incidentPriority: L.icon({
    iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14'%3E"+
      "%3Cpath d='M1 1h12v12h-12z' fill='grey' stroke='red' stroke-width='2'/%3E"+
      "%3C/svg%3E",
    iconSize:    [14,14],
    iconAnchor:  [7,7],
    popupAnchor: [0,-7],
  }),
  incidentPriorityBlue: L.icon({
    iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14'%3E"+
      "%3Cpath d='M1 1h12v12h-12z' fill='blue' stroke='red' stroke-width='2'/%3E"+
      "%3C/svg%3E",
    iconSize:    [14,14],
    iconAnchor:  [7,7],
    popupAnchor: [0,-7],
  }),
  incidentBlue: L.icon({
    iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14'%3E"+
      "%3Cpath d='M1 1h12v12h-12z' fill='blue' stroke='white' stroke-width='2'/%3E"+
      "%3C/svg%3E",
    iconSize:    [14,14],
    iconAnchor:  [7,7],
    popupAnchor: [0,-7],
  }),
  get: function(priority, blue) {
    if (priority)
      if (blue)
        return this.incidentPriorityBlue;
      else
        return this.incidentPriority;
    else
      if (blue)
        return this.incidentBlue;
      else
        return this.incident;
  },
};

L.Marker.IncidentMarker = L.Marker.extend({
  options: {
    icon: cocesoIcons.incident,
    pane: 'overlayPane',
  },
  initialize: function(incident, options) {
    options = L.Util.setOptions(this, options);
    this.bindPopup('');
    this.updateIncident(incident);
  },
  updateIncident: function(incident) {
    this._incident = incident;
    this.setLatLng([incident.location.latitude, incident.location.longitude]);
    this.setIcon(cocesoIcons.get(incident.priority, incident.blue));
    this.setPopupContent(incident.info.trim().replace(/\n/g, '<br />'));
    return this;
  },
});

L.marker.incidentMarker = function(incident, options) {
  return new L.Marker.IncidentMarker(incident, options);
};

L.CircleMarker.UnitMarker = L.CircleMarker.extend({
  options: {
    color: 'lightgray',
    weight: 5,
    fillColor: 'white',
    fillOpacity: 1,
    fadeInterval: 15000, // milliseconds
    fadeStep: 0.1,
    fadeMinOpacity: 0.3,
    pane: 'markerPane',
  },
  initialize: function(unit, options) {
    options = L.Util.setOptions(this, options);
    this._defaultOpacity = options.fillOpacity;
    this.setRadius(options.radius);

    // popup is for touch, tooltip is permanent
    this.bindPopup('');
    this.bindTooltip('', {
      permanent: true,
    });

    this.initFeatureLayer();
    this.updateUnit(unit);

    this.on('add', function(e) {
      this._fadeTimer = setInterval(
        this.fadeStep,
        this.options.fadeInterval,
        this,
      );
    });
    this.on('remove', function(e) {
      clearInterval(this._fadeTimer);
    });
  },
  initFeatureLayer: function() {
    this._fromLine = L.polyline([], {
      color: 'gray',
      interactive: false,
    });
    this._targetLine = L.polyline([], {
      color: 'green',
      interactive: false,
    });
    this._featureLayer = L.layerGroup([this._fromLine, this._targetLine]);
    // event handlers are asymmetric to not hide while either is still open
    this.on('popupopen', this.showFeatureLayer);
    this.on('popupclose', this.hideFeatureLayerPopup);
    // cannot bind this on permanent tooltip
    this.on('mouseover', this.showFeatureLayer);
    this.on('mouseout', this.hideFeatureLayerMouseOver);
  },
  updateFeatureLayer: function(unit) {
    let here = this.getLatLng();
    let from = unit.lastPoint
      ? [unit.lastPoint.latitude, unit.lastPoint.longitude]
      : here;
    let target = unit.targetPoint
      ? [unit.targetPoint.latitude, unit.targetPoint.longitude]
      : here;
    this._fromLine.setLatLngs([from, here]);
    this._targetLine.setLatLngs([here, target]);
    this._targetLine.setStyle({
      color : unit.blueIncidentAssigned ? 'blue' : 'green',
    });
  },
  showFeatureLayer: function(e) {
    this._featureLayer.addTo(this._map);
  },
  hideFeatureLayerPopup: function(e) {
    this._featureLayer.remove();
  },
  hideFeatureLayerMouseOver: function(e) {
    if (this.isPopupOpen()) return;
    this._featureLayer.remove();
  },
  fadeStep: function(self) {
    // setInterval triggers in different context, use self instead of this
    self = self || this;
    let elapsed = new Date() - new Date(self._unit.currentPosition.timestamp); // milliseconds
    let stepCount = Math.floor(elapsed/self.options.fadeInterval);
    let value = self._defaultOpacity - stepCount * self.options.fadeStep;
    self.setStyle({
      fillOpacity: Math.max(value, self.options.fadeMinOpacity),
    });
  },
  getColor: function(unit) {
    if (unit.ownUnit) return 'yellow';
    if (!unit.online) return 'gray';
    // XXX should be configurable
    if (unit.name.indexOf('NEF') !== -1) return 'crimson';
    if (unit.name.indexOf('RTW') !== -1) return 'coral';
    if (unit.name.indexOf('SEW') !== -1) return 'white';
    if (unit.name.indexOf('KTW') !== -1) return 'white';
    if (unit.name.indexOf('VOK') !== -1) return 'fuchsia';
    if (unit.name.indexOf('Kdo') !== -1) return 'fuchsia';
    return 'white';
  },
  getOutline: function(unit) {
    if (unit.isAvailableForDispatching) return 'chartreuse';
    if (unit.blueIncidentAssigned) return 'blue';
    return 'lightgray';
  },
  updateUnit: function(unit) {
    this._unit = unit;
    this.fadeStep();
    this.setLatLng([unit.currentPosition.latitude, unit.currentPosition.longitude]);
    this.setPopupContent(unit.name);
    this.setTooltipContent(unit.name);
    this.setStyle({
      fillColor: this.getColor(unit),
      color: this.getOutline(unit),
    });
    this.updateFeatureLayer(unit);
    return this;
  },
  highlight: function(condition) {
    let highlight = condition;
    if (typeof condition === 'string' && condition !== "") {
      highlight = this._unit.name.indexOf(condition) !== -1;
    } else if (condition.test && typeof condition.test === 'function') {
      highlight = condition.test(this._unit.name);
    };
    L.DomUtil[highlight ? 'addClass' : 'removeClass'](this._tooltip._container, 'highlight');
    return highlight;
  },
  isAvailableForDispatching: function() {
    return this._unit.isAvailableForDispatching;
  },
});

L.circleMarker.unitMarker = function(unit, options) {
  return new L.CircleMarker.UnitMarker(unit, options);
};
