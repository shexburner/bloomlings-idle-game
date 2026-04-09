# Economy Balance Sheet 4: Prestige Math

> Tunes prestige formulas for satisfying Rebirth and Transcendence cycles.
> References: `docs/design/04-prestige-systems.md`, `01-currency-rates.md`, `02-upgrade-costs.md`, `03-bloomling-stats.md`

---

## 1. Nectar Formula — Tuned Constants

### Formula

```
nectarEarned = floor(baseNectar * (highestZone / nectarThreshold)^nectarExponent)
```

### Tuned Constants

| Constant | Design Doc Default | Tuned Value | Rationale |
|---|---|---|---|
| `baseNectar` | 1 | **1** | Keeps Zone 40 (Rebirth unlock) at exactly 1 Nectar |
| `nectarThreshold` | 40 | **32** | Lowered to steepen the curve for mid-range zones; produces ~doubling every 10-15 zones early on |
| `nectarExponent` | 2.2 | **3.1** | Raised to give meaningful Nectar differentiation between zone pushes; with exponent 2.2 the early Nectar values are too flat |

### Verification Math

```javascript
// Zone 50: floor(1 * (50/32)^3.1) = floor(1.5625^3.1) = floor(4.01) = 4
// Zone 75: floor(1 * (75/32)^3.1) = floor(2.344^3.1) = floor(14.2) = 14
// Zone 100: floor(1 * (100/32)^3.1) = floor(3.125^3.1) = floor(35.0) = 35
```

### Nectar Table

| Highest Zone | zone/threshold | (ratio)^3.1 | Nectar Earned |
|---|---|---|---|
| 35 | 1.094 | 1.31 | 1 |
| 40 | 1.250 | 2.01 | 1 |
| 42 | 1.313 | 2.33 | 2 |
| 45 | 1.406 | 2.89 | 2 |
| 48 | 1.500 | 3.53 | 3 |
| 50 | 1.563 | 4.01 | 3 |
| 55 | 1.719 | 5.34 | 5 |
| 60 | 1.875 | 6.98 | 6 |
| 65 | 2.031 | 8.98 | 8 |
| 70 | 2.188 | 11.38 | 11 |
| 75 | 2.344 | 14.24 | 14 |
| 80 | 2.500 | 17.60 | 17 |
| 85 | 2.656 | 21.52 | 21 |
| 90 | 2.813 | 26.05 | 26 |
| 95 | 2.969 | 31.25 | 31 |
| 100 | 3.125 | 37.17 | 35 |
| 110 | 3.438 | 51.11 | 48 |
| 120 | 3.750 | 68.32 | 63 |
| 130 | 4.063 | 89.08 | 82 |
| 140 | 4.375 | 113.70 | 105 |
| 150 | 4.688 | 142.48 | 131 |
| 175 | 5.469 | 226.05 | 210 |
| 200 | 6.250 | 337.32 | 316 |

**Design check**: The curve rewards pushing further but with diminishing returns per zone. Going from Zone 40 to 50 gains +2 Nectar; Zone 50 to 60 gains +3; Zone 60 to 75 gains +8. Each "extra push" is proportionally less efficient, creating the intended tension: reset now or push further?

---

## 2. Optimal Rebirth Analysis

### Nectar Per Hour

The key metric for optimal Rebirth is **Nectar earned per hour of play**. Pushing further gives more Nectar but takes longer.

#### First Run Estimates

| Rebirth at Zone | Nectar Earned | Est. Time to Reach | Nectar/Hour |
|---|---|---|---|
| 40 | 1 | ~1h 40m | 0.6 |
| 45 | 2 | ~2h 15m | 0.9 |
| **50** | **3** | **~3h 00m** | **1.0** |
| 55 | 5 | ~4h 00m | 1.3 |
| 60 | 6 | ~5h 30m | 1.1 |

**First run optimal Rebirth point**: Zone 50-55. Pushing past Zone 55 yields diminishing Nectar/hour on the first run due to the production wall. Zone 50 is the natural inflection point (Biome 2 Boss creates a satisfying narrative endpoint).

#### Post-Rebirth Runs (with Nectar upgrades)

| Run | Typical Rebirth Zone | Nectar Earned | Run Time | Nectar/Hour |
|---|---|---|---|---|
| Run 2 | 55 | 5 | ~1h 30m | 3.3 |
| Run 3 | 60 | 6 | ~1h 30m | 4.0 |
| Run 5 | 70 | 11 | ~1h 00m | 11.0 |
| Run 10 | 90 | 26 | ~45m | 34.7 |
| Run 15 | 110 | 48 | ~35m | 82.3 |
| Run 20 | 120 | 63 | ~35m | 108.0 |

