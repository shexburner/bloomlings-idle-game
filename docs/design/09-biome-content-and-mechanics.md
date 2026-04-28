# Bloomlings Game Design — Section 9: Biome Content & Mechanics

## Overview

This document covers the integration of Biomes 3–8 Bloomling data into code and the unique per-biome gameplay mechanics. It is written from the combined perspective of the Game Designer, Engine Developer, Content Creator, and UI/UX Developer.

Biomes 1–2 (The Mossy Cradle, The Sunlit Glade) are fully implemented in `bloomlingTemplates.ts` and `synergies.ts`. Biomes 3–4 (Twilight Hollow, Crystal Caverns) are pre-Transcendence content. Biomes 5–8 (Scorched Expanse, Abyssal Depths, Celestial Canopy, Frozen Thicket) are post-Transcendence endgame content. The `BiomeType` enum in `src/types/game.ts` already declares all 8 biomes.

---

## Part 1 — Content Creator

### 1.1 Bloomling Registry: Biomes 3–8

Every Bloomling below must be added to `BLOOMLING_TEMPLATES` in `src/data/bloomlingTemplates.ts`. Economy values (`baseProduction`, `baseLevelCost`) follow the rarity table in `docs/economy/03-bloomling-stats.md` and match the conventions already used in the existing 8 templates (Common: 1/10, Uncommon: 2/40, Rare: 5/200, Epic: 12/1000, Legendary: 30/5000, Mythic: 100/50000).

#### Biome 3 — The Twilight Hollow (Zones 51–75)

| ID | Name | Rarity | Ability | AbilityType | Value | Tags | Unlock |
|---|---|---|---|---|---|---|---|
| `glowcap` | Glowcap | Uncommon | +4% Sunlight production | ProductionBoost | 0.04 | Luminous, Fungal | `zone_55` |
| `lumivine` | Lumivine | Rare | +8% Sunlight production | ProductionBoost | 0.08 | Luminous, Verdant | `zone_60` |
| `nightbloom` | Nightbloom | Epic | -5% zone threshold | ZoneBoost | 0.05 | Radiant, Thorned | `zone_68` |
| `deeproot` | Deeproot | Epic | +12% Sunlight production | ProductionBoost | 0.12 | Mossy, Stonekin | `boss_biome3` |

#### Biome 4 — The Crystal Caverns (Zones 76–100)

| ID | Name | Rarity | Ability | AbilityType | Value | Tags | Unlock |
|---|---|---|---|---|---|---|---|
| `crystalbloom` | Crystalbloom | Rare | +8% Sunlight production | ProductionBoost | 0.08 | Radiant, Stonekin | `zone_80` |
| `gemsprout` | Gemsprout | Epic | +4% critical tap chance | TapBoost | 0.04 | Radiant, Luminous | `zone_88` |
| `prismaflora` | Prismaflora | Legendary | +20% Sunlight production | ProductionBoost | 0.20 | Radiant, Luminous | `boss_biome4` |

#### Biome 5 — The Scorched Expanse (Zones 101–125)

| ID | Name | Rarity | Ability | AbilityType | Value | Tags | Unlock |
|---|---|---|---|---|---|---|---|
| `cinderbloom` | Cinderbloom | Uncommon | +4% Sunlight production | ProductionBoost | 0.04 | Floral, Embered | `zone_105` |
| `magmaroot` | Magmaroot | Rare | +8% Sunlight production | ProductionBoost | 0.08 | Stonekin, Embered | `zone_112` |
| `ashveil` | Ashveil | Epic | -5% zone threshold | ZoneBoost | 0.05 | Embered, Luminous | `zone_118` |
| `pyranthus` | Pyranthus | Epic | +12% Sunlight production | ProductionBoost | 0.12 | Embered, Radiant | `boss_biome5` |

#### Biome 6 — The Abyssal Depths (Zones 126–150)

| ID | Name | Rarity | Ability | AbilityType | Value | Tags | Unlock |
|---|---|---|---|---|---|---|---|
| `coralchime` | Coralchime | Uncommon | +0.5s combo decay timer | ComboBoost | 0.5 | Tidal, Luminous | `zone_130` |
| `abyssvine` | Abyssvine | Rare | +8% Sunlight production | ProductionBoost | 0.08 | Tidal, Verdant | `zone_137` |
| `pearlcrest` | Pearlcrest | Epic | +12% Sunlight production | ProductionBoost | 0.12 | Tidal, Radiant | `zone_143` |
| `tidalwarden` | Tidalwarden | Epic | +4% critical tap chance | TapBoost | 0.04 | Tidal, Stonekin | `boss_biome6` |

#### Biome 7 — The Celestial Canopy (Zones 151–175)

| ID | Name | Rarity | Ability | AbilityType | Value | Tags | Unlock |
|---|---|---|---|---|---|---|---|
| `zephyrbud` | Zephyrbud | Uncommon | +4% Sunlight production | ProductionBoost | 0.04 | Floral, Aerial | `zone_155` |
| `skybloom` | Skybloom | Rare | +8% Sunlight production | ProductionBoost | 0.08 | Aerial, Radiant | `zone_162` |
| `cloudweaver` | Cloudweaver | Epic | -5% zone threshold | ZoneBoost | 0.05 | Aerial, Luminous | `zone_168` |
| `aethervane` | Aethervane | Epic | +12% Sunlight production | ProductionBoost | 0.12 | Aerial, Thorned | `boss_biome7` |

#### Biome 8 — The Frozen Thicket (Zones 176–200)

