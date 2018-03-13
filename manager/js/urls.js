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
    .append($('<h1></h1>')
      .text(unit.name)
    )
    .append(qr)
    .append($('<p></p>')
      .addClass('link-paragraph')
      .append($('<a></a>')
        .addClass('line-wrap')
        .attr('href', url)
        .text(url)
      )
    )
    .append($('<h2>Benutzungsbedingungen</h2>'))
    .append($('<p></p>')
      .text('Info/Warnung/Bedingungen: ... Datenschutz ... Verkehrssicherheit ... StVO ... kein Navi ... nicht darauf verlassen ...')
    )
    .appendTo('body');
  (new QRCode(qr.get(0))).makeCode(url);
}

let prefix = '';
{
  let params = (new URL(location)).searchParams;
  if (params.has('prefix')) {
    prefix = params.get('prefix');
  }
}

$.get(apiPrivate + '/units').fail(log).done(function (data) {
  data.configuredUnits.forEach(function (unit) {
    if (unit.id.startsWith(prefix)) {
      addUnitToView(unit);
    } else {
      console.info("Skipping unit with not-matching id.", unit)
    }
  });
});
