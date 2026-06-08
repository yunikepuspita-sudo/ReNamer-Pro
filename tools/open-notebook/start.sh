#!/usr/bin/env bash
#
# start.sh — Start all Open Notebook services (SurrealDB, API, worker, frontend).
# Assumes setup.sh has already run. Logs go to $ON_HOME/logs.
set -euo pipefail

ON_HOME="${ON_HOME:-$HOME/open-notebook-run}"
SRC_DIR="$ON_HOME/src"
DATA_DIR="$ON_HOME/surreal_data"
BIN_DIR="$ON_HOME/bin"
LOG_DIR="$ON_HOME/logs"
mkdir -p "$LOG_DIR" "$DATA_DIR"

log() { printf '\033[1;36m==>\033[0m %s\n' "$*"; }

if [ ! -x "$BIN_DIR/surreal" ] || [ ! -d "$SRC_DIR" ]; then
  echo "Not installed yet. Run tools/open-notebook/setup.sh first." >&2
  exit 1
fi

wait_for() { # url, name
  for _ in $(seq 1 30); do
    if curl -fsS -o /dev/null "$1"; then log "$2 is up."; return 0; fi
    sleep 1
  done
  echo "WARNING: $2 did not become ready at $1" >&2
}

# 1. SurrealDB --------------------------------------------------------------
if pgrep -f "surreal start" >/dev/null; then
  log "SurrealDB already running."
else
  log "Starting SurrealDB..."
  SURREAL_EXPERIMENTAL_GRAPHQL=true nohup "$BIN_DIR/surreal" start --log info \
    --user root --pass root "rocksdb:$DATA_DIR/mydatabase.db" \
    >"$LOG_DIR/surreal.log" 2>&1 &
  wait_for http://localhost:8000/health SurrealDB
fi

# 2. API --------------------------------------------------------------------
if pgrep -f "run_api.py" >/dev/null; then
  log "API already running."
else
  log "Starting API backend..."
  ( cd "$SRC_DIR" && nohup uv run --env-file .env run_api.py >"$LOG_DIR/api.log" 2>&1 & )
  wait_for http://localhost:5055/health API
fi

# 3. Worker -----------------------------------------------------------------
if pgrep -f "surreal-commands-worker" >/dev/null; then
  log "Worker already running."
else
  log "Starting background worker..."
  ( cd "$SRC_DIR" && nohup uv run --env-file .env surreal-commands-worker \
      --import-modules commands >"$LOG_DIR/worker.log" 2>&1 & )
fi

# 4. Frontend ---------------------------------------------------------------
if pgrep -f "next dev" >/dev/null; then
  log "Frontend already running."
else
  log "Starting Next.js frontend..."
  ( cd "$SRC_DIR/frontend" && nohup npm run dev >"$LOG_DIR/frontend.log" 2>&1 & )
  wait_for http://localhost:3000 Frontend
fi

cat <<EOF

All services started.
  Frontend : http://localhost:3000
  API docs : http://localhost:5055/docs
  Logs     : $LOG_DIR

Next step: open the UI -> Settings -> API Keys and add a provider key
(OpenAI / Anthropic / Google / Groq) to enable chat, embeddings, podcasts.
EOF
