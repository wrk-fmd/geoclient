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
