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
    this.setPopupContent(incident.type + ': ' + incident.info);
    return this;
  },
});

L.marker.incidentMarker = function(incident, options) {
  return new L.Marker.IncidentMarker(incident, options);
};

L.CircleMarker.UnitMarker = L.CircleMarker.extend({
  options: {
    color: 'black',
    weight: 2,
    fillColor: 'white',
    fillOpacity: 1,
    pane: 'markerPane',
  },
  initialize: function(unit, options) {
    options = L.Util.setOptions(this, options);
    this.setRadius(options.radius);
    this.bindPopup('');
    this.updateUnit(unit);
  },
  getColor: function(unit) {
    if (unit.ownUnit) return 'yellow';
    // XXX should be configurable
    if (unit.name.indexOf('NEF') !== -1) return 'crimson';
    if (unit.name.indexOf('RTW') !== -1) return 'coral';
    if (unit.name.indexOf('SEW') !== -1) return 'white';
    if (unit.name.indexOf('KTW') !== -1) return 'white';
    if (unit.name.indexOf('VOK') !== -1) return 'fuchsia';
    if (unit.name.indexOf('Kdo') !== -1) return 'fuchsia';
    return 'white';
  },
  updateUnit: function(unit) {
    this._unit = unit;
    this.setLatLng([unit.currentPosition.latitude, unit.currentPosition.longitude]);
    this.setPopupContent(unit.name);
    this.setStyle({
      fillColor: this.getColor(unit),
    });
    return this;
  },
});

L.circleMarker.unitMarker = function(unit, options) {
  return new L.CircleMarker.UnitMarker(unit, options);
};