| ID | Name | Rarity | Ability | AbilityType | Value | Tags | Unlock |
|---|---|---|---|---|---|---|---|
| `frostpetal` | Frostpetal | Uncommon | +4% Sunlight production | ProductionBoost | 0.04 | Floral, Glacial | `zone_180` |
| `hollowpine` | Hollowpine | Rare | +8% Sunlight production | ProductionBoost | 0.08 | Glacial, Verdant | `zone_187` |
| `aurorabloom` | Aurorabloom | Epic | +12% Sunlight production | ProductionBoost | 0.12 | Glacial, Luminous | `zone_193` |
| `permafrost` | Permafrost | Epic | +4% critical tap chance | TapBoost | 0.04 | Glacial, Stonekin | `boss_biome8` |

### 1.2 Legendary & Mythic Bloomlings

These Bloomlings have no native biome (`BiomeType` field should use a new `Universal` value, or the template can omit biome and use `null`). Since the current `BloomlingTemplate` interface requires a `BiomeType`, the recommended approach is to add a `Universal = "universal"` variant to the `BiomeType` enum.

| ID | Name | Rarity | Ability | AbilityType | Value | Tags | Unlock Method | Unlock Condition |
|---|---|---|---|---|---|---|---|---|
| `solstara` | Solstara | Legendary | +20% Sunlight production | ProductionBoost | 0.20 | Radiant, Luminous | Discovery | Zone 150 + 1 Bloomling from each biome 1–6 |
| `worldroot` | Worldroot | Legendary | +20% Sunlight production | ProductionBoost | 0.20 | Mossy, Verdant | Achievement | Defeat all 8 Biome Bosses |
| `eclipsyn` | Eclipsyn | Mythic | +35% Sunlight production | ProductionBoost | 0.35 | Radiant, Luminous | PrestigeUnlock | 3 Transcendences + Zone 200 |
| `bloommother` | Bloommother | Mythic | +35% Sunlight production | ProductionBoost | 0.35 | Verdant, Floral | Discovery | Complete the entire Codex |

**Unlock condition encoding:**
- Solstara: `unlockCondition: "zone_150_all_biomes"` — requires a new `parseUnlockCondition` branch in `discovery.ts`
- Worldroot: `unlockCondition: "all_bosses"` — triggered by the achievement system
- Eclipsyn: `unlockCondition: "transcend_3_zone_200"` — requires prestige + zone check
- Bloommother: `unlockCondition: "codex_complete"` — triggered when every other Bloomling is unlocked

### 1.3 New Synergy Tags

Biomes 3–8 introduce the following new tags not present in biomes 1–2:

| Tag | Biomes | Bloomlings |
|---|---|---|
| **Fungal** | 3 | Glowcap |
| **Embered** | 5 | Cinderbloom, Magmaroot, Ashveil, Pyranthus |
| **Tidal** | 6 | Coralchime, Abyssvine, Pearlcrest, Tidalwarden |
| **Aerial** | 7 | Zephyrbud, Skybloom, Cloudweaver, Aethervane |
| **Glacial** | 8 | Frostpetal, Hollowpine, Aurorabloom, Permafrost |
| **Pollinator** | (2, existing) | Honeyveil (already in code) |

Existing tags that gain new members: Luminous, Radiant, Verdant, Stonekin, Mossy, Thorned, Floral.

### 1.4 Named Synergies to Add

All synergies below must be added to `NAMED_SYNERGIES` in `src/engine/synergies.ts`.

#### Biome 3 — Intra-biome

| ID | Name | Pair | Production Bonus | Tap Bonus |
|---|---|---|---|---|
| `synergy_hollow_lanterns` | Hollow Lanterns | glowcap + lumivine | 0.15 | 0 |
| `synergy_twilight_vigil` | Twilight Vigil | nightbloom + deeproot | 0.15 | 0 |
| `synergy_living_cathedral` | Living Cathedral | lumivine + deeproot | 0.10 (idle) | 0 |

#### Biome 4 — Intra-biome

| ID | Name | Pair | Production Bonus | Tap Bonus |
|---|---|---|---|---|
| `synergy_faceted_harmony` | Faceted Harmony | crystalbloom + gemsprout | 0.15 | 0 |
| `synergy_prismatic_resonance` | Prismatic Resonance | gemsprout + prismaflora | 0.15 | 0 |
| `synergy_crystal_cathedral` | Crystal Cathedral | crystalbloom + prismaflora | 0.10 (idle) | 0 |

#### Biome 5 — Intra-biome

| ID | Name | Pair | Production Bonus | Tap Bonus |
|---|---|---|---|---|
| `synergy_ember_and_ash` | Ember and Ash | cinderbloom + ashveil | 0.15 | 0 |
| `synergy_volcanic_core` | Volcanic Core | magmaroot + pyranthus | 0.15 | 0 |
| `synergy_obsidian_garden` | Obsidian Garden | ashveil + magmaroot | 0.10 (idle) | 0 |

#### Biome 6 — Intra-biome

| ID | Name | Pair | Production Bonus | Tap Bonus |
|---|---|---|---|---|
| `synergy_deep_chorus` | Deep Chorus | coralchime + abyssvine | 0.15 | 0 |
| `synergy_abyssal_crown` | Abyssal Crown | pearlcrest + tidalwarden | 0.15 | 0 |
| `synergy_pressure_garden` | Pressure Garden | abyssvine + tidalwarden | 0.10 (idle) | 0 |

#### Biome 7 — Intra-biome

| ID | Name | Pair | Production Bonus | Tap Bonus |
|---|---|---|---|---|
| `synergy_wind_and_wonder` | Wind and Wonder | zephyrbud + cloudweaver | 0.15 | 0 |
| `synergy_starbound` | Starbound | skybloom + aethervane | 0.15 | 0 |
| `synergy_cloud_garden` | Cloud Garden | cloudweaver + skybloom | 0.10 (idle) | 0 |

