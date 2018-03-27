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
      "%3Cpath d='M1 1h12v12h-12z' fill='grey' stroke='grey' stroke-width='2'/%3E"+
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
      "%3Cpath d='M1 1h12v12h-12z' fill='blue' stroke='blue' stroke-width='2'/%3E"+
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
    let latlng = L.latLng(incident.location.latitude, incident.location.longitude);
    this._latlng = latlng;
    this.setIcon(cocesoIcons.get(incident.priority, incident.blue));
    this.setPopupContent(incident.type + ': ' + incident.info);
    return this;
  },
});

L.marker.incidentMarker = function(incident, options) {
    return new L.Marker.IncidentMarker(incident, options)
};
