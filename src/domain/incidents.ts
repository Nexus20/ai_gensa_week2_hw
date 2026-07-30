import type { Incident } from '../api/types';

export const SEVERITY_RANK: Record<string, number> = { critical: 0, warning: 1, info: 2 };

export function sortBySeverity(incidents: Incident[]): Incident[] {
  return [...incidents].sort((a, b) => {
    const ra = SEVERITY_RANK[a.severity] !== undefined ? SEVERITY_RANK[a.severity] : 3;
    const rb = SEVERITY_RANK[b.severity] !== undefined ? SEVERITY_RANK[b.severity] : 3;
    if (ra !== rb) return ra - rb;
    return a.timestamp < b.timestamp ? 1 : -1;
  });
}

export function filterUnresolved(incidents: Incident[]): Incident[] {
  return incidents.filter((i) => !i.resolved);
}

export function countBySeverity(incidents: Incident[]): {
  critical: number;
  warning: number;
  resolved: number;
} {
  let critical = 0;
  let warning = 0;
  let resolved = 0;
  for (let i = 0; i < incidents.length; i++) {
    const inc = incidents[i];
    if (!inc.resolved && inc.severity === 'critical') {
      critical++;
    } else if (!inc.resolved && inc.severity === 'warning') {
      warning++;
    } else if (inc.resolved) {
      resolved++;
    }
  }
  return { critical, warning, resolved };
}

export function findMostUrgent(incidents: Incident[]): Incident | null {
  const unresolved = filterUnresolved(incidents);
  if (unresolved.length === 0) return null;
  return sortBySeverity(unresolved)[0];
}
