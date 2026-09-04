#!/bin/bash
# Mirror the `Backend · e2e` CI job locally, so a failure that only reproduces
# in CI can be reproduced here. Same order of operations as
# .github/workflows/tests.yml.
#
# Usage: ./scripts/ci-local.sh [extra jest args...]
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="$REPO_ROOT/services/backend"
REPORTS="$REPO_ROOT/reports"

cd "$BACKEND"

if [ ! -f .env ]; then
  echo "==> No .env; creating one from .env.example"
  cp .env.example .env
  echo "    Set a real LOCALSTACK_AUTH_TOKEN in $BACKEND/.env before the S3 specs will pass."
fi

echo "==> Starting Postgres + LocalStack"
docker compose up -d --wait

echo "==> Installing dependencies"
npm ci

echo "==> Applying migrations"
npm run db:deploy

mkdir -p "$REPORTS"

echo "==> Running e2e suite"
# The suite is expected to be partially red (AD-1 commits Stage-2 tests before
# the production code). Keep going so the report is always written.
set +e
npm run test:e2e -- --ci --json --outputFile="$REPORTS/backend-e2e.json" "$@"
STATUS=$?
set -e

echo
echo "==> Report: $REPORTS/backend-e2e.json (jest exit $STATUS)"
echo "==> Build the trace evidence file with:"
echo "    node scripts/build-live-verification-results.cjs \\"
echo "      --jest reports/backend-e2e.json --suite backend-e2e"
echo "==> Tear down with: npm --prefix services/backend run db:down"

exit 0
