import { describe, it, expect } from 'vitest';
import { computeStationStatus } from './station';

describe('computeStationStatus', () => {
  it('returns NOMINAL when all values are healthy', () => {
    expect(computeStationStatus(20.0, 80, 0)).toBe('NOMINAL');
  });

  it('returns CRITICAL when O2 is below critical threshold', () => {
    expect(computeStationStatus(19.4, 80, 0)).toBe('CRITICAL');
  });

  it('returns CRITICAL when more than 1 unresolved critical incident', () => {
    expect(computeStationStatus(20.0, 80, 2)).toBe('CRITICAL');
  });

  it('returns DEGRADED when O2 is below degraded threshold', () => {
    expect(computeStationStatus(19.6, 80, 0)).toBe('DEGRADED');
  });

  it('returns DEGRADED when power is below threshold', () => {
    expect(computeStationStatus(20.0, 49, 0)).toBe('DEGRADED');
  });

  it('returns DEGRADED when there is 1 unresolved critical', () => {
    expect(computeStationStatus(20.0, 80, 1)).toBe('DEGRADED');
  });

  it('returns DEGRADED at O2 boundary (exactly 19.5 is below 19.9 degraded)', () => {
    expect(computeStationStatus(19.5, 50, 0)).toBe('DEGRADED');
  });

  it('returns NOMINAL when O2 is at degraded boundary and power is sufficient', () => {
    expect(computeStationStatus(20.0, 50, 0)).toBe('NOMINAL');
  });

  it('returns CRITICAL at O2 boundary (just below)', () => {
    expect(computeStationStatus(19.49, 80, 0)).toBe('CRITICAL');
  });
});
