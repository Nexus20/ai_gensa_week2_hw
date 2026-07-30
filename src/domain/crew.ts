import type { CrewMember } from '../api/types';

export function splitByDuty(members: CrewMember[]): { onDuty: CrewMember[]; offDuty: CrewMember[] } {
  const onDuty: CrewMember[] = [];
  const offDuty: CrewMember[] = [];
  for (let i = 0; i < members.length; i++) {
    if (members[i].onDuty) {
      onDuty.push(members[i]);
    } else {
      offDuty.push(members[i]);
    }
  }
  return { onDuty, offDuty };
}

export function countByShift(members: CrewMember[]): Record<string, number> {
  const shifts: Record<string, number> = {};
  for (let i = 0; i < members.length; i++) {
    const s = members[i].shift;
    shifts[s] = (shifts[s] || 0) + 1;
  }
  return shifts;
}

export function computeAvgSleep(members: CrewMember[]): number {
  let total = 0;
  for (let i = 0; i < members.length; i++) {
    total += members[i].sleepHours;
  }
  return Math.round((total / members.length) * 10) / 10;
}
