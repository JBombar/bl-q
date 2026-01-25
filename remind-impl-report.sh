#!/bin/bash
# =============================================================================
# HOOK: remind-impl-report.sh
# EVENT: PostToolUse (Edit|Write)
# PURPOSE: Remind agents to create implementation reports
# =============================================================================

INPUT=$(cat)

# Extract file path
if command -v jq &> /dev/null; then
    FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
else
    FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
fi

# Exit if no file path
[ -z "$FILE_PATH" ] && exit 0

# =============================================================================
# RULE: Remind after editing source files (not tests, not reports)
# =============================================================================
if [[ "$FILE_PATH" == src/* ]] &&
   [[ "$FILE_PATH" != *test* ]] &&
   [[ "$FILE_PATH" != __dev/impl_reports/* ]]; then
    cat << EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "📝 Reminder: Create implementation report using /write-impl-report when task is complete"
  }
}
EOF
fi

exit 0