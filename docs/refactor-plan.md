# Refactoring Plan: Orbital Ops Code Smell Remediation

## Context

The Orbital Ops dashboard is a working React 19 + TypeScript app that is deliberately messy — this is a refactoring exercise (ASSIGNMENT.md Exercise 1). The code has seven identified smell clusters. This plan resolves all of them in 6 sequential commits, running `npm run validate` after each.

## O2 Threshold Decision

The code has a real discrepancy: `Dashboard.tsx` uses **19.5** as the O2 floor for alerts and tile coloring, while `utils.ts::computeStationStatus` uses **19.0** (citing "ops handbook rev. C"). Additionally, the DEGRADED threshold differs: Dashboard uses 19.9, utils uses 19.8.

Three sources exist:
- **Dashboard.tsx** (live UI): 19.5 critical, 19.9 degraded — comment says "mission control wall display uses 19.5 as the O2 floor"
- **utils.ts::computeStationStatus** (unused by any current component): 19.0 critical, 19.8 degraded — comment says "ops handbook rev. C"
- **OldDashboard.tsx** (dead): 19.0 critical

**Decision: Dashboard's values (19.5 critical, 19.9 degraded) are correct.** The mission control wall display is the authoritative current revision. The handbook reference in `computeStationStatus` is stale — it was vestigial from the v1 era and never called by any current component.

---

## Cluster 1: Centralize Magic Numbers → `src/config.ts`

**Why first:** Creates a dependency every other cluster imports from. No behavioral changes — just moving values.

### Targets
- All hardcoded numbers in `Dashboard.tsx`, `TelemetryChart.tsx`, `CrewPanel.tsx`, `IncidentFeed.tsx`, `utils.ts`

### Approach
1. Create `src/config.ts` with named exports for all poll intervals, thresholds, colors, and constants
2. Update all components and `utils.ts` to import from `config.ts`
3. Remove local constants (`POLL_INTERVAL` in Dashboard, `REFRESH_MS` in TelemetryChart)

### Risks
- **Low.** Pure constant extraction, no logic changes.

### Verification
- `npm run lint`, `npm run test` — pass
- `npm run validate:structure` — E1.7 goes green
- Visual: app unchanged in browser

---

## Cluster 2: Delete Dead Code

**Why second:** Simplifies the codebase before larger refactors. Reduces what needs typing and testing.

### Targets
- `src/components/OldDashboard.tsx` — entire file (nothing imports it)
- `utils.ts` — `legacyStatusLabel()`, `renderStatusBadge()`, `OLD_SEVERITY_MAP` (only used by OldDashboard)
- Commented-out v1 polling block in `Dashboard.tsx` (lines 220-229)
- `utils.ts` — `flashAlert()` (touches DOM from a util; the alert banner already shows via state)

### Approach
1. Delete `src/components/OldDashboard.tsx`
2. Delete `legacyStatusLabel`, `renderStatusBadge`, `OLD_SEVERITY_MAP` from `utils.ts`
3. Delete the commented-out v1 polling block in `Dashboard.tsx`
4. Delete `flashAlert()` from `utils.ts` and its call site in Dashboard (O2 < 19.5 check already shows alert banner)

### Risks
- **Low.** Confirm nothing imports the dead code.

### Verification
- `npm run lint`, `npm run test` — pass
- `npm run validate:structure` — E1.3 goes green

---

## Cluster 3: Type the API Layer → Zero `any`

**Why third:** Types are needed for the shared hook (Cluster 5) to be properly typed.

### Targets
- `src/api/types.ts` — add `TelemetrySeries`, `TelemetryResponse`, `CrewMember`, `CrewResponse`, `Incident`, `IncidentsResponse`
- `src/api/client.ts` — make `getData<T>` generic, remove `any`
- All 4 components — replace `useState<any>` with typed state

### Approach
1. Read `public/api/*.json` to understand data shapes
2. Add all missing types to `types.ts` matching the actual JSON payloads
3. Make `getData<T>(path: string): Promise<T>` generic
4. Update all call sites with type arguments

