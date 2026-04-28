#!/usr/bin/env bash
# Bloomlings — Screenshot Capture Script
# Uses Maestro (https://maestro.mobile.dev) to automate screenshot capture.
# See docs/launch/screenshot-spec.md for full spec.
#
# Prerequisites:
#   brew install maestro
#   A running iOS Simulator or Android Emulator with the debug build installed.
#   Debug tools enabled (Settings > Developer > Enable Debug Tools).
#
# Usage:
#   ./scripts/capture-screenshots.sh [ios|android] [output_dir]

set -euo pipefail

PLATFORM="${1:-ios}"
OUTPUT_DIR="${2:-screenshots/$PLATFORM}"
APP_ID="com.bloomlings.app"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$OUTPUT_DIR"

echo "=== Bloomlings Screenshot Capture ==="
echo "Platform: $PLATFORM"
echo "Output:   $OUTPUT_DIR"
echo ""

# ---------------------------------------------------------------------------
# Helper: run a maestro flow inline via heredoc
# ---------------------------------------------------------------------------
run_maestro() {
  local flow_name="$1"
  local flow_file
  flow_file=$(mktemp /tmp/bloomlings_"${flow_name}"_XXXX.yaml)
  cat > "$flow_file"
  echo "▶ Capturing: $flow_name"
  maestro test "$flow_file" 2>&1 | tail -1
  rm -f "$flow_file"
}

# ---------------------------------------------------------------------------
# Screenshot 1 — The Garden (Hero Shot)
# State: Combo meter at 10+, visible tap particles, meaningful Sunlight balance
# ---------------------------------------------------------------------------
run_maestro "01_garden" <<YAML
appId: $APP_ID
---
- launchApp
- tapOn:
    id: "settings-tab"
- tapOn:
    id: "dev-tools-toggle"
# Set Sunlight to a visually appealing number
- runScript: "dev.setCurrency('sunlight', 12500)"
# Advance zone to Mossy Cradle zone 3 for a nice background
- runScript: "dev.setZone('mossy-cradle', 3)"
# Navigate to Garden
- tapOn:
    id: "garden-tab"
# Simulate rapid taps to build combo to 10+
- repeat:
    times: 15
    commands:
      - tapOn:
          id: "tap-area"
- takeScreenshot: "$OUTPUT_DIR/01_garden_${TIMESTAMP}"
YAML

# ---------------------------------------------------------------------------
# Screenshot 2 — Your Collection
# State: 8-12 Bloomlings discovered, detail modal open on a Bloom-stage creature
# ---------------------------------------------------------------------------
run_maestro "02_collection" <<YAML
appId: $APP_ID
---
- launchApp:
    clearState: false
- runScript: "dev.unlockBloomlings(['fernlet','mosskin','petalwing','thornbud','dewdrop','glowcap','sunpetal','ivytwist','crystalbloom','mistfern'])"
- tapOn:
    id: "collection-tab"
- assertVisible:
    id: "collection-grid"
# Open detail modal on a Bloom-stage Bloomling
- tapOn:
    id: "bloomling-card-petalwing"
- assertVisible:
    id: "bloomling-detail"
- takeScreenshot: "$OUTPUT_DIR/02_collection_${TIMESTAMP}"
YAML

# ---------------------------------------------------------------------------
# Screenshot 3 — Upgrade Shop
# State: Tap tab active, several upgrades at mixed levels, x10 multiplier
# ---------------------------------------------------------------------------
run_maestro "03_shop" <<YAML
appId: $APP_ID
---
- launchApp:
    clearState: false
- runScript: "dev.setCurrency('sunlight', 50000)"
- runScript: "dev.setUpgradeLevels({tapPower:8, tapCombo:5, critChance:3, idleRate:6})"
- tapOn:
    id: "shop-tab"
- tapOn:
    id: "shop-tab-tap"
- tapOn:
    id: "multiplier-x10"
- takeScreenshot: "$OUTPUT_DIR/03_shop_${TIMESTAMP}"
YAML

# ---------------------------------------------------------------------------
# Screenshot 4 — Rebirth & Prestige
# State: Rebirth panel showing 150+ Nectar reward, Transcendence tab locked
# ---------------------------------------------------------------------------
run_maestro "04_rebirth" <<YAML
appId: $APP_ID
---
- launchApp:
    clearState: false
- runScript: "dev.setCurrency('sunlight', 1e8)"
- runScript: "dev.setRebirthPreview(175)"
- tapOn:
    id: "rebirth-tab-nav"
- tapOn:
    id: "rebirth-tab-rebirth"
- assertVisible:
    id: "rebirth-button"
- takeScreenshot: "$OUTPUT_DIR/04_rebirth_${TIMESTAMP}"
YAML

# ---------------------------------------------------------------------------
# Screenshot 5 — Nectar & Essence Shops
# State: Nectar shop with 2-3 purchased upgrades, enough Nectar for one more
# ---------------------------------------------------------------------------
run_maestro "05_nectar_shop" <<YAML
appId: $APP_ID
---
- launchApp:
    clearState: false
- runScript: "dev.setCurrency('nectar', 320)"
- runScript: "dev.setNectarUpgrades({nectarTapBoost:2, nectarIdleBoost:1, nectarCritBoost:3})"
- tapOn:
    id: "rebirth-tab-nav"
- tapOn:
    id: "rebirth-tab-shop"
- assertVisible:
    id: "nectar-shop"
- takeScreenshot: "$OUTPUT_DIR/05_nectar_shop_${TIMESTAMP}"
YAML

# ---------------------------------------------------------------------------
# Screenshot 6 — Achievements & Rewards
# State: Mix of completed/in-progress/locked achievements, daily reward modal
# ---------------------------------------------------------------------------
run_maestro "06_achievements" <<YAML
appId: $APP_ID
---
- launchApp:
    clearState: false
- runScript: "dev.setAchievements({firstBloomling:'complete', tenBloomlings:'complete', firstRebirth:'in-progress', secretGarden:'locked'})"
- runScript: "dev.triggerDailyReward()"
- tapOn:
    id: "achievements-tab"
- assertVisible:
    id: "daily-reward-modal"
- takeScreenshot: "$OUTPUT_DIR/06_achievements_${TIMESTAMP}"
YAML

echo ""
echo "=== Done! Screenshots saved to $OUTPUT_DIR ==="
echo ""
echo "Post-processing steps (manual):"
echo "  1. Add device frames (iPhone 15 Pro / Pixel 8) using screenshots.pro or Rotato"
echo "  2. Add caption overlays per screenshot-spec.md (white, semi-bold, centered)"
echo "  3. Export at required sizes:"
echo "     iOS:     1290×2796, 1242×2688, 2048×2732"
echo "     Android: 1080×1920, 1200×1920, 1600×2560"
echo "  4. Keep caption text in a separate layer for localization"
