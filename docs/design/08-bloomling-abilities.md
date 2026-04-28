# Bloomlings Game Design — Section 8: Bloomling Abilities

## Design Intent

Every Bloomling should feel **mechanically unique**. Abilities are the system that delivers on this promise — they transform Bloomlings from interchangeable production units into characters with distinct strategic identities. Fernley doesn't just produce Sunlight; Fernley makes *everyone* produce more Sunlight. Briarthorn doesn't just sit in the Garden; Briarthorn makes your taps *crit more often*.

Abilities are the second layer of Garden strategy (after synergies). A player choosing between two Bloomlings for their last Garden slot should be weighing ability type, not just raw production numbers.

---

## 1. Ability Unlock Progression

Abilities are gated by evolution stage to create a clear progression arc:

| Evolution Stage | Ability Status | Power Level |
|---|---|---|
| **Sprout** | Locked — no ability active | 0× (dormant) |
| **Bloom** | Unlocked — base power | 1× |
| **Elder** | Enhanced — double power | 2× |

This means:
- A Sprout Bloomling contributes only raw production. No strategic value beyond numbers.
- Reaching Bloom is the first meaningful decision point — the player now has a reason to care *which* Bloomling they evolved.
- Elder doubles the ability, making it a significant strategic asset and rewarding the Nectar investment required for Elder evolution.

The progression mirrors the "mini-prestige" feel of evolution itself: you invest heavily, reset to level 1, but gain something qualitatively new.

---

## 2. Ability Types

Six ability types cover the game's core systems. Each type has one or two mechanical variants.

### 2.1 ProductionBoost

**What it does**: Increases Sunlight production passively while the Bloomling is in the Garden.

| Variant | Effect | Scope |
|---|---|---|
| **All-garden** | +X% Sunlight/sec to every Garden Bloomling | Whole garden |
| **Self-only** | +X% to the Bloomling's own production | Single Bloomling |

All-garden is the more common variant (Fernley, Petaline, Solara, Honeyveil all use it). Self-only is reserved for higher-rarity Bloomlings where the raw production is already high enough that a self-buff is meaningful.

**Design note**: All-garden ProductionBoost is the "safe" ability — always useful, never wasted. It's intentionally the most common type in early biomes to teach players that abilities matter without requiring complex decision-making.

### 2.2 TapBoost

**What it does**: Enhances the tap system — either raw tap value or critical tap chance.

| Variant | Effect | Scope |
|---|---|---|
| **Base tap value** | +X flat added to base tap value | Additive to `baseTapValue` |
| **Crit chance** | +X% critical tap chance | Additive to `critChance` |

Mosswick uses the flat tap value variant (good for early game when base tap is low). Briarthorn uses the crit chance variant (scales better into late game because crits multiply everything).

**Design note**: TapBoost abilities reward active play. Players who tap frequently get more value from these Bloomlings, creating a meaningful choice between "idle-optimized" and "active-optimized" Garden compositions.

### 2.3 ComboBoost

**What it does**: Affects the combo system — either the combo multiplier itself or the decay timer.

| Variant | Effect | Scope |
|---|---|---|
| **Combo multiplier** | +X% to the combo multiplier formula | Multiplicative on combo |
| **Decay timer** | +Xs added to the combo decay window | Additive to `COMBO_DECAY_MS` |

Dapplebark uses the decay timer variant (+0.3s at Bloom, +0.6s at Elder). This is subtle but powerful: the base decay window is 1.5s, so a +0.6s Elder Dapplebark extends it to 2.1s — a 40% increase in the window, making it dramatically easier to maintain high combos.

**Design note**: ComboBoost is the "skill-expression" ability. It rewards players who understand the combo system and actively maintain their streak. Pairing ComboBoost with TapBoost Bloomlings creates a natural "active player" archetype.

### 2.4 ZoneBoost

**What it does**: Reduces the Sunlight threshold required to clear zones.

| Variant | Effect | Scope |
|---|---|---|
| **Threshold reduction** | -X% zone Sunlight threshold | All zones |

Thornwick uses this (-3% at Bloom, -6% at Elder). The zone threshold formula is `50 * 1.12^zoneNumber`, so a -6% reduction is equivalent to being ~0.5 zones ahead at all times. This compounds: at Zone 50, the threshold drops from ~14,462 to ~13,594, saving ~868 Sunlight per zone clear.

