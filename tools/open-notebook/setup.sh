#!/usr/bin/env bash
#
# setup.sh — Install Open Notebook (https://github.com/lfnovo/open-notebook)
# from source, for environments where Docker Hub / api.github.com are blocked.
#
# What it does:
#   1. Downloads the SurrealDB v2 binary straight from GitHub Releases
#      (avoids Docker Hub rate limits and the blocked install.surrealdb.com).
#   2. Clones the open-notebook source and installs Python deps with `uv`.
#   3. Installs the Next.js frontend deps with `npm` (forcing the official
#      registry, since a baked-in npmmirror lock can 403).
#   4. Writes a .env with a freshly generated encryption key, pointed at a
#      LOCAL SurrealDB (ws://localhost:8000/rpc).
#
# Re-running is safe; existing pieces are reused. After setup, use start.sh.
#
# Override locations with env vars:
#   ON_HOME   install root          (default: $HOME/open-notebook-run)
#   SURREAL_VERSION                  (default: v2.6.5)
set -euo pipefail

ON_HOME="${ON_HOME:-$HOME/open-notebook-run}"
SRC_DIR="$ON_HOME/src"
DATA_DIR="$ON_HOME/surreal_data"
BIN_DIR="$ON_HOME/bin"
SURREAL_VERSION="${SURREAL_VERSION:-v2.6.5}"

mkdir -p "$ON_HOME" "$DATA_DIR" "$BIN_DIR"

log() { printf '\033[1;36m==>\033[0m %s\n' "$*"; }

# 1. SurrealDB binary -------------------------------------------------------
if [ ! -x "$BIN_DIR/surreal" ]; then
  log "Downloading SurrealDB $SURREAL_VERSION binary from GitHub Releases..."
  url="https://github.com/surrealdb/surrealdb/releases/download/${SURREAL_VERSION}/surreal-${SURREAL_VERSION}.linux-amd64.tgz"
  curl -fSL -o "$ON_HOME/surreal.tgz" "$url"
  tar xzf "$ON_HOME/surreal.tgz" -C "$BIN_DIR"
  chmod +x "$BIN_DIR/surreal"
  rm -f "$ON_HOME/surreal.tgz"
fi
log "SurrealDB: $("$BIN_DIR/surreal" version)"

# 2. open-notebook source + Python deps ------------------------------------
if [ ! -d "$SRC_DIR/.git" ]; then
  log "Cloning open-notebook source..."
  git clone --depth 1 https://github.com/lfnovo/open-notebook.git "$SRC_DIR"
fi

log "Installing Python dependencies with uv..."
( cd "$SRC_DIR" && uv sync && uv pip install python-magic )

# 3. .env -------------------------------------------------------------------
if [ ! -f "$SRC_DIR/.env" ]; then
  log "Generating .env (with a fresh encryption key)..."
  KEY="$(openssl rand -hex 32)"
  cat > "$SRC_DIR/.env" <<EOF
OPEN_NOTEBOOK_ENCRYPTION_KEY=$KEY
SURREAL_URL=ws://localhost:8000/rpc
SURREAL_USER=root
SURREAL_PASSWORD=root
SURREAL_NAMESPACE=open_notebook
SURREAL_DATABASE=open_notebook
API_URL=http://localhost:5055
EOF
  chmod 600 "$SRC_DIR/.env"
else
  log ".env already exists — keeping it."
fi

# 4. Frontend deps ----------------------------------------------------------
log "Installing frontend dependencies (official npm registry)..."
(
  cd "$SRC_DIR/frontend"
  npm config set registry https://registry.npmjs.org/
  # A committed lock can pin npmmirror URLs that 403; drop it so npm re-resolves.
  rm -rf node_modules package-lock.json
  npm install
  cat > .env.local <<'EOF'
API_URL=http://localhost:5055
INTERNAL_API_URL=http://localhost:5055
NEXT_PUBLIC_API_URL=http://localhost:5055
EOF
)

log "Setup complete. Start everything with:  tools/open-notebook/start.sh"
