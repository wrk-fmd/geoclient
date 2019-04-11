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
let apiClient =
  (typeof geobroker === 'object' && typeof geobroker.config === 'object' && geobroker.config.apiClient) ?
    geobroker.config.apiClient :
    (window.location.protocol + '//' + window.location.host + '/');
let infoSheet =
  (typeof geobroker === 'object' && typeof geobroker.config === 'object' && geobroker.config.infoSheet) ?
    geobroker.config.infoSheet :
    'info.html';

function log(text) {
  if (text && text.responseJSON) {
    text = text.responseJSON;
  }
  if (typeof text !== 'string') {
    text = JSON.stringify(text, null, 2);
  }
  $('<p></p>').text(text).appendTo('body').get(0).scrollIntoView();
}

let template = $('<div></div>').addClass('unit');
function addUnitToView(unit) {
  let url = apiClient + '?' + $.param({
    id: unit.id,
    token: unit.token,
  });
  let qr = $('<div></div>').addClass('qr');
  template.clone()
    .append(qr)
    .append($('<h1></h1>')
      .text(unit.name)
    )
    .append($('<p></p>')
      .addClass('link-paragraph')
      .append($('<a></a>')
        .addClass('line-wrap')
        .attr('href', url)
        .text(url)
      )
    )
    .append($('<div>Loading info sheet &#8230;</div>')
      .addClass('info-div')
    )
    .appendTo('body');
  new QRCode(qr.get(0), {
    width: 300,
    height: 300,
    correctLevel: QRCode.CorrectLevel.L,
    text: url,
  });
}

let prefix = '';
let name = '';
let label = '';
{
  let params = (new URL(location)).searchParams;
  if (params.has('prefix')) {
    prefix = params.get('prefix');
    $('#prefix').val(prefix);
  }
  if (params.has('name')) {
    name = params.get('name');
    $('#name').val(name);
  }
  if (params.has('label')) {
    label = params.get('label');
    $('#label').val(label);
  }
}

function compareUnits(unitA, unitB) {
  if (unitA.name < unitB.name)
    return -1;
  if (unitA.name > unitB.name)
    return 1;
  return 0;
}

$.get(apiPrivate + '/units').fail(log).done(function (data) {
  let unitsToShow = [];

  data.configuredUnits.forEach(function (unit) {
    if (unit.id.startsWith(prefix)) {
      unitsToShow.push(unit);
    } else {
      console.info("Skipping unit with not-matching id.", unit);
    }
  });

  unitsToShow.sort(compareUnits);

  unitsToShow.forEach(function(unit) {
    addUnitToView(unit);
  });

  $('.info-div').load(infoSheet);
});
