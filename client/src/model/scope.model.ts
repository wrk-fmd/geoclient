import {ExtendedIncident, Incident} from './incident.model';
import {ExtendedUnit, Unit} from './unit.model';

export interface Scope {
  incidents: Incident[];
  units: Unit[];
}

export interface ExtendedScope {
  incidents: ExtendedIncident[];
  units: ExtendedUnit[];
}
