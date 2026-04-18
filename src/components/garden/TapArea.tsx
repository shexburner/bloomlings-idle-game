// =============================================================================
// TapArea — Large tappable area covering the main game zone
// =============================================================================

import { type ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";

import { useTapHandler, type TapResult } from "~/engine/tapSystem";
import * as audioService from "~/services/audioService";
import { tapHaptic, critHaptic, comboMilestoneHaptic } from "~/utils/haptics";

interface TapAreaProps {
  /** Called after each successful tap with the result. */
  onTapResult?: (result: TapResult) => void;
  /** Children rendered inside the tap zone (BloomlingDisplay, etc.). */
  children?: ReactNode;
}

export function TapArea({ onTapResult, children }: TapAreaProps) {
  const { onTap } = useTapHandler();

  const handlePress = () => {
    const result = onTap();
    if (result) {
      if (result.isCritical) {
        critHaptic();
        audioService.play("crit");
      } else {
        tapHaptic();
        audioService.play("tap");
      }
      if (result.comboCount > 0 && result.comboCount % 25 === 0) {
        comboMilestoneHaptic();
        audioService.play("combo");
      }
      if (onTapResult) {
        onTapResult(result);
      }
    }
  };

  return (
    <Pressable
      testID="tap-area"
      style={styles.container}
      onPress={handlePress}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
