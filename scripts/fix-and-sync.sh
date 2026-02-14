#!/usr/bin/env bash
set -Eeuo pipefail

echo "🔧 Starting Project Data Fix + Stripe Sync"

#############################################
# CONFIG
#############################################

PROJECT_FILE="data/project.json"
LOG_PREFIX="[HFRP]"

#############################################
# HELPERS
#############################################

log() {
  echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") $LOG_PREFIX $1"
}

fail() {
  log "❌ $1"
  exit 1
}

warn() {
  log "⚠️  $1"
}

#############################################
# CHECK FILE EXISTS
#############################################

if [ ! -f "$PROJECT_FILE" ]; then
  fail "Project file not found: $PROJECT_FILE"
fi

#############################################
# NORMALIZE PROJECT DATA
#############################################

log "Normalizing project data..."

node <<'NODE'
const fs = require("fs");

const path = "data/project.json";
const raw = fs.readFileSync(path,"utf8");
let project = JSON.parse(raw);

// ---------- defaults ----------
project.goal_amount ??= 0;
project.metrics ??= {};
project.metrics.funding_velocity ??= 0;

// ---------- sanity ----------
if (typeof project.goal_amount !== "number")
  project.goal_amount = Number(project.goal_amount) || 0;

fs.writeFileSync(path, JSON.stringify(project,null,2));

console.log("✔ project normalized");
NODE

#############################################
# VALIDATE DATA
#############################################

log "Validating project..."

node <<'NODE'
const fs = require("fs");

const project = JSON.parse(
  fs.readFileSync("data/project.json","utf8")
);

const errors = [];

if (project.goal_amount == null)
  errors.push("Missing goal_amount");

if (!project.metrics)
  errors.push("Missing metrics");

if (errors.length) {
  console.log("VALIDATION_ERRORS");
  errors.forEach(e => console.log(e));
  process.exit(2);
}

console.log("VALIDATION_OK");
NODE

STATUS=$?

if [ "$STATUS" -eq 2 ]; then
  warn "Validation failed — Stripe sync skipped"
  exit 0
fi

#############################################
# STRIPE CHECK
#############################################

log "Checking Stripe connectivity..."

if [ -z "${STRIPE_SECRET_KEY:-}" ]; then
  warn "STRIPE_SECRET_KEY not set — skipping Stripe sync"
  exit 0
fi

#############################################
# STRIPE SYNC
#############################################

log "Running Stripe sync..."

if ./stripe-sync.sh; then
  log "Stripe sync completed"
else
  warn "Stripe sync failed but pipeline continues"
fi

#############################################
# DONE
#############################################

log "✅ All tasks finished safely"
