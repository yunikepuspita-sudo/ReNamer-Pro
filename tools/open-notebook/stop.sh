#!/usr/bin/env bash
#
# stop.sh — Stop all Open Notebook services started by start.sh.
set -uo pipefail

log() { printf '\033[1;36m==>\033[0m %s\n' "$*"; }

for pat in "next dev" "surreal-commands-worker" "run_api.py" "uvicorn api.main:app" "surreal start"; do
  if pgrep -f "$pat" >/dev/null; then
    log "Stopping: $pat"
    pkill -f "$pat" || true
  fi
done
log "All Open Notebook services stopped."
