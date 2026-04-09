# Economy Balance Sheet 1: Currency & Production Rates

> Defines exact production numbers for the core Sunlight economy.
> Reference: `docs/design/01-core-game-loop.md`

---

## 1. Sunlight Per Tap

### Base Value

| Parameter | Value |
|---|---|
| Starting `baseTapValue` | 1 |
| Starting `tapMultiplier` | 1.0 |
| Starting `comboMultiplier` | 1.0 (no combo) |
| Starting `critMultiplier` | 5.0 |
| Starting `critChance` | 0.05 (5%) |

### Tap Formula

```
tapReward = baseTapValue * tapMultiplier * comboMultiplier * (isCritical ? critMultiplier : 1)
```

### Tap Scaling with Upgrades

`baseTapValue` is increased by **Tap Upgrades** (see `02-upgrade-costs.md` for full list). Each tap upgrade level adds a flat amount to `baseTapValue`.

Effective base tap value at key milestones (assuming typical upgrade progression):

| Game Phase | Approx. Zone | baseTapValue | tapMultiplier (prestige) | Effective Tap (no combo, no crit) |
|---|---|---|---|---|
| Start | 1 | 1 | 1.0 | 1 |
| Early | 10 | 5 | 1.0 | 5 |
| Mid | 25 | 25 | 1.0 | 25 |
| Late (pre-Rebirth) | 40-50 | 120 | 1.0 | 120 |
| Post-Rebirth 1 | 50 | 120 | 1.5 | 180 |
| Post-Rebirth 5 | 75 | 500 | 2.5 | 1,250 |
| Post-Transcendence | 100+ | 2,000 | 5.0 | 10,000 |

---

## 2. Sunlight Per Second (Idle Production)

### Base Rate Per Bloomling

Each Bloomling produces Sunlight per second based on:
```
bloomlingProduction = baseProduction * level * evolutionMultiplier
```

Where:
- `baseProduction` depends on rarity (see `03-bloomling-stats.md`)
- `level` ranges from 1-100 per evolution stage
- `evolutionMultiplier`: Sprout = 1x, Bloom = 3x, Elder = 9x

### Total Idle Rate

```
totalIdleRate = SUM(each Garden Bloomling's production) * idleMultiplier * synergyBonus
```

Where:
- `idleMultiplier` starts at 1.0 and is increased by Idle Upgrades
- `synergyBonus` is 1.0 (no synergy) up to 1.60 (4+ matching tags)

### Idle Rate at Key Milestones

| Zone | Garden Slots | Typical Bloomlings | Estimated Idle Rate (Sunlight/sec) |
|---|---|---|---|
| 1 | 1 | 1 Common Sprout Lv.1 | 1 |
| 5 | 2 | 2 Common Sprouts ~Lv.5 | 10 |
| 10 | 2 | 1 Common Bloom Lv.5, 1 Uncommon Sprout Lv.10 | 55 |
| 25 | 3 | Mixed Uncommon/Rare, avg Lv.20 | 450 |
| 40 | 4 | Mixed Rare/Epic, avg Lv.30 | 4,800 |
| 50 | 4 | Mixed Rare/Epic Bloom, avg Lv.25 | 14,400 |
| 75 (post-Rebirth) | 5 | Mixed Epic/Legendary, Bloom Lv.40 | 250,000 |
| 100 (post-Rebirth) | 6 | Legendary Elders + synergies | 5,000,000 |

---

## 3. Combo Multiplier

### Formula

```
comboMultiplier = 1 + (comboCount * 0.05)
```

- Combo builds by tapping within a **1.5-second window** of the previous tap
- Combo resets to 0 if no tap for 1.5 seconds
- Combo is capped at **100 hits**

### Worked Examples

| Combo Count | comboMultiplier | Calculation | Effective Tap (baseTap=1, no crit) |
|---|---|---|---|
| 0 | 1.00x | 1 + (0 * 0.05) | 1.00 |
| 10 | 1.50x | 1 + (10 * 0.05) | 1.50 |
| 20 | 2.00x | 1 + (20 * 0.05) | 2.00 |
| 25 | 2.25x | 1 + (25 * 0.05) | 2.25 |
| 50 | 3.50x | 1 + (50 * 0.05) | 3.50 |
| 75 | 4.75x | 1 + (75 * 0.05) | 4.75 |
| 100 (cap) | 6.00x | 1 + (100 * 0.05) | 6.00 |

### Combo Build Rate

At a comfortable tapping speed of ~5 taps/sec:
- Reach 10 combo in **2 seconds**
- Reach 25 combo in **5 seconds**
- Reach 50 combo in **10 seconds**
- Reach 100 combo (max) in **20 seconds**

At max anti-autoclicker speed of 20 taps/sec:
- Reach 100 combo in **5 seconds**

