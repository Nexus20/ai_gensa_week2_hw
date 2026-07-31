#!/usr/bin/env bash
# PreToolUse: blocks edits to public/api/** and RUBRIC.md
# Exit 2 = block the tool call; stderr message is fed back to the agent

TOOL_NAME="${CLAUDE_TOOL_NAME:-}"
if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

# Parse the file path from the tool input JSON on stdin
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"\s*:\s*"[^"]*"' | head -1 | sed 's/.*"file_path"\s*:\s*"\([^"]*\)".*/\1/')

# Allow fuel.json — explicitly permitted per Exercise 4 (ASSIGNMENT.md)
if [[ "$FILE_PATH" == *"fuel.json"* ]]; then
  exit 0
fi

# Block edits to protected paths
if [[ "$FILE_PATH" == *"public/api/"* || "$FILE_PATH" == *"RUBRIC.md"* ]]; then
  echo "⛔ BLOCKED: Edits to '$FILE_PATH' are not allowed." >&2
  echo "   This file is part of the grading contract (see CODEOWNERS)." >&2
  echo "   Fix the code, not the checks." >&2
  exit 2
fi

exit 0
