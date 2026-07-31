import type { FuelTank } from '../api/types';

export function computeTotalReserves(tanks: FuelTank[]): number {
  let total = 0;
  for (const tank of tanks) {
    total += tank.currentKg;
  }
  return total;
}

export function computeDaysOfFuelRemaining(tanks: FuelTank[], dailyConsumptionKg: number): number {
  const totalKg = computeTotalReserves(tanks);
  return Math.round((totalKg / dailyConsumptionKg) * 10) / 10;
}