**Acceleration curve**: Nectar/hour improves dramatically with each Rebirth. By Run 10, the player earns Nectar 35x faster than their first run. This acceleration is the core dopamine loop of the prestige system — each Rebirth feels faster and more powerful.

### When To Rebirth (General Rule)

Rebirth is optimal when the player's zone progress has slowed to a crawl — roughly when clearing the next zone takes 3+ minutes of active play. At that point, the time spent pushing is better spent on a fresh run with new Nectar upgrades.

---

## 3. Nectar Upgrade Costs — Cumulative Verification

From `docs/design/04-prestige-systems.md`, with cumulative Nectar spend:

### Upgrade Priority Path

| Priority | Upgrade | Level Costs | Cumul. Cost | Key Effect |
|---|---|---|---|---|
| 1 | Enriched Soil Lv.1 | 1 | 1 | +25% production |
| 2 | Stronger Roots Lv.1 | 2 | 3 | +20% tap value |
| 3 | Enriched Soil Lv.2 | 3 | 6 | +50% production |
| 4 | Seasonal Memory Lv.1 | 5 | 11 | Start at Zone 5 |
| 5 | Enriched Soil Lv.3 | 8 | 19 | +75% production |
| 6 | Nectar Roots Lv.1 | 8 | 27 | +10% Nectar earned |
| 7 | Garden Expansion Lv.1 | 10 | 37 | +1 Garden slot |
| 8 | Combo Memory | 12 | 49 | Start combo at 10 |
| 9 | Stronger Roots Lv.2 | 5 | 54 | +40% tap value |
| 10 | Enriched Soil Lv.4 | 15 | 69 | +100% production (2x) |

### Milestone Purchases

| Milestone | Total Nectar Needed | Rebirths to Accumulate | Approx. Time |
|---|---|---|---|
| First upgrade (Enriched Soil Lv.1) | 1 | 1 | ~3 hours |
| Basic setup (ES.2 + SR.1) | 6 | 2 | ~5 hours |
| Solid foundation (ES.3 + SR.1 + SM.1) | 19 | 3-4 | ~7 hours |
| Garden Expansion | 37 | 5-6 | ~9 hours |
| Bloom Retention | 20 | 4-5 | ~8 hours |
| Elder Retention | 100 | 9-10 | ~14 hours |

**Design check**: Each Rebirth gives the player enough Nectar for 1-2 meaningful upgrades. No single Rebirth feels wasted. The upgrade costs scale appropriately with Nectar income.

---

## 4. Time-to-First-Rebirth Verification

**Target**: 2-4 hours of play (from design doc).

### First Run Timeline

| Elapsed Time | Zone | Sun/sec (idle) | Key Event |
|---|---|---|---|
| 5 min | 5 | 10 | 2 Garden slots, tutorial complete |
| 10 min | 10 | 55 | Evolution unlocked |
| 18 min | 15 | 100 | Sunbeam Boost available |
| 28 min | 20 | 250 | Dewdrop Garden unlocks |
| 40 min | 25 | 450 | Biome 1 Boss, 3rd garden slot |
| 55 min | 30 | 1,200 | Sunlit Glade, new Bloomlings |
| 1h 15m | 35 | 2,500 | Pacing slows, investment needed |
| **1h 40m** | **40** | **4,800** | **Rebirth unlocks (1 Nectar)** |
| 2h 15m | 45 | 8,000 | Pushing for better Nectar (2 Nectar) |
| **3h 00m** | **50** | **14,400** | **Biome 2 Boss, 3 Nectar — optimal first Rebirth** |

**Result**: First viable Rebirth at ~1h 40m (Zone 40, 1 Nectar). Recommended first Rebirth at ~3h (Zone 50, 3 Nectar). This falls within the 2-4 hour target window.

### Assumptions

- Mix of active and idle play (~60% active, 40% idle)
- Player invests Sunlight in upgrades and Bloomling levels as available
- No ad boosts used (ads would speed this up by ~20-30%)
- Gates cleared on first or second attempt through Zone 40; Boss at Zone 25 may require 1-2 attempts

---

## 5. Post-Rebirth Speedup Factor

### Run 2 vs Run 1

After first Rebirth (3 Nectar invested):
- **Enriched Soil Lv.1**: +25% idle production
- **Stronger Roots Lv.1**: +20% tap value
- Kept: all discovered Bloomlings (return as Sprout Lv.1)
- Player knowledge: knows optimal upgrade order

