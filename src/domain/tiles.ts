import { O2_CRITICAL, O2_DEGRADED, HULL_TEMP_MAX_C, HULL_TEMP_MIN_C, HULL_INTEGRITY_BAD, HULL_INTEGRITY_WARN } from '../config';

export function getO2TileClass(o2: number): string {
  if (o2 < O2_CRITICAL) return 'tile-bad';
  if (o2 < O2_DEGRADED) return 'tile-warn';
  return 'tile-ok';
}

export function getPowerBudgetClass(pct: number, bad: number, warn: number): string {
  if (pct < bad) return 'tile-bad';
  if (pct < warn) return 'tile-warn';
  return 'tile-ok';
}

export function getHullTempClass(temp: number): string {
  if (temp > HULL_TEMP_MAX_C || temp < HULL_TEMP_MIN_C) return 'tile-warn';
  return 'tile-ok';
}

export function getHullIntegrityClass(integrity: number): string {
  if (integrity < HULL_INTEGRITY_BAD) return 'tile-bad';
  if (integrity < HULL_INTEGRITY_WARN) return 'tile-warn';
  return 'tile-ok';
}

export function getIncidentsClass(critical: number, warning: number): string {
  if (critical > 0) return 'tile-bad';
  if (warning > 0) return 'tile-warn';
  return 'tile-ok';
}

export function getSleepClass(avg: number, critical: number, warn: number): string {
  if (avg < critical) return 'tile-bad';
  if (avg < warn) return 'tile-warn';
  return 'tile-ok';
}

export function getResupplyClass(daysLeft: number, critical: number, warn: number): string {
  if (daysLeft < critical) return 'tile-bad';
  if (daysLeft < warn) return 'tile-warn';
  return 'tile-ok';
}

export function computeResupply(
  nextResupply: string,
  now: string,
  criticalDays: number,
  warnDays: number,
): { label: string; tileClass: string } {
  const msLeft = new Date(nextResupply).getTime() - new Date(now).getTime();
  const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let label = daysLeft + 'd ' + hoursLeft + 'h';
  const tileClass = getResupplyClass(daysLeft, criticalDays, warnDays);
  if (daysLeft < criticalDays) label += ' ⚠';
  return { label, tileClass };
}
