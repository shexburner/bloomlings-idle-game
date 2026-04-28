<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->
<!-- Source: docs/design/08-bloomling-abilities.md -->

# Bloomlings Game Design — Section 8: Bloomling Abilities (Compact Context)

> Auto-generated from the canonical source file. Edit the source markdown, then regenerate compact docs.

## Quick Map
- Design Intent
- 1. Ability Unlock Progression
- 2. Ability Types
  - 2.1 ProductionBoost
  - 2.2 TapBoost
  - 2.3 ComboBoost
  - 2.4 ZoneBoost
  - 2.5 PrestigeBoost
  - 2.6 Luck
- 3. Stacking Rules
  - 3.1 Same-Type Stacking: Additive
  - 3.2 Cross-Source Stacking: Multiplicative
  - 3.3 Why Additive Within, Multiplicative Across?
  - 3.4 Non-Production Ability Stacking
- 4. Interaction with Synergies
- 5. Ability Strength Values Per Rarity
  - 5.1 Production Boost
  - 5.2 Tap Boost
  - 5.3 Combo Boost
  - 5.4 Zone Boost
  - 5.5 Prestige Boost
  - 5.6 Elder Enhancement
- 6. Economy Balance Verification
  - 6.1 Worst-Case Production Stacking
  - 6.2 Mythic Edge Case
  - 6.3 Prestige Pacing Impact
  - 6.4 Zone Boost Cap Verification
- 7. Engine Architecture
  - 7.1 New Module: `src/engine/abilities.ts`
    - Core Types
    - Core Functions
  - 7.2 Integration Points
    - Production (`src/state/selectors.ts`)
    - Tap Value (`src/engine/tapSystem.ts`)
    - Combo Decay (`src/engine/tapSystem.ts`)
    - Zone Threshold (`src/state/selectors.ts`)
    - Rebirth Nectar (`src/state/selectors.ts`)
  - 7.3 Data Flow Diagram
  - 7.4 Backward Compatibility
- 8. Current Bloomling Ability Map
  - 8.1 Biome 1 — The Mossy Cradle
  - 8.2 Biome 2 — The Sunlit Glade
  - 8.3 Ability Distribution Analysis
- 9. Ability Flavor Text Guidelines
  - 9.1 Writing Principles
  - 9.2 Format Template
  - 9.3 Elder Description Convention
  - 9.4 Naming Conventions for Future Bloomlings
- 10. Future Considerations
  - 10.1 Ability Variants Not Yet Used
  - 10.2 Ability Sub-Type Encoding
  - 10.3 Ability Discovery UI
- Next Section

## Key Points
### Design Intent
- Every Bloomling should feel **mechanically unique**. Abilities are the system that delivers on this promise — they transform Bloomlings from interchangeable production units into characters with distinct strategic identities. Fernley doesn't just produce Sunlight; Fernley makes *everyone* produce more Sunlight. Briarthorn doesn't just sit in the Garden; Briarthorn makes your taps *crit more often*.

### 1. Ability Unlock Progression
- A Sprout Bloomling contributes only raw production. No strategic value beyond numbers.
- Reaching Bloom is the first meaningful decision point — the player now has a reason to care *which* Bloomling they evolved.
- Elder doubles the ability, making it a significant strategic asset and rewarding the Nectar investment required for Elder evolution.

### 2. Ability Types
- Six ability types cover the game's core systems. Each type has one or two mechanical variants.

### 2.1 ProductionBoost
- **What it does**: Increases Sunlight production passively while the Bloomling is in the Garden.

### 2.2 TapBoost
- **What it does**: Enhances the tap system — either raw tap value or critical tap chance.

### 2.3 ComboBoost
- **What it does**: Affects the combo system — either the combo multiplier itself or the decay timer.

### 2.4 ZoneBoost
- **What it does**: Reduces the Sunlight threshold required to clear zones.

### 2.5 PrestigeBoost
- **What it does**: Increases Nectar earned on Rebirth.

### 2.6 Luck
- **What it does**: Increases the frequency or value of random bonus events.

