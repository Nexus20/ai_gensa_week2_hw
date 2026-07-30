import { describe, it, expect } from 'vitest';
import { formatTimestamp, severityColor } from './formatting';

describe('formatTimestamp', () => {
  it('formats an ISO timestamp', () => {
    const result = formatTimestamp('2036-07-11T09:00:00Z');
    expect(result).toBe('Jul 11, 09:00 UTC');
  });
});

describe('severityColor', () => {
  it('returns red for critical', () => {
    expect(severityColor('critical')).toBe('#ff4d4d');
  });

  it('returns amber for warning', () => {
    expect(severityColor('warning')).toBe('#ffb020');
  });

  it('returns blue for info', () => {
    expect(severityColor('info')).toBe('#4da3ff');
  });

  it('returns muted for unknown', () => {
    expect(severityColor('unknown')).toBe('#8892a6');
  });
});