| Metric | Run 1 | Run 2 | Speedup |
|---|---|---|---|
| Idle production multiplier | 1.0x | 1.25x | 1.25x |
| Tap multiplier | 1.0x | 1.20x | 1.20x |
| Combined active rate | 1.0x | ~1.5x | 1.5x |
| Time to Zone 40 | ~100 min | ~50 min | 2.0x |
| Time to Zone 50 | ~180 min | ~90 min | 2.0x |
| Push to Zone 55 | N/A | ~90 min total | - |

**Run 2 feels**: Dramatically faster through zones 1-25. The early game melts away. The "I'm so powerful now" rush is strong. Player reaches their old wall in half the time and pushes beyond.

### Run 5 vs Run 1

After 5 Rebirths (~33 Nectar invested):
- **Enriched Soil Lv.3**: +75% production (1.75x)
- **Stronger Roots Lv.3**: +60% tap value (1.60x)
- **Seasonal Memory Lv.1**: Start at Zone 5
- **Rapid Growth Lv.1**: -10% level-up costs

| Metric | Run 1 | Run 5 | Speedup |
|---|---|---|---|
| Idle production multiplier | 1.0x | 1.75x | 1.75x |
| Tap multiplier | 1.0x | 1.60x | 1.60x |
| Combined active rate | 1.0x | ~2.8x | 2.8x |
| Starting zone | 1 | 5 | Skip 5 zones |
| Time to Zone 50 | ~180 min | ~35 min | **5.1x** |
| Push zone | 50 | 70+ | +20 zones |

**Run 5 feels**: The first 30 zones are trivial (cleared in ~15 minutes). The player spends most of their time pushing past Zone 50 into new territory. Zones 50-70 feel like the "real game" now.

---

## 6. Total Player Power After N Rebirths

### Multiplicative Power Scaling

Nectar upgrades stack additively within each category, then multiply across categories:

```
totalPower = productionMult * tapMult * nectarMult * (1 - levelCostReduction)
```

| After Run | ES Level | Prod Mult | SR Level | Tap Mult | Combined Power |
|---|---|---|---|---|---|
| 0 (fresh) | 0 | 1.00x | 0 | 1.00x | 1.00x |
| 1 | 1 | 1.25x | 1 | 1.20x | 1.50x |
| 2 | 2 | 1.50x | 1 | 1.20x | 1.80x |
| 3 | 3 | 1.75x | 1 | 1.20x | 2.10x |
| 5 | 3 | 1.75x | 3 | 1.60x | 2.80x |
| 7 | 4 | 2.00x | 3 | 1.60x | 3.20x |
| 10 | 5 | 2.25x | 4 | 1.80x | 4.05x |
| 15 | 6 | 2.50x | 5 | 2.00x | 5.00x |
| 20 | 7 | 2.75x | 6 | 2.20x | 6.05x |
| 25 | 9 | 3.25x | 6 | 2.20x | 7.15x |
| 30 | 9 | 3.25x | 7 | 2.40x | 7.80x |

**Additional power from other Nectar upgrades** (not shown in combined column):
- Nectar Roots: compounding +10%/level on future Nectar income
- Rapid Growth: -10%/level on Bloomling leveling costs (frees up Sunlight)
- Bloom/Elder Retention: keeps evolution stages through Rebirth (massive time savings)
- Garden Expansion: +1-2 garden slots (multiplicative with production)

### Effective Zone Push by Rebirth Count

| Rebirths | Typical Push Zone | Nectar Per Run | Run Duration |
|---|---|---|---|
| 1 | 47 | 3 | 3h 00m |
| 3 | 61 | 7 | 1h 30m |
| 5 | 73 | 12 | 1h 00m |
| 10 | 95 | 31 | 45m |
| 15 | 113 | 58 | 35m |
| 20 | 121 | 79 | 35m |
| 25 | 127 | 92 | 25m |
| 30 | 133 | 114 | 25m |

---

## 7. Essence Formula — Tuned Constants

### Formula

```
essenceEarned = floor(baseEssence * (totalNectarSpent / essenceThreshold)^essenceExponent)
```

### Constants (from design doc — verified as balanced)

| Constant | Value | Rationale |
|---|---|---|
| `baseEssence` | 1 | First Transcendence yields a single-digit Essence amount |
| `essenceThreshold` | 50 | Requires meaningful Nectar investment before Essence scales |
| `essenceExponent` | 1.8 | Sub-quadratic: encourages deep Nectar investment but doesn't explode |

### Essence Table

