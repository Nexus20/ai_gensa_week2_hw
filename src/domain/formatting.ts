import type { Severity } from '../api/types';
import { SEVERITY_COLORS } from '../config';

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  return months[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ' UTC';
}

export function severityColor(severity: Severity | string): string {
  if (severity === 'critical') return SEVERITY_COLORS.critical;
  if (severity === 'warning') return SEVERITY_COLORS.warning;
  if (severity === 'info') return SEVERITY_COLORS.info;
  return '#8892a6';
}
