import { useState } from 'react';
import { useApiResource } from '../hooks/useApiResource';
import type { TelemetryResponse } from '../api/types';
import {
  O2_CRITICAL, SPARKLINE_MAX_POINTS, SPARKLINE_WIDTH, SPARKLINE_HEIGHT, COLOR_CRITICAL, COLOR_ACCENT,
} from '../config';
import { downsampleTelemetry } from '../domain/telemetry';
import { PanelLoading, PanelError } from './PanelStates';

export default function TelemetryChart() {
  const { data, loading, error, retry } = useApiResource<TelemetryResponse>('telemetry');
  const [selected, setSelected] = useState('o2');

  if (loading) return <PanelLoading title="Telemetry" message="Loading telemetry…" />;
  if (error) return <PanelError title="Telemetry" error={error} onRetry={retry} />;
  if (!data) return null;

  const series = data.series[selected as keyof typeof data.series];
  const points = downsampleTelemetry(series.points, SPARKLINE_MAX_POINTS);

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = SPARKLINE_WIDTH / (points.length - 1);
  const coords = points
    .map((p: number, i: number) => {
      const x = (i * step).toFixed(1);
      const y = (SPARKLINE_HEIGHT - ((p - min) / range) * (SPARKLINE_HEIGHT - 8) - 4).toFixed(1);
      return x + ',' + y;
    })
    .join(' ');

  const latest = points[points.length - 1];
  const breach = selected === 'o2' && latest < O2_CRITICAL;

  return (
    <section className="panel">
      <h2>Telemetry</h2>
      <div className="chart-tabs">
        {Object.keys(data.series).map((key) => (
          <button
            key={key}
            className={key === selected ? 'chart-tab chart-tab-active' : 'chart-tab'}
            onClick={() => setSelected(key)}
          >
            {data.series[key as keyof typeof data.series].label}
          </button>
        ))}
      </div>
      <div className="chart-body">
        <svg viewBox={'0 0 ' + SPARKLINE_WIDTH + ' ' + SPARKLINE_HEIGHT} className="sparkline" preserveAspectRatio="none">
          <polyline points={coords} fill="none" stroke={breach ? COLOR_CRITICAL : COLOR_ACCENT} strokeWidth="2" />
        </svg>
        <div className="chart-stats">
          <span>latest <strong>{latest.toFixed(1)}</strong> {series.unit}</span>
          <span>min {min.toFixed(1)}</span>
          <span>max {max.toFixed(1)}</span>
          {breach && <span className="chart-breach">below floor!</span>}
        </div>
      </div>
    </section>
  );
}