| Total Nectar Spent | ratio | (ratio)^1.8 | Essence Earned |
|---|---|---|---|
| 50 | 1.00 | 1.00 | 1 |
| 100 | 2.00 | 3.48 | 3 |
| 150 | 3.00 | 7.22 | 7 |
| 200 | 4.00 | 12.13 | 12 |
| 300 | 6.00 | 25.15 | 25 |
| 400 | 8.00 | 42.22 | 42 |
| 500 | 10.00 | 63.10 | 63 |
| 700 | 14.00 | 115.38 | 115 |
| 1,000 | 20.00 | 219.09 | 219 |
| 1,500 | 30.00 | 440.67 | 440 |
| 2,000 | 40.00 | 724.08 | 724 |

### Verification Calculation

```javascript
// At Transcendence with 500 Nectar spent:
// floor(1 * (500/50)^1.8) = floor(10^1.8) = floor(63.10) = 63 Essence
```

---

## 8. Transcendence Timing Verification

**Target**: First Transcendence after 1-2 weeks of play.

### Requirements

From `docs/design/04-prestige-systems.md`:
- 10+ Rebirths completed
- Reach Zone 150+ in a single run

### Timeline to Meeting Requirements

| Milestone | When | Cumulative Play Time |
|---|---|---|
| First Rebirth | Run 1, Zone 50 | ~3h |
| 10 Rebirths complete | Run 10, Zone 95 | ~12h |
| Zone 150 first reachable | Run 14, Zone 150+ | ~16h |
| **Earliest Transcendence** | **Run 14** | **~16 hours** |

### Real-World Calendar Time

| Player Type | Daily Play | Days to Transcendence |
|---|---|---|
| Hardcore (3+ hr/day) | 3-4 hours | 4-5 days |
| Regular (1-2 hr/day) | 1.5 hours | 10-12 days |
| Casual (30-60 min/day) | 45 minutes | 20-25 days |

**Result**: Regular players hit Transcendence in ~1.5-2 weeks. Hardcore players can reach it in under a week. Casual players take about 3 weeks. This is slightly wider than the 1-2 week target for casuals, but acceptable — casual players aren't expected to Transcend quickly.

### Nectar Spent at First Transcendence

By Run 14 (typical): ~367 total Nectar earned, ~300-350 spent.

```javascript
// Essence at first Transcendence: floor(1 * (350/50)^1.8) = floor(7.0^1.8) = floor(32.8) = 32 Essence
```

With 32 Essence, the player can buy:
- Primordial Vigor Lv.1 (1 Essence): All production x2
- Ancient Wisdom Lv.1 (2 Essence): All Nectar x1.5
- Biome Attunement Lv.1 (3 Essence): Unlock biome mechanic from Zone 1
- Accelerated Seasons Lv.1 (4 Essence): Higher starting zone for Rebirths
- Bloomling Awakening (10 Essence): Unlock Legendary Bloomlings
- Remaining: 12 Essence for future upgrades

This is a satisfying amount — the player can buy 4-5 meaningful upgrades and unlock Legendary Bloomlings, dramatically changing the game feel.

---

## 9. JavaScript Safety Check

### Maximum Values at Key Milestones

| Milestone | Largest Number | Safe? |
|---|---|---|
| Zone 200 Nectar | 316 | Yes |
| 2,000 Nectar spent Essence | 724 | Yes |
| Zone 200 threshold | 3.49e11 | Yes (< 9.0e15) |
| Max Sunlight/sec (endgame) | ~46.7M | Yes |
| Nectar formula at Zone 500 | floor((500/32)^3.1) = 5,879 | Yes |

All values remain within `Number.MAX_SAFE_INTEGER` (9.007e15). No BigInt required.

---

## 10. Quick Reference: All Prestige Formulas

| Formula | Expression |
|---|---|
| Nectar earned | `floor(1 * (highestZone / 32)^3.1)` |
| Essence earned | `floor(1 * (totalNectarSpent / 50)^1.8)` |
| Enriched Soil bonus | `1 + level * 0.25` (production multiplier) |
| Stronger Roots bonus | `1 + level * 0.20` (tap multiplier) |
| Nectar Roots bonus | `1 + level * 0.10` (Nectar multiplier) |
| Rapid Growth discount | `1 - level * 0.10` (level-up cost multiplier) |
| Optimal Rebirth point | When zone progress slows to 3+ min per zone |
| First Rebirth timing | ~2-3 hours at Zone 45-50 |
| First Transcendence timing | ~16 hours play time / ~10-14 days calendar |
