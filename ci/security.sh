#!/usr/bin/env bash
# Dependency vulnerability + secret scan of the whole repo (Maven, npm, pub lockfiles)
# using Trivy in Docker, so it runs the same on GitHub Actions, GitLab CI or a laptop.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TRIVY_IMAGE="${TRIVY_IMAGE:-aquasec/trivy:0.75.0}"
docker run --rm -v "$ROOT:/src:ro" -v trivy-cache:/root/.cache "$TRIVY_IMAGE" \
  fs --scanners vuln,secret --severity HIGH,CRITICAL --ignore-unfixed --exit-code 1 \
  --skip-dirs /src/web/node_modules --skip-dirs /src/mobile/.dart_tool \
  /src
