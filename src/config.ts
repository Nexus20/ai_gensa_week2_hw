import type { Severity } from './api/types';

// ── Polling ────────────────────────────────────────────────────────────────
export const POLL_INTERVAL_MS = 5000;

// ── O2 thresholds (mission control wall display, rev. D) ───────────────────
export const O2_CRITICAL = 19.5;
export const O2_DEGRADED = 19.9;
export const O2_NOMINAL = 20.9;

// ── Power thresholds ───────────────────────────────────────────────────────
export const POWER_DEGRADED_KW = 50;
export const POWER_BUDGET_MAX_KW = 90;
export const POWER_BUDGET_BAD_PCT = 55;
export const POWER_BUDGET_WARN_PCT = 75;

// ── Hull temp ──────────────────────────────────────────────────────────────
export const HULL_TEMP_MAX_C = 40;
export const HULL_TEMP_MIN_C = -30;

// ── Hull integrity ─────────────────────────────────────────────────────────
export const HULL_INTEGRITY_BAD = 98;
export const HULL_INTEGRITY_WARN = 99;

// ── Crew sleep ─────────────────────────────────────────────────────────────
export const SLEEP_CRITICAL_H = 6;
export const SLEEP_WARN_H = 7;

// ── Resupply ───────────────────────────────────────────────────────────────
export const RESUPPLY_CRITICAL_DAYS = 7;
export const RESUPPLY_WARN_DAYS = 14;

// ── Trend arrows ───────────────────────────────────────────────────────────
export const TREND_O2_DELTA = 0.15;
export const TREND_POWER_DELTA = 2;
export const TREND_BACK_SAMPLES = 4;

// ── Retry / network ────────────────────────────────────────────────────────
export const RETRY_MAX_ATTEMPTS = 3;
export const RETRY_DELAY_MS = 1000;

// ── Sparkline ──────────────────────────────────────────────────────────────
export const SPARKLINE_MAX_POINTS = 12;
export const SPARKLINE_WIDTH = 320;
export const SPARKLINE_HEIGHT = 80;

// ── Colors (used in inline styles; mirrors styles.css custom properties) ───
export const COLOR_CRITICAL = '#ff4d4d';
export const COLOR_DEGRADED = '#ffb020';
export const COLOR_NOMINAL = '#3ddc84';
export const COLOR_ACCENT = '#4da3ff';
export const COLOR_MUTED = '#8892a6';

export const SEVERITY_COLORS: Record<Severity, string> = {
  critical: '#ff4d4d',
  warning: '#ffb020',
  info: '#4da3ff',
} as const;

export const STATUS_COLORS = {
  NOMINAL: '#3ddc84',
  DEGRADED: '#ffb020',
  CRITICAL: '#ff4d4d',
} as const;
