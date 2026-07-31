# Hooks Demo — Claude Code Session Excerpt

## PreToolUse: Blocking an edit to a protected file

```
$ claude

> Edit RUBRIC.md to change the scoring threshold from 80 to 70

[PreToolUse hook fires: .claude/hooks/block-protected.sh]
⛔ BLOCKED: Edits to 'RUBRIC.md' are not allowed.
   This file is part of the grading contract (see CODEOWNERS).
   Fix the code, not the checks.

[Tool call blocked with exit code 2]
```

The hook correctly prevents writing to `RUBRIC.md`. The same block
applies to any file under `public/api/` — if the agent attempts to
write `public/api/station.json`, the hook exits 2 and the edit is
rejected before it touches the filesystem.

## PostToolUse: Running tests after a source edit

```
$ claude

> Add a new helper function to src/domain/incidents.ts

[Edit tool runs, writes to src/domain/incidents.ts]

[PostToolUse hook fires: .claude/hooks/run-tests.sh]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PostToolUse: edit to src/domain/incidents.ts — running test suite…
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 RUN  v4.1.10 H:/AI_Course/ai_gensa_week2_hw
 Test Files  8 passed (8)
      Tests  42 passed (42)

[All tests pass — agent can continue confidently]
```

## Hook Configuration

Defined in `.claude/settings.json`:

- `PostToolUse` — runs `.claude/hooks/run-tests.sh` after Edit/Write to `src/**`
- `PreToolUse` — runs `.claude/hooks/block-protected.sh` before Edit/Write (blocks `public/api/**` and `RUBRIC.md`)
- `UserPromptSubmit` — runs `.claude/hooks/project-conventions.sh` on every prompt

All three scripts live in `.claude/hooks/` and are tracked with +x mode in git.

## Exercise 4: Intentional PreToolUse exception

When scaffolding the Fuel Reserves widget (Exercise 4), the PreToolUse
hook blocked the Write to `public/api/fuel.json`. The assignment explicitly
permits adding this file — it is not part of the grading contract.

**What I did:** Added a whitelist condition to `.claude/hooks/block-protected.sh`:

```bash
# Allow fuel.json — explicitly permitted per Exercise 4 (ASSIGNMENT.md)
if [[ "$FILE_PATH" == *"fuel.json"* ]]; then
  exit 0
fi
```

This is the correct pattern for hook exceptions: explicit, documented,
and narrow in scope. The hook still blocks all other `public/api/**`
files and `RUBRIC.md`.

**Verification:**
```
$ Edit public/api/fuel.json   → exit 0 (allowed)
$ Edit public/api/station.json → exit 2 (blocked)
$ Edit RUBRIC.md               → exit 2 (blocked)
```
