import {
  TREND_O2_DELTA,
  TREND_POWER_DELTA,
  TREND_BACK_SAMPLES,
} from '../config';

export type TrendDirection = '↑' | '↓' | '→';

export function computeTrend(
  points: number[],
  delta: number,
  backSamples: number = TREND_BACK_SAMPLES,
): TrendDirection {
  const latest = points[points.length - 1];
  const prev = points[points.length - backSamples];
  if (latest - prev > delta) return '↑';
  if (latest - prev < -delta) return '↓';
  return '→';
}

export function computeO2Trend(points: number[]): TrendDirection {
  return computeTrend(points, TREND_O2_DELTA);
}

export function computePowerTrend(points: number[]): TrendDirection {
  return computeTrend(points, TREND_POWER_DELTA);
}

export function computePowerBudget(
  points: number[],
  maxKw: number,
): { avg: number; budgetPct: number } {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    sum += points[i];
  }
  const avg = sum / points.length;
  const budgetPct = Math.round((points[points.length - 1] / maxKw) * 100);
  return { avg, budgetPct };
}

export function downsampleTelemetry(points: number[], maxPoints: number): number[] {
  if (points.length <= maxPoints) return points;
  const bucketSize = points.length / maxPoints;
  const result: number[] = [];
  for (let i = 0; i < maxPoints; i++) {
    const start = Math.floor(i * bucketSize);
    const end = Math.floor((i + 1) * bucketSize);
    let sum = 0;
    let count = 0;
    for (let j = start; j < end && j < points.length; j++) {
      sum += points[j];
      count++;
    }
    result.push(count > 0 ? sum / count : points[start]);
  }
  return result;
}
