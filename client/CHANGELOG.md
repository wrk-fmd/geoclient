## 2.0.3

- Fix `wien.gv.at` URLs in map layers
- fix default config and map layers
- cleanup docker structure
- update jquery libraries

## 2.0.2

- Pass feature properties as path options for lines and polygons in GeoJson

## 2.0.1

- Only show first line of text-markers

## 2.0.0

- Update dependency versions
- Show units and incidents on separate pane in front of other markers
- Bugfix: Add/remove unit markers on availability changes when only available units should be shown  
- Only update marker positions when moved by at least ~10 meters to improve performance
- Feature: Add (optional) clustering of unit markers 

## 2.0.0beta2

- Use `100%` for height instead of `100vh`, because Chrome on Android considers the address bar as part of the viewport.
- Add favicon
- Set `no-referrer` in HTML and Docker Nginx config to further restrict sending of referrer

## 2.0.0beta1

Completely rewritten in Typescript.

Added functionality:
- Overlays from [Geotool](https://github.com/wrk-fmd/geotool) can be loaded directly
- UI available in English and German, based on browser preferences
- Config is now provided as JSON
- Text markers can be toggled between showing text and just a small circle
- Docker config available and built on every commit
- Some minor fixes

Removed functionality:
- Unit specific POIs from Geobroker
  (will possibly be redesigned and added again at some point)
- Customization of overlays through custom JS functions
  (should not be required anymore with extended GeoJSON overlays out of the box)
- All overlay types except GeoJSON and WMS
  (should not be necessary, as all common formats can easily be converted to GeoJSON)
