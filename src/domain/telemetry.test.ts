import { describe, it, expect } from 'vitest';
import { downsampleTelemetry, computeTrend, computePowerBudget } from './telemetry';

describe('downsampleTelemetry', () => {
  it('returns original array if length <= maxPoints', () => {
    expect(downsampleTelemetry([1, 2, 3], 5)).toEqual([1, 2, 3]);
  });

  it('downsamples to exactly maxPoints', () => {
    const points = Array.from({ length: 100 }, (_, i) => i);
    const result = downsampleTelemetry(points, 10);
    expect(result.length).toBe(10);
  });

  it('averages values within each bucket', () => {
    const points = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = downsampleTelemetry(points, 2);
    expect(result.length).toBe(2);
    expect(result[0]).toBeCloseTo(3, 0);
    expect(result[1]).toBeCloseTo(8, 0);
  });
});

describe('computeTrend', () => {
  it('returns upward arrow when rising above delta', () => {
    expect(computeTrend([10, 10.2], 0.15, 2)).toBe('↑');
  });

  it('returns downward arrow when falling below negative delta', () => {
    expect(computeTrend([10, 9.8], 0.15, 2)).toBe('↓');
  });

  it('returns steady arrow when change is within delta', () => {
    expect(computeTrend([10, 10.05], 0.15, 2)).toBe('→');
  });
});

describe('computePowerBudget', () => {
  it('computes average and budget percentage', () => {
    const { avg, budgetPct } = computePowerBudget([50, 60, 70], 100);
    expect(avg).toBeCloseTo(60, 0);
    expect(budgetPct).toBe(70);
  });
});
