# Economy Balance Sheet 3: Bloomling Stats

> Defines per-rarity base stats, scaling formulas, evolution multipliers, abilities, and synergy verification.
> References: `docs/design/02-bloomling-mechanics.md`, `01-currency-rates.md`

---

## 1. Base Sunlight/sec Per Rarity Tier

From the design doc, rarity production multipliers are:

| Rarity | Base Production Multiplier | Base Sunlight/sec (Sprout Lv.1) |
|---|---|---|
| **Common** | 1x | 1 |
| **Uncommon** | 2x | 2 |
| **Rare** | 5x | 5 |
| **Epic** | 12x | 12 |
| **Legendary** | 30x | 30 |
| **Mythic** | 100x | 100 |

These are the anchor values for the entire idle economy. A Common Sprout at Level 1 produces exactly **1 Sunlight per second**.

---

## 2. Per-Level Production Formula

From `02-bloomling-mechanics.md`:

```
bloomlingProduction = baseProduction * level * evolutionMultiplier
```

Where:
- `baseProduction` = rarity base from the table above
- `level` = current level (1-100)
- `evolutionMultiplier` = Sprout: 1x, Bloom: 3x, Elder: 9x

This is **linear scaling** with level -- simple and predictable. A level 50 Bloomling produces exactly 50x what it does at level 1 (before evolution multipliers).

### Why Linear?

Exponential production scaling combined with exponential cost scaling creates runaway inflation. Linear production with geometric costs (`1.10^level`) means each level gives diminishing returns per Sunlight spent, creating natural soft walls that encourage diversifying (leveling other Bloomlings, pursuing evolution, or prestiging).

---

## 3. Production at Key Levels Per Rarity

### 3.1 Sprout Stage (evolutionMultiplier = 1x)

| Rarity | Lv.1 | Lv.25 | Lv.50 | Lv.100 |
|---|---|---|---|---|
| Common | 1 | 25 | 50 | 100 |
| Uncommon | 2 | 50 | 100 | 200 |
| Rare | 5 | 125 | 250 | 500 |
| Epic | 12 | 300 | 600 | 1,200 |
| Legendary | 30 | 750 | 1,500 | 3,000 |
| Mythic | 100 | 2,500 | 5,000 | 10,000 |

**Worked example**: Rare Sprout Lv.50 = `5 * 50 * 1 = 250 Sun/sec`

### 3.2 Bloom Stage (evolutionMultiplier = 3x)

| Rarity | Lv.1 | Lv.25 | Lv.50 | Lv.100 |
|---|---|---|---|---|
| Common | 3 | 75 | 150 | 300 |
| Uncommon | 6 | 150 | 300 | 600 |
| Rare | 15 | 375 | 750 | 1,500 |
| Epic | 36 | 900 | 1,800 | 3,600 |
| Legendary | 90 | 2,250 | 4,500 | 9,000 |
| Mythic | 300 | 7,500 | 15,000 | 30,000 |

**Worked example**: Epic Bloom Lv.25 = `12 * 25 * 3 = 900 Sun/sec`

### 3.3 Elder Stage (evolutionMultiplier = 9x)

| Rarity | Lv.1 | Lv.25 | Lv.50 | Lv.100 |
|---|---|---|---|---|
| Common | 9 | 225 | 450 | 900 |
| Uncommon | 18 | 450 | 900 | 1,800 |
| Rare | 45 | 1,125 | 2,250 | 4,500 |
| Epic | 108 | 2,700 | 5,400 | 10,800 |
| Legendary | 270 | 6,750 | 13,500 | 27,000 |
| Mythic | 900 | 22,500 | 45,000 | 90,000 |

**Worked example**: Legendary Elder Lv.100 = `30 * 100 * 9 = 27,000 Sun/sec`

---

## 4. Evolution Multiplier Verification

The design doc specifies 3x per evolution stage. Let us verify this creates satisfying progression.

### 4.1 Sprout vs Bloom vs Elder at Lv.1

