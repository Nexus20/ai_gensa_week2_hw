# Widget Template (Annotated)

Replace placeholders wrapped in `{{…}}` with actual values. Delete comments
marked `// --` after filling in.

---

## 1. Domain Module — `src/domain/{{name}}.ts`

```typescript
// -- Import config constants you need (thresholds, colors, etc.)
import { {{CONSTANTS}} } from '../config';
// -- If you added new API types, import them here
import type { {{ResponseType}} } from '../api/types';

// -- Export pure functions only. No React, no fetch, no DOM.
// -- Each function should do exactly one thing and be testable in isolation.

/**
 * Computes {{description of what this does}}.
 */
export function compute{{PascalName}}(input: {{InputType}}): {{OutputType}} {
  // -- Pure computation here. Use config constants, not hardcoded values.
  // -- Example: return input.current / input.total;
  throw new Error('Not implemented — fill in your domain logic');
}
```

## 2. Domain Test — `src/domain/{{name}}.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { compute{{PascalName}} } from './{{name}}';

describe('compute{{PascalName}}', () => {
  it('returns the expected result for normal input', () => {
    // -- Arrange: set up test data
    // -- Act: call the function
    // -- Assert: check the output
    expect(true).toBe(true); // -- replace with real test
  });

  it('handles edge case: {{describe edge case}}', () => {
    // -- Test boundary values, empty input, or error conditions
    expect(true).toBe(true); // -- replace with real test
  });
});
```

## 3. Component — `src/components/{{PascalName}}Widget.tsx`

```typescript
import { useApiResource } from '../hooks/useApiResource';
import type { {{ResponseType}} } from '../api/types';
import { compute{{PascalName}} } from '../domain/{{name}}';

export default function {{PascalName}}Widget() {
  // -- Use the shared typed hook — no custom fetch/useEffect/retry
  const { data, loading, error, retry } = useApiResource<{{ResponseType}}>('{{endpoint}}');

  // -- Loading state
  if (loading) {
    return (
      <section className="panel">
        <h2>{{DisplayName}}</h2>
        <div className="panel-loading">
          <div className="spinner" />
          <p>Loading {{displayName}}…</p>
        </div>
      </section>
    );
  }

  // -- Error state with retry button
  if (error) {
    return (
      <section className="panel">
        <h2>{{DisplayName}}</h2>
        <div className="panel-error">
          <p>⚠ {error}</p>
          <button onClick={retry}>Retry</button>
        </div>
      </section>
    );
  }

  // -- Empty state (no data yet)
  if (!data) {
    return null;
  }

  // -- Compute derived values using domain functions (not inline)
  const result = compute{{PascalName}}(data);

  // -- Render
  return (
    <section className="panel">
      <h2>{{DisplayName}}</h2>
      {/* Your widget content here. Use domain functions for computed values.
          Apply tile-ok / tile-warn / tile-bad classes from domain/tiles.ts. */}
    </section>
  );
}
```

## 4. Registration — Edit `src/App.tsx`

Import the new component and add it to the dashboard grid:

```typescript
// -- Add this import at the top
import {{PascalName}}Widget from './components/{{PascalName}}Widget';

// -- Inside the App component, add the widget to the grid div:
<div className="grid">
  <{{PascalName}}Widget />
  <TelemetryChart />
  <CrewPanel />
  <IncidentFeed />
</div>
```

## 5. Data File (if needed) — `public/api/{{endpoint}}.json`

If the widget needs new data, create a JSON file:

```json
{
  "updated": "2036-07-11T09:00:00Z",
  "{{key}}": []
}
```

Then add the corresponding types to `src/api/types.ts` following the
existing pattern (response interface + entity interfaces).

## 6. Verification

After scaffolding, run:

```bash
npx vitest run          # all tests must pass, including the new domain test
npm run typecheck       # strict TypeScript must pass
npm run lint            # zero warnings
```

Do NOT skip these checks. The PostToolUse hook will run tests automatically
after every Edit/Write to `src/**`, so you will see failures immediately.
