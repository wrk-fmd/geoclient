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

function log (text) {
    if (text && text.responseJSON) {
        text = text.responseJSON;
    }
    if (typeof text !== 'string') {
        text = JSON.stringify(text, null, 2);
    }
    $('<p></p>').text(text).appendTo('body').get(0).scrollIntoView();
};

function randomToken () {
  // https://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript/30925561#30925561
  return (Math.random()*1e64).toString(36);
};

function randomLocation () {
  return {
    latitude: Math.random()*(0.2)+48.1,  // range 48.1~48.3
    longitude: Math.random()*(0.2)+16.3, // range 16.3~16.5
  };
};

function poiModel (data) {
  var self = this;
  ko.mapping.fromJS(data, {
    copy: ['id'],
  }, self);
  self.post = function () {
    $.ajax({
        method: 'PUT',
        url: apiPrivate + '/pois/' + encodeURIComponent(self.id),
        contentType: 'application/json',
        processData: false,
        data: ko.toJSON(self),
    }).fail(log);
  };
};

$.get(apiPrivate + '/pois').fail(log).done(function (data) {
  let viewModel = ko.mapping.fromJS(data, {
    'pointsOfInterest': {
      create: function (options) {
        return new poiModel(options.data);
      },
      key: function (data) {
        return data.id;
      },
    },
  });
  viewModel.newPoiType = ko.observable();
  viewModel.newPoiInfo = ko.observable();
  viewModel.addPoi = function () {
    let type = viewModel.newPoiType();
    viewModel.newPoiInfo().split('\n').forEach(function (info) {
      let poi = new poiModel({
        id: randomToken(),
        type: type,
        info: info,
        location: randomLocation(),
      });
      viewModel.pointsOfInterest.push(poi);
      poi.post();
    });
  };
  viewModel.postAll = function() {
    viewModel.pointsOfInterest().forEach(function (poi) {
      poi.post();
    });
  };
  viewModel.removePoi = function(poi) {
    viewModel.pointsOfInterest.remove(poi);
    $.ajax({
        method: 'DELETE',
        url: apiPrivate + '/pois/' + encodeURIComponent(poi.id),
        processData: false,
        contentType: 'text/plain',
        dataType: 'text',
    }).fail(log);
  };
  ko.applyBindings(viewModel);
});
