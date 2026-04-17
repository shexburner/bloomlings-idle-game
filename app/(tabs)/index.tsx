// =============================================================================
// Garden Screen — Main game tap screen with currency bar, bloomling, and combo
// =============================================================================

import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CurrencyBar } from "~/components/garden/CurrencyBar";
import { TapArea } from "~/components/garden/TapArea";
import { TapFeedback, useTapFeedback } from "~/components/garden/TapFeedback";
import { ComboMeter } from "~/components/garden/ComboMeter";
import { ComboKeeperButton } from "~/components/garden/ComboKeeperButton";
import { SunbeamBoostButton } from "~/components/garden/SunbeamBoostButton";
import { ZoneProgress } from "~/components/garden/ZoneProgress";
import { BloomlingDisplay } from "~/components/garden/BloomlingDisplay";
import type { TapResult } from "~/engine/tapSystem";

export default function GardenScreen() {
  const insets = useSafeAreaInsets();
  const { entries, spawn } = useTapFeedback();

  const handleTapResult = useCallback(
    (result: TapResult) => {
      spawn(result.sunlight, result.isCritical);
    },
    [spawn]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Currency display bar */}
      <CurrencyBar />

      {/* Zone progress */}
      <View style={styles.zoneRow}>
        <ZoneProgress />
      </View>

      {/* Main tap area with bloomling and feedback */}
      <TapArea onTapResult={handleTapResult}>
        <BloomlingDisplay />
        <TapFeedback entries={entries} />
      </TapArea>

      {/* Combo meter + Combo Keeper pill positioned above the tab bar */}
      <View style={styles.comboRow}>
        <ComboMeter />
        <ComboKeeperButton />
      </View>

      {/* Sunbeam Boost FAB — absolutely positioned, visible from Zone 15 */}
      <SunbeamBoostButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  zoneRow: {
    paddingVertical: 8,
  },
  comboRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 12,
  },
});