**Design note**: ZoneBoost is the "progression accelerator." It doesn't make you stronger — it makes the world weaker. This is psychologically satisfying and particularly valuable during gate zones where thresholds are already punishing.

### 2.5 PrestigeBoost

**What it does**: Increases Nectar earned on Rebirth.

| Variant | Effect | Scope |
|---|---|---|
| **Nectar bonus** | +X% Nectar earned on Rebirth | Applied during Rebirth calculation |

PrestigeBoost is a long-term investment ability. It does nothing during normal play — its value is realized only at the moment of Rebirth. This creates an interesting tension: do you slot a PrestigeBoost Bloomling for the eventual payoff, or use that Garden slot for something that helps you *right now*?

**Design note**: PrestigeBoost abilities must be in the Garden at the moment of Rebirth to apply. This prevents players from swapping them in at the last second (they need to have been contributing — or not contributing — to production the whole run).

### 2.6 Luck

**What it does**: Increases the frequency or value of random bonus events.

| Variant | Effect | Scope |
|---|---|---|
| **Bonus Sunlight drops** | +X% chance of bonus Sunlight orbs spawning | Passive, timed check |
| **Lucky Sprout frequency** | +X% increased Lucky Sprout appearance rate | Reduces Lucky Sprout interval |

Luck is the "surprise and delight" ability. It doesn't show up in any formula the player can calculate — it just makes good things happen more often. This is intentionally opaque to preserve the feeling of pleasant randomness.

**Design note**: Luck abilities should never be so strong that they feel mandatory. They're the "cherry on top" — nice to have, never required. The bonus Sunlight orbs are visual events (a glowing orb appears on screen, player taps it for a burst of Sunlight), reinforcing the game's tactile, garden-tending feel.

---

## 3. Stacking Rules

When multiple Bloomlings with abilities are in the Garden, their bonuses combine according to these rules:

### 3.1 Same-Type Stacking: Additive

Abilities of the **same type** stack **additively** with each other.

**Example**: Fernley (Elder, +4% all production) + Petaline (Elder, +8% all production) + Honeyveil (Bloom, +8% all production) = +20% total production bonus from abilities.

This is applied as a single multiplier: `1 + 0.04 + 0.08 + 0.08 = 1.20×`

### 3.2 Cross-Source Stacking: Multiplicative

The combined ability bonus is then **multiplicative** with other bonus sources:

```
finalProduction = baseProduction
  × abilityMultiplier        (from §3.1)
  × synergyMultiplier        (from tag/named synergies)
  × upgradeMultiplier        (from Nectar/Essence upgrades)
  × boostMultiplier          (from active ad boosts)
```

**Example**: A Bloomling producing 1,000 Sun/sec base, with +20% ability bonus, +15% synergy, and 2× Sunbeam Boost:
```
1,000 × 1.20 × 1.15 × 2.0 = 2,760 Sun/sec
```

### 3.3 Why Additive Within, Multiplicative Across?

- **Additive within type** prevents exponential blowup from stacking 4 ProductionBoost Bloomlings. The bonus grows linearly with each additional Bloomling.
- **Multiplicative across sources** rewards players who diversify their bonus sources (abilities + synergies + upgrades) rather than over-investing in one.
- This matches the existing synergy stacking model (synergies are multiplicative with upgrades) and keeps the math consistent.

### 3.4 Non-Production Ability Stacking

| Ability Type | Stacking Rule |
|---|---|
| TapBoost (flat) | Additive — sum all flat tap bonuses |
| TapBoost (crit chance) | Additive — sum all crit chance bonuses, hard cap at 50% |
| ComboBoost (decay timer) | Additive — sum all decay extensions |
| ComboBoost (multiplier) | Additive — sum all combo multiplier bonuses |
| ZoneBoost | Additive — sum all threshold reductions, hard cap at -30% |
| PrestigeBoost | Additive — sum all Nectar bonuses |
| Luck | Additive — sum all luck bonuses, soft cap via diminishing returns |

Hard caps prevent degenerate cases (e.g., 50% crit chance cap means crits stay special; -30% zone threshold cap prevents zones from becoming trivial).

---

## 4. Interaction with Synergies

Abilities and synergies are **independent systems** that multiply together.

- A Bloomling can have an active ability AND participate in one or more synergies simultaneously.
- The ability bonus is computed from all Garden Bloomlings' abilities (additive within type).
- The synergy bonus is computed per-Bloomling from tag matches and named pairs (multiplicative across synergies, per the existing `synergies.ts` model).
- The two results multiply together in the final production formula.

