#!/bin/bash
set -euo pipefail

# SessionStart hook untuk Claude Code on the web.
# Memastikan dependency terpasang agar build & type-check siap dipakai
# setiap sesi web dibuka (container selalu dimulai dari kondisi bersih).

# Hanya jalan di environment remote (Claude Code on the web).
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Pasang dependency npm (idempotent; aman dijalankan berulang).
npm install
