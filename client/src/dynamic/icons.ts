import {icon, Icon, PointExpression} from 'leaflet';

let svgConstants = {
  svgHeader: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="16" height="16"%3E',
  svgFooter: '%3C/svg%3E',

  topDownTriangle: 'M1,1 L8,15 L15,1 z',
  square: 'M1,1 h14 v14 h-14 z',

  incidentIconSize: [16, 16] as PointExpression,
  incidentIconAnchor: [8, 8] as PointExpression,
  incidentPopupAnchor: [0, -8] as PointExpression,
  incidentFill: 'grey',
  incidentFillBlue: 'blue',
  incidentStroke: 'darkorange',
  incidentStrokePriority: 'red',
};

function buildSvgString(pathString: string, fillColor: string, strokeColor: string, flash: boolean) {
  return svgConstants.svgHeader
    + `%3Cpath d='${pathString}' fill='${fillColor}' stroke='${strokeColor}' stroke-width='2'%3E`
    + (flash ? '%3Canimate attributeName="opacity" values="0;1;1;1;1;1;0;0" dur="1s" repeatCount="indefinite"/%3E' : '')
    + '%3C/path%3E' + svgConstants.svgFooter;
}

const cache = new Map<string, Icon>();

/**
 * Obtain a new or cached incident icon for the given properties
 * @param priority incident has priority
 * @param blue incident is blue
 * @param flash icon should be flashing
 * @return An icon instance
 */
export function getIncidentIcon(priority: boolean, blue: boolean, flash: boolean): Icon {
  const name = `incident${priority ? 'Priority' : ''}${blue ? 'Blue' : ''}${flash ? 'Flash' : ''}`;

  // Try to get the icon from the cache
  const cachedIcon = cache.get(name);
  if (cachedIcon) {
    return cachedIcon;
  }

  // Create the icon
  const newIcon = icon({
    iconUrl: buildSvgString(
      svgConstants.topDownTriangle,
      blue ? svgConstants.incidentFillBlue : svgConstants.incidentFill,
      priority ? svgConstants.incidentStrokePriority : svgConstants.incidentStroke,
      flash
    ),
    iconSize: svgConstants.incidentIconSize,
    iconAnchor: svgConstants.incidentIconAnchor,
    popupAnchor: svgConstants.incidentPopupAnchor,
  });
  cache.set(name, newIcon);

  return newIcon;
}
