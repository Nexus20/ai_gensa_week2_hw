import type { CrewMember } from '../api/types';
import { getO2TileClass, getHullTempClass, getHullIntegrityClass, getIncidentsClass } from '../domain/tiles';

interface CrewData {
  onDuty: CrewMember[];
  offDuty: CrewMember[];
  shifts: Record<string, number>;
  avgSleep: number;
  sleepClass: string;
}

interface TileGridProps {
  latestO2: number; o2Trend: string;
  latestPower: number; powerTrend: string; powerAvg: number;
  powerClass: string; powerBudgetPct: number;
  latestHullTemp: number; latestIntegrity: number;
  unresolvedCritical: number; unresolvedWarning: number; resolvedToday: number;
  resupplyLabel: string; resupplyClass: string;
  crew: CrewData; resupplyDate: string; commissioned: string;
  o2Critical: number; o2Degraded: number;
  hullTempMax: number; hullTempMin: number;
  hullIntegrityBad: number; hullIntegrityWarn: number;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  return months[d.getUTCMonth()] + ' ' + d.getUTCDate() + ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + 'z';
}

export default function TileGrid(props: TileGridProps) {
  const {
    latestO2, o2Trend, latestPower, powerTrend, powerAvg, powerClass, powerBudgetPct,
    latestHullTemp, latestIntegrity, unresolvedCritical, unresolvedWarning, resolvedToday,
    resupplyLabel, resupplyClass, crew, resupplyDate, commissioned,
    o2Critical,
  } = props;

  return (
    <div className="tiles">
      <div className={'tile ' + getO2TileClass(latestO2)}>
        <div className="tile-label">O2 Level</div>
        <div className="tile-value">{latestO2.toFixed(1)}<span className="tile-unit">%</span><span className="tile-trend">{o2Trend}</span></div>
        <div className="tile-sub">floor {o2Critical} · cabin nominal {20.9}</div>
      </div>

      <div className={'tile ' + powerClass}>
        <div className="tile-label">Power Output</div>
        <div className="tile-value">{latestPower}<span className="tile-unit">kW</span><span className="tile-trend">{powerTrend}</span></div>
        <div className="tile-sub">avg {powerAvg.toFixed(0)} kW · budget {powerBudgetPct}%</div>
      </div>

      <div className={'tile ' + getHullTempClass(latestHullTemp)}>
        <div className="tile-label">Hull Temp</div>
        <div className="tile-value">{latestHullTemp}<span className="tile-unit">°C</span></div>
        <div className="tile-sub">day/night swing normal</div>
      </div>

      <div className={'tile ' + getHullIntegrityClass(latestIntegrity)}>
        <div className="tile-label">Hull Integrity</div>
        <div className="tile-value">{latestIntegrity.toFixed(1)}<span className="tile-unit">%</span></div>
        <div className="tile-sub">MMOD shielding rated to 97.0</div>
      </div>

      <div className={'tile ' + getIncidentsClass(unresolvedCritical, unresolvedWarning)}>
        <div className="tile-label">Open Incidents</div>
        <div className="tile-value">{unresolvedCritical + unresolvedWarning}<span className="tile-unit">open</span></div>
        <div className="tile-sub">{unresolvedCritical} critical · {unresolvedWarning} warning · {resolvedToday} resolved today</div>
      </div>

      <div className={'tile ' + resupplyClass}>
        <div className="tile-label">Next Resupply</div>
        <div className="tile-value" style={{ fontSize: 24 }}>{resupplyLabel}</div>
        <div className="tile-sub">{fmtDate(resupplyDate)}</div>
      </div>

      <div className={'tile ' + crew.sleepClass}>
        <div className="tile-label">Crew Rest</div>
        <div className="tile-value">{crew.avgSleep}<span className="tile-unit">h avg</span></div>
        <div className="tile-sub">{crew.onDuty.length} on duty · {crew.offDuty.length} off duty</div>
      </div>

      <div className="tile tile-ok">
        <div className="tile-label">Shift Board</div>
        <div className="tile-value" style={{ fontSize: 20 }}>
          α {crew.shifts['alpha'] || 0} · β {crew.shifts['beta'] || 0} · γ {crew.shifts['gamma'] || 0}
        </div>
        <div className="tile-sub">commissioned {fmtDate(commissioned + 'T00:00:00Z')}</div>
      </div>
    </div>
  );
}
