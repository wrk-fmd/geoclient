/*
 * Copyright (c) 2018 Red Cross Vienna and contributors. All rights reserved.
 *
 * This software may be modified and distributed under the terms of the MIT license. See the LICENSE file for details.
 */

// external_config is global geobroker.config
(function (external_config) {

  // stub out console unless debug is requested
  let output = {
    log:   $.noop,
    info:  $.noop,
    warn:  $.noop,
    error: $.noop,
  };

  // read from the query parameters
  let myId;
  let myToken;
  let myScopeUrl;
  let myPositionsUrl;
  let myPoisUrl;
  /* temporary let params */
  {
    let params = (new URL(location)).searchParams;
    if (params.has('debug')) {
      output = console;
    };
    myId = params.get('id');
    myToken = params.get('token');
  }

  output.log("Starting up client with external configuration:", external_config);

  // configure / defaults
  let default_config = {
    scopeRefreshInterval: 2000, // milliseconds

    initLatitude: 48.2089816,
    initLongitude: 16.3710193,
    initZoom: 14,

    loadData: [],

    apiPublic: '/api/v1/public',
  };

  let config = $.extend({}, default_config, external_config);

  // calculate my URLs
  if (myId && myToken) {
    myScopeUrl = config.apiPublic
      + '/scope/' + encodeURIComponent(myId)
      + '?' + $.param({token: myToken});
    myPositionsUrl = config.apiPublic
      + '/positions/' + encodeURIComponent(myId)
      + '?' + $.param({token: myToken});
    myPoisUrl = config.apiPublic
      + '/poi/' + encodeURIComponent(myId)
      + '?' + $.param({token: myToken});
  }

  // map and base tiles
  let map = L.map('map', {
    center: [config.initLatitude, config.initLongitude],
    zoom: config.initZoom,
    zoomSnap: 0.25,
    zoomDelta: 0.5,
  });

  L.tileLayer('https://{s}.wien.gv.at/basemap/bmaphidpi/normal/google3857/{z}/{y}/{x}.jpeg', {
    maxZoom: 19,
    subdomains: ['maps', 'maps1', 'maps2', 'maps3', 'maps4'],
    bounds: [[46.358770, 8.782379], [49.037872, 17.189532]],
    attribution: 'Grundkarte: <a href="http://basemap.at" target="_blank">basemap.at</a>, <a href="http://creativecommons.org/licenses/by/3.0/at/deed.de" target="_blank">CC-BY 3.0</a>',
  }).addTo(map);

  // Own Position
  let ownPosition = {};
  ownPosition.marker = undefined;
  ownPosition.circle = undefined;
  ownPosition.event = undefined; // cache last position
  ownPosition.layer = L.layerGroup().addTo(map);
  ownPosition.popup = function (accuracy) {
    return 'Ihr seid hier im Umkreis von ' + accuracy.toFixed(0) + 'm.';
  };
  ownPosition.follow = true;
  ownPosition.doFollow = function () {
    if (ownPosition.follow && ownPosition.event !== undefined) {
      map.panTo(ownPosition.event.latlng, {animate: true});
    };
  };
  ownPosition.startFollow = function () {
    ownPosition.follow = true;
    ownPosition.doFollow();
    ownPosition.followButton.state('followMe');
  };
  ownPosition.stopFollow = function () {
    ownPosition.follow = false;
    ownPosition.followButton.state('dontFollowMe');
  };
  ownPosition.followButton = L.easyButton({
    states: [{
        stateName: 'followMe',
        icon:    'fa-map-marker',
        title:   'automatisches Verschieben ausschalten',
        onClick:   ownPosition.stopFollow,
      }, {
        stateName: 'dontFollowMe',
        icon:    'fa-crosshairs',
        title:   'Karte mit eigener Position verschieben',
        onClick:   ownPosition.startFollow,
    }],
  }).addTo(map);

  // status
  let appStatus = {};
  appStatus.reload = function() {
    window.location.reload();
  };
  appStatus.locationButton = L.easyButton({
    position: 'bottomleft',
    states: [{
        stateName: 'green',
        icon:    'fa-globe green',
        title:   'die eigene Position wurde gefunden',
        onClick: $.noop,
      }, {
        stateName: 'red',
        icon:    'fa-globe red',
        title:   'klicken um die Seite neu zu laden',
        onClick:  appStatus.reload,
    }],
  }).addTo(map);
  appStatus.connectionButton = L.easyButton({
    position: 'bottomleft',
    states: [{
        stateName: 'green',
        icon:    'fa-plug green',
        title:   'regelmäßige Kommunikation mit dem Server',
        onClick: $.noop,
      }, {
        stateName: 'red',
        icon:    'fa-plug red',
        title:   'klicken um die Seite neu zu laden',
        onClick:  appStatus.reload,
    }],
  }).addTo(map);

  // locate self
  map
    .on('dragstart', ownPosition.stopFollow)
    .on('locationfound', function (e) {
      appStatus.locationButton.state('green');
      ownPosition.event = e;

      // send to geobroker
      if (myPositionsUrl !== undefined) {
        $.ajax({
          method: 'POST',
          url: myPositionsUrl,
          contentType: 'application/json',
          processData: false,
          data: JSON.stringify({
            latitude: e.latlng.lat,
            longitude: e.latlng.lng,
            timestamp: (new Date(e.timestamp)).toISOString(),
            accuracy: e.accuracy,
            heading: e.heading,
            speed: e.speed,
          }),
        }).done(function (e) {
          appStatus.connectionButton.state('green');
        }).fail(function (e) {
          appStatus.connectionButton.state('red');
          // TODO report on UI
          output.warn(e);
        });
      };

      // update the marker
      let radius = e.accuracy / 2;
      if (ownPosition.marker === undefined) {
        ownPosition.marker = L.marker(e.latlng)
          .addTo(ownPosition.layer)
          .bindPopup(ownPosition.popup(e.accuracy));
        ownPosition.circle = L.circle(e.latlng, {
          radius: radius,
        })
          .addTo(ownPosition.layer)
      } else {
        ownPosition.marker
          .setLatLng(e.latlng)
          .setPopupContent(ownPosition.popup(e.accuracy));
        ownPosition.circle
          .setLatLng(e.latlng)
          .setRadius(radius);
      };

      // follow the new position
      ownPosition.doFollow();
    })
    .on('locationerror', function (e) {
      appStatus.locationButton.state('red');
      // TODO report on UI
      output.warn(e);
    })
    .locate({
      watch: true,
      enableHighAccuracy: true,
    });

  // empty scope
  let scope = {};
  scope.unitLayer = L.layerGroup().addTo(map);
  scope.incidentLayer = L.layerGroup().addTo(map);
  scope.units = new Map(); // id => L.circleMarker
  scope.incidents = new Map(); // id => L.marker.svgMarker.rhombusMarker

  // controls
  L.control.scale({
    position: 'bottomright',
    metric: true,
    imperial: false,
    // maxWidth: 100,
    updateWhenIdle: true,
  }).addTo(map);
  let layersControl = L.control.layers(null, {
    "Eigene Position": ownPosition.layer,
    "Einheiten": scope.unitLayer,
    "Vorf\u00e4lle": scope.incidentLayer,
  }).addTo(map);

  // scope update
  let scopeRefreshId;
  let scopeRefresh = function () {
    $.get(myScopeUrl).done(function (data) {
      if (!data || !data.units || !data.incidents) {
        // TODO report on UI
        return false;
      };

      // keep a copy of the existing keys and remove updated ones
      let toBeRemoved = new Set(scope.units.keys());
      // update the markers
      data.units.forEach(function (unit) {
        if (unit.currentPosition) {
          toBeRemoved.delete(unit.id);
          let pos = unit.currentPosition;
          if (scope.units.has(unit.id)) {
            scope.units.get(unit.id)
              .setLatLng([pos.latitude, pos.longitude])
              .setPopupContent(unit.name);
          } else {
            scope.units.set(unit.id,
              L.circleMarker([pos.latitude, pos.longitude], {
                color: 'black',
                weight: 1,
                fillColor: unit.id == myId ? 'yellow' : 'white',
                fillOpacity: 1,
                pane: 'markerPane',
              })
                .addTo(scope.unitLayer)
                .bindPopup(unit.name)
            );
          };
        };
      });
      // clear deprecated markers
      toBeRemoved.forEach(function (id) {
        scope.units.get(id).remove();
        scope.units.delete(id);
      });

      // keep a copy of the existing keys and remove updated ones
      toBeRemoved = new Set(scope.incidents.keys());
      // update the markers
      data.incidents.forEach(function (incident) {
        if (incident.location) {
          toBeRemoved.delete(incident.id);
          if (scope.incidents.has(incident.id)) {
            scope.incidents.get(incident.id).updateIncident(incident);
          } else {
            scope.incidents.set(incident.id,
              L.marker.incidentMarker(incident)
                .addTo(scope.incidentLayer)
            );
          };
        };
      });
      // clear deprecated markers
      toBeRemoved.forEach(function (id) {
        scope.incidents.get(id).remove();
        scope.incidents.delete(id);
      });

    }).done(function (e) {
      appStatus.connectionButton.state('green');
    }).fail(function (e) {
      appStatus.connectionButton.state('red');
      // TODO report on UI
      output.warn(e);
    });
  };

  if (myScopeUrl !== undefined) {
    scopeRefreshId = setInterval(scopeRefresh, config.scopeRefreshInterval);
  } else {
    appStatus.connectionButton.state('red');
    output.warn("Unit id or token parameter missing!")
  };

  // manage POI layers
  let pois = {};
  pois.layers = new Map(); // name => L.layerGroup
  pois.getLayer = function (name) {
    if (pois.layers.has(name)) {
      return pois.layers.get(name);
    } else {
      let layer = L.layerGroup();
      layersControl.addOverlay(layer, name);
      pois.layers.set(name, layer);
      return layer;
    };
  };

  // no else, no warning - assuming myPoisUrl undefined iff myScopeUrl undefined
  if (myPoisUrl !== undefined) {
    $.get(myPoisUrl).done(function (data) {
      if (!data || !data.pointsOfInterest) {
        // TODO report on UI
        return false;
      };
      // create markers and layers
      data.pointsOfInterest.forEach(function (poi) {
        if (poi.location) {
          let layer = pois.getLayer(poi.type);
          L.marker.svgMarker.rhombusMarker([poi.location.latitude, poi.location.longitude], {
            iconOptions: {
              circleRatio: 0,
              color: 'black',
              weight: 1,
              fillColor: 'yellow',
              fillOpacity: 0.5,
              iconSize: [25,25],
            },
          })
            .addTo(layer)
            .bindPopup(poi.info)
          ;
        };
      });

    }).done(function (e) {
      appStatus.connectionButton.state('green');
    }).fail(function (e) {
      appStatus.connectionButton.state('red');
      // TODO report on UI
      output.warn(e);
    });
  };

  config.loadData.forEach(function (set) {
    let config = $.extend({
      authenticate: false,
      markerFactory: L.marker,
      markerOptions: {/* must be extended per marker */},
      layerName: 'Extra',
      layerShow: false,
      popupFunction: null,
      popupOptions: {},
      tooltipFunction: null,
      tooltipOptions: {},
    }, set);
    if (!config.authenticate || myPoisUrl !== undefined) {
      $.get(config.url, function (data) {
        let layer = pois.getLayer(config.layerName);
        data.forEach(function (p) {
          let options = $.extend({
            pane: 'overlayPane',
            title: p.text,
            alt: p.text,
          }, config.markerOptions);
          let m = config.markerFactory(p.coordinates, options)
            .addTo(layer);
          if (config.popupFunction) {
            m.bindPopup(config.popupFunction, config.popupOptions);
          };
          if (config.tooltipFunction) {
            m.bindTooltip(config.tooltipFunction, config.tooltipOptions);
          };
        });
        if (config.layerShow) {
          layer.addTo(map);
        };
      });
    };
  });

})(typeof geobroker === 'object' ? geobroker.config : {});
