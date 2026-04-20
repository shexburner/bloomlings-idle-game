#!/usr/bin/env bash
# =============================================================================
# build-apk.sh — Build the Bloomlings Android APK
#
# Usage:
#   ./build-apk.sh              # builds debug (default)
#   ./build-apk.sh debug        # builds debug
#   ./build-apk.sh release      # builds release
#   ./build-apk.sh --clean release  # cleans Gradle cache first, then builds release
#
# Output APK:
#   debug   → android/app/build/outputs/apk/debug/app-debug.apk
#   release → android/app/build/outputs/apk/release/app-release.apk
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Resolve the project root (directory containing this script)
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
ANDROID_DIR="$PROJECT_ROOT/android"

# ---------------------------------------------------------------------------
# Parse arguments
# ---------------------------------------------------------------------------
BUILD_TYPE="debug"
CLEAN=false

for arg in "$@"; do
  case "$arg" in
    debug|release)
      BUILD_TYPE="$arg"
      ;;
    --clean|-c)
      CLEAN=true
      ;;
    --help|-h)
      sed -n '/^# Usage/,/^# ====*/p' "$0" | head -n 10
      exit 0
      ;;
    *)
      echo "❌  Unknown argument: $arg"
      echo "    Usage: $0 [--clean] [debug|release]"
      exit 1
      ;;
  esac
done

# ---------------------------------------------------------------------------
# Validate project layout
# ---------------------------------------------------------------------------
if [[ ! -d "$ANDROID_DIR" ]]; then
  echo "❌  Android directory not found: $ANDROID_DIR"
  exit 1
fi

if [[ ! -f "$ANDROID_DIR/gradlew" ]]; then
  echo "❌  gradlew not found in $ANDROID_DIR"
  exit 1
fi

# Ensure gradlew is executable
chmod +x "$ANDROID_DIR/gradlew"

# ---------------------------------------------------------------------------
# Ensure local.properties points to the Android SDK
# ---------------------------------------------------------------------------
LOCAL_PROPS="$ANDROID_DIR/local.properties"
if [[ ! -f "$LOCAL_PROPS" ]]; then
  # Try common Windows SDK path (translated to Unix for bash)
  SDK_PATH_WIN="C:\\Users\\sheha\\AppData\\Local\\Android\\Sdk"
  echo "sdk.dir=$SDK_PATH_WIN" > "$LOCAL_PROPS"
  echo "ℹ️   Created local.properties with sdk.dir=$SDK_PATH_WIN"
fi

# ---------------------------------------------------------------------------
# Print summary
# ---------------------------------------------------------------------------
echo ""
echo "┌─────────────────────────────────────────────┐"
echo "│         Bloomlings APK Build                │"
echo "├─────────────────────────────────────────────┤"
printf  "│  Build type : %-30s │\n" "$BUILD_TYPE"
printf  "│  Clean      : %-30s │\n" "$CLEAN"
printf  "│  Project    : %-30s │\n" "$PROJECT_ROOT"
echo "└─────────────────────────────────────────────┘"
echo ""

# ---------------------------------------------------------------------------
# Optional clean
# ---------------------------------------------------------------------------
if [[ "$CLEAN" == true ]]; then
  echo "🧹  Running Gradle clean..."
  cd "$ANDROID_DIR"
  ./gradlew clean
  cd "$PROJECT_ROOT"
  echo ""
fi

# ---------------------------------------------------------------------------
# Determine Gradle task
# ---------------------------------------------------------------------------
if [[ "$BUILD_TYPE" == "release" ]]; then
  GRADLE_TASK="assembleRelease"
  APK_RELATIVE="android/app/build/outputs/apk/release/app-release.apk"
else
  GRADLE_TASK="assembleDebug"
  APK_RELATIVE="android/app/build/outputs/apk/debug/app-debug.apk"
fi

# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------
echo "🔨  Running: ./gradlew $GRADLE_TASK"
echo ""

cd "$ANDROID_DIR"
./gradlew "$GRADLE_TASK"

# ---------------------------------------------------------------------------
# Report result
# ---------------------------------------------------------------------------
APK_PATH="$PROJECT_ROOT/$APK_RELATIVE"

echo ""
if [[ -f "$APK_PATH" ]]; then
  APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
  echo "✅  Build succeeded!"
  echo ""
  echo "   APK : $APK_PATH"
  echo "   Size: $APK_SIZE"
  echo ""
  # Windows-friendly path for copy-paste
  WIN_PATH=$(echo "$APK_PATH" | sed 's|^/c/|C:\\|' | tr '/' '\\')
  echo "   Windows path: $WIN_PATH"
else
  echo "❌  Build completed but APK not found at expected path:"
  echo "   $APK_PATH"
  exit 1
fi