**Example**: Fernley (Elder) in a 2-Mossy tag synergy:
- Ability: +4% all production → contributes to the garden-wide ability multiplier
- Synergy: +15% production to Fernley specifically (tag: Mossy, 2-match)
- Fernley's production = `base × level × 9 × abilityMult × 1.15 × upgradeMult`

This means synergy-optimized gardens with good ability coverage are significantly stronger than either system alone, rewarding deep team-building.

---

## 5. Ability Strength Values Per Rarity

Values at **Bloom** stage (base power). Elder doubles all values.

### 5.1 Production Boost

| Rarity | All-Garden | Self-Only |
|---|---|---|
| Common | +2% | +10% |
| Uncommon | +4% | +20% |
| Rare | +8% | +40% |
| Epic | +12% | +60% |
| Legendary | +20% | +100% |
| Mythic | +35% | +200% |

### 5.2 Tap Boost

| Rarity | Base Tap Value | Crit Chance |
|---|---|---|
| Common | +1 | +0.5% |
| Uncommon | +3 | +1% |
| Rare | +8 | +2% |
| Epic | +20 | +4% |
| Legendary | +50 | +6% |
| Mythic | +150 | +10% |

### 5.3 Combo Boost

| Rarity | Decay Timer |
|---|---|
| Common | +0.2s |
| Uncommon | +0.3s |
| Rare | +0.5s |
| Epic | +0.8s |
| Legendary | +1.0s |
| Mythic | +1.5s |

### 5.4 Zone Boost

| Rarity | Threshold Reduction |
|---|---|
| Common | -1% |
| Uncommon | -2% |
| Rare | -3% |
| Epic | -5% |
| Legendary | -8% |
| Mythic | -12% |

### 5.5 Prestige Boost

| Rarity | Nectar Bonus |
|---|---|
| Common | +1% |
| Uncommon | +2% |
| Rare | +5% |
| Epic | +8% |
| Legendary | +12% |
| Mythic | +20% |

### 5.6 Elder Enhancement

At Elder stage, all values double. Selected examples:

| Ability | Common Elder | Rare Elder | Epic Elder | Legendary Elder | Mythic Elder |
|---|---|---|---|---|---|
| Production (all) | +4% | +16% | +24% | +40% | +70% |
| Crit Chance | +1% | +4% | +8% | +12% | +20% |
| Zone Boost | -2% | -6% | -10% | -16% | -24% |
| Prestige Boost | +2% | +10% | +16% | +24% | +40% |
| Combo Decay | +0.4s | +1.0s | +1.6s | +2.0s | +3.0s |

---

## 6. Economy Balance Verification

### 6.1 Worst-Case Production Stacking

**Scenario**: 4 Elder Legendary Bloomlings, all with ProductionBoost (all-garden variant), in a 4-slot garden.

```
Ability bonus = 4 × 40% = +160%
Ability multiplier = 1 + 1.60 = 2.60×
```

Each Legendary Elder Lv.100 produces `30 × 100 × 9 = 27,000 Sun/sec` base.

```
Per-Bloomling with abilities = 27,000 × 2.60 = 70,200 Sun/sec
Garden total = 4 × 70,200 = 280,800 Sun/sec
```

Without abilities: `4 × 27,000 = 108,000 Sun/sec`. The +160% ability bonus yields a 2.6× multiplier on total garden output.

**Is this balanced?** Yes, for several reasons:
- Reaching 4 Elder Legendaries requires multiple Rebirths and massive Nectar investment. This is deep late-game.
- The 2.6× multiplier is comparable to having ~4 levels of the `enriched_soil` Nectar upgrade (each level = +25%, so 4 levels = 2.0×). Abilities are strong but not stronger than the prestige upgrade path.
- This scenario sacrifices all synergy diversity and all non-production abilities. A mixed garden with synergies, ZoneBoost, and TapBoost would progress faster in practice.
- The `docs/economy/03-bloomling-stats.md` §8.2 JavaScript safety check already accounts for ability stacking (1.35× assumed) and confirms values stay within `Number.MAX_SAFE_INTEGER`.

### 6.2 Mythic Edge Case

**Scenario**: 4 Elder Mythic Bloomlings with ProductionBoost (all-garden).

```
Ability bonus = 4 × 70% = +280%
Ability multiplier = 1 + 2.80 = 3.80×
```

Each Mythic Elder Lv.100 = `100 × 100 × 9 = 90,000 Sun/sec`.

