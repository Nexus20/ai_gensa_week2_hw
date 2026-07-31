#!/usr/bin/env bash
# PostToolUse: runs the test suite after any Edit/Write to src/**
set -euo pipefail

TOOL_NAME="${CLAUDE_TOOL_NAME:-}"
if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

# Parse the file path from the tool input JSON on stdin
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"\s*:\s*"[^"]*"' | head -1 | sed 's/.*"file_path"\s*:\s*"\([^"]*\)".*/\1/')

if [[ -z "$FILE_PATH" || "$FILE_PATH" != src/* ]]; then
  exit 0
fi

echo "" >&2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
echo "PostToolUse: edit to $FILE_PATH — running test suite…" >&2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2

cd "$(dirname "$0")/../.." || exit 1
npx vitest run 2>&1
