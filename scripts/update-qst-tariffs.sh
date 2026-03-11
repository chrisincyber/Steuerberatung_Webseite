#!/bin/bash
# Update Quellensteuer tariff data from ESTV
# Runs annually around Dec 30 to fetch next year's tariffs.
# Usage: ./scripts/update-qst-tariffs.sh [YEAR]
# If no year is given, it defaults to next year.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DATA_FILE="$PROJECT_DIR/src/data/qst-tariffs-2026.json"
TMP_DIR=$(mktemp -d)

# Determine year: argument or next year
if [ -n "$1" ]; then
  YEAR="$1"
else
  YEAR=$(($(date +%Y) + 1))
fi

SHORT_YEAR="${YEAR: -2}"
ZIP_URL="https://www.estv2.admin.ch/qst/${YEAR}/loehne/tar${YEAR}txt.zip"

echo "[QST Update] Fetching tariffs for year ${YEAR}..."
echo "[QST Update] URL: ${ZIP_URL}"

# Download
HTTP_CODE=$(curl -sL -o "$TMP_DIR/tariffs.zip" -w "%{http_code}" "$ZIP_URL")

if [ "$HTTP_CODE" != "200" ]; then
  echo "[QST Update] ERROR: Download failed (HTTP $HTTP_CODE). Tariffs for ${YEAR} may not be published yet."
  rm -rf "$TMP_DIR"
  exit 1
fi

# Verify it's a zip
if ! file "$TMP_DIR/tariffs.zip" | grep -q "Zip"; then
  echo "[QST Update] ERROR: Downloaded file is not a valid ZIP archive."
  rm -rf "$TMP_DIR"
  exit 1
fi

# Extract
unzip -o "$TMP_DIR/tariffs.zip" -d "$TMP_DIR/txt" > /dev/null
COUNT=$(ls "$TMP_DIR/txt/"*.txt 2>/dev/null | wc -l | tr -d ' ')
echo "[QST Update] Extracted ${COUNT} canton files."

if [ "$COUNT" -lt 26 ]; then
  echo "[QST Update] WARNING: Expected 26 canton files, got ${COUNT}."
fi

# Parse into JSON
python3 - "$TMP_DIR/txt" "$DATA_FILE" "$YEAR" << 'PYEOF'
import json, os, glob, sys

txt_dir = sys.argv[1]
output_file = sys.argv[2]
year = sys.argv[3]

data = {}

KEEP_TARIFFS = set()
for letter in ("A", "B", "C", "H"):
    for num in range(0, 6):
        if letter == "H" and num == 0:
            continue
        KEEP_TARIFFS.add(f"{letter}{num}")

for filepath in sorted(glob.glob(os.path.join(txt_dir, "*.txt"))):
    canton = os.path.basename(filepath).split(".")[0][-2:].upper()
    canton_data = {}
    a0_n = {}
    a0_y = {}

    with open(filepath, "r") as f:
        for line in f:
            line = line.rstrip()
            if len(line) < 55 or line[0:2] != "06":
                continue

            tariff = line[6:8]
            church = line[8]

            if tariff not in KEEP_TARIFFS:
                continue

            income_from = int(line[24:30]) * 10
            stripped = line.rstrip()
            rate_raw = int(stripped[-4:])
            rate_pct = rate_raw / 100

            if tariff == "A0":
                if church == "N":
                    a0_n[income_from] = rate_pct
                else:
                    a0_y[income_from] = rate_pct

            if church != "N":
                continue

            key = tariff
            if key not in canton_data:
                canton_data[key] = []
            canton_data[key].append((income_from, rate_pct))

    diffs = [a0_y[i] - a0_n[i] for i in a0_n if i in a0_y and a0_n[i] > 0.5]
    church = round(sum(diffs) / len(diffs), 2) if diffs else 0

    result = {"_c": church}
    for key, brackets in canton_data.items():
        brackets.sort()
        flat = []
        prev_rate = None
        for inc, rate in brackets:
            if rate != prev_rate:
                flat.extend([inc, rate])
                prev_rate = rate
        result[key] = flat

    data[canton] = result

# Also update the filename reference in the API route
output_path = os.path.dirname(output_file)
new_filename = f"qst-tariffs-{year}.json"
new_filepath = os.path.join(output_path, new_filename)

with open(new_filepath, "w") as f:
    json.dump(data, f, separators=(",", ":"))

total = sum(sum(len(v) // 2 for k, v in cd.items() if isinstance(v, list)) for cd in data.values())
size_kb = os.path.getsize(new_filepath) / 1024

print(f"[QST Update] Parsed {len(data)} cantons, {total} rate entries")
print(f"[QST Update] Output: {new_filepath} ({size_kb:.0f} KB)")
print(f"NEWFILE={new_filename}")
PYEOF

# Update the import in the API route to point to the new file
API_ROUTE="$PROJECT_DIR/src/app/api/quellensteuer/route.ts"
if [ -f "$API_ROUTE" ]; then
  sed -i '' "s|qst-tariffs-[0-9]*.json|qst-tariffs-${YEAR}.json|g" "$API_ROUTE"
  echo "[QST Update] Updated API route import to qst-tariffs-${YEAR}.json"
fi

# Remove old tariff files (keep only current)
find "$PROJECT_DIR/src/data" -name "qst-tariffs-*.json" ! -name "qst-tariffs-${YEAR}.json" -delete 2>/dev/null
echo "[QST Update] Cleaned up old tariff files."

# Cleanup
rm -rf "$TMP_DIR"

echo "[QST Update] Done! Tariffs updated to ${YEAR}."
echo "[QST Update] Remember to rebuild and deploy."
