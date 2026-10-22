#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [[ ! -f .dev.vars ]]; then
  echo "Arquivo .dev.vars não encontrado."
  exit 1
fi
set -a
source .dev.vars
set +a
exec pnpm run dev --host 0.0.0.0 --port 4173
