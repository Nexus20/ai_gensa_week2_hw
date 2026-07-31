# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server (defaults to `http://localhost:5173`) |
| `npm run build` | Production build — no typecheck, on purpose |
| `npm run preview` | Serve the production build locally |
| `npm run test` | Run the smoke test suite (`vitest run tests/`) |
| `npm test -- --run src/` | Run smoke tests + all colocated unit tests |
| `npm test -- --run src/domain/foo.test.ts` | Run a single test file |
| `npm run test:coverage` | Tests with coverage thresholds (60% lines, 60% funcs, 50% branches) |
| `npm run typecheck` | Strict TypeScript check (`tsc --noEmit -p tsconfig.strict.json`) |
| `npm run lint` | ESLint (`src` + `scripts/`, `--max-warnings 0`) |
| `npm run dupcheck` | Copy-paste detection via jscpd (threshold: 3, minLines: 8) |
| `npm run validate:structure` | Structural checks in `scripts/validate.ts` — maps to ASSIGNMENT.md checkboxes |
| `npm run validate` | Full gauntlet: lint → typecheck → coverage → dupcheck → structure |

Always run `npm run validate` after every commit of refactoring work. The sub-checks
can be run individually for faster feedback loops during development.

## Architecture

Single-page React 19 + TypeScript dashboard with no router. The app shell (`App.tsx`)
renders a header section (`Dashboard`) and a 3-panel lower grid (`TelemetryChart`,
`CrewPanel`, `IncidentFeed`). All data is static JSON served from `public/api/`
and fetched at runtime via `src/api/client.ts`.

**Data flow:** `public/api/*.json` → `fetch()` via `getData(path)` → component-local
`useState<any>` → render. There is no global store, no context, and no prop
drilling — every panel and the dashboard each fetch independently and poll on
their own timers. This is one of the key smells the assignment targets.

**Key smells (deliberate — this is a refactoring exercise):**

- **God component:** `Dashboard.tsx` (~330 lines) owns header, all 8 summary tiles,
  status computation, trend arrows, resupply countdown, crew/shift math, and incident
  sorting — all inline.
- **Copy-pasted fetch:** `CrewPanel`, `TelemetryChart`, and `IncidentFeed` each
  contain their own diverged copy of the fetch/loading/error/retry state machine.
- **The `any` API:** `getData()` returns `Promise<any>`. `types.ts` only defines
  `Station` and `Severity` — the other five payloads are untyped.
- **O2 threshold discrepancy:** `Dashboard.tsx` uses O2 floor 19.5 while
  `utils.ts::computeStationStatus` uses 19.0 (with a comment citing "ops handbook
  rev. C"). The mission control wall display and the alert logic disagree.
- **Utility dump:** `utils.ts` is a grab-bag of pure functions, DOM manipulation
  (`flashAlert()`), and obsolete code that only `OldDashboard` used.
- **Dead code:** `OldDashboard.tsx` was replaced in 2035. Nothing imports it.
  `legacyStatusLabel`, `renderStatusBadge`, and `OLD_SEVERITY_MAP` in `utils.ts`
  exist only to serve it.
- **Magic numbers:** Poll intervals (5000, 5000, 5000, 5000), thresholds
  (19.5, 19.9, 50, 90, 40, -30, 98, 99, 6, 7, 14, 55, 75), and colors are
  hardcoded across four files.

**Target directory layout (post-refactor):**

```
src/
  api/          client.ts + types.ts — typed API layer, no `any`
  config.ts     centralized constants (poll intervals, thresholds, colors)
  domain/       pure business logic (status computation, downsampling, fuel math)
                each module tested with a colocated *.test.ts
  hooks/        shared React hooks (one useApiResource hook replaces all four copies)
  components/   thin presentation components — Dashboard is split into tiles
  utils.ts      gone — logic moved to domain/
  App.tsx       layout shell, no business logic
  main.tsx      entry point
  styles.css    global styles (dark-themed monitor display)
```

## Conventions

- **TypeScript strict mode** governs the project — `tsconfig.strict.json` is what
  `npm run typecheck` uses. The default `tsconfig.json` is lenient; validation
  runs strict.
- **ESLint rules** that bite: `@typescript-eslint/no-explicit-any` is an error,
  `complexity` max 10, `max-lines-per-function` 80 in components, `max-lines` 300
  per file. Fix the code, not the config.
- **Naming:** PascalCase for components, camelCase for everything else. Components
  are default exports. Domain modules are named exports.
- **File organization:** pure logic goes in `src/domain/` with colocated unit
  tests. Shared hooks go in `src/hooks/`. API types and client stay in `src/api/`.
  Config constants go in `src/config.ts`.
- **Tests:** colocated with the module they test (`src/domain/foo.test.ts`,
  `src/hooks/useApiResource.test.ts`). Use Vitest + jsdom. The coverage gate
  enforces 60% lines/functions, 50% branches.
- **CSS:** global styles in `src/styles.css` using CSS custom properties defined
  in `:root`. The design is a dark-themed mission control display. No CSS modules
  or Tailwind.

### What the agent may delete without asking

- `src/components/OldDashboard.tsx` — dead since 2035, nothing imports it
- `utils.ts` functions only used by `OldDashboard`: `legacyStatusLabel`,
  `renderStatusBadge`, `OLD_SEVERITY_MAP`
- Any commented-out code blocks (the v1 polling implementation block in Dashboard,
  the "keep just in case" comments)
- Any file or function that a grep confirms has zero imports/references

### Locked files — do not edit

These are part of the grading contract. CI fails if they are touched:
`RUBRIC.md`, `.github/` (all files), `eslint.config.js`, `tsconfig.strict.json`,
`.jscpd.json`, `vite.config.ts`, `scripts/validate.ts`, `public/api/`
(except for adding `fuel.json` — see `ASSIGNMENT.md` Exercise 4).
