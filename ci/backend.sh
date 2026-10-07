#!/usr/bin/env bash
# Compile, unit tests (surefire), integration tests with Testcontainers (failsafe), package.
# Requires: JDK 21, Docker (for Testcontainers).
set -euo pipefail
cd "$(dirname "$0")/../backend"
./mvnw -B -ntp verify