### Risks
- **Medium.** Types must exactly match JSON payloads.

### Verification
- `npm run typecheck`, `npm run lint` — zero errors
- `npm run validate:structure` — E1.6 goes green

---

## Cluster 4: Extract Pure Logic → `src/domain/`

**Why fourth:** Domain functions are testable independently of React. Needs config (Cluster 1) and types (Cluster 3) first.

### Targets
- Status computation, trend arrows, incident sorting/filtering, crew math, power budget (all from Dashboard and utils.ts)
- `downsampleTelemetry`, `formatTimestamp`, `severityColor` (from utils.ts)

### Approach
Create domain modules with colocated tests:
- `src/domain/station.ts` + test — `computeStationStatus` (fixed to use 19.5 floor)
- `src/domain/telemetry.ts` + test — `downsampleTelemetry`, `computeTrend`
- `src/domain/crew.ts` + test — `splitByDuty`, `countByShift`, `computeAvgSleep`
- `src/domain/incidents.ts` + test — `countBySeverity`, `sortBySeverity`, `findMostUrgent`
- `src/domain/formatting.ts` + test — `formatTimestamp`

Update Dashboard and panels to import from `src/domain/`. Delete `utils.ts` after extraction.

### Risks
- **Medium.** Must preserve exact behavior; O2 threshold fix is intentional.

### Verification
- `npm run test:coverage` — thresholds met (domain tests provide coverage)
- `npm run lint`, `npm run typecheck` — pass
- `npm run validate:structure` — E1.5 goes green

---

## Cluster 5: Create Shared Fetch Hook → `src/hooks/`

**Why fifth:** Needs types (Cluster 3) first. Replaces all 4 copies of fetch/loading/error/retry state machines.

### Targets
- All 4 components that duplicate fetch logic

### Approach
1. Create `src/hooks/useApiResource.ts` — generic hook with fetch, loading, error, retry (3 attempts), cancellation (AbortController), and optional polling
2. Accept `options` for `retries`, `pollIntervalMs`, `retryDelayMs` to handle diverged behaviors
3. Refactor all 4 components to use `useApiResource`
4. Write `src/hooks/useApiResource.test.ts`

### Risks
- **Medium-High.** Components have diverged behaviors (retry counts, error handling, cancellation). Hook must handle them via options.

### Verification
- `npm run dupcheck` — passes (fetch boilerplate no longer duplicated)
- `npm run lint`, `npm run typecheck`, `npm run test:coverage` — pass
- `npm run validate:structure` — E1.4 goes green

---

## Cluster 6: Decompose God Component → Dashboard under 150 lines

**Why sixth:** Depends on hooks (Cluster 5) and domain (Cluster 4). Dashboard shrinks once logic and fetching are extracted.

### Targets
- `Dashboard.tsx` — reduce from ~330 to <150 non-empty lines
- Create focused sub-components: `StatusHeader`, `AlertBanner`, `TileGrid`
- Individual tile components for each summary metric

### Approach
1. Extract `StatusHeader` — station name, orbit info, status pill
2. Extract `AlertBanner` — flash animation via state, not DOM manipulation
3. Extract `TileGrid` — renders tiles via a config array, not inline JSX
4. Dashboard becomes a thin orchestrator: fetches data, computes derived values via domain functions, renders sub-components

### Risks
- **Medium.** Props threading must be correct. Complexity ≤10 and max-lines-per-function ≤80 constraints apply to every sub-component.

### Verification
- `npm run validate` — all checks green
- `npm run validate:structure` — E1.2 (<150 lines) goes green
- Manual smoke test: app renders identically

---

## Commit Order

| # | Cluster | Expected `validate` after commit |
|---|---------|----------------------------------|
| 1 | Config file | structure E1.7 green; others unchanged |
| 2 | Dead code | structure E1.3 green; others unchanged |
| 3 | Type API | structure E1.6 green; typecheck green |
| 4 | Domain logic + tests | structure E1.5 green; coverage green |
| 5 | Shared hook | structure E1.4 green; dupcheck green |
| 6 | Decompose Dashboard | structure E1.2 green; ALL green |
