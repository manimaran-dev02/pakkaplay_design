#!/usr/bin/env bash
# Format check, static analysis, tests. Set BUILD_APK=1 to also build a debug APK
# (needs the Android SDK; iOS builds need a macOS runner).
set -euo pipefail
cd "$(dirname "$0")/../mobile"
flutter pub get
dart format --output=none --set-exit-if-changed lib test
flutter analyze
flutter test
if [[ "${BUILD_APK:-0}" == "1" ]]; then
  flutter build apk --debug
fi