#### Biome 8 — Intra-biome

| ID | Name | Pair | Production Bonus | Tap Bonus |
|---|---|---|---|---|
| `synergy_winter_bloom` | Winter Bloom | frostpetal + aurorabloom | 0.15 | 0 |
| `synergy_frozen_vigil` | Frozen Vigil | hollowpine + permafrost | 0.15 | 0 |
| `synergy_thicket_heart` | Thicket Heart | hollowpine + frostpetal | 0.10 (idle) | 0 |

#### Cross-Biome Synergies

| ID | Name | Pair | Production Bonus | Tap Bonus |
|---|---|---|---|---|
| `synergy_root_and_crown` | Root and Crown | deeproot + dapplebark | 0.20 | 0 |
| `synergy_borrowed_light` | Borrowed Light | lumivine + solara | 0.15 (idle) | 0 |
| `synergy_light_unbroken` | Light Unbroken | prismaflora + lumivine | 0.20 | 0 |
| `synergy_stone_remembers` | Stone Remembers | crystalbloom + mosswick | 0.15 (idle) | 0 |
| `synergy_fire_and_moonlight` | Fire and Moonlight | pyranthus + nightbloom | 0.20 | 0 |
| `synergy_tempered_crystal` | Tempered Crystal | cinderbloom + crystalbloom | 0.15 (idle) | 0 |
| `synergy_fire_and_water` | Fire and Water | tidalwarden + pyranthus | 0.20 | 0 |
| `synergy_pearl_and_prism` | Pearl and Prism | pearlcrest + prismaflora | 0.15 (idle) | 0 |
| `synergy_sky_and_deep` | Sky and Deep | aethervane + tidalwarden | 0.20 | 0 |
| `synergy_drifting_light` | Drifting Light | zephyrbud + glowcap | 0.15 (idle) | 0 |
| `synergy_fire_and_ice` | Fire and Ice | permafrost + pyranthus | 0.20 | 0 |
| `synergy_aurora_and_prism` | Aurora and Prism | aurorabloom + prismaflora | 0.15 (idle) | 0 |

#### Legendary & Mythic Synergies

| ID | Name | Pair | Production Bonus | Tap Bonus |
|---|---|---|---|---|
| `synergy_twin_pillars` | Twin Pillars | solstara + worldroot | 0.20 | 0 |
| `synergy_eclipse_garden` | Eclipse Garden | eclipsyn + bloommother | 0.25 | 0 |
| `synergy_alpha_and_omega` | Alpha and Omega | bloommother + fernley | 0.30 | 0 |
| `synergy_eternal_dawn` | Eternal Dawn | eclipsyn + solstara | 0.25 | 0 |

---

## Part 2 — Game Designer: Per-Biome Mechanics

Each biome (except Biome 1, which is a pure learning environment) has a unique mechanic that activates while the player's current zone falls within that biome's range. Mechanics are mutually exclusive — only the current biome's mechanic is active. On Rebirth, the player returns to Zone 1 and re-encounters each mechanic as they push through.

### 2.1 Biome 1 — The Mossy Cradle (Zones 1–25)

**Mechanic: None.** Pure tutorial environment. No special mechanic — the player learns tapping, idle production, Bloomling placement, and zone progression.

### 2.2 Biome 2 — Sunbursts (Zones 26–50)

**Core concept:** Random golden orbs appear on the Garden screen during active gameplay. Tapping one grants a burst of bonus Sunlight equal to 2× the current zone's threshold.

**Parameters:**

| Parameter | Value | Notes |
|---|---|---|
| Spawn interval | 15–30s (random uniform) | Foreground only; timer pauses on background |
| Duration on screen | 4s | Orb fades in over 0.3s, holds 3.4s, fades out over 0.3s |
| Tap reward | 2× current zone Sunlight threshold | Applied instantly to zone progress |
| Max concurrent orbs | 1 | New orb cannot spawn while one is visible |
| Spawn position | Random within Garden viewport | Avoid overlap with Garden slots and bottom nav; min 60px from edges |
| Visual | Golden sphere, 48×48dp, soft pulsing glow animation | Particle trail of tiny golden motes |
| Sound | Soft chime on spawn; brighter chime + sparkle on tap | Reuse existing reward SFX family |
| Miss penalty | None | Orb simply fades; no negative feedback |

**Design rationale:** Sunbursts reward attentive active play without punishing idle players. The 2× threshold reward is meaningful in early Biome 2 but becomes proportionally less impactful as idle production scales, keeping it a pleasant bonus rather than a required grind.

### 2.3 Biome 3 — Luminescence (Zones 51–75)

**Core concept:** Bloomlings in the Garden slowly charge a Glow Meter. When the meter is full, the player can tap it to instantly receive 60 seconds of idle income.

**Parameters:**

| Parameter | Value | Notes |
|---|---|---|
| Charge rate | 1% per Garden Bloomling per 10s | 5 Bloomlings in Garden = 5% per 10s = full in ~200s |
| Meter size | 100 units | Displayed as a vertical bar on the left edge of the Garden screen |
| Cooldown after activation | 120s | Meter is greyed out and shows countdown |
| Reward on tap | 60s × current idle Sunlight/sec | Calculated at moment of tap, includes all active boosts |
| Auto-decay | None | Meter holds at 100% indefinitely until tapped |
| Charge while backgrounded | No | Meter only charges during foreground ticks |
| Visual | Vertical bar, teal-to-violet gradient matching Twilight Hollow palette | Pulses gently when full; firefly particles orbit the bar |
| Sound | Soft hum while charging; resonant chime burst on activation |

