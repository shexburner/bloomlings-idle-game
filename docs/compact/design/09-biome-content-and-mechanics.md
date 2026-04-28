<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->
<!-- Source: docs/design/09-biome-content-and-mechanics.md -->

# Bloomlings Game Design — Section 9: Biome Content & Mechanics (Compact Context)

> Auto-generated from the canonical source file. Edit the source markdown, then regenerate compact docs.

## Quick Map
- Overview
- Part 1 — Content Creator
  - 1.1 Bloomling Registry: Biomes 3–8
    - Biome 3 — The Twilight Hollow (Zones 51–75)
    - Biome 4 — The Crystal Caverns (Zones 76–100)
    - Biome 5 — The Scorched Expanse (Zones 101–125)
    - Biome 6 — The Abyssal Depths (Zones 126–150)
    - Biome 7 — The Celestial Canopy (Zones 151–175)
    - Biome 8 — The Frozen Thicket (Zones 176–200)
  - 1.2 Legendary & Mythic Bloomlings
  - 1.3 New Synergy Tags
  - 1.4 Named Synergies to Add
    - Biome 3 — Intra-biome
    - Biome 4 — Intra-biome
    - Biome 5 — Intra-biome
    - Biome 6 — Intra-biome
    - Biome 7 — Intra-biome
    - Biome 8 — Intra-biome
    - Cross-Biome Synergies
    - Legendary & Mythic Synergies
- Part 2 — Game Designer: Per-Biome Mechanics
  - 2.1 Biome 1 — The Mossy Cradle (Zones 1–25)
  - 2.2 Biome 2 — Sunbursts (Zones 26–50)
  - 2.3 Biome 3 — Luminescence (Zones 51–75)
  - 2.4 Biome 4 — Resonance (Zones 76–100)
  - 2.5 Biome 5 — Eruption Surge (Zones 101–125)
  - 2.6 Biome 6 — Pressure Tide (Zones 126–150)
  - 2.7 Biome 7 — Windfall (Zones 151–175)
  - 2.8 Biome 8 — Thaw Cycle (Zones 176–200)
  - 2.9 Biome Mechanic Summary
- Part 3 — Engine Developer
  - 3.1 Data Task: Extend `bloomlingTemplates.ts`
  - 3.2 Data Task: Extend `synergies.ts`
  - 3.3 Extend `discovery.ts` for New Unlock Conditions
  - 3.4 New Engine Module: `src/engine/biomeMechanics.ts`
  - 3.5 Game Loop Integration
  - 3.6 Discovery Integration
- Part 4 — UI/UX Developer
  - 4.1 Sunburst Orb (Biome 2)
  - 4.2 Glow Meter (Biome 3)
  - 4.3 Resonance Echo (Biome 4)
  - 4.4 Eruption Surge Overlay (Biome 5)
  - 4.5 Pressure Gauge (Biome 6)
  - 4.6 Windfall Event (Biome 7)
  - 4.7 Thaw Cycle HUD (Biome 8)
  - 4.8 Biome Transition Animations
  - 4.9 Garden Screen Per-Biome Visuals
- Implementation Priority
- Next Section

## Key Points
### Overview
- This document covers the integration of Biomes 3–8 Bloomling data into code and the unique per-biome gameplay mechanics. It is written from the combined perspective of the Game Designer, Engine Developer, Content Creator, and UI/UX Developer.

### Part 1 — Content Creator
- (No concise bullet/summary found; use grep in source file for details.)

### 1.1 Bloomling Registry: Biomes 3–8
- Every Bloomling below must be added to `BLOOMLING_TEMPLATES` in `src/data/bloomlingTemplates.ts`. Economy values (`baseProduction`, `baseLevelCost`) follow the rarity table in `docs/economy/03-bloomling-stats.md` and match the conventions already used in the existing 8 templates (Common: 1/10, Uncommon: 2/40, Rare: 5/200, Epic: 12/1000, Legendary: 30/5000, Mythic: 100/50000).

### Biome 3 — The Twilight Hollow (Zones 51–75)
- (No concise bullet/summary found; use grep in source file for details.)

### Biome 4 — The Crystal Caverns (Zones 76–100)
- (No concise bullet/summary found; use grep in source file for details.)

### Biome 5 — The Scorched Expanse (Zones 101–125)
- (No concise bullet/summary found; use grep in source file for details.)

### Biome 6 — The Abyssal Depths (Zones 126–150)
- (No concise bullet/summary found; use grep in source file for details.)

### Biome 7 — The Celestial Canopy (Zones 151–175)
- (No concise bullet/summary found; use grep in source file for details.)

### Biome 8 — The Frozen Thicket (Zones 176–200)
- (No concise bullet/summary found; use grep in source file for details.)

