#!/usr/bin/env bash
# OWNER: P2 (Backend)
# Netlify bundles only netlify/functions/. Canonical P3 sources live in
# netlify/background-functions/ — copy + fix imports before dev/build.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/netlify/background-functions"
DST="$ROOT/netlify/functions"

for f in "$SRC"/background-*.ts; do
  [[ -f "$f" ]] || continue
  base=$(basename "$f")
  sed "s|from '../functions/_lib/response'|from './_lib/response'|g" "$f" > "$DST/$base"
  echo "synced $base"
done
