# Geoclient

The Geoclient is a browser application that acts as frontend for Geobroker.

## Requirements

* For building:
  * Node (tested with version 16.15.0)
  * npm (tested with version 8.5.5)
* For running: A current web browser
  * Tested with Chrome 101.
  * Current versions of Firefox and Google Chrome should be fine.
  * Microsoft Edge is untested.

## Run the application

### Using released versions

* Download the latest version from the *Releases* section as zip or tar.gz archive
* Unpack the archive
* Serve the unpacked directory through a webserver.
* Make the public Geobroker API available through a reverse proxy, or set CORS appropriately.

### Using Docker

The latest state of the repository is automatically built as Docker image on every commit.
If you have Docker and Docker Compose installed you can run it as follows:

* Download `docker-compose.yml` to some directory
* Make sure Geobroker is available in the named container `geobroker`.
* Run `docker-compose pull && docker-compose up` from that directory
* Go to [localhost:8070](http://localhost:8070)

## Configuration

Make sure `config.json` is available at the application root (next to `index.html`).
It must contain a single JSON object (`{}`) where the following optional properties can be set:

| Property          | Type               | Default                           | Description                                              |
|-------------------|--------------------|-----------------------------------|----------------------------------------------------------|
| `refreshInterval` | `int`              | `2000`                            | Data refresh interval in ms                              |
| `onlineTimeout`   | `int`              | `30*60000`                        | Timeout after which a unit is considered *offline* in ms |
| `initialPosition` | `LatLngExpression` | `{lat:48.2089816,lng:16.3710193}` | Initial map position                                     |
| `initialZoom`     | `int`              | `14`                              | Initial map zoom level                                   |
| `apiUrl`          | `URL`              | `/api/v1/public`                  | Relative or absolute URL to the Geobroker API            |
| `unitColors`      | `{string:color}`   | `{}`                              | Map of unit name parts to custom colors                  |
| `overlays`        | `[OverlayOptions]` | `[]`                              | List of additional overlays (see below)                  |

### Overlays

Overlays can be loaded from GeoJSON or WMS.

The following options are common to all types (only the URL is mandatory):

| Property       | Type      | Default   | Description                                                          |
|----------------|-----------|-----------|----------------------------------------------------------------------|
| `url`          | `URL`     | required  | The URL to the layer data                                            |
| `ignore`       | `boolean` | `false`   | Whether this overlay should be ignored (essentially *commented out*) |
| `authenticate` | `boolean` | `false`   | Whether the overlay should only be shown to authenticated users      |
| `type`         | `string`  | `geojson` | The type of overlay                                                  |
| `name`         | `string`  | none      | The display name for the overlay                                     |
| `attribution`  | `string`  | none      | An attribution string shown at the bottom of the map                 |

#### GeoJSON overlays

GeoJSON data is identified by the type `geojson`.
The format created by the [Geotool](https://github.com/wrk-fmd/geotool) is supported.

The configuration entry may contain an additional object `markerDefaults`, which overrides defaults given in the GeoJSON file:

| Property        | Type       | Default             | Description                                                                                                                |
|-----------------|------------|---------------------|----------------------------------------------------------------------------------------------------------------------------|
| `text`          | `string`   | none                | The text shown on all markers                                                                                              |
| `titleTemplate` | `string`   | `{{text}}`          | A template string for the tooltip title, where `{{key}}` placeholders are replaced with the corresponding feature property |
| `popupTemplate` | `string`   | `{{text}}`          | A template string for the popup content, where `{{key}}` placeholders are replaced with the corresponding feature property |
| `color`         | CSS color  | none                | A CSS color used for the marker                                                                                            |
| `icon`          | Icon class | `fa-map-marker-alt` | A CSS class for the marker icon                                                                                            |
| `hAnchor`       | `string`   | `0.5` (center)      | A numeric value from `0` to `1` indicating the horizontal anchor position of the marker icon                               |
| `vAnchor`       | `string`   | `1` (bottom)        | A numeric value from `0` to `1` indicating the vertical anchor position of the marker icon                                 |

The following icons are supported:
* [Font Awesome icons](https://fontawesome.com/search?m=free&s=solid)
* The `marker-*` classes specified in [markers.scss](src/markers.scss)
* The `text-marker` class, which shows the tooltip of the marker

#### WMS overlays

The type property must be set to `wms`.
Additionally, a string `layers` must specify the [WMS layers](https://leafletjs.com/reference.html#tilelayer-wms-layers).

## License

This application and its source code are published under the [MIT license](LICENSE).

The core of the application is based on [Leaflet](https://github.com/Leaflet/Leaflet).

Both the application and documentation use [Font Awesome](https://github.com/FortAwesome/Font-Awesome),
available under the MIT license.
