---
name: new-widget
description: Scaffold a new dashboard widget following Orbital Ops conventions — typed data via useApiResource, pure domain logic with colocated test, and dashboard registration.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(npx vitest:*)
---

# New Widget Scaffold

Use this skill to add a new data-driven widget to the Orbital Ops dashboard.
It encodes the conventions established during the Great Refactor.

## Architecture (what goes where)

| Concern | Location | Example |
|---------|----------|---------|
| API types | `src/api/types.ts` | Add response + entity interfaces |
| Data fetching | `src/hooks/useApiResource.ts` | Already generic — reuse as-is |
| Pure business logic | `src/domain/<name>.ts` | Computations, math, predicates |
| Domain tests | `src/domain/<name>.test.ts` | Colocated, edge-case coverage |
| React component | `src/components/<Name>Widget.tsx` | Presentation only — thin |
| Dashboard registration | `src/App.tsx` or `src/components/Dashboard.tsx` | Add to grid |

## Scaffold Workflow

1. **Read the data source.** If the widget needs a new JSON endpoint in
   `public/api/`, add the file and type it in `src/api/types.ts`.
2. **Add the domain module.** Pure functions only — see the annotated
   template in `references/widget-template.md` for the exact file shape.
3. **Write the domain test.** Cover at least: normal input, edge case
   (empty, boundary), and the primary computation.
4. **Create the component.** Import `useApiResource<T>` with the typed
   endpoint. Import domain functions for derived values. Follow the
   loading / error / empty / data state pattern.
5. **Register in the grid.** Edit `src/App.tsx` to add the new component
   to the dashboard layout.
6. **Run `npx vitest run`.** All existing tests must still pass.
   The new domain test must pass too.

## Component Pattern

Every widget follows the same state-machine shape:

```
loading → spinner + label
error   → error message + retry button
no data → null (or empty state)
data    → render using domain functions for derived values
```

Use `useApiResource<T>('endpoint-name')` for data. Do NOT write custom
`useEffect` + `useState` fetch logic — that is the pre-refactor pattern.

## Full Template

See **[references/widget-template.md](references/widget-template.md)** for
the complete annotated template with fill-in-the-blank placeholders.