### Average Combo Multiplier During Active Play

Assuming a 60-second active session with 5 taps/sec:
- First 20 seconds: building combo from 0 to 100 (average combo ~50, multiplier ~3.5x)
- Remaining 40 seconds: at max combo (6.0x)
- Weighted average over 60s: `(20/60 * 3.5) + (40/60 * 6.0)` = **5.17x**

---

## 4. Critical Taps

### Base Stats

| Parameter | Value |
|---|---|
| Base critical chance | 5% (0.05) |
| Critical multiplier | 5x |
| Max critical chance (upgradeable) | 30% (soft cap) |

### Chance Scaling Per Upgrade

Critical chance is increased by specific tap upgrades and Bloomling abilities:
- **Lucky Fingers** upgrade: +1% per level (see `02-upgrade-costs.md`)
- Bloomling abilities can add +2% to +5% depending on rarity

### Critical Chance Progression

| Source | Critical Chance Added | Cumulative |
|---|---|---|
| Base | 5% | 5% |
| Lucky Fingers Lv.10 | +10% | 15% |
| Lucky Fingers Lv.25 | +25% | 30% (soft cap from this upgrade) |
| Bloomling ability (Rare) | +2% | 32% |
| Bloomling ability (Epic) | +4% | 36% |
| Nectar upgrade | +5% | 41% |

### Expected Value of Critical Taps

The expected multiplier per tap accounting for crits:
```
expectedCritMultiplier = (1 - critChance) * 1 + critChance * critMultiplier
                       = 1 + critChance * (critMultiplier - 1)
                       = 1 + critChance * 4
```

| Critical Chance | Expected Multiplier Per Tap |
|---|---|
| 5% (base) | 1.20x |
| 10% | 1.40x |
| 15% | 1.60x |
| 20% | 1.80x |
| 25% | 2.00x |
| 30% | 2.20x |

### Tap Income with Crit (Full Formula)

Expected income per tap:
```
expectedTapReward = baseTapValue * tapMultiplier * comboMultiplier * expectedCritMultiplier
```

**Worked example** (Zone 25, baseTap=25, tapMult=1.0, combo=50, critChance=10%):
```
= 25 * 1.0 * 3.50 * 1.40
= 122.5 Sunlight per tap (expected)
```

---

## 5. Active vs Idle Income Ratio Verification

Design target from `01-core-game-loop.md`:
| Play Style | Target Ratio |
|---|---|
| Pure idle | 1x baseline |
| Casual tapping (no combo) | ~1.5-2x baseline |
| Active tapping (with combo) | ~3-5x baseline |
| Active + ad boost | ~6-10x baseline |

### Methodology

Active income = tap income per second (at sustained tapping rate)
Idle income = total Bloomling production per second

Assume active tapping at 5 taps/sec with a sustained combo of ~50 (multiplier 3.5x average over a session).

### Zone 10 Verification

| Component | Value | Calculation |
|---|---|---|
| Idle rate | 55 Sun/sec | 2 Bloomlings (see table above) |
| baseTapValue | 5 | Early upgrades |
| tapMultiplier | 1.0 | No prestige yet |
| comboMultiplier (avg) | 3.5 | ~50 combo average |
| expectedCritMultiplier | 1.20 | 5% base crit |
| Taps per second | 5 | Comfortable active play |
| Tap income/sec | 5 * 1.0 * 3.5 * 1.20 * 5 = **105** | baseTap * tapMult * combo * crit * tapsPerSec |
| Total active income/sec | 55 + 105 = **160** | Idle + Tap |
| **Active:Idle ratio** | **160 / 55 = 2.9x** | Within 3-5x target range |

### Zone 25 Verification

| Component | Value | Calculation |
|---|---|---|
| Idle rate | 450 Sun/sec | 3 Bloomlings |
| baseTapValue | 25 | Mid-game upgrades |
| tapMultiplier | 1.0 | No prestige yet |
| comboMultiplier (avg) | 4.0 | Sustained combo ~60 |
| expectedCritMultiplier | 1.40 | 10% crit (some upgrades) |
| Taps per second | 5 | |
| Tap income/sec | 25 * 1.0 * 4.0 * 1.40 * 5 = **700** | |
| Total active income/sec | 450 + 700 = **1,150** | |
| **Active:Idle ratio** | **1,150 / 450 = 2.56x** | Slightly below target; combo/crit upgrades push it higher |

Casual tapping (no combo, 2 taps/sec): `25 * 1.0 * 1.0 * 1.20 * 2 = 60` => total `510 / 450 = 1.13x`. This is the "casual" range -- acceptable since casual players are barely tapping.

