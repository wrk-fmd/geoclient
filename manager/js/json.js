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

  output.log("Starting up client with external configuration:", external_config);

  // configure / defaults
  let default_config = {
    initLatitude: 48.2089816,
    initLongitude: 16.3710193,
    initZoom: 14,
  };

  let config = $.extend({}, default_config, external_config);

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

  // controls
  L.control.scale({
    metric: true,
    imperial: false,
    // maxWidth: 100,
    updateWhenIdle: true,
  }).addTo(map);

  // load markers
  let allMarkers = L.layerGroup().addTo(map);
  let outArray = [];
  let outObjects = new Map(); // L.Marker => object
  let updateOutput = function () {
    $('#output').val(JSON.stringify(outArray, null, 2));
  };
  $('#load').on('click', function () {
    allMarkers.remove();
    allMarkers = L.layerGroup().addTo(map);

    outObjects.clear();

    outArray = JSON.parse($('#input').val())
    outArray.forEach(function (e) {
      let m = L.marker(e.coordinates, {
        draggable: true,
      })
        .bindPopup(e.text.replace(/\n/g, '<br />'))
        .addTo(allMarkers)
        .on('moveend', function (e) {
          let out = outObjects.get(e.target);
          out.coordinates = e.target.getLatLng();
          updateOutput();
        });
      outObjects.set(m, e);
    });

    updateOutput();
  });

})(typeof geobroker === 'object' ? geobroker.config : {});
