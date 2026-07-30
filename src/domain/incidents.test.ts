import { describe, it, expect } from 'vitest';
import { sortBySeverity, filterUnresolved, countBySeverity, findMostUrgent } from './incidents';
import type { Incident } from '../api/types';

function makeIncident(overrides: Partial<Incident> = {}): Incident {
  return {
    id: 'INC-1',
    severity: 'info',
    system: 'test',
    title: 'Test',
    timestamp: '2036-07-11T00:00:00Z',
    resolved: false,
    assignee: 't1',
    ...overrides,
  };
}

describe('sortBySeverity', () => {
  it('sorts critical before warning before info', () => {
    const incidents = [
      makeIncident({ id: 'a', severity: 'info' }),
      makeIncident({ id: 'b', severity: 'critical' }),
      makeIncident({ id: 'c', severity: 'warning' }),
    ];
    const sorted = sortBySeverity(incidents);
    expect(sorted[0].id).toBe('b');
    expect(sorted[1].id).toBe('c');
    expect(sorted[2].id).toBe('a');
  });
});

describe('filterUnresolved', () => {
  it('returns only unresolved incidents', () => {
    const incidents = [
      makeIncident({ id: 'a', resolved: true }),
      makeIncident({ id: 'b', resolved: false }),
    ];
    expect(filterUnresolved(incidents).length).toBe(1);
    expect(filterUnresolved(incidents)[0].id).toBe('b');
  });
});

describe('countBySeverity', () => {
  it('counts critical, warning, and resolved', () => {
    const incidents = [
      makeIncident({ id: 'a', severity: 'critical', resolved: false }),
      makeIncident({ id: 'b', severity: 'warning', resolved: false }),
      makeIncident({ id: 'c', severity: 'info', resolved: true }),
    ];
    const counts = countBySeverity(incidents);
    expect(counts.critical).toBe(1);
    expect(counts.warning).toBe(1);
    expect(counts.resolved).toBe(1);
  });
});

describe('findMostUrgent', () => {
  it('returns null for empty list', () => {
    expect(findMostUrgent([])).toBeNull();
  });

  it('returns the most urgent unresolved incident', () => {
    const incidents = [
      makeIncident({ id: 'a', severity: 'warning', resolved: false }),
      makeIncident({ id: 'b', severity: 'critical', resolved: false }),
    ];
    expect(findMostUrgent(incidents)!.id).toBe('b');
  });

  it('skips resolved incidents', () => {
    const incidents = [
      makeIncident({ id: 'a', severity: 'critical', resolved: true }),
      makeIncident({ id: 'b', severity: 'warning', resolved: false }),
    ];
    expect(findMostUrgent(incidents)!.id).toBe('b');
  });
});
