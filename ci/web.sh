#!/usr/bin/env bash
# Install, lint, format check, unit tests, production build. Requires: Node >= 22.22.3.
set -euo pipefail
cd "$(dirname "$0")/../web"
npm ci
npm run lint
npm run format:check
npm run test:ci
npm run build