### 1.2 Legendary & Mythic Bloomlings
- Solstara: `unlockCondition: "zone_150_all_biomes"` — requires a new `parseUnlockCondition` branch in `discovery.ts`
- Worldroot: `unlockCondition: "all_bosses"` — triggered by the achievement system
- Eclipsyn: `unlockCondition: "transcend_3_zone_200"` — requires prestige + zone check
- Bloommother: `unlockCondition: "codex_complete"` — triggered when every other Bloomling is unlocked

### 1.3 New Synergy Tags
- Biomes 3–8 introduce the following new tags not present in biomes 1–2:

### 1.4 Named Synergies to Add
- All synergies below must be added to `NAMED_SYNERGIES` in `src/engine/synergies.ts`.

### Biome 3 — Intra-biome
- (No concise bullet/summary found; use grep in source file for details.)

### Biome 4 — Intra-biome
- (No concise bullet/summary found; use grep in source file for details.)

### Biome 5 — Intra-biome
- (No concise bullet/summary found; use grep in source file for details.)

### Biome 6 — Intra-biome
- (No concise bullet/summary found; use grep in source file for details.)

### Biome 7 — Intra-biome
- (No concise bullet/summary found; use grep in source file for details.)

### Biome 8 — Intra-biome
- (No concise bullet/summary found; use grep in source file for details.)

### Cross-Biome Synergies
- (No concise bullet/summary found; use grep in source file for details.)

### Legendary & Mythic Synergies
- (No concise bullet/summary found; use grep in source file for details.)

### Part 2 — Game Designer: Per-Biome Mechanics
- Each biome (except Biome 1, which is a pure learning environment) has a unique mechanic that activates while the player's current zone falls within that biome's range. Mechanics are mutually exclusive — only the current biome's mechanic is active. On Rebirth, the player returns to Zone 1 and re-encounters each mechanic as they push through.

### 2.1 Biome 1 — The Mossy Cradle (Zones 1–25)
- **Mechanic: None.** Pure tutorial environment. No special mechanic — the player learns tapping, idle production, Bloomling placement, and zone progression.

### 2.2 Biome 2 — Sunbursts (Zones 26–50)
- **Core concept:** Random golden orbs appear on the Garden screen during active gameplay. Tapping one grants a burst of bonus Sunlight equal to 2× the current zone's threshold.

### 2.3 Biome 3 — Luminescence (Zones 51–75)
- **Core concept:** Bloomlings in the Garden slowly charge a Glow Meter. When the meter is full, the player can tap it to instantly receive 60 seconds of idle income.

### 2.4 Biome 4 — Resonance (Zones 76–100)
- **Core concept:** Each tap creates an "echo" that bounces off crystal formations and generates additional Sunlight. Effectively +30% tap value while in this biome.

### 2.5 Biome 5 — Eruption Surge (Zones 101–125)
- **Theme:** Volcanic / Scorched Expanse

### 2.6 Biome 6 — Pressure Tide (Zones 126–150)
- **Theme:** Underwater / Abyssal Depths

### 2.7 Biome 7 — Windfall (Zones 151–175)
- **Theme:** Sky / Celestial Canopy

### 2.8 Biome 8 — Thaw Cycle (Zones 176–200)
- **Theme:** Tundra / Frozen Thicket

### 2.9 Biome Mechanic Summary
- (No concise bullet/summary found; use grep in source file for details.)

### Part 3 — Engine Developer
- (No concise bullet/summary found; use grep in source file for details.)

### 3.1 Data Task: Extend `bloomlingTemplates.ts`
- Zone-based: `UnlockMethod.ZoneMilestone` with `unlockCondition: "zone_<N>"`
- Boss-based: `UnlockMethod.BiomeBoss` with `unlockCondition: "boss_biome<N>"`
- Solstara: `UnlockMethod.Discovery` with `unlockCondition: "zone_150_all_biomes"`
- Worldroot: `UnlockMethod.Achievement` with `unlockCondition: "all_bosses"`

### 3.2 Data Task: Extend `synergies.ts`
- Add all synergies from §1.4 to the `NAMED_SYNERGIES` array. Follow the existing pattern:

### 3.3 Extend `discovery.ts` for New Unlock Conditions
- `zone_150_all_biomes` → `{ kind: "zone_all_biomes", zone: 150 }`
- `all_bosses` → `{ kind: "all_bosses" }`
- `transcend_3_zone_200` → `{ kind: "prestige_zone", transcendCount: 3, zone: 200 }`
- `codex_complete` → `{ kind: "codex_complete" }`

### 3.4 New Engine Module: `src/engine/biomeMechanics.ts`
- This module owns the per-biome mechanic logic. It is pure functions + state, consumed by the game loop.