| Rarity | Sprout Lv.1 | Bloom Lv.1 | Elder Lv.1 | Bloom/Sprout | Elder/Sprout |
|---|---|---|---|---|---|
| Common | 1 | 3 | 9 | 3.0x | 9.0x |
| Rare | 5 | 15 | 45 | 3.0x | 9.0x |
| Epic | 12 | 36 | 108 | 3.0x | 9.0x |
| Legendary | 30 | 90 | 270 | 3.0x | 9.0x |

The 3x multiplier is consistent. At evolution, the Bloomling's level resets to 1, but production starts at 3x the **base** -- meaning a freshly evolved Bloom Lv.1 produces the same as a Sprout Lv.3. This creates a brief "dip" in production right after evolution that is quickly recovered.

### 4.2 Evolution Transition Analysis

A Sprout at Lv.100 evolves to a Bloom at Lv.1:

| Rarity | Sprout Lv.100 | Bloom Lv.1 | Ratio | Break-Even Level (Bloom) |
|---|---|---|---|---|
| Common | 100 | 3 | 0.03x | Lv.34 |
| Rare | 500 | 15 | 0.03x | Lv.34 |
| Epic | 1,200 | 36 | 0.03x | Lv.34 |

**Break-even calculation**: Bloom Lv.L = Sprout Lv.100 when `base * L * 3 = base * 100 * 1`, so `L = 100/3 = 33.3`, meaning **Bloom Lv.34** surpasses Sprout Lv.100.

This is a meaningful dip: after evolution, the player needs to invest in ~34 levels before the Bloomling regains its pre-evolution output. This mirrors the "mini-prestige" design intent. The payoff is that Bloom Lv.100 produces 3x what Sprout Lv.100 did, and the journey to Lv.100 again is engaging.

### 4.3 Full Lifecycle Production Curve

Taking a Common Bloomling through all stages:

| Milestone | Production (Sun/sec) | Total Leveling Cost |
|---|---|---|
| Sprout Lv.1 | 1 | 0 |
| Sprout Lv.25 | 25 | 491 |
| Sprout Lv.50 | 50 | 5,664 |
| Sprout Lv.100 | 100 | 758K |
| *Evolution to Bloom* | *(drops to 3)* | *+10K evo cost* |
| Bloom Lv.1 | 3 | 768K total |
| Bloom Lv.34 (break-even) | 102 | 798K total |
| Bloom Lv.50 | 150 | 874K total |
| Bloom Lv.100 | 300 | 1.53M total |
| *Evolution to Elder* | *(drops to 9)* | *+100K evo + 5 Nectar* |
| Elder Lv.1 | 9 | 1.63M total |
| Elder Lv.12 (break-even) | 108 | ~1.64M total |
| Elder Lv.50 | 450 | 1.80M total |
| Elder Lv.100 | 900 | 2.38M total |

> **Note**: Elder break-even vs Bloom Lv.100 occurs at `L = 100/3 = 34` as well. Elder Lv.34 = `1 * 34 * 9 = 306`, which surpasses Bloom Lv.100 = 300.

---

## 5. Ability Strength Values Per Rarity

Abilities unlock at Bloom stage (base power) and enhance at Elder stage (2x power, per design doc).

### 5.1 Ability Strength Table

| Ability Type | Common | Uncommon | Rare | Epic | Legendary | Mythic |
|---|---|---|---|---|---|---|
| **Production Boost (all)** | +2% | +4% | +8% | +12% | +20% | +35% |
| **Production Boost (self)** | +10% | +20% | +40% | +60% | +100% | +200% |
| **Tap Boost (baseTapValue)** | +1 | +3 | +8 | +20 | +50 | +150 |
| **Crit Chance** | +0.5% | +1% | +2% | +4% | +6% | +10% |
| **Combo Boost (decay timer)** | +0.2s | +0.3s | +0.5s | +0.8s | +1.0s | +1.5s |
| **Zone Boost (threshold reduction)** | -1% | -2% | -3% | -5% | -8% | -12% |
| **Prestige Boost (Nectar)** | +1% | +2% | +5% | +8% | +12% | +20% |

