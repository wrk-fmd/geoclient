/*
 * Copyright (c) 2018 Red Cross Vienna and contributors. All rights reserved.
 *
 * This software may be modified and distributed under the terms of the MIT license. See the LICENSE file for details.
 */

let geobroker = {};

geobroker.config = {
  // scopeRefreshInterval: 2000, // given in milliseconds. Default 2000

  // initLatitude: 48.2089816,
  // initLongitude: 16.3710193,
  // initZoom: 14,

  initLayers: function (map, layersControl) {
    // optionally add data
  },

  // Each entry loads a json file with an array of objects.
  // Each object has coordinates.lat, coordinates.lng, and text.
  // Text is copied to marker's title and alt. It can be used in
  // tooltipFunction and popupFunction, e.g. see example below.
  loadData: [
    {
      url: 'data/sample.json',
      // XXX weak protection if true: load only if *any* id and token are given
      authenticate: false,
      // markerFactory(coordinates, markerOptions)
      markerFactory: L.marker,
      // https://leafletjs.com/reference-1.3.0.html#marker-option
      markerOptions: {
        pane: 'overlayPane',
        title: text,
        alt: text,
      },
      // https://leafletjs.com/reference-1.3.0.html#control-layers-addoverlay
      layerName: 'Extra',
      // show the layer by default
      layerShow: false,
      // https://leafletjs.com/reference-1.3.0.html#marker-bindtooltip
      tooltipFunction: null, // no tooltip
      tooltipOptions: {},
      // https://leafletjs.com/reference-1.3.0.html#marker-bindpopup
      popupFunction: function (m) {
        return m.options.title;
      },
      popupOptions: {},
      // bind a key (e.g. 'ctrl+t') or multiple keys (e.g. ['t', '.'])
      keyToggle: null,
    },
  ],

  apiPublic: '/api/v1/public',

  // keyboard is only available in centerMode
  keySearch: ['ctrl+f', '/'],
  keyZoomIn: ['pageup', '+'],
  keyZoomOut: ['pagedown', '-'],
  keyPanWE: 100,
  keyPanNS: 100,
  keyPanN: 'up',
  keyPanE: 'right',
  keyPanS: 'down',
  keyPanW: 'left',
};