```
Garden total = 4 × 90,000 × 3.80 = 1,368,000 Sun/sec
```

This is extreme but acceptable: Mythic Bloomlings are Dewdrop-shop exclusives requiring significant ad engagement. A player who has 4 Elder Mythics has invested weeks of real time. The 3.8× multiplier is their reward.

### 6.3 Prestige Pacing Impact

**Scenario**: A player with +24% Nectar bonus (single Elder Legendary PrestigeBoost) Rebirths at Zone 60.

Base Nectar at Zone 60: `floor(10 × (60/40)^2.5) = floor(10 × 1.5^2.5) = floor(10 × 2.756) = 27 Nectar`

With +24% bonus: `floor(27 × 1.24) = 33 Nectar`

The +6 Nectar is meaningful but doesn't fundamentally change when the player should Rebirth. The optimal Rebirth zone is still determined by the exponential zone threshold curve, not the flat percentage bonus. A player won't Rebirth 10 zones earlier just for +24% — the zone threshold growth (1.12× per zone) dominates.

**Stacked scenario**: 4 Elder Legendary PrestigeBoost = +48% Nectar.
```
27 × 1.48 = 39 Nectar (vs. 27 base)
```

Still within bounds. The player sacrificed 4 Garden slots to non-production abilities, meaning they progressed slower to reach the same zone. The Nectar bonus compensates for the slower run, not accelerates it.

### 6.4 Zone Boost Cap Verification

**Scenario**: 4 Elder Rare ZoneBoost Bloomlings = 4 × (-6%) = -24% threshold reduction.

Zone 50 threshold: `50 × 1.12^50 = 14,462`
With -24%: `14,462 × 0.76 = 10,991`

This is equivalent to being at approximately Zone 47.5 instead of Zone 50. Meaningful but not game-breaking. The -30% hard cap prevents it from going further.

---

## 7. Engine Architecture

### 7.1 New Module: `src/engine/abilities.ts`

A pure-function module following the same pattern as `src/engine/synergies.ts`. No side effects, no store access — just math.

#### Core Types

```typescript
/** Aggregated ability bonuses for the current Garden. */
interface AbilityBonuses {
  /** Additive production bonus for all garden Bloomlings (e.g., 0.20 = +20%). */
  productionBoostAll: number;
  /** Per-Bloomling self-only production bonus, keyed by instanceId. */
  productionBoostSelf: Record<string, number>;
  /** Flat tap value bonus (additive). */
  tapValueFlat: number;
  /** Additive crit chance bonus (e.g., 0.04 = +4%). */
  critChanceBonus: number;
  /** Additive combo multiplier bonus. */
  comboMultiplierBonus: number;
  /** Additive combo decay extension in milliseconds. */
  comboDecayExtensionMs: number;
  /** Additive zone threshold reduction (e.g., 0.06 = -6%). */
  zoneThresholdReduction: number;
  /** Additive Nectar bonus on Rebirth (e.g., 0.12 = +12%). */
  prestigeNectarBonus: number;
  /** Additive luck bonus (e.g., 0.10 = +10% bonus drop chance). */
  luckBonus: number;
}
```

#### Core Functions

```typescript
/**
 * Get the ability power multiplier for a Bloomling's evolution stage.
 * Sprout = 0 (dormant), Bloom = 1 (base), Elder = 2 (enhanced).
 */
function getAbilityPower(stage: EvolutionStage): number;

/**
 * Collect active abilities from all Garden Bloomlings.
 * Filters out Sprout-stage Bloomlings (ability dormant).
 * Returns an array of { instanceId, template, power } tuples.
 */
function getActiveAbilities(
  gardenBloomlings: readonly Bloomling[],
  getTemplate: (templateId: string) => BloomlingTemplate | undefined
): ActiveAbility[];

/**
 * Compute the aggregated AbilityBonuses from active abilities.
 * Same-type bonuses are summed additively.
 * Hard caps applied: critChance ≤ 0.50, zoneThreshold ≤ 0.30.
 */
function computeAbilityBonuses(
  activeAbilities: readonly ActiveAbility[]
): AbilityBonuses;
```

### 7.2 Integration Points

The `AbilityBonuses` object flows into existing selectors and systems at four points:

#### Production (`src/state/selectors.ts`)

In `totalSunlightPerSecond`, after computing synergy multipliers, apply ability bonuses:

```
per-Bloomling production =
  baseProduction × level × evolutionMult
  × synergyMult
  × (1 + productionBoostAll + productionBoostSelf[instanceId])
```

