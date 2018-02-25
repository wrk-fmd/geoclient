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
    }

    // map and base tiles
    let map = L.map('map', {
        center: [config.initLatitude, config.initLongitude],
        zoom: config.initZoom,
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
    ownPosition.layer = L.layerGroup().addTo(map);
    ownPosition.popup = function (radius) {
        return 'Ihr seid hier im Umkreis von ' + radius.toFixed(0) + 'm';
    };

    // locate self
    map.on('locationfound', function (e) {
        let radius = e.accuracy / 2;
        if (ownPosition.marker === undefined) {
            ownPosition.marker = L.marker(e.latlng)
                .addTo(ownPosition.layer)
                .bindPopup(ownPosition.popup(radius));
        } else {
            ownPosition.marker.setLatLng(e.latlng)
                .setPopupContent(ownPosition.popup(radius));
        }

        // TODO send to geobroker
    }).on('locationerror', function (e) {
        // TODO report on UI
        output.warn(e);
    }).locate({
        watch: true,
        enableHighAccuracy: true,
    });

    // empty scope
    let scope = {};
    scope.layer = L.layerGroup().addTo(map);
    scope.units = new Map(); // id => L.marker

    // controls
    L.control.scale({
        metric: true,
        imperial: false,
        // maxWidth: 100,
        updateWhenIdle: true,
    }).addTo(map);
    L.control.layers(null, {
        "Eigene Position": ownPosition.layer,
        "Einheiten": scope.layer,
    }).addTo(map);

    // scope update
    let scopeRefreshId;
    let scopeRefresh = function () {
        $.get(myScopeUrl).done(function (data) {
            if (!data || !data.units) {
                // TODO report on UI
                return false;
            }

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
                            L.marker([pos.latitude, pos.longitude])
                                .addTo(scope.layer)
                                .bindPopup(unit.name)
                        );
                    }
                }
            });

            // clear deprecated markers
            toBeRemoved.forEach(function (id) {
                scope.units.get(id).remove();
                scope.units.delete(id);
            });

        }).fail(function (e) {
            // TODO report on UI
            output.warn(e);
        });
    };

    if (myScopeUrl) {
        scopeRefreshId = setInterval(scopeRefresh, config.scopeRefreshInterval);
    } else {
        output.warn("Unit id or token parameter missing!")
    }

})(typeof geobroker === 'object' ? geobroker.config : {});