**Design rationale:** Luminescence creates a "check back" loop — the player is rewarded for returning to the app and tapping the meter. The 60s idle income burst is generous enough to feel exciting but bounded enough to not break the economy. The charge rate scales with Garden size, rewarding players who fill their Garden slots.

### 2.4 Biome 4 — Resonance (Zones 76–100)

**Core concept:** Each tap creates an "echo" that bounces off crystal formations and generates additional Sunlight. Effectively +30% tap value while in this biome.

**Parameters:**

| Parameter | Value | Notes |
|---|---|---|
| Echo bonus | +30% of the tap's Sunlight value | Applied per-tap, after all other tap multipliers |
| Echo delay | 300ms after the originating tap | Visual only — the bonus Sunlight is applied immediately for responsiveness |
| Echo visual | A smaller, translucent copy of the tap ripple that travels from the tap point to the nearest crystal formation, then bursts | Crystal formations are part of the Biome 4 background |
| Echo sound | Crystalline ping, pitch-shifted slightly per echo | 3–4 pitch variants to avoid repetition |
| Interaction with combo | Echoes do NOT generate combo hits | Prevents infinite combo escalation |
| Interaction with critical taps | Critical taps produce a larger, brighter echo | Echo bonus is calculated on the post-crit value |

**Design rationale:** Resonance makes tapping feel more impactful in the Crystal Caverns, matching the biome's theme of light bouncing through crystal. The +30% is a flat multiplier that doesn't compound with itself, keeping it predictable. The visual echo delay creates a satisfying "cascade" feel without affecting gameplay timing.

### 2.5 Biome 5 — Eruption Surge (Zones 101–125)

**Theme:** Volcanic / Scorched Expanse

**Core concept:** The volcanic ground periodically erupts, creating a brief "Eruption Surge" window where all Sunlight production (tap + idle) is multiplied by 2× for a short burst, but idle production drops to 50% between surges.

**Parameters:**

| Parameter | Value | Notes |
|---|---|---|
| Surge interval | Every 45s | Foreground only |
| Surge duration | 8s | 2× all Sunlight production during this window |
| Between-surge penalty | 0.5× idle production | Tap value is unaffected between surges |
| Visual | Screen edges glow molten orange during surge; lava cracks appear in the ground | Subtle heat shimmer between surges |
| Sound | Low rumble building to eruption; triumphant brass hit during surge |
| Warning | 3s countdown before surge (ground trembles, cracks glow brighter) |

**Design rationale:** Eruption Surge creates a rhythm of anticipation and payoff. The between-surge idle penalty means the biome's net idle output is slightly below baseline (~85% average), but active players who tap during surges come out significantly ahead. This matches the Scorched Expanse's hostile-but-rewarding theme.

**Net economy impact:** Over a 45s cycle: 37s at 0.5× idle + 8s at 2× idle = (37×0.5 + 8×2) / 45 = 0.77× average idle. Active tapping during surges compensates. Tuning lever: adjust surge duration or between-surge penalty.

### 2.6 Biome 6 — Pressure Tide (Zones 126–150)

**Theme:** Underwater / Abyssal Depths

**Core concept:** A "Pressure" gauge builds over time. The player can release it at any moment for a Sunlight burst proportional to how full the gauge is — but if it hits 100%, it auto-releases at reduced efficiency. Rewards patience and timing.

**Parameters:**

| Parameter | Value | Notes |
|---|---|---|
| Pressure fill rate | 1% per second (foreground only) | Full in 100s |
| Manual release reward | `pressurePercent × 0.8 × (60s idle income)` | At 80% pressure: 0.8 × 0.8 × 60s = 38.4s idle income |
| Auto-release at 100% | 0.5 × (60s idle income) | Penalty for not paying attention |
| Optimal release window | 75–90% | Reward curve peaks here; exact formula: `min(percent/100, 1) × (1 - 0.3 × max(0, (percent-90)/10))` |
| Cooldown after release | 30s | Gauge is empty and greyed out |
| Visual | Circular pressure gauge, deep blue with bioluminescent bubbles rising as it fills | Gauge cracks and leaks light above 90% |
| Sound | Deep underwater ambience; rising pitch as pressure builds; satisfying "whoosh" on release |

**Design rationale:** Pressure Tide is a risk/reward timing mechanic that fits the deep-sea theme. It rewards engaged players who watch the gauge and release at the sweet spot, while the auto-release safety net ensures AFK players aren't punished too harshly. The 30s cooldown keeps the rhythm manageable.

### 2.7 Biome 7 — Windfall (Zones 151–175)

**Theme:** Sky / Celestial Canopy

**Core concept:** Wind currents periodically sweep across the screen carrying "Star Motes" — small collectible particles. Each mote tapped adds a stacking buff to idle production. The buff decays over time, creating a "catch as many as you can" mini-game.

**Parameters:**

| Parameter | Value | Notes |
|---|---|---|
| Windfall event interval | Every 60s | Foreground only |
| Event duration | 10s | Star Motes drift across the screen during this window |
| Motes per event | 8–12 (random) | Spawn from the right edge, drift left at varying speeds |
| Buff per mote caught | +5% idle production (stacking) | 10 motes = +50% idle production |
| Buff duration | 30s from last mote caught | Refreshed by each catch; decays all at once when timer expires |
| Mote size | 32×32dp | Small enough to require precision, large enough to be tappable |
| Mote hit area | 48×48dp | Generous touch target |
| Visual | Glowing star-shaped particles with trailing light ribbons; wind streaks across the background during events |
| Sound | Gentle wind whoosh on event start; soft twinkle per mote caught; ascending chime scale as stack grows |