The ability multiplier is a single additional factor in the existing per-Bloomling loop. The `totalSunlightPerSecondFromRegistry` function gains an `AbilityBonuses` parameter (or computes it internally from the garden state).

#### Tap Value (`src/engine/tapSystem.ts`)

In `useTapHandler`, after computing `baseTapValue` via `selectEffectiveTapValue`:

```
effectiveBaseTap = baseTapValue + abilityBonuses.tapValueFlat
effectiveCritChance = BASE_CRIT_CHANCE + upgradeCritChance + abilityBonuses.critChanceBonus
```

Both are additive — flat tap value adds to the base, crit chance adds to the upgrade-derived chance. The existing `calculateTapReward` function signature does not change; the caller passes adjusted values.

#### Combo Decay (`src/engine/tapSystem.ts`)

The `COMBO_DECAY_MS` constant (1500ms) becomes the base. The effective decay window:

```
effectiveDecayMs = COMBO_DECAY_MS + abilityBonuses.comboDecayExtensionMs
```

This is read in `shouldResetCombo` — either by passing the effective value as a parameter or by making `shouldResetCombo` accept an optional decay override.

#### Zone Threshold (`src/state/selectors.ts`)

In `getZoneThreshold`:

```
effectiveThreshold = baseThreshold × (1 - abilityBonuses.zoneThresholdReduction)
```

The reduction is capped at 0.30 inside `computeAbilityBonuses`, so the multiplier floor is 0.70.

#### Rebirth Nectar (`src/state/selectors.ts`)

In `calculateNectarOnRebirth`:

```
nectarEarned = floor(baseNectar × (1 + abilityBonuses.prestigeNectarBonus))
```

The bonus is computed from Garden Bloomlings at the moment of Rebirth. This requires the Rebirth action to snapshot the current ability bonuses before clearing the garden.

### 7.3 Data Flow Diagram

```
Garden Bloomlings
       │
       ├──→ synergies.ts:calculateActiveSynergies()
       │         → ActiveSynergies (per-Bloomling multipliers)
       │
       └──→ abilities.ts:getActiveAbilities()
             → abilities.ts:computeAbilityBonuses()
                   → AbilityBonuses (garden-wide aggregates)
                         │
                         ├──→ selectors.ts (production, zone, prestige)
                         └──→ tapSystem.ts (tap value, crit, combo decay)
```

Both systems read from the same Garden Bloomlings list. Both produce multipliers/bonuses. Both feed into the same downstream calculations. They do not interact with each other — they are parallel inputs to the final math.

### 7.4 Backward Compatibility

The `AbilityBonuses` object defaults to all-zero values when no abilities are active (all Sprouts, empty garden). This means:
- `productionBoostAll = 0` → multiplier is `1 + 0 = 1×` → no change
- `tapValueFlat = 0` → no change to tap value
- `zoneThresholdReduction = 0` → multiplier is `1 - 0 = 1×` → no change

Existing tests and game behavior are unaffected until abilities are actually active. No migration required for the engine — the new code path is purely additive.

---

## 8. Current Bloomling Ability Map

### 8.1 Biome 1 — The Mossy Cradle

| Bloomling | Rarity | Ability Type | Bloom Effect | Elder Effect | `abilityValue` |
|---|---|---|---|---|---|
| **Fernley** | Common | ProductionBoost (all) | +2% all production | +4% all production | `0.02` |
| **Mosswick** | Common | TapBoost (flat) | +1 base tap value | +2 base tap value | `1` |
| **Petaline** | Uncommon | ProductionBoost (all) | +4% all production | +8% all production | `0.04` |
| **Thornwick** | Rare | ZoneBoost | -3% zone threshold | -6% zone threshold | `0.03` |

### 8.2 Biome 2 — The Sunlit Glade

| Bloomling | Rarity | Ability Type | Bloom Effect | Elder Effect | `abilityValue` |
|---|---|---|---|---|---|
| **Solara** | Uncommon | ProductionBoost (all) | +4% all production | +8% all production | `0.04` |
| **Dapplebark** | Uncommon | ComboBoost (decay) | +0.3s decay timer | +0.6s decay timer | `0.3` |
| **Honeyveil** | Rare | ProductionBoost (all) | +8% all production | +16% all production | `0.08` |
| **Briarthorn** | Rare | TapBoost (crit) | +2% crit chance | +4% crit chance | `0.02` |