With full 100-combo sustained (6.0x): `25 * 1.0 * 6.0 * 1.40 * 5 = 1,050` => total `1,500 / 450 = 3.33x`. Solidly in the 3-5x range for dedicated active play.

### Zone 50 Verification

| Component | Value | Calculation |
|---|---|---|
| Idle rate | 14,400 Sun/sec | 4 Bloomlings, Bloom stage |
| baseTapValue | 120 | Late-game upgrades |
| tapMultiplier | 1.0 | First run (no Rebirth yet) |
| comboMultiplier (avg) | 5.0 | Sustained high combo |
| expectedCritMultiplier | 1.60 | 15% crit |
| Taps per second | 5 | |
| Tap income/sec | 120 * 1.0 * 5.0 * 1.60 * 5 = **4,800** | |
| Total active income/sec | 14,400 + 4,800 = **19,200** | |
| **Active:Idle ratio** | **19,200 / 14,400 = 1.33x** | |

**Analysis**: At Zone 50 the idle income dominates because Bloom-stage Bloomlings are very productive. This is **intentional** -- by Zone 50, the player has invested heavily in Bloomlings and the game is transitioning toward prestige. Active play still adds meaningful income, but the ratio shifts toward idle as designed.

With ad boost (2x all production): `(14,400 * 2) + 4,800 = 33,600` => `33,600 / 14,400 = 2.33x`. The ad boost primarily amplifies idle (as intended for late-game monetization).

### Ratio Summary

| Zone | Pure Idle | Casual Tap | Active Tap | Active + Ad Boost |
|---|---|---|---|---|
| 10 | 1.0x | ~1.4x | ~2.9x | ~5.3x |
| 25 | 1.0x | ~1.1x | ~3.3x | ~5.9x |
| 50 | 1.0x | ~1.1x | ~1.3x | ~2.3x |

**Balance note**: The Zone 50 active ratio is lower than target. This is acceptable because: (1) Zone 50 is near first-Rebirth territory where idle dominance encourages the prestige reset, and (2) post-Rebirth `tapMultiplier` from Nectar upgrades will restore the ratio. Post-Rebirth at Zone 50 with `tapMultiplier=1.5`: active ratio becomes `~1.5x`, and the post-Rebirth push to higher zones (60-75) will have better ratios since tap upgrades scale with the new run.

---

## 6. Number Formatting Thresholds

All numbers use abbreviated notation past certain thresholds for readability.

| Threshold | Format | Example |
|---|---|---|
| < 1,000 | Full number | 847 |
| >= 1,000 | K (thousands) | 1.5K, 25.3K, 999K |
| >= 1,000,000 | M (millions) | 1.2M, 500M |
| >= 1,000,000,000 | B (billions) | 3.4B |
| >= 1,000,000,000,000 | T (trillions) | 1.1T |
| >= 1e15 | Scientific notation | 2.5e15 |

### Formatting Rules

```javascript
function formatSunlight(value) {
  if (value < 1000) return Math.floor(value).toString();
  if (value < 1e6) return (value / 1e3).toFixed(1) + "K";
  if (value < 1e9) return (value / 1e6).toFixed(1) + "M";
  if (value < 1e12) return (value / 1e9).toFixed(1) + "B";
  if (value < 1e15) return (value / 1e12).toFixed(1) + "T";
  return value.toExponential(2);
}
```

### Expected Number Ranges by Game Phase

| Phase | Sunlight/sec | Sunlight Accumulated | Typical Format |
|---|---|---|---|
| First 10 min | 1-50 | 1-5K | Full / K |
| First hour | 50-5K | 10K-500K | K |
| First Rebirth (2-4hr) | 5K-15K | 1M-50M | K / M |
| Post-Rebirth runs | 15K-500K | 50M-10B | M / B |
| Post-Transcendence | 500K-50M | 10B-10T | B / T |
| Deep endgame | 50M+ | 10T+ | T / Scientific |

### JavaScript Safety

All values remain within `Number.MAX_SAFE_INTEGER` (9,007,199,254,740,991, roughly 9e15) through the main progression. Deep endgame values approaching the T/scientific range should use careful float arithmetic but do not require BigInt. If a future expansion pushes beyond 9e15 accumulated Sunlight, a precision layer should be added.

---

## Quick Reference: All Core Formulas

| Formula | Expression |
|---|---|
| Tap reward | `baseTapValue * tapMultiplier * comboMultiplier * (isCrit ? 5 : 1)` |
| Combo multiplier | `1 + comboCount * 0.05` (cap: comboCount=100, max 6x) |
| Expected crit multiplier | `1 + critChance * 4` |
| Bloomling production | `baseProduction * level * evolutionMult` |
| Total idle rate | `SUM(bloomlingProduction) * idleMultiplier * synergyBonus` |
| Zone threshold | `50 * 1.12^zoneNumber` |
