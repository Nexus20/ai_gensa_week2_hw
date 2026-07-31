import { describe, it, expect } from 'vitest';
import { splitByDuty, countByShift, computeAvgSleep } from './crew';
import type { CrewMember } from '../api/types';

function makeMember(overrides: Partial<CrewMember> = {}): CrewMember {
  return {
    id: 't1',
    name: 'Test',
    role: 'Tester',
    shift: 'alpha',
    onDuty: true,
    heartRate: 70,
    sleepHours: 7,
    missionDay: 10,
    ...overrides,
  };
}

describe('splitByDuty', () => {
  it('splits members into on-duty and off-duty', () => {
    const members = [
      makeMember({ id: 'a', onDuty: true }),
      makeMember({ id: 'b', onDuty: false }),
      makeMember({ id: 'c', onDuty: true }),
    ];
    const { onDuty, offDuty } = splitByDuty(members);
    expect(onDuty.length).toBe(2);
    expect(offDuty.length).toBe(1);
  });
});

describe('countByShift', () => {
  it('counts members per shift', () => {
    const members = [
      makeMember({ id: 'a', shift: 'alpha' }),
      makeMember({ id: 'b', shift: 'beta' }),
      makeMember({ id: 'c', shift: 'alpha' }),
    ];
    const counts = countByShift(members);
    expect(counts['alpha']).toBe(2);
    expect(counts['beta']).toBe(1);
  });
});

describe('computeAvgSleep', () => {
  it('computes average sleep hours', () => {
    const members = [
      makeMember({ id: 'a', sleepHours: 6 }),
      makeMember({ id: 'b', sleepHours: 8 }),
    ];
    expect(computeAvgSleep(members)).toBe(7.0);
  });
});
