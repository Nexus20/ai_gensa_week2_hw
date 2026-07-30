import { useEffect, useState } from 'react';
import { useApiResource } from '../hooks/useApiResource';
import type { Station, TelemetryResponse, CrewResponse, IncidentsResponse } from '../api/types';
import { computeStationStatus } from '../domain/station';
import { computeO2Trend, computePowerTrend, computePowerBudget } from '../domain/telemetry';
import { splitByDuty, countByShift, computeAvgSleep } from '../domain/crew';
import { countBySeverity, findMostUrgent, countResolvedOnDate } from '../domain/incidents';
import { getPowerBudgetClass, getSleepClass, computeResupply } from '../domain/tiles';
import {
  POWER_BUDGET_MAX_KW, POWER_BUDGET_BAD_PCT, POWER_BUDGET_WARN_PCT,
  SLEEP_CRITICAL_H, SLEEP_WARN_H, RESUPPLY_CRITICAL_DAYS, RESUPPLY_WARN_DAYS,
  COLOR_CRITICAL, COLOR_DEGRADED, COLOR_NOMINAL, O2_CRITICAL, O2_DEGRADED,
  HULL_TEMP_MAX_C, HULL_TEMP_MIN_C, HULL_INTEGRITY_BAD, HULL_INTEGRITY_WARN,
} from '../config';
import StatusHeader from './StatusHeader';
import AlertBanner from './AlertBanner';
import TileGrid from './TileGrid';

export default function Dashboard() {
  const s = useApiResource<Station>('station');
  const t = useApiResource<TelemetryResponse>('telemetry');
  const c = useApiResource<CrewResponse>('crew');
  const i = useApiResource<IncidentsResponse>('incidents');
  const [lastSync, setLastSync] = useState('');

  const allHaveData = [s.data, t.data, c.data, i.data].every(Boolean);
  const loading = [s.loading, t.loading, c.loading, i.loading].some(Boolean);
  const error = [s.error, t.error, c.error, i.error].find(Boolean) || '';

  useEffect(() => {
    if (!allHaveData) return;
    const now = new Date();
    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    setLastSync(pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds()));
  }, [allHaveData]);

  if (loading && !s.data) {
    return <div className="dashboard dashboard-loading"><div className="spinner" /><p>Establishing uplink to ISS Kruger-60…</p></div>;
  }
  if (error) {
    return (
      <div className="dashboard dashboard-error">
        <h1>⚠ Uplink lost</h1><p>{error}</p>
        <button onClick={() => { s.retry(); t.retry(); c.retry(); i.retry(); }}>Retry uplink</button>
      </div>
    );
  }
  if (!allHaveData) return null;
  const stationData = s.data!;
  const telemetryData = t.data!;
  const crewData = c.data!;
  const incidentsData = i.data!;

  const o2Points = telemetryData.series.o2.points;
  const powerPoints = telemetryData.series.power.points;
  const latestO2 = o2Points[o2Points.length - 1];
  const latestPower = powerPoints[powerPoints.length - 1];

  const incidentCounts = countBySeverity(incidentsData.items);
  const resolvedToday = countResolvedOnDate(incidentsData.items, '2036-07-11');

  const status = computeStationStatus(latestO2, latestPower, incidentCounts.critical);
  const statusColor = status === 'CRITICAL' ? COLOR_CRITICAL : status === 'DEGRADED' ? COLOR_DEGRADED : COLOR_NOMINAL;
  const o2Trend = computeO2Trend(o2Points);
  const powerTrend = computePowerTrend(powerPoints);
  const { avg: powerAvg, budgetPct: powerBudgetPct } = computePowerBudget(powerPoints, POWER_BUDGET_MAX_KW);
  const powerClass = getPowerBudgetClass(powerBudgetPct, POWER_BUDGET_BAD_PCT, POWER_BUDGET_WARN_PCT);
  const resupply = computeResupply(stationData.nextResupply, '2036-07-11T09:00:00Z', RESUPPLY_CRITICAL_DAYS, RESUPPLY_WARN_DAYS);
  const { onDuty, offDuty } = splitByDuty(crewData.members);
  const shifts = countByShift(crewData.members);
  const avgSleep = computeAvgSleep(crewData.members);
  const sleepClass = getSleepClass(avgSleep, SLEEP_CRITICAL_H, SLEEP_WARN_H);
  const topIncident = findMostUrgent(incidentsData.items);

  return (
    <div className="dashboard">
      <StatusHeader station={stationData} status={status} statusColor={statusColor} lastSync={lastSync} />
      <AlertBanner status={status} statusColor={statusColor} topIncident={topIncident} />
      <TileGrid
        latestO2={latestO2} o2Trend={o2Trend}
        latestPower={latestPower} powerTrend={powerTrend}
        powerAvg={powerAvg} powerClass={powerClass} powerBudgetPct={powerBudgetPct}
        latestHullTemp={telemetryData.series.hullTemp.points[telemetryData.series.hullTemp.points.length - 1]}
        latestIntegrity={telemetryData.series.hullIntegrity.points[telemetryData.series.hullIntegrity.points.length - 1]}
        unresolvedCritical={incidentCounts.critical} unresolvedWarning={incidentCounts.warning}
        resolvedToday={resolvedToday}
        resupplyLabel={resupply.label} resupplyClass={resupply.tileClass}
        crew={{ onDuty, offDuty, shifts, avgSleep, sleepClass }}
        resupplyDate={stationData.nextResupply} commissioned={stationData.commissioned}
        o2Critical={O2_CRITICAL} o2Degraded={O2_DEGRADED}
        hullTempMax={HULL_TEMP_MAX_C} hullTempMin={HULL_TEMP_MIN_C}
        hullIntegrityBad={HULL_INTEGRITY_BAD} hullIntegrityWarn={HULL_INTEGRITY_WARN}
      />
    </div>
  );
}