### 3.5 Game Loop Integration
- Resonance: Multiply tap value by 1.3 when `getCurrentBiome(zone) === CrystalCaverns`
- Thaw Cycle: Each tap adds +1% to `warmthPercent`
- Sunbursts: Sunburst tap handler is separate from normal tap (it's a UI overlay tap target)

### 3.6 Discovery Integration
- **In `advanceZone`:** After granting zone-based Bloomlings, check for `zone_all_biomes` and `prestige_zone` conditions
- **In boss defeat handler:** Check for `all_bosses` condition (are all 8 bosses defeated?)
- **In Bloomling unlock handler:** Check for `codex_complete` condition (is every other Bloomling owned?)

### Part 4 — UI/UX Developer
- (No concise bullet/summary found; use grep in source file for details.)

### 4.1 Sunburst Orb (Biome 2)
- Rendered as an absolutely-positioned `Animated.View` within the Garden screen container
- Position: Random x/y within safe bounds (60px inset from all edges, avoiding Garden slot positions)
- Size: 48×48dp with a 64×64dp touch target
- Animation: `useAnimatedStyle` with Reanimated — scale pulse (1.0→1.1→1.0, 1.5s loop), opacity fade-in (0→1 over 300ms) and fade-out (1→0 over 300ms)

### 4.2 Glow Meter (Biome 3)
- Placement: Left edge of the Garden screen, vertically centered, 24dp wide × 200dp tall
- Background: Dark semi-transparent rounded rect
- Fill: Bottom-to-top gradient fill (teal at bottom → violet at top), height = `glowMeterPercent%`
- When full (100%): Gentle pulse animation on the fill; firefly particle emitter (2–3 particles orbiting the bar)

### 4.3 Resonance Echo (Biome 4)
- On each tap in Biome 4: After the primary tap ripple, spawn a secondary ripple at 60% opacity and 80% size
- The secondary ripple travels from the tap point toward the nearest crystal formation in the background (predefined anchor points in the Biome 4 background asset)
- Travel time: 300ms (visual only; Sunlight is applied immediately)
- On arrival at crystal: Small prismatic burst (rainbow-colored particle scatter, 200ms)

### 4.4 Eruption Surge Overlay (Biome 5)
- During surge: Screen edges glow molten orange (animated border overlay, 8dp wide, opacity pulses 0.3→0.6)
- Lava crack effect: 3–4 predefined crack paths on the ground area that glow during surge
- Warning phase (3s before surge): Cracks begin to glow dimly; subtle screen shake (translateX ±2dp, 100ms interval)
- Between surges: Subtle heat shimmer effect on the background (slight vertical distortion, very low intensity)

### 4.5 Pressure Gauge (Biome 6)
- Placement: Bottom-right corner of Garden screen, 64×64dp circular gauge
- Fill: Clockwise radial fill, deep blue → bright cyan as pressure increases
- Bioluminescent bubbles: Small particle emitter inside the gauge, bubble count increases with pressure
- Above 90%: Gauge border cracks with light leaking through (animated crack lines)

### 4.6 Windfall Event (Biome 7)
- Star Motes: 32×32dp star-shaped sprites with trailing light ribbons (2–3 trailing particles per mote)
- Spawn: From right edge at random y-positions, drift left at 80–150dp/s (varied per mote)
- Tap interaction: Mote pops with a sparkle burst on tap; missed motes drift off-screen left
- Buff indicator: Small badge in top-left showing current stack count and remaining duration

### 4.7 Thaw Cycle HUD (Biome 8)
- Ice crystal patterns creep inward from screen edges as `frostPenaltyPercent` increases
- At 0%: No overlay. At 25%: Thin frost border. At 50%: Thick frost with ice crystals reaching 30% into the screen
- Animated with Reanimated `useAnimatedStyle` — frost extent interpolated from penalty value
- Horizontal bar at the bottom of the Garden screen, above the nav bar

### 4.8 Biome Transition Animations
- **Fade-out** (500ms): Current biome background fades to black
- **Narrative card** (2–3s): Biome name + one-line description on a dark background with the new biome's accent color. Auto-dismisses or tap to skip.
- **Fade-in** (500ms): New biome background fades in with a subtle parallax zoom (1.05→1.0 scale)
- **Mechanic introduction toast** (biomes 2+): A bottom toast explains the new mechanic in one sentence. Dismisses after 5s or on tap. Example: "Sunbursts — Tap golden orbs for bonus Sunlight!"

### 4.9 Garden Screen Per-Biome Visuals
- The Garden screen's background, ambient effects, and color palette change based on the current biome:

### Implementation Priority
- (No concise bullet/summary found; use grep in source file for details.)

### Next Section
- See `docs/design/03-zone-progression.md` for zone threshold scaling and gate mechanics.
