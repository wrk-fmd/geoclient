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

function unitModel (data) {
  var self = this;
  self.units = ko.observableArray();
  self.incidents = ko.observableArray();
  ko.mapping.fromJS(data, {
    copy: ['id'],
  }, self);
  self.post = function () {
    $.ajax({
        method: 'PUT',
        url: apiPrivate + '/units/' + encodeURIComponent(self.id),
        contentType: 'application/json',
        processData: false,
        data: ko.toJSON(self),
    }).fail(log);
  };
  self.random = function () {
    self.token(randomToken());
  };
};

function incidentModel (data) {
  var self = this;
  ko.mapping.fromJS(data, {
    copy: ['id'],
  }, self);
};

let viewModel = {
  newUnitName: ko.observable(),
  addUnit: function () {
    viewModel.newUnitName().split('\n').forEach(function (name) {
      let unit = new unitModel({
        id: randomToken(),
        name: name,
        token: randomToken(),
        units: [],
        incidentes: [],
      });
      viewModel.configuredUnits.push(unit);
      unit.post();
    });
  },
  randomAll: function() {
    viewModel.configuredUnits().forEach(function (unit) {
      unit.random();
    });
  },
  postAll: function() {
    viewModel.configuredUnits().forEach(function (unit) {
      unit.post();
    });
  },
  removeUnit: function(unit) {
    viewModel.configuredUnits.remove(unit);
    $.ajax({
        method: 'DELETE',
        url: apiPrivate + '/units/' + encodeURIComponent(unit.id),
        processData: false,
        contentType: 'text/plain',
        dataType: 'text',
    }).fail(log);
  },
};
$.when(
  $.get(apiPrivate + '/units').fail(log).done(function (data) {
    ko.mapping.fromJS(data, {
      'configuredUnits': {
	create: function (options) {
	  return new unitModel(options.data);
	},
	key: function (data) {
	  return data.id;
	},
      },
    }, viewModel);
  }),
  $.get(apiPrivate + '/incidents').fail(log).done(function (data) {
    ko.mapping.fromJS(data, {
      'configuredIncidents': {
	create: function (options) {
	  return new incidentModel(options.data);
	},
	key: function (data) {
	  return data.id;
	},
      },
    }, viewModel);
  }),
).then(function () {
  ko.applyBindings(viewModel);
});
