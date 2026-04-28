// =============================================================================
// Bloomling Abilities — Pure functions for computing ability bonuses
// =============================================================================
// Each Bloomling has an ability that activates at Bloom stage (power 1) and
// strengthens at Elder stage (power 2). Sprouts have no active ability.
//
// Abilities are categorized by AbilityType and dispatched by inspecting the
// template's abilityDescription to determine the specific bonus target.
// All bonuses are additive within their category; hard caps apply to crit
// chance and zone threshold reduction.
// =============================================================================

import { AbilityType, EvolutionStage } from "~/types/game";
import type { Bloomling, BloomlingTemplate } from "~/types/game";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface ActiveAbility {
  instanceId: string;
  templateId: string;
  abilityType: AbilityType;
  abilityValue: number;
  power: number; // 0 for Sprout, 1 for Bloom, 2 for Elder
}

export interface AbilityBonuses {
  productionBoostAll: number;
  productionBoostSelf: Record<string, number>;
  tapValueFlat: number;
  critChanceBonus: number;
  comboMultiplierBonus: number;
  comboDecayExtensionMs: number;
  zoneThresholdReduction: number;
  prestigeNectarBonus: number;
  luckBonus: number;
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const CRIT_CHANCE_CAP = 0.5;
const ZONE_THRESHOLD_REDUCTION_CAP = 0.3;

// -----------------------------------------------------------------------------
// Functions
// -----------------------------------------------------------------------------

export function getAbilityPower(stage: EvolutionStage): number {
  switch (stage) {
    case EvolutionStage.Sprout:
      return 0;
    case EvolutionStage.Bloom:
      return 1;
    case EvolutionStage.Elder:
      return 2;
  }
}

export function getActiveAbilities(
  gardenBloomlings: readonly Bloomling[],
  getTemplate: (templateId: string) => BloomlingTemplate | undefined
): ActiveAbility[] {
  const result: ActiveAbility[] = [];
  for (const b of gardenBloomlings) {
    const power = getAbilityPower(b.evolutionStage);
    if (power === 0) continue;
    const tmpl = getTemplate(b.templateId);
    if (!tmpl) continue;
    result.push({
      instanceId: b.instanceId,
      templateId: b.templateId,
      abilityType: tmpl.abilityType,
      abilityValue: tmpl.abilityValue * power,
      power,
    });
  }
  return result;
}

export function computeAbilityBonuses(
  activeAbilities: readonly ActiveAbility[],
  getTemplate: (templateId: string) => BloomlingTemplate | undefined
): AbilityBonuses {
  const bonuses = emptyAbilityBonuses();

  for (const a of activeAbilities) {
    const tmpl = getTemplate(a.templateId);
    const desc = tmpl?.abilityDescription ?? "";

    switch (a.abilityType) {
      case AbilityType.ProductionBoost:
        if (desc.includes("all Garden") || desc.includes("all garden")) {
          bonuses.productionBoostAll += a.abilityValue;
        } else {
          bonuses.productionBoostSelf[a.instanceId] =
            (bonuses.productionBoostSelf[a.instanceId] ?? 0) + a.abilityValue;
        }
        break;
      case AbilityType.TapBoost:
        if (desc.includes("critical")) {
          bonuses.critChanceBonus += a.abilityValue;
        } else {
          bonuses.tapValueFlat += a.abilityValue;
        }
        break;
      case AbilityType.ComboBoost:
        if (desc.includes("decay")) {
          bonuses.comboDecayExtensionMs += a.abilityValue * 1000;
        } else {
          bonuses.comboMultiplierBonus += a.abilityValue;
        }
        break;
      case AbilityType.ZoneBoost:
        bonuses.zoneThresholdReduction += a.abilityValue;
        break;
      case AbilityType.PrestigeBoost:
        bonuses.prestigeNectarBonus += a.abilityValue;
        break;
      case AbilityType.Luck:
        bonuses.luckBonus += a.abilityValue;
        break;
    }
  }

  bonuses.critChanceBonus = Math.min(bonuses.critChanceBonus, CRIT_CHANCE_CAP);
  bonuses.zoneThresholdReduction = Math.min(
    bonuses.zoneThresholdReduction,
    ZONE_THRESHOLD_REDUCTION_CAP
  );

  return bonuses;
}

export function emptyAbilityBonuses(): AbilityBonuses {
  return {
    productionBoostAll: 0,
    productionBoostSelf: {},
    tapValueFlat: 0,
    critChanceBonus: 0,
    comboMultiplierBonus: 0,
    comboDecayExtensionMs: 0,
    zoneThresholdReduction: 0,
    prestigeNectarBonus: 0,
    luckBonus: 0,
  };
}
