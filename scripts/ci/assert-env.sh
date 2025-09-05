#!/usr/bin/env bash
# assert-env.sh  — validace produkčních env proměnných
# Použití:
#   ./scripts/ci/assert-env.sh vercel  <token>
#   ./scripts/ci/assert-env.sh railway <token>
set -euo pipefail

MODE="${1:-}"
TOKEN="${2:-}"

REQ_KEYS=(SMTP_HOST SMTP_PORT SMTP_USER SMTP_PASS SMTP_FROM OPENAI_API_KEY OPENAI_API_BASE OPENAI_MODEL)

fail() { echo "::error::$1"; exit 1; }

if [[ "$MODE" == "vercel" ]]; then
  [[ -z "$TOKEN" ]] && fail "Missing Vercel token"
  rm -f .vercel/.env.ci || true
  mkdir -p .vercel
  # stáhneme production env
  vercel env pull .vercel/.env.ci --environment=production --token "$TOKEN" >/dev/null
  source .vercel/.env.ci
  MISSING=()
  for k in "${REQ_KEYS[@]}"; do
    v="${!k-}"
    if [[ -z "${v:-}" ]]; then MISSING+=("$k"); fi
  done
  if (( ${#MISSING[@]} )); then
    echo "Chybějící klíče ve Vercel env (production): ${MISSING[*]}"
    exit 1
  fi
  echo "Vercel env OK"

elif [[ "$MODE" == "railway" ]]; then
  [[ -z "$TOKEN" ]] && fail "Missing Railway token"
  export RAILWAY_TOKEN="$TOKEN"
  # vylistuj variables do KEY=VALUE, přečti do prostředí
  mapfile -t lines < <(railway variables | tr -d '\r')
  declare -A VARS
  for ln in "${lines[@]}"; do
    [[ "$ln" == *"="* ]] || continue
    k="${ln%%=*}"; v="${ln#*=}"
    VARS["$k"]="$v"
  done
  MISSING=()
  for k in "${REQ_KEYS[@]}"; do
    v="${VARS[$k]-}"
    if [[ -z "${v:-}" ]]; then MISSING+=("$k"); fi
  done
  if (( ${#MISSING[@]} )); then
    echo "Chybějící klíče v Railway variables: ${MISSING[*]}"
    exit 1
  fi
  echo "Railway env OK"
else
  fail "Usage: assert-env.sh [vercel|railway] <token>"
fi
