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

function incidentModel (data) {
  var self = this;
  ko.mapping.fromJS(data, {
    copy: ['id'],
  }, self);
  self.post = function () {
    $.ajax({
        method: 'PUT',
        url: apiPrivate + '/incidents/' + encodeURIComponent(self.id),
        contentType: 'application/json',
        processData: false,
        data: ko.toJSON(self),
    }).fail(log);
  };
};

$.get(apiPrivate + '/incidents').fail(log).done(function (data) {
  let viewModel = ko.mapping.fromJS(data, {
    'configuredIncidents': {
      create: function (options) {
        return new incidentModel(options.data);
      },
      key: function (data) {
        return data.id;
      },
    },
  });
  viewModel.newIncidentType = ko.observable();
  viewModel.addIncident = function () {
    viewModel.newIncidentType().split('\n').forEach(function (type) {
      let incident = new incidentModel({
        id: randomToken(),
        type: type,
        info: '',
        priority: false,
        blue: false,
        location: randomLocation(),
      });
      viewModel.configuredIncidents.push(incident);
      incident.post();
    });
  };
  viewModel.postAll = function() {
    viewModel.configuredIncidents().forEach(function (incident) {
      incident.post();
    });
  };
  viewModel.removeIncident = function(incident) {
    viewModel.configuredIncidents.remove(incident);
    $.ajax({
        method: 'DELETE',
        url: apiPrivate + '/incidents/' + encodeURIComponent(incident.id),
        processData: false,
        contentType: 'text/plain',
        dataType: 'text',
    }).fail(log);
  };
  ko.applyBindings(viewModel);
});
