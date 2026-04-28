// =============================================================================
// Perk Templates — Dewdrop shop item registry
// =============================================================================
// Static catalog of every perk available in the Dewdrop shop. Prices and
// effects are sourced from docs/design/05-ad-economy.md §What Can Dewdrops Buy.
//
// Cosmetic and Exclusive-Bloomling entries from the design doc are NOT
// shipped here — they require asset pipelines / new Bloomling templates
// that are out of scope for this slice. Auto-Tap is also deferred; it
// needs its own engine work.
//
// Every perk ID exported here is wired into engine code:
//   • dewdrop_bonus_slot  → src/engine/garden.ts (DEWDROP_SLOT_PERK_ID)
//   • offline_boost       → src/engine/offlineProgress.ts (getOfflineEfficiency)
//   • zone_skip           → consumable; invokes store.advanceZone()
//   • rebirth_boost       → consumable; consumed by prestigeSlice.executeRebirth
//   • evolution_shard     → consumable; consumed by bloomlingSlice.evolveBloomling
// =============================================================================

/** Perk IDs referenced by engine code. Keep in sync with engine modules. */
export const PERK_ID = {
  ExtraGardenSlot: "dewdrop_bonus_slot",
  OfflineBoost: "offline_boost",
  ZoneSkip: "zone_skip",
  RebirthBoost: "rebirth_boost",
  EvolutionShard: "evolution_shard",
  AutoTapSlow: "auto_tap_slow",
  AutoTapFast: "auto_tap_fast",
} as const;

export type PerkCategory = "permanent" | "consumable";

/** Static template describing a perk offered in the Dewdrop shop. */
export interface PerkTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly cost: number;
  readonly category: PerkCategory;
  /** Short label shown on the card badge (e.g. "QoL", "Boost", "One-Time"). */
  readonly badge: string;
}

/** Offline Boost raises offline efficiency floor from 50% to 75%. */
export const OFFLINE_BOOST_EFFICIENCY = 0.75;

/** Instant Rebirth Boost: +50% Nectar on the next Rebirth. */
export const REBIRTH_BOOST_MULTIPLIER = 1.5;

/** Evolution Shard: next evolution costs 50% of normal. */
export const EVOLUTION_SHARD_DISCOUNT = 0.5;

export const PERK_TEMPLATES: readonly PerkTemplate[] = [
  // --- Permanent perks --------------------------------------------------
  {
    id: PERK_ID.ExtraGardenSlot,
    name: "Extra Garden Slot",
    description:
      "Permanently adds one Garden slot. Stacks with every other slot source.",
    cost: 75,
    category: "permanent",
    badge: "QoL",
  },
  {
    id: PERK_ID.OfflineBoost,
    name: "Offline Boost",
    description:
      "Lifts offline earning efficiency from 50% to 75% forever. Stacks multiplicatively with Cosmic Roots.",
    cost: 40,
    category: "permanent",
    badge: "QoL",
  },
  // --- Consumables ------------------------------------------------------
  {
    id: PERK_ID.ZoneSkip,
    name: "Zone Skip",
    description:
      "Instantly clear the current zone. Useful when stuck before a gate or boss timer recovers.",
    cost: 3,
    category: "consumable",
    badge: "One-Time",
  },
  {
    id: PERK_ID.RebirthBoost,
    name: "Instant Rebirth Boost",
    description:
      "Your next Rebirth grants +50% Nectar. Consumed automatically on Rebirth.",
    cost: 5,
    category: "consumable",
    badge: "One-Time",
  },
  {
    id: PERK_ID.EvolutionShard,
    name: "Evolution Shard",
    description:
      "Cuts the Sunlight and Nectar cost of your next evolution in half. Consumed on use.",
    cost: 8,
    category: "consumable",
    badge: "One-Time",
  },
  // --- Auto-Tap perks ---------------------------------------------------
  {
    id: PERK_ID.AutoTapSlow,
    name: "Auto-Tap (Slow)",
    description:
      "Automatically taps 2 times per second while the app is open. Does not build combo.",
    cost: 50,
    category: "permanent",
    badge: "QoL",
  },
  {
    id: PERK_ID.AutoTapFast,
    name: "Auto-Tap (Fast)",
    description:
      "Automatically taps 5 times per second. Replaces Slow. Does not build combo.",
    cost: 150,
    category: "permanent",
    badge: "QoL",
  },
];

export const PERK_TEMPLATE_MAP: Record<string, PerkTemplate> = Object.fromEntries(
  PERK_TEMPLATES.map((t) => [t.id, t])
);