### 8.3 Ability Distribution Analysis

Current distribution across 8 Bloomlings:
- ProductionBoost: 4 (50%) — Fernley, Petaline, Solara, Honeyveil
- TapBoost: 2 (25%) — Mosswick (flat), Briarthorn (crit)
- ComboBoost: 1 (12.5%) — Dapplebark
- ZoneBoost: 1 (12.5%) — Thornwick
- PrestigeBoost: 0
- Luck: 0

ProductionBoost is intentionally over-represented in early biomes. It's the simplest ability to understand and the easiest to feel. PrestigeBoost and Luck are reserved for later biomes where the player has the mechanical literacy to appreciate them.

**Recommendation for Biome 3+**: Introduce PrestigeBoost and Luck abilities. Biome 3 (Twilight Hollow) is the natural home for a Luck Bloomling (thematic fit with mystery/darkness). Biome 4+ should include PrestigeBoost as players are deep into the Rebirth cycle by then.

---

## 9. Ability Flavor Text Guidelines

### 9.1 Writing Principles

Ability descriptions should be:
- **Mechanically precise** — the player must understand what the ability does from the description alone
- **Flavorful but brief** — one line, no jargon, personality-appropriate
- **Consistent in format** — always start with the effect sign (+/-), always include the scope

### 9.2 Format Template

```
[+/-][Value][Unit] [effect description] [scope]
```

**Examples**:
- `+2% idle Sunlight production to all Garden Bloomlings` (Fernley)
- `+1 to base tap value` (Mosswick)
- `-3% zone Sunlight threshold for all zones` (Thornwick)
- `+0.3s to combo decay timer` (Dapplebark)
- `+2% critical tap chance` (Briarthorn)

### 9.3 Elder Description Convention

Elder descriptions use the same format with doubled values. The UI should display both Bloom and Elder values on the Bloomling detail card, with the Elder value shown as an upgrade preview (greyed out if not yet Elder).

### 9.4 Naming Conventions for Future Bloomlings

When designing abilities for new Bloomlings:

1. **Match ability to personality** — a protective Bloomling gets ZoneBoost or TapBoost (crit), not Luck. A mysterious Bloomling gets Luck, not ProductionBoost.
2. **Match ability to rarity** — Common/Uncommon get simple, universally useful abilities (ProductionBoost all, flat TapBoost). Rare+ get specialized abilities (ZoneBoost, crit chance, PrestigeBoost).
3. **One ability per Bloomling** — no Bloomling has two ability types. The `abilityType` field is singular by design.
4. **Values follow the rarity table** — never invent custom values. Use §5 tables. If a Rare Bloomling has ProductionBoost (all), its `abilityValue` is `0.08`. No exceptions.
5. **Biome diversity** — each biome of 4 Bloomlings should cover at least 3 different ability types. Avoid biomes where all 4 Bloomlings have ProductionBoost.

---

## 10. Future Considerations

### 10.1 Ability Variants Not Yet Used

The following ability variants exist in the type system but have no Bloomling assigned yet:

- ProductionBoost (self-only)
- ComboBoost (multiplier variant)
- Luck (bonus Sunlight drops)
- Luck (Lucky Sprout frequency)
- PrestigeBoost (Nectar bonus)

These are reserved for Biomes 3-8. The `AbilityType` enum and `abilityValue` field already support them — no type changes needed.

### 10.2 Ability Sub-Type Encoding

The current `BloomlingTemplate` has a single `abilityType` and `abilityValue`. For variants within a type (e.g., ProductionBoost all-garden vs. self-only), the variant is determined by convention:
- All-garden ProductionBoost: `abilityDescription` contains "all Garden Bloomlings"
- Self-only ProductionBoost: `abilityDescription` contains "own production"

For the engine, the variant distinction can be encoded in `abilities.ts` via a lookup table keyed by template ID, or by adding an optional `abilitySubType` field to `BloomlingTemplate` in a future iteration. The current 8 Bloomlings all use unambiguous variants, so this is not blocking.

### 10.3 Ability Discovery UI

When a Bloomling first reaches Bloom stage, the ability unlock should be celebrated with a dedicated animation and explanation popup — similar to synergy discovery. This reinforces the "abilities matter" message and teaches the player what their new power does.

---

## Next Section

See `docs/design/02-bloomling-mechanics.md` for the base Bloomling system, evolution, and synergies.
See `docs/economy/03-bloomling-stats.md` for the full economy balance sheet including ability strength tables.
