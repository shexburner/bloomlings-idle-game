<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->
<!-- Source: docs/design/01-core-game-loop.md -->

# Bloomlings Game Design — Section 1: Core Game Loop (Compact Context)

> Auto-generated from the canonical source file. Edit the source markdown, then regenerate compact docs.

## Quick Map
- The Gardener's Story
- Time-Scale Loops
  - Second-to-Second (Active Play)
  - Minute-to-Minute (Micro Decisions)
  - Hour-to-Hour (Progression Pushes)
  - Day-to-Day (Strategic Planning)
  - Week-to-Week (Long-term Goals)
- The Tap System
  - Base Tapping
  - Combo System (Tap Hero Inspired)
  - Critical Taps
  - Tap Formula
  - Anti-Autoclicker
- Idle Production
  - How It Works
  - Active vs. Idle Ratio Target
- Currency Overview
- Feature Unlock Timeline
- Next Section

## Key Points
### The Gardener's Story
- The player is a **Gardener** who discovers an abandoned greenhouse. Inside, dormant plant creatures — **Bloomlings** — wait to be awakened. By tapping the screen, the Gardener channels **Sunlight** energy, waking Bloomlings and helping them grow. Once awake, Bloomlings produce Sunlight on their own, creating an idle income stream.

### Time-Scale Loops
- (No concise bullet/summary found; use grep in source file for details.)

### Second-to-Second (Active Play)
- **Tap** the screen to generate Sunlight manually
- Each tap produces `sunlightPerTap` value
- Rapid tapping builds a **Combo Meter** (see below)
- Bloomlings passively generate Sunlight every tick (idle production)

### Minute-to-Minute (Micro Decisions)
- Spend Sunlight on **upgrades** (tap power, idle multipliers)
- Level up individual Bloomlings to increase their production
- Decide: upgrade what I have, or save for something new?
- Hit small milestones that trigger unlocks ("Reach 1,000 Sunlight")

### Hour-to-Hour (Progression Pushes)
- Push through **zones** — each zone has a Sunlight threshold to clear
- Every 5th zone is a **Gate** (mini-boss, requires burst of Sunlight)
- Unlock new Bloomlings at zone milestones
- Evolve Bloomlings through growth stages (Sprout -> Bloom -> Elder)

### Day-to-Day (Strategic Planning)
- Collect **Daily Login Rewards** (escalating streak bonuses)
- Execute prestige runs — Rebirth for Nectar currency
- Spend Nectar on permanent upgrades that persist through rebirths
- Watch ads strategically for Dewdrops and temporary boosts

### Week-to-Week (Long-term Goals)
- Multiple Rebirth cycles, accumulating Nectar
- Unlock and complete biomes
- Build toward **Transcendence** (second prestige layer)
- Collect rare and legendary Bloomlings

### The Tap System
- (No concise bullet/summary found; use grep in source file for details.)

### Base Tapping
- Each tap generates `baseTapValue * tapMultiplier` Sunlight
- Starting value: 1 Sunlight per tap
- Tap upgrades increase `baseTapValue`
- Prestige upgrades increase `tapMultiplier`

### Combo System (Tap Hero Inspired)
- Tapping within a **1.5-second window** of the last tap builds the combo counter
- Combo multiplier: `1 + (comboCount * 0.05)` — so 20 taps in a row = 2x multiplier
- Combo caps at **100 hits** (6x multiplier)
- Combo decays: if no tap for 1.5 seconds, combo resets to 0

### Critical Taps
- Every tap has a **5% base chance** to be a Critical Tap
- Critical multiplier: **5x** base tap value (before combo)
- Critical chance can be upgraded
- Visual: golden burst effect, larger number popup, satisfying haptic

### Tap Formula
- tapReward = baseTapValue * tapMultiplier * comboMultiplier * (isCritical ? critMultiplier : 1)

### Anti-Autoclicker
- Maximum registered taps: **20 per second**
- Taps beyond this are silently ignored (no error shown)
- Tap patterns analyzed: if perfectly even intervals detected for 60+ seconds, reduce tap value by 50%

### Idle Production
- (No concise bullet/summary found; use grep in source file for details.)

### How It Works
- Each Bloomling in the **Garden** (active roster) produces Sunlight per second
- Total idle rate: sum of all active Bloomlings' production rates
- Idle production runs continuously, even during active tapping
- Active play = idle production + tap income (they stack, not replace)

### Active vs. Idle Ratio Target
- The goal: **active players feel rewarded, idle players never feel punished.**

### Currency Overview
- (No concise bullet/summary found; use grep in source file for details.)

### Feature Unlock Timeline
- Features drip-feed to avoid overwhelming new players. The first 10 minutes should feel simple: tap, grow, smile.

### Next Section
- See `02-bloomling-mechanics.md` for Bloomling growth, evolution, synergies, and the Garden system.
