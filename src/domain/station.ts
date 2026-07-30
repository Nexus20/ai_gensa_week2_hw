import { O2_CRITICAL, O2_DEGRADED, POWER_DEGRADED_KW } from '../config';

export type StationStatus = 'NOMINAL' | 'DEGRADED' | 'CRITICAL';

export function computeStationStatus(
  o2: number,
  power: number,
  unresolvedCritical: number,
): StationStatus {
  if (o2 < O2_CRITICAL || unresolvedCritical > 1) {
    return 'CRITICAL';
  }
  if (o2 < O2_DEGRADED || power < POWER_DEGRADED_KW || unresolvedCritical > 0) {
    return 'DEGRADED';
  }
  return 'NOMINAL';
}
