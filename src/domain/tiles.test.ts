import { describe, it, expect } from 'vitest';
import {
  getO2TileClass, getPowerBudgetClass, getHullTempClass,
  getHullIntegrityClass, getIncidentsClass, getSleepClass,
  getResupplyClass, computeResupply,
} from './tiles';

describe('getO2TileClass', () => {
  it('returns tile-bad below critical', () => {
    expect(getO2TileClass(19.4)).toBe('tile-bad');
  });
  it('returns tile-warn between critical and degraded', () => {
    expect(getO2TileClass(19.7)).toBe('tile-warn');
  });
  it('returns tile-ok above degraded', () => {
    expect(getO2TileClass(20.0)).toBe('tile-ok');
  });
});

describe('getPowerBudgetClass', () => {
  const bad = 55, warn = 75;
  it('returns tile-bad below bad threshold', () => {
    expect(getPowerBudgetClass(50, bad, warn)).toBe('tile-bad');
  });
  it('returns tile-warn between bad and warn', () => {
    expect(getPowerBudgetClass(60, bad, warn)).toBe('tile-warn');
  });
  it('returns tile-ok above warn', () => {
    expect(getPowerBudgetClass(80, bad, warn)).toBe('tile-ok');
  });
});

describe('getHullTempClass', () => {
  it('returns tile-warn for temp above max', () => {
    expect(getHullTempClass(41)).toBe('tile-warn');
  });
  it('returns tile-warn for temp below min', () => {
    expect(getHullTempClass(-31)).toBe('tile-warn');
  });
  it('returns tile-ok for normal temp', () => {
    expect(getHullTempClass(20)).toBe('tile-ok');
  });
});

describe('getHullIntegrityClass', () => {
  it('returns tile-bad below bad threshold', () => {
    expect(getHullIntegrityClass(97)).toBe('tile-bad');
  });
  it('returns tile-warn between bad and warn', () => {
    expect(getHullIntegrityClass(98.5)).toBe('tile-warn');
  });
  it('returns tile-ok above warn', () => {
    expect(getHullIntegrityClass(99.5)).toBe('tile-ok');
  });
});

describe('getIncidentsClass', () => {
  it('returns tile-bad when critical > 0', () => {
    expect(getIncidentsClass(1, 0)).toBe('tile-bad');
  });
  it('returns tile-warn when no critical but warning > 0', () => {
    expect(getIncidentsClass(0, 1)).toBe('tile-warn');
  });
  it('returns tile-ok when no critical or warning', () => {
    expect(getIncidentsClass(0, 0)).toBe('tile-ok');
  });
});

describe('getSleepClass', () => {
  it('returns tile-bad below critical hours', () => {
    expect(getSleepClass(5, 6, 7)).toBe('tile-bad');
  });
  it('returns tile-warn between critical and warn', () => {
    expect(getSleepClass(6.5, 6, 7)).toBe('tile-warn');
  });
  it('returns tile-ok above warn hours', () => {
    expect(getSleepClass(8, 6, 7)).toBe('tile-ok');
  });
});

describe('getResupplyClass', () => {
  it('returns tile-bad below critical days', () => {
    expect(getResupplyClass(5, 7, 14)).toBe('tile-bad');
  });
  it('returns tile-warn between critical and warn days', () => {
    expect(getResupplyClass(10, 7, 14)).toBe('tile-warn');
  });
  it('returns tile-ok above warn days', () => {
    expect(getResupplyClass(20, 7, 14)).toBe('tile-ok');
  });
});

describe('computeResupply', () => {
  it('returns tile-ok and normal label when far out', () => {
    const result = computeResupply('2036-08-02T14:30:00Z', '2036-07-11T09:00:00Z', 7, 14);
    expect(result.label).toContain('22d');
    expect(result.tileClass).toBe('tile-ok');
  });
  it('returns tile-bad and warning emoji when critical', () => {
    const result = computeResupply('2036-07-16T00:00:00Z', '2036-07-11T09:00:00Z', 7, 14);
    expect(result.tileClass).toBe('tile-bad');
    expect(result.label).toContain('⚠');
  });
  it('returns tile-warn without emoji when between critical and warn', () => {
    const result = computeResupply('2036-07-22T00:00:00Z', '2036-07-11T09:00:00Z', 7, 14);
    expect(result.tileClass).toBe('tile-warn');
    expect(result.label).not.toContain('⚠');
  });
});
