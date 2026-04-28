// =============================================================================
// useNextUnlock — Computes the next meaningful unlock for the player
// =============================================================================

import { useMemo } from "react";
import { useGameStore } from "~/state/store";
import { BLOOMLING_TEMPLATES } from "~/data/bloomlingTemplates";

interface NextUnlock {
  type: "bloomling" | "feature";
  label: string;
  targetZone: number;
  currentZone: number;
  progress: number;
}

const FEATURE_UNLOCKS: { zone: number; label: string }[] = [
  { zone: 20, label: "Dewdrop Shop" },
  { zone: 40, label: "Rebirth" },
];

function parseZoneCondition(condition: string): number | null {
  const match = condition.match(/^zone_(\d+)$/);
  return match ? Number(match[1]) : null;
}

export function useNextUnlock(): NextUnlock | null {
  const currentZone = useGameStore((s) => s.zoneProgress.currentZone);
  const bloomlings = useGameStore((s) => s.bloomlings);

  return useMemo(() => {
    const candidates: NextUnlock[] = [];

    // Zone-based Bloomling unlocks
    for (const t of BLOOMLING_TEMPLATES) {
      const zone = parseZoneCondition(t.unlockCondition);
      if (zone === null || zone <= currentZone) continue;
      const isUnlocked = Object.values(bloomlings).some(
        (b) => b.templateId === t.id && b.unlocked
      );
      if (isUnlocked) continue;
      candidates.push({
        type: "bloomling",
        label: t.name,
        targetZone: zone,
        currentZone,
        progress: currentZone / zone,
      });
    }

    // Feature unlocks
    for (const f of FEATURE_UNLOCKS) {
      if (f.zone <= currentZone) continue;
      candidates.push({
        type: "feature",
        label: f.label,
        targetZone: f.zone,
        currentZone,
        progress: currentZone / f.zone,
      });
    }

    if (candidates.length === 0) return null;
    // Return the closest unlock
    candidates.sort((a, b) => a.targetZone - b.targetZone);
    return candidates[0]!;
  }, [currentZone, bloomlings]);
}
