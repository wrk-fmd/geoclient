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
  let myCenterMode = false;
  let mySendLocation = false;
  let myDoLocate = true;
  let myScopeUrl;
  let myPositionsUrl;
  let myPoisUrl;
  /* temporary let params */
  {
    let params = (new URL(location)).searchParams;
    if (params.has('debug')) {
      output = console;
    };
    myCenterMode = params.has('centerMode');
    mySendLocation = params.has('sendLocation');
    myDoLocate = mySendLocation || !myCenterMode;
    myId = params.get('id');
    myToken = params.get('token');
  };

  output.log("Starting up client with external configuration:", external_config);

  // configure / defaults
  let default_config = {
    scopeRefreshInterval: 2000, // given in milliseconds. Default 2 sec
    onlineTimeout: 30*60000, // given in milliseconds. Default 30 min
    showBusyUnits: true,

    initLatitude: 48.2089816,
    initLongitude: 16.3710193,
    initZoom: 14,

    loadData: [],

    apiPublic: '/api/v1/public',

    // keyboard is only available in centerMode
    keySearch: ['ctrl+f', '/'],
    keyResetLayers: ['ctrl+x', 'home'],
    keyToggleBusyUnits: ['space'],
    keyZoomIn: ['pageup', '+'],
    keyZoomOut: ['pagedown', '-'],
    keyPanWE: 100,
    keyPanNS: 100,
    keyPanN: 'up',
    keyPanE: 'right',
    keyPanS: 'down',
    keyPanW: 'left',
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
  };

  // map and base tiles
  let map = L.map('map', {
    center: [config.initLatitude, config.initLongitude],
    zoom: config.initZoom,
    zoomSnap: 0.5,
    zoomDelta: 1,
  });

  L.tileLayer('https://{s}.wien.gv.at/basemap/bmaphidpi/normal/google3857/{z}/{y}/{x}.jpeg', {
    maxZoom: 19,
    subdomains: ['maps', 'maps1', 'maps2', 'maps3', 'maps4'],
    bounds: [[46.358770, 8.782379], [49.037872, 17.189532]],
    attribution: 'Grundkarte: <a href="http://basemap.at" target="_blank">basemap.at</a>, <a href="http://creativecommons.org/licenses/by/3.0/at/deed.de" target="_blank">CC-BY 3.0</a>',
  }).addTo(map);

  // Own Position
  let ownPosition;
  if (myDoLocate) {
    ownPosition = {};
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
  };

  // status
  let appStatus = {};
  appStatus.reload = function() {
    window.location.reload();
  };
  if (myDoLocate) {
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
  };
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
  if (myDoLocate) {
    map
      .on('dragstart', ownPosition.stopFollow)
      .on('locationfound', function (e) {
	appStatus.locationButton.state('green');
	ownPosition.event = e;

	// send to geobroker
	if (mySendLocation && myPositionsUrl !== undefined) {
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
  };

  // empty scope
  let scope = {};
  scope.unitLayer = L.layerGroup().addTo(map);
  scope.incidentLayer = L.layerGroup().addTo(map);
  scope.units = new Map(); // id => L.circleMarker.unitMarker
  scope.incidents = new Map(); // id => L.marker.incidentMarker
  scope.showBusyUnits = config.showBusyUnits;

  // controls
  L.control.scale({
    position: 'bottomright',
    metric: true,
    imperial: false,
    // maxWidth: 100,
    updateWhenIdle: true,
  }).addTo(map);
  let layersControl;
  {
    let layers = {}; // temporary variable
    if (myDoLocate) {
      layers["Eigene Position"] = ownPosition.layer;
    };
    layers["Einheiten"] = scope.unitLayer;
    layers["Vorf\u00e4lle"] = scope.incidentLayer;
    layersControl = L.control.layers(null, layers).addTo(map);
  };

  // center mode - activate with ?centerMode
  if (myCenterMode) {
    // show busy units
    let toggleBusyUnits = function() {
      scope.showBusyUnits = !scope.showBusyUnits;
      scope.toggleBusyUnitsButton.state(scope.showBusyUnits ? 'busyUnitsShown' : 'busyUnitsHidden');
      scope.units.forEach(function (marker) {
        marker[
          scope.showBusyUnits || marker.isAvailableForDispatching()
          ? 'addTo'
          : 'removeFrom'
        ](scope.unitLayer);
      });
    };
    scope.toggleBusyUnitsButton = L.easyButton({
      states: [{
	stateName: 'busyUnitsShown',
	icon:    'fa-thumbs-up',
	title:   'nur disponierbare Einheiten zeigen',
	onClick:   toggleBusyUnits,
      }, {
	stateName: 'busyUnitsHidden',
	icon:    'fa-flag',
	title:   'alle Einheiten zeigen',
	onClick:   toggleBusyUnits,
      }],
    }).addTo(map);
    if (!scope.showBusyUnits) toggleBusyUnits();

    // XXX quite hacky search
    let searchString = "";
    let doSearch = function() {
      let what = prompt("Suche ohne Gro\u00df-/Kleinschreibung", searchString);
      if (what === null) return;
      searchString = what;
      // case-insensitive, make it a RegExp (except for the empty string that clears all search results)
      // escaping special characters, see js escapeRegExp in
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Using_special_characters
      what = what === "" ? false : RegExp(what.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      // extend the view to include the results
      let bounds = map.getBounds();
      scope.units.forEach(function(unit) {
        if (unit.highlight(what)) {
          bounds.extend(unit.getLatLng());
        };
      });
      map.flyToBounds(bounds);
    };
    L.easyButton({
      states: [{
        stateName: 'search',
        icon:    'fa-search',
        title:   'Suche Einheiten',
        onClick: doSearch,
      }],
    }).addTo(map);

    // keyboard shortcuts in centerMode
    appStatus.mousetrapLoaded = $.getScript("libs/mousetrap/v1.6.2/mousetrap.min.js", function() {
      // wrapper functions are needed because action functions are not event functions
      Mousetrap.bind(config.keySearch, function() {
        doSearch();
        return false;
      });
      Mousetrap.bind(config.keyResetLayers, function() {
        // remove all layers then add the default ones
        layersControl._layers.forEach(function(layer) {
          map.removeLayer(layer.layer);
        });
        if (myDoLocate) map.addLayer(ownPosition.layer);
        map.addLayer(scope.unitLayer);
        map.addLayer(scope.incidentLayer);
        return false;
      });
      Mousetrap.bind(config.keyToggleBusyUnits, function() {
        toggleBusyUnits();
        return false;
      });
      Mousetrap.bind(config.keyZoomIn, function() {
        map.zoomIn();
        return false;
      });
      Mousetrap.bind(config.keyZoomOut, function() {
        map.zoomOut();
        return false;
      });
      Mousetrap.bind(config.keyPanW, function() {
        ownPosition && ownPosition.stopFollow();
        map.panBy([-config.keyPanWE, 0]);
        return false;
      });
      Mousetrap.bind(config.keyPanE, function() {
        ownPosition && ownPosition.stopFollow();
        map.panBy([config.keyPanWE, 0]);
        return false;
      });
      Mousetrap.bind(config.keyPanN, function() {
        ownPosition && ownPosition.stopFollow();
        map.panBy([0, -config.keyPanNS]);
        return false;
      });
      Mousetrap.bind(config.keyPanS, function() {
        ownPosition && ownPosition.stopFollow();
        map.panBy([0, config.keyPanNS]);
        return false;
      });
    });
  };

  // help dialog
  let help = {};
  help.size = [map.getSize().x-150, map.getSize().y-50];
  help.dialog = L.control.dialog({
    anchor: [0, 50],
    size: help.size,
    maxSize: help.size,
    initOpen: false,
  })
    .setContent($('#help').get(0))
    .addTo(map)
    .freeze();
  L.easyButton({
    position: 'topright',
    states: [{
      stateName: 'help',
      icon:    'fa-question',
      title:   'Erläuterungen',
      onClick: help.dialog.toggle.bind(help.dialog),
    }],
  }).addTo(map);

  // scope update
  let scopeRefreshId;
  let scopeRefresh = function () {
    $.get(myScopeUrl).done(function (data) {
      if (!data || !data.units || !data.incidents) {
        // TODO report on UI
        return false;
      };

      // while updating units and incidents, use a Set for the diff with existing ones
      let toBeRemoved;

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

      toBeRemoved = new Set(scope.units.keys());
      // update the markers
      let now = new Date();
      data.units.forEach(function (unit) {
        if (unit.currentPosition || unit.lastPoint) {
          unit.online = !!unit.currentPosition &&
            (now - new Date(unit.currentPosition.timestamp) < config.onlineTimeout);
          if (!unit.currentPosition) {
            unit.currentPosition = {
              latitude: unit.lastPoint.latitude,
              longitude: unit.lastPoint.longitude,
              // lastPoint has no timestamp, pretend it is fresh
              timestamp: now.toISOString(),
            };
          };
          unit.ownUnit = unit.id == myId;
          toBeRemoved.delete(unit.id);
          if (scope.units.has(unit.id)) {
            scope.units.get(unit.id).updateUnit(unit);
          } else {
            scope.units.set(unit.id,
              L.circleMarker.unitMarker(unit)
                .addTo(scope.unitLayer)
            );
          };
        };
      });
      // clear deprecated markers
      toBeRemoved.forEach(function (id) {
        scope.units.get(id).remove();
        scope.units.delete(id);
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
      type: 'marker', // or 'wms' or a constructor of omnivore, i.e. csv, kml, ...
      authenticate: false,
      markerFactory: L.marker,
      markerOptions: {/* must be extended per marker */},
      layerName: 'Extra',
      layerShow: false,
      popupFunction: null,
      popupOptions: {},
      tooltipFunction: null,
      tooltipOptions: {},
      keyToggle: null,
    }, set);
    if (!config.authenticate || myPoisUrl !== undefined) {
      let layer
      switch (config.type) {
        case 'marker':
          layer = pois.getLayer(config.layerName);
          $.get(config.url, function (data) {
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
          });
          break;
        case 'wms':
          layer = L.tileLayer.wms(config.url, config.parserOptions);
          layersControl.addOverlay(layer, config.layerName);
          break;
        case 'kml':
        case 'geojson':
        case 'csv':
        case 'gpx':
        case 'wkt':
        case 'topojson':
        case 'polyline':
          layer = omnivore[config.type](config.url, config.parserOptions);
          layersControl.addOverlay(layer, config.layerName);
          break;
        default:
          output.warn('Ignoring unknown data type in loadData: ' + config.type);
      };
      if (layer) {
        if (config.layerShow) {
          layer.addTo(map);
        };

        // keyboard shortcuts
        if (myCenterMode) {
          if (config.keyToggle) {
            appStatus.mousetrapLoaded.done(function() {
              Mousetrap.bind(config.keyToggle, function() {
                layer[map.hasLayer(layer) ? 'removeFrom' : 'addTo'](map);
                return false;
              });
            });
          };
        };
      };
    };
  });

})(typeof geobroker === 'object' ? geobroker.config : {});