**Design rationale:** Windfall turns the Celestial Canopy into a playful, skill-rewarding biome. The stacking buff creates a satisfying "high score" feel within each event, and the 60s interval keeps it from being overwhelming. The buff is purely additive to idle production, so it doesn't interact with tap value or break the combo system.

### 2.8 Biome 8 — Thaw Cycle (Zones 176–200)

**Theme:** Tundra / Frozen Thicket

**Core concept:** The Garden is under a "Frost" effect that slowly reduces idle production over time. Tapping generates "Warmth" that pushes back the frost. Maintaining a balance between tapping and idle creates an optimal production state. Reaching full Warmth triggers a "Thaw Bloom" burst.

**Parameters:**

| Parameter | Value | Notes |
|---|---|---|
| Frost accumulation | -2% idle production per 10s (uncapped at -50%) | Foreground only; resets on zone change |
| Warmth per tap | +1% (added to a Warmth gauge, 0–100%) | Warmth decays at 1% per 3s when not tapping |
| Warmth → idle bonus | At 50%+ Warmth: frost accumulation paused | At 80%+: +20% idle production bonus |
| Thaw Bloom trigger | Warmth reaches 100% | Instant burst of 90s idle income; Warmth resets to 50%; frost resets to 0% |
| Thaw Bloom cooldown | 60s before Warmth can reach 100% again | Gauge caps at 99% during cooldown |
| Visual | Frost crystals creep across screen edges as frost builds; warm golden glow radiates from tap point; Thaw Bloom is a dramatic ice-shattering burst with aurora colors |
| Sound | Creaking ice ambience; warm crackling per tap; triumphant crystalline shatter on Thaw Bloom |

**Design rationale:** Thaw Cycle is the most mechanically complex biome, appropriate for the final biome in the game. It creates a constant push-pull between frost and warmth that rewards consistent engagement. The Thaw Bloom burst is the biggest single reward in the biome mechanic system (90s idle income), but requires sustained active play to trigger. This matches the Frozen Thicket's narrative of patient warmth overcoming ancient cold.

### 2.9 Biome Mechanic Summary

| Biome | Mechanic | Play Style | Net Economy Impact |
|---|---|---|---|
| 1 Mossy Cradle | None | Tutorial | Baseline |
| 2 Sunlit Glade | Sunbursts | Reactive tap | +10–15% (attentive) |
| 3 Twilight Hollow | Luminescence | Check-back loop | +15–20% (timed taps) |
| 4 Crystal Caverns | Resonance | Active tap | +30% tap value (flat) |
| 5 Scorched Expanse | Eruption Surge | Burst windows | +20% (active during surges) |
| 6 Abyssal Depths | Pressure Tide | Timing/patience | +15–25% (optimal release) |
| 7 Celestial Canopy | Windfall | Collection mini-game | +20–30% (skill-dependent) |
| 8 Frozen Thicket | Thaw Cycle | Sustained engagement | +25–35% (active maintenance) |

---

## Part 3 — Engine Developer

### 3.1 Data Task: Extend `bloomlingTemplates.ts`

Add 23 new entries to `BLOOMLING_TEMPLATES` (16 biome Bloomlings + 3 biome boss rewards already counted above + 2 Legendary + 2 Mythic). Follow the existing pattern exactly:

```typescript
// Template structure (existing pattern):
{
  id: "glowcap",
  name: "Glowcap",
  rarity: Rarity.Uncommon,
  biome: BiomeType.TwilightHollow,
  baseProduction: 2,       // Uncommon = 2
  baseLevelCost: 40,       // Uncommon = 40
  abilityType: AbilityType.ProductionBoost,
  abilityDescription: "+4% Sunlight production to all Garden Bloomlings",
  abilityValue: 0.04,
  synergyTags: ["Luminous", "Fungal"],
  unlockMethod: UnlockMethod.ZoneMilestone,
  unlockCondition: "zone_55",
  personality: "Cheerful, easily startled, surprisingly brave",
  lore: "Glowcap sprouted from a fallen log...",
}
```

**Rarity → economy value mapping (matching existing code conventions):**

| Rarity | baseProduction | baseLevelCost |
|---|---|---|
| Common | 1 | 10 |
| Uncommon | 2 | 40 |
| Rare | 5 | 200 |
| Epic | 12 | 1000 |
| Legendary | 30 | 5000 |
| Mythic | 100 | 50000 |

**BiomeType enum change:** Add `Universal = "universal"` for Legendary/Mythic Bloomlings that belong to no biome. This requires a one-line addition to the enum in `src/types/game.ts`.

**UnlockMethod usage for new entries:**
- Zone-based: `UnlockMethod.ZoneMilestone` with `unlockCondition: "zone_<N>"`
- Boss-based: `UnlockMethod.BiomeBoss` with `unlockCondition: "boss_biome<N>"`
- Solstara: `UnlockMethod.Discovery` with `unlockCondition: "zone_150_all_biomes"`
- Worldroot: `UnlockMethod.Achievement` with `unlockCondition: "all_bosses"`
- Eclipsyn: `UnlockMethod.PrestigeUnlock` with `unlockCondition: "transcend_3_zone_200"`
- Bloommother: `UnlockMethod.Discovery` with `unlockCondition: "codex_complete"`

### 3.2 Data Task: Extend `synergies.ts`

Add all synergies from §1.4 to the `NAMED_SYNERGIES` array. Follow the existing pattern:

```typescript
{
  id: "synergy_hollow_lanterns",
  name: "Hollow Lanterns",
  requiredBloomlingIds: ["glowcap", "lumivine"],
  productionBonus: 0.15,
  tapValueBonus: 0,
  lore: "One glows from within; the other glows from stolen moonlight...",
},
```

Total new entries: 18 intra-biome + 12 cross-biome + 4 legendary/mythic = **34 new synergies**.

### 3.3 Extend `discovery.ts` for New Unlock Conditions

The current `parseUnlockCondition` only handles `zone_<N>` and `boss_biome<N>`. Add support for the Legendary/Mythic conditions:

```typescript
// New ParsedUnlockCondition variants:
| { kind: "zone_all_biomes"; zone: number }
| { kind: "all_bosses" }
| { kind: "prestige_zone"; transcendCount: number; zone: number }
| { kind: "codex_complete" }
```

**New regex patterns:**
- `zone_150_all_biomes` → `{ kind: "zone_all_biomes", zone: 150 }`
- `all_bosses` → `{ kind: "all_bosses" }`
- `transcend_3_zone_200` → `{ kind: "prestige_zone", transcendCount: 3, zone: 200 }`
- `codex_complete` → `{ kind: "codex_complete" }`

The `getZoneUnlockTemplates` function should remain focused on `kind === "zone"` unlocks. The new conditions require separate trigger pathways:
- `zone_all_biomes`: Check in `advanceZone` — if zone >= N and player has ≥1 Bloomling from each biome 1–6
- `all_bosses`: Check in the boss defeat handler
- `prestige_zone`: Check in `advanceZone` — if transcendCount >= N and zone >= M
- `codex_complete`: Check whenever a new Bloomling is unlocked — if all other templates are owned

### 3.4 New Engine Module: `src/engine/biomeMechanics.ts`

This module owns the per-biome mechanic logic. It is pure functions + state, consumed by the game loop.

```typescript
// --- Core API ---

/** Map zone number to BiomeType. */
export function getCurrentBiome(zone: number): BiomeType;

/** Get the mechanic identifier for a biome. */
export function getBiomeMechanic(biome: BiomeType): BiomeMechanicType;

/** Per-biome tick handler — called from gameLoop's gameTick. */
export function biomeMechanicTick(
  biome: BiomeType,
  state: BiomeMechanicState,
  deltaMs: number,
  now: number,
): BiomeMechanicTickResult;
```

**`getCurrentBiome` mapping:**

```
Zones   1– 25 → MossyCradle
Zones  26– 50 → SunlitGlade
Zones  51– 75 → TwilightHollow
Zones  76–100 → CrystalCaverns
Zones 101–125 → ScorchedExpanse
Zones 126–150 → AbyssalDepths
Zones 151–175 → CelestialCanopy
Zones 176–200 → FrozenThicket
```

**`BiomeMechanicType` enum:**

```typescript
export enum BiomeMechanicType {
  None = "none",                 // Biome 1
  Sunbursts = "sunbursts",       // Biome 2
  Luminescence = "luminescence", // Biome 3
  Resonance = "resonance",       // Biome 4
  EruptionSurge = "eruption_surge",   // Biome 5
  PressureTide = "pressure_tide",     // Biome 6
  Windfall = "windfall",              // Biome 7
  ThawCycle = "thaw_cycle",           // Biome 8
}
```

