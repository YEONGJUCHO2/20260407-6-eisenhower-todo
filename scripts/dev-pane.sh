#!/usr/bin/env bash

set -uo pipefail

PROJECT_DIR="${1:-$(pwd)}"
LOG_FILE="$PROJECT_DIR/.next/dev/logs/next-development.log"
OUTPUT_FILE="$(mktemp -t next-dev-pane.XXXXXX)"

cleanup() {
  rm -f "$OUTPUT_FILE"
}

trap cleanup EXIT

cd "$PROJECT_DIR"

start_ts="$(date +%s)"

set +e
npm run dev 2>&1 | tee "$OUTPUT_FILE"
cmd_status="${PIPESTATUS[0]}"
set -e

elapsed="$(( $(date +%s) - start_ts ))"

if [ "$elapsed" -le 5 ] \
  && grep -Eq 'Run kill [0-9]+ to stop it|A dev server is already running' "$OUTPUT_FILE" \
  && [ -f "$LOG_FILE" ]; then
  echo
  echo "Following existing Next dev log: $LOG_FILE"
  exec tail -n 50 -f "$LOG_FILE"
fi

exit "$cmd_status"
