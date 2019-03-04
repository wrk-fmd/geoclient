/*
 * Copyright (c) 2018 Red Cross Vienna and contributors. All rights reserved.
 *
 * This software may be modified and distributed under the terms of the MIT license. See the LICENSE file for details.
 */

let apiBase = '/api/v1';
let apiPrivate =
    (typeof geobroker === 'object' && typeof geobroker.config === 'object' && geobroker.config.apiPrivate) ?
    geobroker.config.apiPrivate :
    (apiBase + '/private');
let apiPublic =
    (typeof geobroker === 'object' && typeof geobroker.config === 'object' && geobroker.config.apiPublic) ?
    geobroker.config.apiPublic :
    (apiBase + '/public');

let masterUnit = null;
let masterId = 'master';
let masterToken = 'mtok';
let masterName = 'Master';

let sampleUnits = [];
let sampleData = [
    {
        id: 'c',
        token: 'around',
        name: 'VCM VOK 1',
        lastPoint: {
          latitude: 48.2,
          longitude: 16.35,
        },
        targetPoint: {
          latitude: 48.15,
          longitude: 16.4,
        },
        isAvailableForDispatching: false,
    },
    {
        id: 'h',
        token: 'ew',
        name: 'RTW 42',
        targetPoint: {
          latitude: 48.15,
          longitude: 16.4,
        },
        isAvailableForDispatching: true,
    },
    {
        id: 'v',
        token: 'ns',
        name: 'NEF 1',
        lastPoint: {
          latitude: 48.2,
          longitude: 16.35,
        },
        isAvailableForDispatching: true,
    },
];
let sampleCenterX = 16.4; // longitude
let sampleCenterY = 48.2; // latitude
let sampleRadius = 0.02;
let sampleSpeed = 2 * Math.PI / 60000; // radians per millisecond (value = 360 degrees per minute)
let sampleInterval = 2000; // milliseconds
let sampleIntervalId = null;

// helper function appends text to the DOM;
// tries to reasonably extract data from well-known objects.
function log(text) {
    if (text && text.responseJSON) {
        text = text.responseJSON;
    }
    if (typeof text !== 'string') {
        text = JSON.stringify(text, null, 2);
    }
    $('<p></p>').text(text).appendTo('body').get(0).scrollIntoView();
}

// helper function creates the URI suffix "{id}?token={token}"
function unitToURI(unit) {
    return encodeURIComponent(unit.id) + '?' + $.param({token: unit.token});
}

// create/update units via REST
function update(unitId, unit) {
    return $.ajax({
        method: 'PUT',
        url: apiPrivate + '/units/' + encodeURIComponent(unitId),
        contentType: 'application/json',
        processData: false,
        data: JSON.stringify(unit),
    }).always(log);
}

function create(unitId, token, name) {
    return update(unitId, {id: unitId, token: token, name: name, isAvailableForDispatching: true});
}

// update positions
function samplePositions() {
    let now = new Date();
    let iso = now.toISOString();
    let millis = now.getTime();
    let x = sampleCenterX + sampleRadius * Math.cos(millis * sampleSpeed);
    let y = sampleCenterY + sampleRadius * Math.sin(millis * sampleSpeed);
    sampleUnits.map(u => $.ajax({
        method: 'POST',
        url: apiPublic + '/positions/' + unitToURI(u),
        contentType: 'application/json',
        processData: false,
        data: JSON.stringify({
            latitude: u.id === 'h' ? sampleCenterY : y,
            longitude: u.id === 'v' ? sampleCenterX : x,
            timestamp: iso,
        }),
    }).always(log));
}

// push sample data to the broker
$.when(
    // create master
    create(masterId, masterToken, masterName).done(function (master) {
        masterUnit = master;
    }),
    // create sample units (in separate arguments to when())
    ...sampleData.map(d => update(d.id, d).done(function (unit) {
        sampleUnits.push(unit);
    })),
).then(function () {
    // append all sample units to the master's scope
    masterUnit.units = sampleUnits.map(u => u.id);
    return update(masterId, masterUnit);
}).then(function () {
    // finally print all units
    $.get(apiPrivate + '/units').always(log);
    $.get(apiPublic + '/scope/' + unitToURI(masterUnit)).always(log);
    sampleIntervalId = setInterval(samplePositions, sampleInterval);
});
