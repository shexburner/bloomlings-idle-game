# Bloomlings Game Design — Section 1: Core Game Loop

## The Gardener's Story

The player is a **Gardener** who discovers an abandoned greenhouse. Inside, dormant plant creatures — **Bloomlings** — wait to be awakened. By tapping the screen, the Gardener channels **Sunlight** energy, waking Bloomlings and helping them grow. Once awake, Bloomlings produce Sunlight on their own, creating an idle income stream.

The deeper the Gardener explores the greenhouse (and the wilds beyond), the more exotic and powerful the Bloomlings become.

---

## Time-Scale Loops

### Second-to-Second (Active Play)
- **Tap** the screen to generate Sunlight manually
- Each tap produces `sunlightPerTap` value
- Rapid tapping builds a **Combo Meter** (see below)
- Bloomlings passively generate Sunlight every tick (idle production)
- Numbers float up from taps, currency counter ticks upward

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
- First prestige (Rebirth) becomes attractive around 2-4 hours in

### Day-to-Day (Strategic Planning)
- Collect **Daily Login Rewards** (escalating streak bonuses)
- Execute prestige runs — Rebirth for Nectar currency
- Spend Nectar on permanent upgrades that persist through rebirths
- Watch ads strategically for Dewdrops and temporary boosts
- Unlock new biomes by pushing further each run

### Week-to-Week (Long-term Goals)
- Multiple Rebirth cycles, accumulating Nectar
- Unlock and complete biomes
- Build toward **Transcendence** (second prestige layer)
- Collect rare and legendary Bloomlings
- Complete achievement chains

---

## The Tap System

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
- Visual: combo counter displayed prominently, screen effects intensify with higher combos
- **Combo Keeper** (ad perk): freezes combo decay for 5 minutes

### Critical Taps
- Every tap has a **5% base chance** to be a Critical Tap
- Critical multiplier: **5x** base tap value (before combo)
- Critical chance can be upgraded
- Visual: golden burst effect, larger number popup, satisfying haptic

### Tap Formula
```
tapReward = baseTapValue * tapMultiplier * comboMultiplier * (isCritical ? critMultiplier : 1)
```

### Anti-Autoclicker
- Maximum registered taps: **20 per second**
- Taps beyond this are silently ignored (no error shown)
- Tap patterns analyzed: if perfectly even intervals detected for 60+ seconds, reduce tap value by 50%

---

## Idle Production

### How It Works
- Each Bloomling in the **Garden** (active roster) produces Sunlight per second
- Total idle rate: sum of all active Bloomlings' production rates
- Idle production runs continuously, even during active tapping
- Active play = idle production + tap income (they stack, not replace)

### Active vs. Idle Ratio Target
| Play Style | Income Source | Approximate Rate |
|---|---|---|
| Pure idle | Bloomling production only | 1x baseline |
| Casual tapping | Idle + slow taps (no combo) | ~1.5-2x baseline |
| Active tapping | Idle + fast taps + combo | ~3-5x baseline |
| Active + ad boost | All above + 2x Sunbeam Boost | ~6-10x baseline |

The goal: **active players feel rewarded, idle players never feel punished.**

---

## Currency Overview

| Currency | Source | Persists Through | Purpose |
|---|---|---|---|
| **Sunlight** | Tapping + Bloomling idle production | Nothing (reset on Rebirth) | Buy upgrades, level Bloomlings, clear zones |
| **Nectar** | Earned on Rebirth (prestige 1) | Rebirth (lost on Transcendence) | Permanent multipliers, unlock features |
| **Essence** | Earned on Transcendence (prestige 2) | Everything | Massive multipliers, new biomes, ultimate upgrades |
| **Dewdrops** | Watching ads only | Everything | Exclusive cosmetics, QoL perks, unique Bloomlings |

---

## Feature Unlock Timeline

| Milestone | Feature Unlocked |
|---|---|
| Zone 1 | Tapping, first Bloomling (Fernley) |
| Zone 3 | Tap Upgrades shop |
| Zone 5 | Second Bloomling slot, Idle Upgrades shop |
| Zone 10 | Bloomling Evolution (Sprout -> Bloom) |
| Zone 15 | Ad rewards become available (Sunbeam Boost button appears) |
| Zone 20 | Dewdrop Shop unlocks |
| Zone 25 | First biome boss, Biome 2 unlocked on defeat |
| Zone 30 | Bloomling Synergies become visible |
| Zone 40 | Rebirth button appears (prestige 1), Nectar explained |
| Zone 50 | Elder Evolution unlocked (Bloom -> Elder) |
| Rebirth 3+ | Garden expansion slots |
| Rebirth 10+ | Transcendence teased |
| Zone 100+ (post-Rebirth) | Transcendence unlocked (prestige 2) |

Features drip-feed to avoid overwhelming new players. The first 10 minutes should feel simple: tap, grow, smile.

---

## Next Section
See `02-bloomling-mechanics.md` for Bloomling growth, evolution, synergies, and the Garden system.