### 3. Stacking Rules
- When multiple Bloomlings with abilities are in the Garden, their bonuses combine according to these rules:

### 3.1 Same-Type Stacking: Additive
- Abilities of the **same type** stack **additively** with each other.

### 3.2 Cross-Source Stacking: Multiplicative
- The combined ability bonus is then **multiplicative** with other bonus sources:

### 3.3 Why Additive Within, Multiplicative Across?
- **Additive within type** prevents exponential blowup from stacking 4 ProductionBoost Bloomlings. The bonus grows linearly with each additional Bloomling.
- **Multiplicative across sources** rewards players who diversify their bonus sources (abilities + synergies + upgrades) rather than over-investing in one.
- This matches the existing synergy stacking model (synergies are multiplicative with upgrades) and keeps the math consistent.

### 3.4 Non-Production Ability Stacking
- Hard caps prevent degenerate cases (e.g., 50% crit chance cap means crits stay special; -30% zone threshold cap prevents zones from becoming trivial).

### 4. Interaction with Synergies
- A Bloomling can have an active ability AND participate in one or more synergies simultaneously.
- The ability bonus is computed from all Garden Bloomlings' abilities (additive within type).
- The synergy bonus is computed per-Bloomling from tag matches and named pairs (multiplicative across synergies, per the existing `synergies.ts` model).
- The two results multiply together in the final production formula.

### 5. Ability Strength Values Per Rarity
- Values at **Bloom** stage (base power). Elder doubles all values.

### 5.1 Production Boost
- (No concise bullet/summary found; use grep in source file for details.)

### 5.2 Tap Boost
- (No concise bullet/summary found; use grep in source file for details.)

### 5.3 Combo Boost
- (No concise bullet/summary found; use grep in source file for details.)

### 5.4 Zone Boost
- (No concise bullet/summary found; use grep in source file for details.)

### 5.5 Prestige Boost
- (No concise bullet/summary found; use grep in source file for details.)

### 5.6 Elder Enhancement
- At Elder stage, all values double. Selected examples:

### 6. Economy Balance Verification
- (No concise bullet/summary found; use grep in source file for details.)

### 6.1 Worst-Case Production Stacking
- Reaching 4 Elder Legendaries requires multiple Rebirths and massive Nectar investment. This is deep late-game.
- The 2.6× multiplier is comparable to having ~4 levels of the `enriched_soil` Nectar upgrade (each level = +25%, so 4 levels = 2.0×). Abilities are strong but not stronger than the prestige upgrade path.
- This scenario sacrifices all synergy diversity and all non-production abilities. A mixed garden with synergies, ZoneBoost, and TapBoost would progress faster in practice.
- The `docs/economy/03-bloomling-stats.md` §8.2 JavaScript safety check already accounts for ability stacking (1.35× assumed) and confirms values stay within `Number.MAX_SAFE_INTEGER`.

### 6.2 Mythic Edge Case
- **Scenario**: 4 Elder Mythic Bloomlings with ProductionBoost (all-garden).

### 6.3 Prestige Pacing Impact
- **Scenario**: A player with +24% Nectar bonus (single Elder Legendary PrestigeBoost) Rebirths at Zone 60.

### 6.4 Zone Boost Cap Verification
- **Scenario**: 4 Elder Rare ZoneBoost Bloomlings = 4 × (-6%) = -24% threshold reduction.

### 7. Engine Architecture
- (No concise bullet/summary found; use grep in source file for details.)

### 7.1 New Module: `src/engine/abilities.ts`
- A pure-function module following the same pattern as `src/engine/synergies.ts`. No side effects, no store access — just math.

### Core Types
- /** Aggregated ability bonuses for the current Garden. */

### Core Functions
- Get the ability power multiplier for a Bloomling's evolution stage.
- Sprout = 0 (dormant), Bloom = 1 (base), Elder = 2 (enhanced).
- Collect active abilities from all Garden Bloomlings.
- Filters out Sprout-stage Bloomlings (ability dormant).

### 7.2 Integration Points
- The `AbilityBonuses` object flows into existing selectors and systems at four points:

