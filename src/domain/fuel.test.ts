import { describe, it, expect } from 'vitest';
import { computeTotalReserves, computeDaysOfFuelRemaining } from './fuel';
import type { FuelTank } from '../api/types';

const sampleTanks: FuelTank[] = [
  { id: 'main-a', type: 'hydrazine', capacityKg: 1200, currentKg: 830 },
  { id: 'main-b', type: 'hydrazine', capacityKg: 1200, currentKg: 764 },
  { id: 'rcs', type: 'cold-gas', capacityKg: 300, currentKg: 211 },
];

describe('computeTotalReserves', () => {
  it('sums currentKg across all tanks', () => {
    expect(computeTotalReserves(sampleTanks)).toBe(1805);
  });

  it('returns 0 for empty tank list', () => {
    expect(computeTotalReserves([])).toBe(0);
  });

  it('handles a single tank', () => {
    const single: FuelTank[] = [{ id: 'a', type: 'hydrazine', capacityKg: 100, currentKg: 50 }];
    expect(computeTotalReserves(single)).toBe(50);
  });
});

describe('computeDaysOfFuelRemaining', () => {
  it('computes days from total reserves and daily consumption', () => {
    // (830 + 764 + 211) / 14.2 = 1805 / 14.2 ≈ 127.1
    expect(computeDaysOfFuelRemaining(sampleTanks, 14.2)).toBe(127.1);
  });

  it('returns 0 when no fuel remains', () => {
    const empty: FuelTank[] = [{ id: 'a', type: 'hydrazine', capacityKg: 100, currentKg: 0 }];
    expect(computeDaysOfFuelRemaining(empty, 10)).toBe(0);
  });
});
