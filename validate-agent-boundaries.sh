#!/bin/bash
# =============================================================================
# HOOK: validate-agent-boundaries.sh
# EVENT: PreToolUse (Edit|Write)
# PURPOSE: Enforce file ownership boundaries between agents
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
# RULE: Shared files require coordination
# =============================================================================
if [[ "$FILE_PATH" == src/types/* ]] ||
   [[ "$FILE_PATH" == package.json ]] ||
   [[ "$FILE_PATH" == tsconfig* ]] ||
   [[ "$FILE_PATH" == next.config* ]] ||
   [[ "$FILE_PATH" == tailwind.config* ]] ||
   [[ "$FILE_PATH" == .env.example ]]; then
    cat << EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "ask",
    "permissionDecisionReason": "Shared files should be coordinated through integration-specialist"
  }
}
EOF
    exit 0
fi

# =============================================================================
# RULE: Stripe files managed by integration
# =============================================================================
if [[ "$FILE_PATH" == src/lib/stripe/* ]]; then
    cat << EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "ask",
    "permissionDecisionReason": "Stripe integration managed by integration-specialist"
  }
}
EOF
    exit 0
fi

# =============================================================================
# RULE: Cross-domain edits require explanation
# =============================================================================
# Note: This is simplified - a more robust version would detect which agent
# is running and enforce stricter boundaries

# Frontend files
if [[ "$FILE_PATH" == src/app/q/* ]] ||
   [[ "$FILE_PATH" == src/components/* ]] ||
   [[ "$FILE_PATH" == src/hooks/* ]]; then
    # Likely frontend work - allow
    exit 0
fi

# Backend files
if [[ "$FILE_PATH" == src/app/api/* ]] ||
   [[ "$FILE_PATH" == src/lib/services/* ]] ||
   [[ "$FILE_PATH" == src/lib/supabase/* ]] ||
   [[ "$FILE_PATH" == supabase/* ]]; then
    # Likely backend work - allow
    exit 0
fi

# Test files
if [[ "$FILE_PATH" == tests/* ]]; then
    # QA or relevant specialist - allow
    exit 0
fi

# Everything else - allow but could add more rules
exit 0