### 5.2 Elder Enhancement (2x)

At Elder stage, all ability values double:

| Ability Type | Common Elder | Rare Elder | Epic Elder | Legendary Elder | Mythic Elder |
|---|---|---|---|---|---|
| **Production Boost (all)** | +4% | +16% | +24% | +40% | +70% |
| **Crit Chance** | +1% | +4% | +8% | +12% | +20% |
| **Zone Boost** | -2% | -6% | -10% | -16% | -24% |
| **Prestige Boost** | +2% | +10% | +16% | +24% | +40% |

### 5.3 Ability Value Analysis

**Example**: A Legendary Elder with "+40% production to all Garden Bloomlings" applied to a 4-slot garden averaging 5,000 Sun/sec total idle:
```
Bonus = 5,000 * 0.40 = +2,000 Sun/sec
Effective total = 7,000 Sun/sec
```
This is a massive multiplier but requires significant investment (Legendary Bloomling leveled to Elder Lv.100).

---

## 6. Synergy Bonus Verification

### 6.1 Synergy Tiers (from design doc)

| Matching Bloomlings | Bonus to Tagged Members |
|---|---|
| 2 with same tag | +15% production |
| 3 with same tag | +35% production |
| 4+ with same tag | +60% production |

Synergies only apply to Elder-stage Bloomlings (who have Synergy Tags).

### 6.2 Synergy Math Verification

**Test Case: 2 Matching Elders (15% bonus)**

Garden: 2 Rare Elders (tag: "Mossy") at Lv.50, 1 Epic Bloom at Lv.50 (no tag match), 1 Common Elder Lv.50 (no tag match)

| Bloomling | Base Production | Synergy Bonus | Effective Production |
|---|---|---|---|
| Rare Elder Lv.50 #1 | 5 * 50 * 9 = 2,250 | +15% = +337.5 | **2,587.5** |
| Rare Elder Lv.50 #2 | 5 * 50 * 9 = 2,250 | +15% = +337.5 | **2,587.5** |
| Epic Bloom Lv.50 | 12 * 50 * 3 = 1,800 | none | **1,800** |
| Common Elder Lv.50 | 1 * 50 * 9 = 450 | none | **450** |
| **Total** | 6,750 | +675 | **7,425** |

Synergy provides a +10% boost to total garden output in this configuration.

**Test Case: 3 Matching Elders (35% bonus)**

Garden: 3 Rare Elders (tag: "Mossy") at Lv.50, 1 Epic Bloom at Lv.50

| Bloomling | Base Production | Synergy Bonus | Effective Production |
|---|---|---|---|
| Rare Elder Lv.50 #1 | 2,250 | +35% = +787.5 | **3,037.5** |
| Rare Elder Lv.50 #2 | 2,250 | +35% = +787.5 | **3,037.5** |
| Rare Elder Lv.50 #3 | 2,250 | +35% = +787.5 | **3,037.5** |
| Epic Bloom Lv.50 | 1,800 | none | **1,800** |
| **Total** | 8,550 | +2,362.5 | **10,912.5** |

Synergy provides a +27.6% boost to total garden output.

**Test Case: 4 Matching Elders (60% bonus)**

Garden: 4 Rare Elders (tag: "Mossy") at Lv.50

| Bloomling | Base Production | Synergy Bonus | Effective Production |
|---|---|---|---|
| Each of 4 Rare Elders | 2,250 | +60% = +1,350 | **3,600** |
| **Total** | 9,000 | +5,400 | **14,400** |

Synergy provides a +60% boost to total garden output (since all members benefit).

### 6.3 Synergy vs Higher Rarity Trade-off

Is it better to run 4 synergized Rare Elders or 2 Rare Elders + 1 Epic Bloom + 1 unmatched Legendary Bloom?

