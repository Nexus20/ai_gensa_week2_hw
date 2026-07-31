// Data models for the station API.

export interface Station {
  id: string;
  name: string;
  orbit: string;
  inclinationDeg: number;
  velocityKms: number;
  crewCapacity: number;
  crewOnboard: number;
  commissioned: string;
  nextResupply: string;
  daysInService: number;
}

export type Severity = 'critical' | 'warning' | 'info';

// ── Telemetry ──────────────────────────────────────────────────────────────

export interface TelemetrySeriesItem {
  label: string;
  unit: string;
  points: number[];
}

export interface TelemetrySeries {
  o2: TelemetrySeriesItem;
  power: TelemetrySeriesItem;
  hullTemp: TelemetrySeriesItem;
  hullIntegrity: TelemetrySeriesItem;
}

export interface TelemetryResponse {
  updated: string;
  intervalMinutes: number;
  series: TelemetrySeries;
}

// ── Crew ───────────────────────────────────────────────────────────────────

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  shift: string;
  onDuty: boolean;
  heartRate: number;
  sleepHours: number;
  missionDay: number;
}

export interface CrewResponse {
  updated: string;
  members: CrewMember[];
}

// ── Incidents ──────────────────────────────────────────────────────────────

export interface Incident {
  id: string;
  severity: Severity;
  system: string;
  title: string;
  timestamp: string;
  resolved: boolean;
  assignee: string;
}

export interface IncidentsResponse {
  updated: string;
  items: Incident[];
}

// ── Fuel ────────────────────────────────────────────────────────────────────

export interface FuelTank {
  id: string;
  type: string;
  capacityKg: number;
  currentKg: number;
}

export interface FuelResponse {
  updated: string;
  tanks: FuelTank[];
  dailyConsumptionKg: number;
}
