import {latLngBounds, layerGroup, tileLayer} from 'leaflet';

import {i18n} from '../i18n';

export namespace Baselayers {
  const basemapAttribution = i18n('baselayer.attribution') + ':'
    + ' <a href="https://www.basemap.at" target="_blank">basemap.at</a>,'
    + ' <a href="https://creativecommons.org/licenses/by/4.0/deed.de" target="_blank">CC-BY 4.0</a>';
  const basemapSubdomains = ['maps', 'maps1', 'maps2', 'maps3', 'maps4'];
  const basemapBounds = latLngBounds([46.358770, 8.782379], [49.037872, 17.5]);

  export const hidpi = tileLayer('https://{s}.wien.gv.at/basemap/bmaphidpi/normal/google3857/{z}/{y}/{x}.jpeg', {
    maxZoom: 19,
    subdomains: basemapSubdomains,
    bounds: basemapBounds,
    attribution: basemapAttribution,
  });

  export const ortho = tileLayer('https://{s}.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg', {
    maxZoom: 19,
    subdomains: basemapSubdomains,
    bounds: basemapBounds,
    attribution: basemapAttribution,
  });

  export const terrain = tileLayer('https://{s}.wien.gv.at/basemap/bmapgelaende/grau/google3857/{z}/{y}/{x}.jpeg', {
    maxZoom: 19,
    subdomains: basemapSubdomains,
    bounds: basemapBounds,
    attribution: basemapAttribution,
  });

  export const labels = tileLayer('https://{s}.wien.gv.at/basemap/bmapoverlay/normal/google3857/{z}/{y}/{x}.png', {
    maxZoom: 19,
    subdomains: basemapSubdomains,
    bounds: basemapBounds,
  });

  export const orthoLabels = layerGroup([ortho, labels]);

  export const osm = tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: `${i18n('baselayer.attribution')}: © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors`
  });
}
