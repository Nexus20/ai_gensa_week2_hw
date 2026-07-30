import { describe, it, expect } from 'vitest';
import {
  getO2TileClass, getPowerBudgetClass, getHullTempClass,
  getHullIntegrityClass, getIncidentsClass, getSleepClass,
  getResupplyClass, computeResupply,
} from './tiles';

describe('tile class helpers', () => {
  it('getO2TileClass returns tile-bad below critical', () => {
    expect(getO2TileClass(19.4)).toBe('tile-bad');
  });
  it('getPowerBudgetClass returns tile-warn below warn threshold', () => {
    expect(getPowerBudgetClass(60, 55, 75)).toBe('tile-warn');
  });
  it('getHullTempClass returns tile-warn for high temp', () => {
    expect(getHullTempClass(41)).toBe('tile-warn');
  });
  it('getHullIntegrityClass returns tile-bad below bad threshold', () => {
    expect(getHullIntegrityClass(97)).toBe('tile-bad');
  });
  it('getIncidentsClass returns tile-bad when critical > 0', () => {
    expect(getIncidentsClass(1, 0)).toBe('tile-bad');
  });
  it('getSleepClass returns tile-ok above warn', () => {
    expect(getSleepClass(8, 6, 7)).toBe('tile-ok');
  });
  it('getResupplyClass returns tile-ok above warn days', () => {
    expect(getResupplyClass(20, 7, 14)).toBe('tile-ok');
  });
});

describe('computeResupply', () => {
  it('computes days and hours left', () => {
    const result = computeResupply('2036-08-02T14:30:00Z', '2036-07-11T09:00:00Z', 7, 14);
    expect(result.label).toContain('22d');
    expect(result.tileClass).toBe('tile-ok');
  });
});
