import { useApiResource } from '../hooks/useApiResource';
import type { FuelResponse } from '../api/types';
import { computeTotalReserves, computeDaysOfFuelRemaining } from '../domain/fuel';
import { PanelLoading, PanelError } from './PanelStates';

export default function FuelWidget() {
  const { data, loading, error, retry } = useApiResource<FuelResponse>('fuel');

  if (loading) return <PanelLoading title="Fuel Reserves" message="Loading fuel data…" />;
  if (error) return <PanelError title="Fuel Reserves" error={error} onRetry={retry} />;
  if (!data) return null;

  const totalKg = computeTotalReserves(data.tanks);
  const daysRemaining = computeDaysOfFuelRemaining(data.tanks, data.dailyConsumptionKg);
  const daysClass = daysRemaining < 30 ? 'tile-bad' : daysRemaining < 60 ? 'tile-warn' : 'tile-ok';

  return (
    <section className="panel">
      <h2>Fuel Reserves</h2>
      <div className="tiles" style={{ marginTop: 0 }}>
        <div className="tile tile-ok">
          <div className="tile-label">Total Reserves</div>
          <div className="tile-value">{totalKg}<span className="tile-unit">kg</span></div>
          <div className="tile-sub">{data.tanks.length} tanks · {data.dailyConsumptionKg} kg/day burn rate</div>
        </div>

        <div className={'tile ' + daysClass}>
          <div className="tile-label">Days of Fuel</div>
          <div className="tile-value">{daysRemaining}<span className="tile-unit">days</span></div>
          <div className="tile-sub">at current consumption rate</div>
        </div>

        {data.tanks.map((tank) => (
          <div key={tank.id} className="tile tile-ok">
            <div className="tile-label">{tank.id} · {tank.type}</div>
            <div className="tile-value" style={{ fontSize: 22 }}>
              {tank.currentKg}<span className="tile-unit">/ {tank.capacityKg} kg</span>
            </div>
            <div className="tile-sub">{Math.round((tank.currentKg / tank.capacityKg) * 100)}% remaining</div>
          </div>
        ))}
      </div>
    </section>
  );
}
