#!/usr/bin/env bash
# OWNER: P2 (Backend)
# Kürsü API smoke tests. Requires `npm run dev` (runs sync:bg + netlify dev) on :8888.

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8888}"
FAIL=0

pass() { echo "  OK   $1"; }
fail() { echo "  FAIL $1"; FAIL=1; }

check_status() {
  local label="$1"
  local expected="$2"
  local actual="$3"
  if [[ "$actual" == "$expected" ]]; then
    pass "$label (HTTP $actual)"
  else
    fail "$label (expected HTTP $expected, got $actual)"
  fi
}

echo "Kürsü API smoke — $BASE_URL"
echo

# --- health (function URL; P4 may add /api/health redirect in netlify.toml) ---
code=$(curl -sS -o /tmp/kursu-health.json -w "%{http_code}" "$BASE_URL/.netlify/functions/health")
check_status "GET /.netlify/functions/health" "200" "$code"
if grep -q '"ok":true' /tmp/kursu-health.json 2>/dev/null; then
  pass "health body contains ok:true"
else
  fail "health body missing ok:true ($(cat /tmp/kursu-health.json 2>/dev/null || echo empty))"
fi

# --- lectures list ---
code=$(curl -sS -o /tmp/kursu-lectures.json -w "%{http_code}" "$BASE_URL/api/lectures")
check_status "GET /api/lectures" "200" "$code"

# --- by-code (seeded demo) ---
code=$(curl -sS -o /tmp/kursu-bycode.json -w "%{http_code}" "$BASE_URL/api/lectures/by-code/KRSU-DEMO")
if [[ "$code" == "200" ]]; then
  pass "GET /api/lectures/by-code/KRSU-DEMO"
  LECTURE_ID=$(python3 -c "import json; print(json.load(open('/tmp/kursu-bycode.json'))['lecture']['id'])" 2>/dev/null || true)
elif [[ "$code" == "404" ]]; then
  echo "  WARN KRSU-DEMO not found (run: npm run db:migrate && npm run db:seed)"
  LECTURE_ID=""
else
  fail "GET /api/lectures/by-code/KRSU-DEMO (HTTP $code)"
  LECTURE_ID=""
fi

# --- create lecture ---
code=$(curl -sS -o /tmp/kursu-create.json -w "%{http_code}" \
  -X POST "$BASE_URL/api/lectures" \
  -H "content-type: application/json" \
  -d '{"title":"Smoke Test","subject":"QA"}')
check_status "POST /api/lectures" "201" "$code"
NEW_ID=$(python3 -c "import json; print(json.load(open('/tmp/kursu-create.json'))['id'])" 2>/dev/null || true)
if [[ -n "${NEW_ID:-}" ]]; then
  pass "created lecture id=$NEW_ID"
else
  fail "POST /api/lectures — no id in response"
fi

# --- get by id ---
if [[ -n "${NEW_ID:-}" ]]; then
  code=$(curl -sS -o /tmp/kursu-get.json -w "%{http_code}" "$BASE_URL/api/lectures/$NEW_ID")
  check_status "GET /api/lectures/:id" "200" "$code"
fi

# --- student join (demo or new lecture) ---
TARGET_ID="${LECTURE_ID:-$NEW_ID}"
if [[ -n "${TARGET_ID:-}" ]]; then
  code=$(curl -sS -o /tmp/kursu-join.json -w "%{http_code}" \
    -X POST "$BASE_URL/api/lectures/$TARGET_ID/student-join" \
    -H "content-type: application/json" \
    -d '{"studentName":"Smoke","studentId":"smoke-student-001"}')
  check_status "POST /api/lectures/:id/student-join" "200" "$code"
  SESSION_ID=$(python3 -c "import json; print(json.load(open('/tmp/kursu-join.json'))['studentSessionId'])" 2>/dev/null || true)
  if [[ -n "${SESSION_ID:-}" ]]; then
    pass "student session id=$SESSION_ID"
  fi

  code=$(curl -sS -o /tmp/kursu-questions.json -w "%{http_code}" \
    "$BASE_URL/api/lectures/$TARGET_ID/questions")
  check_status "GET /api/lectures/:id/questions" "200" "$code"
else
  echo "  SKIP student-join / questions (no lecture id)"
fi

echo
if [[ "$FAIL" -eq 0 ]]; then
  echo "All smoke checks passed."
  exit 0
else
  echo "Some checks failed."
  exit 1
fi
