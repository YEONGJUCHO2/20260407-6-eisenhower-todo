#!/usr/bin/env bash

set -euo pipefail

SESSION_NAME="${1:-ai-stack}"
PROJECT_DIR="${2:-$(pwd)}"
APP_SERVER_CMD="${3:-npm run dev}"
ATTACH_MODE="${AI_TMUX_ATTACH:-1}"

if ! command -v tmux >/dev/null 2>&1; then
  echo "tmux is not installed." >&2
  exit 1
fi

if ! command -v claude >/dev/null 2>&1; then
  echo "claude command is not available in PATH." >&2
  exit 1
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "codex command is not available in PATH." >&2
  exit 1
fi

if [ ! -d "$PROJECT_DIR" ]; then
  echo "Project directory does not exist: $PROJECT_DIR" >&2
  exit 1
fi

if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
  if [ "$ATTACH_MODE" = "0" ]; then
    exit 0
  elif [ -n "${TMUX:-}" ]; then
    tmux switch-client -t "$SESSION_NAME"
  else
    tmux attach-session -t "$SESSION_NAME"
  fi
  exit 0
fi

WINDOW_TARGET="$SESSION_NAME:0"

tmux new-session -d -s "$SESSION_NAME" -c "$PROJECT_DIR"
tmux rename-window -t "$WINDOW_TARGET" "ai"
tmux split-window -h -t "$WINDOW_TARGET.0" -p 40 -c "$PROJECT_DIR"
tmux split-window -v -t "$WINDOW_TARGET.1" -p 50 -c "$PROJECT_DIR"
tmux send-keys -t "$WINDOW_TARGET.0" "claude" C-m
tmux send-keys -t "$WINDOW_TARGET.1" "codex" C-m
tmux send-keys -t "$WINDOW_TARGET.2" "$APP_SERVER_CMD" C-m
tmux select-pane -t "$WINDOW_TARGET.0"

if [ "$ATTACH_MODE" = "0" ]; then
  exit 0
elif [ -n "${TMUX:-}" ]; then
  tmux switch-client -t "$SESSION_NAME"
else
  tmux attach-session -t "$SESSION_NAME"
fi