**`BiomeMechanicState` (new fields in the store's MetaSlice or a dedicated slice):**

```typescript
interface BiomeMechanicState {
  // Sunbursts (Biome 2)
  sunburstNextSpawnAt: number | null;
  sunburstActiveUntil: number | null;

  // Luminescence (Biome 3)
  glowMeterPercent: number;        // 0–100
  glowMeterCooldownUntil: number | null;

  // Resonance (Biome 4) — stateless; +30% is applied in tap calculation

  // Eruption Surge (Biome 5)
  eruptionSurgeActiveUntil: number | null;
  eruptionNextSurgeAt: number | null;

  // Pressure Tide (Biome 6)
  pressurePercent: number;         // 0–100
  pressureCooldownUntil: number | null;

  // Windfall (Biome 7)
  windfallEventActiveUntil: number | null;
  windfallNextEventAt: number | null;
  windfallBuffStacks: number;
  windfallBuffExpiresAt: number | null;

  // Thaw Cycle (Biome 8)
  frostPenaltyPercent: number;     // 0–50
  warmthPercent: number;           // 0–100
  thawBloomCooldownUntil: number | null;
}
```

**Reset policy:** All biome mechanic state resets when the player changes biomes (zone advance into a new biome range) or on Rebirth.

### 3.5 Game Loop Integration

Extend `gameTick` in `src/engine/gameLoop.ts`:

```typescript
// Inside gameTick, after idle production and before zone threshold check:

// --- Biome mechanic tick ---
const currentBiome = getCurrentBiome(state.zoneProgress.currentZone);
const mechanicResult = biomeMechanicTick(
  currentBiome,
  state.biomeMechanic,
  deltaMs,
  now,
);
```

**Integration points per mechanic:**

| Mechanic | Game Loop Hook | Affects |
|---|---|---|
| Sunbursts | `biomeMechanicTick` sets `sunburstActiveUntil`; UI reads it | Zone progress (bonus Sunlight on tap) |
| Luminescence | `biomeMechanicTick` increments `glowMeterPercent` based on Garden size | Idle income burst on player tap |
| Resonance | No tick needed; tap system reads `currentBiome === CrystalCaverns` | Tap value multiplier |
| Eruption Surge | `biomeMechanicTick` manages surge/cooldown timers | Idle multiplier (0.5× or 2×) |
| Pressure Tide | `biomeMechanicTick` increments `pressurePercent` at 1%/s | Idle income burst on player release |
| Windfall | `biomeMechanicTick` manages event timer; UI handles mote spawning | Idle production buff stacks |
| Thaw Cycle | `biomeMechanicTick` manages frost accumulation and warmth decay | Idle multiplier; burst on Thaw Bloom |

**Tap system integration (`src/engine/tapSystem.ts`):**
- Resonance: Multiply tap value by 1.3 when `getCurrentBiome(zone) === CrystalCaverns`
- Thaw Cycle: Each tap adds +1% to `warmthPercent`
- Sunbursts: Sunburst tap handler is separate from normal tap (it's a UI overlay tap target)

### 3.6 Discovery Integration

The existing `getZoneUnlockTemplates` function works unchanged for all zone-based Bloomlings in biomes 3–8. Boss-based unlocks (`boss_biome3` through `boss_biome8`) are already recognized by `parseUnlockCondition` — they just need a trigger pathway from the boss defeat handler (which doesn't exist yet, same as biomes 1–2).

**New discovery checks to add:**

1. **In `advanceZone`:** After granting zone-based Bloomlings, check for `zone_all_biomes` and `prestige_zone` conditions
2. **In boss defeat handler:** Check for `all_bosses` condition (are all 8 bosses defeated?)
3. **In Bloomling unlock handler:** Check for `codex_complete` condition (is every other Bloomling owned?)

---

## Part 4 — UI/UX Developer

### 4.1 Sunburst Orb (Biome 2)

**Component:** `src/components/garden/SunburstOrb.tsx`

- Rendered as an absolutely-positioned `Animated.View` within the Garden screen container
- Position: Random x/y within safe bounds (60px inset from all edges, avoiding Garden slot positions)
- Size: 48×48dp with a 64×64dp touch target
- Animation: `useAnimatedStyle` with Reanimated — scale pulse (1.0→1.1→1.0, 1.5s loop), opacity fade-in (0→1 over 300ms) and fade-out (1→0 over 300ms)
- On tap: Scale-up burst animation (1.0→1.5→0, 200ms) with particle scatter, then unmount
- Particle effect: 6–8 golden motes that fly outward from the orb center and fade over 400ms
- Accessibility: `accessibilityLabel="Sunburst bonus — tap for extra Sunlight"`, `accessibilityRole="button"`

**Visibility logic:** Only rendered when `biomeMechanicState.sunburstActiveUntil > now` and `currentBiome === SunlitGlade`.

### 4.2 Glow Meter (Biome 3)

**Component:** `src/components/garden/GlowMeter.tsx`

- Placement: Left edge of the Garden screen, vertically centered, 24dp wide × 200dp tall
- Background: Dark semi-transparent rounded rect
- Fill: Bottom-to-top gradient fill (teal at bottom → violet at top), height = `glowMeterPercent%`
- When full (100%): Gentle pulse animation on the fill; firefly particle emitter (2–3 particles orbiting the bar)
- Tap interaction: When full, tapping the meter triggers the burst. Tap target is the entire bar when full.
- Cooldown state: Bar fill is grey, countdown text (`mm:ss`) centered vertically
- Animation: Fill changes use `withTiming` (300ms ease-out) for smooth visual updates
- Accessibility: `accessibilityLabel="Glow Meter, ${percent}% charged"`, announces "Glow Meter ready" when full

### 4.3 Resonance Echo (Biome 4)

**Visual effect only — no dedicated component.** Integrated into the existing tap ripple system.

- On each tap in Biome 4: After the primary tap ripple, spawn a secondary ripple at 60% opacity and 80% size
- The secondary ripple travels from the tap point toward the nearest crystal formation in the background (predefined anchor points in the Biome 4 background asset)
- Travel time: 300ms (visual only; Sunlight is applied immediately)
- On arrival at crystal: Small prismatic burst (rainbow-colored particle scatter, 200ms)
- Critical tap echoes: Larger secondary ripple (100% size), brighter prismatic burst
- Implementation: Extend the existing tap animation handler with a biome check; use Reanimated `withSequence` for the travel + burst

### 4.4 Eruption Surge Overlay (Biome 5)

**Component:** `src/components/garden/EruptionOverlay.tsx`

- During surge: Screen edges glow molten orange (animated border overlay, 8dp wide, opacity pulses 0.3→0.6)
- Lava crack effect: 3–4 predefined crack paths on the ground area that glow during surge
- Warning phase (3s before surge): Cracks begin to glow dimly; subtle screen shake (translateX ±2dp, 100ms interval)
- Between surges: Subtle heat shimmer effect on the background (slight vertical distortion, very low intensity)
- Countdown: Small timer badge in top-right showing seconds until next surge

### 4.5 Pressure Gauge (Biome 6)

**Component:** `src/components/garden/PressureGauge.tsx`

- Placement: Bottom-right corner of Garden screen, 64×64dp circular gauge
- Fill: Clockwise radial fill, deep blue → bright cyan as pressure increases
- Bioluminescent bubbles: Small particle emitter inside the gauge, bubble count increases with pressure
- Above 90%: Gauge border cracks with light leaking through (animated crack lines)
- Tap to release: Tap the gauge at any fill level. Release animation: gauge shatters outward, reassembles during cooldown
- Cooldown: Gauge is grey/empty, circular countdown overlay
- Accessibility: `accessibilityLabel="Pressure gauge, ${percent}% — tap to release"`, haptic feedback on release

### 4.6 Windfall Event (Biome 7)

**Component:** `src/components/garden/WindfallEvent.tsx`

- Star Motes: 32×32dp star-shaped sprites with trailing light ribbons (2–3 trailing particles per mote)
- Spawn: From right edge at random y-positions, drift left at 80–150dp/s (varied per mote)
- Tap interaction: Mote pops with a sparkle burst on tap; missed motes drift off-screen left
- Buff indicator: Small badge in top-left showing current stack count and remaining duration
- Wind effect: During events, horizontal wind streaks animate across the background (thin white lines, 60% opacity, fast horizontal translation)
- Event countdown: Subtle wind icon with timer in the corner between events

### 4.7 Thaw Cycle HUD (Biome 8)

**Components:** `src/components/garden/FrostOverlay.tsx`, `src/components/garden/WarmthGauge.tsx`

**Frost Overlay:**
- Ice crystal patterns creep inward from screen edges as `frostPenaltyPercent` increases
- At 0%: No overlay. At 25%: Thin frost border. At 50%: Thick frost with ice crystals reaching 30% into the screen
- Animated with Reanimated `useAnimatedStyle` — frost extent interpolated from penalty value

**Warmth Gauge:**
- Horizontal bar at the bottom of the Garden screen, above the nav bar
- Fill: Left-to-right, cold blue (0%) → warm amber (50%) → bright gold (80%) → white-hot (100%)
- Each tap causes a brief flash at the current fill position
- At 100%: Thaw Bloom animation — ice shatters outward from center, aurora-colored light burst, screen briefly flashes white-gold
- Accessibility: `accessibilityLabel="Warmth ${percent}%, Frost ${frostPercent}%"`

### 4.8 Biome Transition Animations

When the player advances from one biome to the next (clearing zones 25, 50, 75, 100, 125, 150, 175):

1. **Fade-out** (500ms): Current biome background fades to black
2. **Narrative card** (2–3s): Biome name + one-line description on a dark background with the new biome's accent color. Auto-dismisses or tap to skip.
3. **Fade-in** (500ms): New biome background fades in with a subtle parallax zoom (1.05→1.0 scale)
4. **Mechanic introduction toast** (biomes 2+): A bottom toast explains the new mechanic in one sentence. Dismisses after 5s or on tap. Example: "Sunbursts — Tap golden orbs for bonus Sunlight!"

### 4.9 Garden Screen Per-Biome Visuals

The Garden screen's background, ambient effects, and color palette change based on the current biome:

| Biome | Background | Ambient Effects | Accent Color |
|---|---|---|---|
| 1 Mossy Cradle | Greenhouse interior, warm light through cracked glass | Floating dust motes, gentle light rays | `#7CB342` (moss green) |
| 2 Sunlit Glade | Open forest clearing, golden hour lighting | Butterflies, drifting pollen, lens flares | `#FFB300` (golden) |
| 3 Twilight Hollow | Deep forest, bioluminescent mushrooms | Fireflies, pulsing mushroom glow, mist | `#00BCD4` (teal) |
| 4 Crystal Caverns | Underground cave, crystal formations | Prismatic light refractions, dripping water particles | `#CE93D8` (crystal violet) |
| 5 Scorched Expanse | Volcanic plateau, lava rivers | Heat shimmer, drifting embers, distant eruptions | `#FF5722` (ember orange) |
| 6 Abyssal Depths | Underwater cavern, bioluminescent currents | Rising bubbles, swaying kelp, distant whale calls | `#0277BD` (deep blue) |
| 7 Celestial Canopy | Treetop canopy above clouds, starfield | Drifting clouds, twinkling stars, wind streaks | `#B39DDB` (sky lavender) |
| 8 Frozen Thicket | Snow-covered tundra forest, aurora sky | Falling snow, aurora shimmer, breath mist | `#B3E5FC` (ice blue) |

**Implementation:** Background is a static image asset per biome. Ambient effects are lightweight Reanimated particle systems (max 10–15 particles at a time to maintain 60fps). Color palette is exposed via a `useBiomeTheme()` hook that returns accent, background, and text colors for the current biome.

---

## Implementation Priority

| Priority | Task | Effort | Dependencies |
|---|---|---|---|
| P0 | Add biome 3–8 templates to `bloomlingTemplates.ts` | S | None |
| P0 | Add new synergies to `synergies.ts` | S | Templates |
| P0 | Add `Universal` to `BiomeType` enum | XS | None |
| P1 | Create `biomeMechanics.ts` with `getCurrentBiome` + mechanic type mapping | S | None |
| P1 | Implement Sunbursts mechanic (Biome 2) — simplest, validates the pattern | M | `biomeMechanics.ts` |
| P1 | Implement Resonance (Biome 4) — stateless, tap system integration only | S | `biomeMechanics.ts` |
| P2 | Implement Luminescence (Biome 3) — Glow Meter state + UI | M | `biomeMechanics.ts` |
| P2 | Extend `discovery.ts` for Legendary/Mythic unlock conditions | S | Templates |
| P2 | Add Legendary/Mythic templates | S | `Universal` enum, discovery changes |
| P3 | Implement Eruption Surge (Biome 5) | M | `biomeMechanics.ts` |
| P3 | Implement Pressure Tide (Biome 6) | M | `biomeMechanics.ts` |
| P3 | Implement Windfall (Biome 7) | L | `biomeMechanics.ts` |
| P3 | Implement Thaw Cycle (Biome 8) | L | `biomeMechanics.ts` |
| P3 | Biome transition animations | M | Background assets |
| P3 | Per-biome Garden backgrounds and ambient effects | L | Art assets |

---

## Next Section

See `docs/design/03-zone-progression.md` for zone threshold scaling and gate mechanics.
See `docs/design/02-bloomling-mechanics.md` for evolution, abilities, and synergy system details.