**Option A**: 4x Rare Elder Lv.50 with 60% synergy
```
= 4 * (5 * 50 * 9) * 1.60
= 4 * 2,250 * 1.60
= 14,400 Sun/sec
```

**Option B**: 2x Rare Elder Lv.50 (15% synergy) + 1x Epic Bloom Lv.50 + 1x Legendary Bloom Lv.50
```
= 2 * (2,250 * 1.15) + (12 * 50 * 3) + (30 * 50 * 3)
= 2 * 2,587.5 + 1,800 + 4,500
= 5,175 + 1,800 + 4,500
= 11,475 Sun/sec
```

**Result**: Option A (synergy-focused) beats Option B by 25%. Synergies are powerful enough to justify keeping lower-rarity Bloomlings over unsynergized higher-rarity ones. This creates the team-building metagame the design intends.

However, if the Legendary were an Elder:
```
Option C: 2x Rare Elder Lv.50 (15%) + 1x Epic Bloom Lv.50 + 1x Legendary Elder Lv.50
= 5,175 + 1,800 + (30 * 50 * 9)
= 5,175 + 1,800 + 13,500
= 20,475 Sun/sec
```
Option C crushes Option A. A single Legendary Elder's raw production (13,500) outweighs the synergy advantage. This is intentional: Legendary/Mythic Bloomlings are meant to feel impactful, and synergies are the "poor man's power" that rewards strategic play for players who don't yet have top-rarity Bloomlings.

---

## 7. Example Garden Compositions

### 7.1 Early Game Garden (Zone 10, 2 slots)

**Composition**: Fernley (Common Bloom Lv.5) + Mosswick (Common Sprout Lv.10)

| Bloomling | Rarity | Stage | Level | Production |
|---|---|---|---|---|
| Fernley | Common | Bloom | 5 | 1 * 5 * 3 = **15** |
| Mosswick | Common | Sprout | 10 | 1 * 10 * 1 = **10** |
| | | | **Total** | **25 Sun/sec** |

No synergies active (need Elder stage). No abilities from Mosswick (Sprout). Fernley has a Bloom-stage ability (e.g., +2% production to all = +0.5 Sun/sec, negligible at this stage).

With `idleMultiplier` of ~1.25 (Fertile Soil Lv.5):
```
Effective idle = 25 * 1.25 = 31.25 Sun/sec
```

**Matches** `01-currency-rates.md` Zone 10 estimate of ~55 Sun/sec when accounting for slightly higher levels and a potential Uncommon Bloomling (Petaline).

### 7.2 Mid Game Garden (Zone 25, 3 slots)

**Composition**: Petaline (Uncommon Bloom Lv.20) + Thornwick (Rare Sprout Lv.15) + Fernley (Common Bloom Lv.25)

| Bloomling | Rarity | Stage | Level | Base Production | Ability Bonus |
|---|---|---|---|---|---|
| Petaline | Uncommon | Bloom | 20 | 2 * 20 * 3 = **120** | +4% all production |
| Thornwick | Rare | Sprout | 15 | 5 * 15 * 1 = **75** | None (Sprout) |
| Fernley | Common | Bloom | 25 | 1 * 25 * 3 = **75** | +2% all production |
| | | | | **270 base** | |

Ability bonuses: +6% to all production = `270 * 1.06 = 286.2`

With `idleMultiplier` of ~2.0 (Fertile Soil Lv.10 + Sunlit Canopy Lv.5):
```
Effective idle = 286.2 * 2.0 = 572.4 Sun/sec
```

**Cross-check**: `01-currency-rates.md` estimates ~450 Sun/sec at Zone 25. Our composition gives ~572, which is reasonable for a player who has invested well in leveling. The estimate in Task 1 assumes a slightly less optimized garden.

### 7.3 Late Game Garden (Zone 50, 4 slots, post-first-Rebirth)

**Composition**: Honeyveil (Rare Bloom Lv.40) + Thornwick (Rare Elder Lv.25) + Nightbloom (Epic Bloom Lv.30) + Deeproot (Epic Bloom Lv.20)

