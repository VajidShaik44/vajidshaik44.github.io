#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
OUTPUT="$ROOT_DIR/assets/resume/vajid-shaik-devops-resume.pdf"
TEMP_OUTPUT="${OUTPUT%.pdf}.tmp.pdf"
HTML_PATH="$SCRIPT_DIR/resume.html"
if command -v cygpath >/dev/null 2>&1; then
  HTML_PATH="$(cygpath -m "$HTML_PATH")"
  HTML_URL="file:///${HTML_PATH// /%20}"
else
  HTML_URL="file://$HTML_PATH"
fi
CHROME="${CHROME_BIN:-}"

if [[ -z "$CHROME" ]]; then
  for candidate in chromium chromium-browser google-chrome google-chrome-stable; do
    if command -v "$candidate" >/dev/null 2>&1; then
      CHROME="$(command -v "$candidate")"
      break
    fi
  done
fi

if [[ -z "$CHROME" ]]; then
  printf '%s\n' 'Chromium not found. Set CHROME_BIN to a headless Chromium executable.' >&2
  exit 1
fi

mkdir -p "$(dirname -- "$OUTPUT")"
trap 'rm -f "$TEMP_OUTPUT"' EXIT
"$CHROME" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="$TEMP_OUTPUT" "$HTML_URL"
test -s "$TEMP_OUTPUT"
mv "$TEMP_OUTPUT" "$OUTPUT"
trap - EXIT
printf 'Wrote %s\n' "$OUTPUT"