### Production (`src/state/selectors.ts`)
- In `totalSunlightPerSecond`, after computing synergy multipliers, apply ability bonuses:

### Tap Value (`src/engine/tapSystem.ts`)
- In `useTapHandler`, after computing `baseTapValue` via `selectEffectiveTapValue`:

### Combo Decay (`src/engine/tapSystem.ts`)
- The `COMBO_DECAY_MS` constant (1500ms) becomes the base. The effective decay window:

### Zone Threshold (`src/state/selectors.ts`)
- In `getZoneThreshold`:

### Rebirth Nectar (`src/state/selectors.ts`)
- In `calculateNectarOnRebirth`:

### 7.3 Data Flow Diagram
- Garden Bloomlings

### 7.4 Backward Compatibility
- `productionBoostAll = 0` → multiplier is `1 + 0 = 1×` → no change
- `tapValueFlat = 0` → no change to tap value
- `zoneThresholdReduction = 0` → multiplier is `1 - 0 = 1×` → no change

### 8. Current Bloomling Ability Map
- (No concise bullet/summary found; use grep in source file for details.)

### 8.1 Biome 1 — The Mossy Cradle
- (No concise bullet/summary found; use grep in source file for details.)

### 8.2 Biome 2 — The Sunlit Glade
- (No concise bullet/summary found; use grep in source file for details.)

### 8.3 Ability Distribution Analysis
- ProductionBoost: 4 (50%) — Fernley, Petaline, Solara, Honeyveil
- TapBoost: 2 (25%) — Mosswick (flat), Briarthorn (crit)
- ComboBoost: 1 (12.5%) — Dapplebark
- ZoneBoost: 1 (12.5%) — Thornwick

### 9. Ability Flavor Text Guidelines
- (No concise bullet/summary found; use grep in source file for details.)

### 9.1 Writing Principles
- **Mechanically precise** — the player must understand what the ability does from the description alone
- **Flavorful but brief** — one line, no jargon, personality-appropriate
- **Consistent in format** — always start with the effect sign (+/-), always include the scope

### 9.2 Format Template
- `+2% idle Sunlight production to all Garden Bloomlings` (Fernley)
- `+1 to base tap value` (Mosswick)
- `-3% zone Sunlight threshold for all zones` (Thornwick)
- `+0.3s to combo decay timer` (Dapplebark)

### 9.3 Elder Description Convention
- Elder descriptions use the same format with doubled values. The UI should display both Bloom and Elder values on the Bloomling detail card, with the Elder value shown as an upgrade preview (greyed out if not yet Elder).

### 9.4 Naming Conventions for Future Bloomlings
- **Match ability to personality** — a protective Bloomling gets ZoneBoost or TapBoost (crit), not Luck. A mysterious Bloomling gets Luck, not ProductionBoost.
- **Match ability to rarity** — Common/Uncommon get simple, universally useful abilities (ProductionBoost all, flat TapBoost). Rare+ get specialized abilities (ZoneBoost, crit chance, PrestigeBoost).
- **One ability per Bloomling** — no Bloomling has two ability types. The `abilityType` field is singular by design.
- **Values follow the rarity table** — never invent custom values. Use §5 tables. If a Rare Bloomling has ProductionBoost (all), its `abilityValue` is `0.08`. No exceptions.

### 10. Future Considerations
- (No concise bullet/summary found; use grep in source file for details.)

### 10.1 Ability Variants Not Yet Used
- ProductionBoost (self-only)
- ComboBoost (multiplier variant)
- Luck (bonus Sunlight drops)
- Luck (Lucky Sprout frequency)

### 10.2 Ability Sub-Type Encoding
- All-garden ProductionBoost: `abilityDescription` contains "all Garden Bloomlings"
- Self-only ProductionBoost: `abilityDescription` contains "own production"

### 10.3 Ability Discovery UI
- When a Bloomling first reaches Bloom stage, the ability unlock should be celebrated with a dedicated animation and explanation popup — similar to synergy discovery. This reinforces the "abilities matter" message and teaches the player what their new power does.

### Next Section
- See `docs/design/02-bloomling-mechanics.md` for the base Bloomling system, evolution, and synergies.