**Synergy**: Thornwick Elder has tag "Thorned" -- no match in this garden (no synergy).

| Bloomling | Rarity | Stage | Level | Production | Ability |
|---|---|---|---|---|---|
| Honeyveil | Rare | Bloom | 40 | 5 * 40 * 3 = **600** | +8% all production (Bloom) |
| Thornwick | Rare | Elder | 25 | 5 * 25 * 9 = **1,125** | +16% all production (Elder, 2x of 8%) |
| Nightbloom | Epic | Bloom | 30 | 12 * 30 * 3 = **1,080** | -5% zone threshold (Bloom) |
| Deeproot | Epic | Bloom | 20 | 12 * 20 * 3 = **720** | +12% all production (Bloom) |
| | | | | **3,525 base** | |

Combined ability production bonuses: +8% + 16% + 12% = +36% (additive)
```
Production with abilities = 3,525 * 1.36 = 4,794 Sun/sec
```

With `idleMultiplier` of ~4.0 (multiple idle upgrades purchased):
```
Effective idle = 4,794 * 4.0 = 19,176 Sun/sec
```

**Cross-check**: `01-currency-rates.md` estimates ~14,400 Sun/sec at Zone 50. Our composition gives ~19,176 with strong ability stacking and a good `idleMultiplier`. The difference is that this represents an optimized post-Rebirth setup. The Task 1 estimate assumes a first-run player. Both are internally consistent.

### 7.4 Garden Composition Summary

| Garden | Zone | Slots | Total Production | Key Strategy |
|---|---|---|---|---|
| Early | 10 | 2 | ~31 Sun/sec | Level what you have |
| Mid | 25 | 3 | ~572 Sun/sec | Ability stacking begins |
| Late | 50 | 4 | ~19,176 Sun/sec | Elder abilities + idle multipliers |

---

## 8. Production Scaling Summary

### 8.1 Rarity Comparison at Max Investment (Elder Lv.100)

| Rarity | Elder Lv.100 Production | vs. Common | Total Sunlight Investment |
|---|---|---|---|
| Common | 900 | 1.0x | 2.38M |
| Uncommon | 1,800 | 2.0x | 9.64M |
| Rare | 4,500 | 5.0x | 48.1M |
| Epic | 10,800 | 12.0x | 238M |
| Legendary | 27,000 | 30.0x | 2.38B |
| Mythic | 90,000 | 100.0x | 23.8B |

The rarity multipliers are preserved exactly through all evolution stages. A Mythic is always 100x a Common at the same level and stage.

### 8.2 JavaScript Safety Verification

Maximum possible single-Bloomling production:
```
Mythic Elder Lv.100 = 100 * 100 * 9 = 90,000 Sun/sec
```

Maximum possible garden production (8 slots, all Mythic Elder Lv.100, 60% synergy, 35% ability stacking, 30x idleMultiplier):
```
= 8 * 90,000 * 1.60 * 1.35 * 30
= 8 * 90,000 * 64.8
= 46,656,000 Sun/sec
≈ 46.7M Sun/sec
```

Over one year of continuous play: `46.7M * 31,536,000 seconds ≈ 1.47e15`

This is within `Number.MAX_SAFE_INTEGER` (9.0e15). No BigInt required.

---

## 9. Quick Reference: All Bloomling Formulas

| Formula | Expression |
|---|---|
| Bloomling production | `baseProduction * level * evolutionMultiplier` |
| Evolution multiplier | Sprout=1, Bloom=3, Elder=9 |
| Rarity base production | Common=1, Uncommon=2, Rare=5, Epic=12, Legendary=30, Mythic=100 |
| Synergy bonus | 2-match=+15%, 3-match=+35%, 4+-match=+60% |
| Ability power at Elder | 2x Bloom-stage value |
| Evolution break-even | Lv.34 in new stage equals Lv.100 in previous stage |
| Level-up cost | `baseCost_rarity * 1.10^level` |
