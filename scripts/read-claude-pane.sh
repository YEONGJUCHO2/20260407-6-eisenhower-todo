#!/usr/bin/env bash

set -euo pipefail

SESSION_NAME="${AI_TMUX_SESSION_NAME:-ai-stack}"
WINDOW_INDEX="${AI_TMUX_WINDOW_INDEX:-0}"
PANE_INDEX="${AI_TMUX_CLAUDE_PANE_INDEX:-0}"
LINES="${AI_TMUX_CAPTURE_LINES:-120}"
FOLLOW_MODE=0

usage() {
  cat <<'EOF'
Usage: read-claude-pane.sh [options]

Options:
  -s, --session <name>   tmux session name (default: ai-stack)
  -w, --window <index>   tmux window index (default: 0)
  -p, --pane <index>     tmux pane index (default: 0)
  -n, --lines <count>    lines to capture from the bottom (default: 120)
  -f, --follow           refresh every 2 seconds
  -h, --help             show this help
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    -s|--session)
      SESSION_NAME="$2"
      shift 2
      ;;
    -w|--window)
      WINDOW_INDEX="$2"
      shift 2
      ;;
    -p|--pane)
      PANE_INDEX="$2"
      shift 2
      ;;
    -n|--lines)
      LINES="$2"
      shift 2
      ;;
    -f|--follow)
      FOLLOW_MODE=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

TARGET="$SESSION_NAME:$WINDOW_INDEX.$PANE_INDEX"
START_LINE="-$LINES"

if ! tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
  echo "tmux session not found: $SESSION_NAME" >&2
  exit 1
fi

capture_once() {
  tmux capture-pane -p -S "$START_LINE" -t "$TARGET"
}

if [ "$FOLLOW_MODE" = "1" ]; then
  while true; do
    clear
    echo "Target: $TARGET"
    echo
    capture_once
    sleep 2
  done
else
  capture_once
fi
