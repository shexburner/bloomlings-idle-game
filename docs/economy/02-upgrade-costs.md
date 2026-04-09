# Economy Balance Sheet 2: Upgrade Cost Curves

> Defines every upgrade's cost formula, scaling factor, and pacing verification.
> References: `docs/design/01-core-game-loop.md`, `docs/design/02-bloomling-mechanics.md`, `01-currency-rates.md`

---

## 1. Tap Upgrades

All tap upgrades use geometric cost scaling:
```
cost(level) = baseCost * scalingFactor^level
```

Each upgrade is purchased one level at a time. Level 0 = not yet purchased (first purchase costs `baseCost * scalingFactor^1`). Level numbering below uses the convention that "Level 1" is the first purchased level.

### 1.1 Tap Upgrade Table

| # | Upgrade Name | Effect Per Level | Base Cost | Scaling Factor | Unlocked At |
|---|---|---|---|---|---|
| T1 | **Stronger Rays** | +1 `baseTapValue` | 10 | 1.07 | Zone 3 |
| T2 | **Focused Light** | +3 `baseTapValue` | 200 | 1.10 | Zone 8 |
| T3 | **Lucky Fingers** | +1% critical tap chance | 500 | 1.12 | Zone 12 |
| T4 | **Solar Flare** | +5 `baseTapValue` | 2,000 | 1.10 | Zone 20 |
| T5 | **Prismatic Touch** | +0.01 combo coefficient (base 0.05) | 5,000 | 1.15 | Zone 30 |
| T6 | **Radiant Burst** | +15 `baseTapValue` | 50,000 | 1.12 | Zone 45 |

### 1.2 Tap Upgrade Cost at Key Levels

#### T1: Stronger Rays (base=10, scale=1.07)

| Level | Cost | Cumulative Cost | Total baseTapValue Added |
|---|---|---|---|
| 1 | 10 * 1.07^1 = **11** | 11 | +1 |
| 10 | 10 * 1.07^10 = **20** | 149 | +10 |
| 25 | 10 * 1.07^25 = **54** | 632 | +25 |
| 50 | 10 * 1.07^50 = **294** | 3,960 | +50 |
| 100 | 10 * 1.07^100 = **8,677** | 117,108 | +100 |

#### T2: Focused Light (base=200, scale=1.10)

| Level | Cost | Cumulative Cost | Total baseTapValue Added |
|---|---|---|---|
| 1 | 200 * 1.10^1 = **220** | 220 | +3 |
| 10 | 200 * 1.10^10 = **519** | 3,500 | +30 |
| 25 | 200 * 1.10^25 = **2,164** | 19,638 | +75 |
| 50 | 200 * 1.10^50 = **23,456** | 226,561 | +150 |
| 100 | 200 * 1.10^100 = **2,757,170** | 27,371,700 | +300 |

#### T3: Lucky Fingers (base=500, scale=1.12)

| Level | Cost | Cumulative Cost | Total Crit Chance Added |
|---|---|---|---|
| 1 | 500 * 1.12^1 = **560** | 560 | +1% |
| 10 | 500 * 1.12^10 = **1,553** | 9,876 | +10% |
| 25 | 500 * 1.12^25 = **8,500** | 63,540 | +25% (soft cap) |
| 50 | 500 * 1.12^50 = **144,505** | 1,136,290 | +50% (hard cap applied at 30% from this source) |

> **Note**: Lucky Fingers has a soft cap at 25 levels (+25% crit chance, for 30% total with 5% base). Levels beyond 25 are purchasable but grant diminishing returns: +0.5% per level past 25, capping total crit from this source at 30%.

#### T4: Solar Flare (base=2000, scale=1.10)

| Level | Cost | Cumulative Cost | Total baseTapValue Added |
|---|---|---|---|
| 1 | 2,000 * 1.10^1 = **2,200** | 2,200 | +5 |
| 10 | 2,000 * 1.10^10 = **5,187** | 35,000 | +50 |
| 25 | 2,000 * 1.10^25 = **21,644** | 196,382 | +125 |
| 50 | 2,000 * 1.10^50 = **234,564** | 2,265,614 | +250 |
| 100 | 2,000 * 1.10^100 = **27,571,700** | 273,717,000 | +500 |

#### T5: Prismatic Touch (base=5000, scale=1.15)

| Level | Cost | Cumulative Cost | Combo Coefficient |
|---|---|---|---|
| 1 | 5,000 * 1.15^1 = **5,750** | 5,750 | 0.06 |
| 10 | 5,000 * 1.15^10 = **20,228** | 101,688 | 0.15 |
| 25 | 5,000 * 1.15^25 = **164,313** | 1,000,234 | 0.30 |
| 50 | 5,000 * 1.15^50 = **5,394,691** | 34,964,607 | 0.55 |

> **Note**: With Prismatic Touch at level 25, the combo coefficient becomes 0.30 and the max combo multiplier (100 hits) becomes `1 + 100*0.30 = 31x` instead of the base 6x. This is intentional for late-game scaling but requires heavy investment.

#### T6: Radiant Burst (base=50000, scale=1.12)

| Level | Cost | Cumulative Cost | Total baseTapValue Added |
|---|---|---|---|
| 1 | 50,000 * 1.12^1 = **56,000** | 56,000 | +15 |
| 10 | 50,000 * 1.12^10 = **155,292** | 987,600 | +150 |
| 25 | 50,000 * 1.12^25 = **850,002** | 6,354,004 | +375 |
| 50 | 50,000 * 1.12^50 = **14,450,489** | 113,629,000 | +750 |

---

## 2. Idle Upgrades

Same formula: `cost(level) = baseCost * scalingFactor^level`

### 2.1 Idle Upgrade Table

| # | Upgrade Name | Effect Per Level | Base Cost | Scaling Factor | Unlocked At |
|---|---|---|---|---|---|
| I1 | **Fertile Soil** | +0.05x `idleMultiplier` | 25 | 1.08 | Zone 5 |
| I2 | **Sunlit Canopy** | +0.10x `idleMultiplier` | 400 | 1.10 | Zone 10 |
| I3 | **Root Network** | +5% to all Bloomling base production | 1,000 | 1.12 | Zone 18 |
| I4 | **Growth Spurt** | +0.20x `idleMultiplier` | 5,000 | 1.10 | Zone 28 |
| I5 | **Ancient Wisdom** | +2% synergy bonus effectiveness | 15,000 | 1.13 | Zone 35 |
| I6 | **Greenhouse Effect** | +0.50x `idleMultiplier` | 100,000 | 1.12 | Zone 48 |

### 2.2 Idle Upgrade Cost at Key Levels

#### I1: Fertile Soil (base=25, scale=1.08)

| Level | Cost | Cumulative Cost | idleMultiplier Bonus |
|---|---|---|---|
| 1 | 25 * 1.08^1 = **27** | 27 | +0.05x |
| 10 | 25 * 1.08^10 = **54** | 381 | +0.50x |
| 25 | 25 * 1.08^25 = **171** | 1,685 | +1.25x |
| 50 | 25 * 1.08^50 = **1,173** | 13,633 | +2.50x |
| 100 | 25 * 1.08^100 = **54,972** | 661,897 | +5.00x |

#### I2: Sunlit Canopy (base=400, scale=1.10)

| Level | Cost | Cumulative Cost | idleMultiplier Bonus |
|---|---|---|---|
| 1 | 400 * 1.10^1 = **440** | 440 | +0.10x |
| 10 | 400 * 1.10^10 = **1,037** | 7,000 | +1.00x |
| 25 | 400 * 1.10^25 = **4,329** | 39,276 | +2.50x |
| 50 | 400 * 1.10^50 = **46,912** | 453,123 | +5.00x |
| 100 | 400 * 1.10^100 = **5,514,340** | 54,743,400 | +10.00x |

#### I3: Root Network (base=1000, scale=1.12)

| Level | Cost | Cumulative Cost | Base Production Bonus |
|---|---|---|---|
| 1 | 1,000 * 1.12^1 = **1,120** | 1,120 | +5% |
| 10 | 1,000 * 1.12^10 = **3,106** | 19,752 | +50% |
| 25 | 1,000 * 1.12^25 = **17,000** | 127,080 | +125% |
| 50 | 1,000 * 1.12^50 = **289,010** | 2,272,580 | +250% |

#### I4: Growth Spurt (base=5000, scale=1.10)

| Level | Cost | Cumulative Cost | idleMultiplier Bonus |
|---|---|---|---|
| 1 | 5,000 * 1.10^1 = **5,500** | 5,500 | +0.20x |
| 10 | 5,000 * 1.10^10 = **12,969** | 87,500 | +2.00x |
| 25 | 5,000 * 1.10^25 = **54,109** | 491,000 | +5.00x |
| 50 | 5,000 * 1.10^50 = **586,410** | 5,664,100 | +10.00x |
| 100 | 5,000 * 1.10^100 = **68,929,250** | 683,933,500 | +20.00x |

#### I5: Ancient Wisdom (base=15000, scale=1.13)

| Level | Cost | Cumulative Cost | Synergy Effectiveness Bonus |
|---|---|---|---|
| 1 | 15,000 * 1.13^1 = **16,950** | 16,950 | +2% |
| 10 | 15,000 * 1.13^10 = **50,916** | 283,815 | +20% |
| 25 | 15,000 * 1.13^25 = **324,226** | 2,308,162 | +50% |

> **Note**: At Ancient Wisdom Lv.25, a base 15% synergy becomes `15% * 1.50 = 22.5%`. This upgrade has high impact for synergy-focused Garden compositions.

#### I6: Greenhouse Effect (base=100000, scale=1.12)

| Level | Cost | Cumulative Cost | idleMultiplier Bonus |
|---|---|---|---|
| 1 | 100,000 * 1.12^1 = **112,000** | 112,000 | +0.50x |
| 10 | 100,000 * 1.12^10 = **310,585** | 1,975,200 | +5.00x |
| 25 | 100,000 * 1.12^25 = **1,700,004** | 12,708,008 | +12.50x |
| 50 | 100,000 * 1.12^50 = **28,900,978** | 227,258,000 | +25.00x |

---

## 3. Bloomling Level-Up Costs

### 3.1 Cost Formula

```
levelUpCost(level) = baseCost * 1.10^level
```

Where `baseCost` varies by rarity:

| Rarity | Base Level-Up Cost | Reasoning |
|---|---|---|
| Common | 5 | Cheapest to level, available from start |
| Uncommon | 20 | 4x Common |
| Rare | 100 | 5x Uncommon |
| Epic | 500 | 5x Rare |
| Legendary | 5,000 | 10x Epic |
| Mythic | 50,000 | 10x Legendary |

### 3.2 Level-Up Cost Table by Rarity

Formula: `cost = baseCost * 1.10^level`

#### Common (baseCost = 5)

| Level | Cost to Level Up | Cumulative Cost (from Lv.1) |
|---|---|---|
| 1 | 5 * 1.10^1 = **6** | 6 |
| 25 | 5 * 1.10^25 = **54** | 491 |
| 50 | 5 * 1.10^50 = **587** | 5,664 |
| 100 | 5 * 1.10^100 = **68,929** | 683,934 |

#### Uncommon (baseCost = 20)

| Level | Cost to Level Up | Cumulative Cost (from Lv.1) |
|---|---|---|
| 1 | 20 * 1.10^1 = **22** | 22 |
| 25 | 20 * 1.10^25 = **217** | 1,964 |
| 50 | 20 * 1.10^50 = **2,346** | 22,656 |
| 100 | 20 * 1.10^100 = **275,717** | 2,735,734 |

#### Rare (baseCost = 100)

| Level | Cost to Level Up | Cumulative Cost (from Lv.1) |
|---|---|---|
| 1 | 100 * 1.10^1 = **110** | 110 |
| 25 | 100 * 1.10^25 = **1,083** | 9,819 |
| 50 | 100 * 1.10^50 = **11,739** | 113,281 |
| 100 | 100 * 1.10^100 = **1,378,585** | 13,678,670 |

#### Epic (baseCost = 500)

| Level | Cost to Level Up | Cumulative Cost (from Lv.1) |
|---|---|---|
| 1 | 500 * 1.10^1 = **550** | 550 |
| 25 | 500 * 1.10^25 = **5,413** | 49,095 |
| 50 | 500 * 1.10^50 = **58,641** | 566,406 |
| 100 | 500 * 1.10^100 = **6,892,926** | 68,393,350 |

#### Legendary (baseCost = 5,000)

| Level | Cost to Level Up | Cumulative Cost (from Lv.1) |
|---|---|---|
| 1 | 5,000 * 1.10^1 = **5,500** | 5,500 |
| 25 | 5,000 * 1.10^25 = **54,109** | 490,950 |
| 50 | 5,000 * 1.10^50 = **586,410** | 5,664,063 |
| 100 | 5,000 * 1.10^100 = **68,929,259** | 683,933,500 |

#### Mythic (baseCost = 50,000)

| Level | Cost to Level Up | Cumulative Cost (from Lv.1) |
|---|---|---|
| 1 | 50,000 * 1.10^1 = **55,000** | 55,000 |
| 25 | 50,000 * 1.10^25 = **541,088** | 4,909,500 |
| 50 | 50,000 * 1.10^50 = **5,864,101** | 56,640,625 |
| 100 | 50,000 * 1.10^100 = **689,292,593** | 6,839,335,000 |

### 3.3 Cumulative Cost Formula (Geometric Series)

The cumulative cost to go from level 1 to level N:
```
cumulativeCost = baseCost * SUM(1.10^k, k=1..N)
               = baseCost * 1.10 * (1.10^N - 1) / (1.10 - 1)
               = baseCost * 11 * (1.10^N - 1)
```

**Worked example**: Common Bloomling from Lv.1 to Lv.100:
```
= 5 * 11 * (1.10^100 - 1)
= 55 * (13,780.61 - 1)
= 55 * 13,779.61
= 757,879
```
> Roughly 758K Sunlight to max a Common Sprout. This checks out against the per-level table above (within rounding).

---

## 4. Evolution Costs

Evolution occurs when a Bloomling reaches Lv.100 in its current stage. The evolution itself has a one-time Sunlight cost (and Nectar for Elder).

### 4.1 Sprout -> Bloom Evolution Cost

| Rarity | Sunlight Cost | Reasoning |
|---|---|---|
| Common | 10,000 | ~15x cumulative Lv.1-100 leveling cost |
| Uncommon | 50,000 | ~18x cumulative leveling cost |
| Rare | 250,000 | ~18x cumulative leveling cost |
| Epic | 1,000,000 | ~15x cumulative leveling cost |
| Legendary | 10,000,000 | ~15x cumulative leveling cost |
| Mythic | 100,000,000 | ~15x cumulative leveling cost |

### 4.2 Bloom -> Elder Evolution Cost

Elder evolution requires both Sunlight and Nectar (prestige currency), gating it behind at least one Rebirth.

| Rarity | Sunlight Cost | Nectar Cost | Reasoning |
|---|---|---|---|
| Common | 100,000 | 5 | Affordable early post-Rebirth |
| Uncommon | 500,000 | 15 | Mid-Rebirth goal |
| Rare | 2,500,000 | 50 | Requires multiple Rebirths |
| Epic | 10,000,000 | 150 | Significant investment |
| Legendary | 100,000,000 | 500 | Late-game milestone |
| Mythic | 1,000,000,000 | 2,000 | Endgame goal |

### 4.3 Total Investment to Max a Bloomling

Total cost to bring a Bloomling from Sprout Lv.1 to Elder Lv.100:

```
Total = (Sprout Lv.1-100 leveling) + (Sprout->Bloom cost) + (Bloom Lv.1-100 leveling) + (Bloom->Elder cost) + (Elder Lv.1-100 leveling)
```

| Rarity | Sprout Leveling | Evo 1 | Bloom Leveling | Evo 2 | Elder Leveling | **Total Sunlight** |
|---|---|---|---|---|---|---|
| Common | 758K | 10K | 758K | 100K | 758K | **2.38M** |
| Uncommon | 3.03M | 50K | 3.03M | 500K | 3.03M | **9.64M** |
| Rare | 15.1M | 250K | 15.1M | 2.5M | 15.1M | **48.1M** |
| Epic | 75.8M | 1M | 75.8M | 10M | 75.8M | **238M** |
| Legendary | 758M | 10M | 758M | 100M | 758M | **2.38B** |
| Mythic | 7.58B | 100M | 7.58B | 1B | 7.58B | **23.8B** |

> **JavaScript safety check**: Mythic total of ~23.8B is well within `Number.MAX_SAFE_INTEGER` (9.0e15).

---

## 5. "Time to Afford" Estimates

Using idle production rates from `01-currency-rates.md`:

### 5.1 Early Game (Zone 5-10, idle ~10-55 Sun/sec)

| Purchase | Cost | Time at 10 Sun/sec | Time at 55 Sun/sec |
|---|---|---|---|
| Stronger Rays Lv.5 | ~13 each, ~63 cumulative | 6 sec | 1 sec |
| Fertile Soil Lv.5 | ~37 each, ~158 cumulative | 16 sec | 3 sec |
| Common Bloomling Lv.10 | ~13 each, ~81 cumulative | 8 sec | 1.5 sec |
| Focused Light Lv.1 | 220 | 22 sec | 4 sec |

**Analysis**: Early upgrades are affordable within seconds to tens of seconds. Tapping adds significant income here, so actual times are shorter. Pacing feels brisk.

### 5.2 Mid Game (Zone 20-30, idle ~200-1,500 Sun/sec)

| Purchase | Cost | Time at 450 Sun/sec |
|---|---|---|
| Lucky Fingers Lv.10 | ~1,553 each, ~9,876 cumulative | 22 sec |
| Solar Flare Lv.10 | ~5,187 each, ~35K cumulative | 78 sec |
| Rare Bloomling Lv.25 | ~1,083 each, ~9.8K cumulative | 22 sec |
| Prismatic Touch Lv.1 | 5,750 | 13 sec |
| Ancient Wisdom Lv.5 | ~30K each, ~108K cumulative | 4 min |

**Analysis**: Mid-game upgrades take 15 seconds to a few minutes of idle accumulation. Active play halves these times. Players face meaningful choices about upgrade order.

### 5.3 Late Game (Zone 40-50, idle ~5K-15K Sun/sec)

| Purchase | Cost | Time at 14,400 Sun/sec |
|---|---|---|
| Radiant Burst Lv.10 | ~155K each, ~988K cumulative | 69 sec |
| Greenhouse Effect Lv.5 | ~178K each, ~702K cumulative | 49 sec |
| Rare Bloomling Lv.50 | ~11.7K each, ~113K cumulative | 8 sec |
| Epic Bloomling Lv.25 | ~5,413 each, ~49K cumulative | 3.4 sec |
| Sprout->Bloom Evo (Rare) | 250,000 | 17 sec |

**Analysis**: Individual upgrade purchases remain in the seconds-to-minutes range. The total cost to max out all upgrades creates a longer-term goal. Evolution represents a satisfying milestone purchase.

---

## 6. Buy-10 and Buy-Max Cost Formulas

### 6.1 Buy-N Formula (Geometric Series)

For any upgrade with scaling factor `r` at current level `L`, buying the next `N` levels:

```javascript
function buyNCost(baseCost, scalingFactor, currentLevel, n) {
  // Cost of levels (currentLevel+1) through (currentLevel+n)
  // = baseCost * SUM(scalingFactor^k, k=currentLevel+1..currentLevel+n)
  // = baseCost * scalingFactor^(currentLevel+1) * (scalingFactor^n - 1) / (scalingFactor - 1)
  
  const firstTermCost = baseCost * Math.pow(scalingFactor, currentLevel + 1);
  const geometricSum = (Math.pow(scalingFactor, n) - 1) / (scalingFactor - 1);
  return firstTermCost * geometricSum;
}
```

**Worked example**: Buy 10 levels of Stronger Rays (base=10, scale=1.07) starting from level 15:
```
firstTermCost = 10 * 1.07^16 = 10 * 2.952 = 29.52
geometricSum  = (1.07^10 - 1) / (1.07 - 1) = (1.9672 - 1) / 0.07 = 13.817
total         = 29.52 * 13.817 = 407.9 Sunlight
```

### 6.2 Buy-Max Formula

Buy-Max calculates the maximum number of levels affordable with current Sunlight balance:

```javascript
function buyMaxLevels(baseCost, scalingFactor, currentLevel, sunlightBalance) {
  // Solve for n: baseCost * r^(L+1) * (r^n - 1) / (r - 1) <= balance
  // r^n <= balance * (r - 1) / (baseCost * r^(L+1)) + 1
  // n <= log(balance * (r-1) / (baseCost * r^(L+1)) + 1) / log(r)
  
  const r = scalingFactor;
  const firstTerm = baseCost * Math.pow(r, currentLevel + 1);
  const inner = sunlightBalance * (r - 1) / firstTerm + 1;
  
  if (inner <= 1) return 0; // Can't afford even one level
  
  const maxLevels = Math.floor(Math.log(inner) / Math.log(r));
  return Math.max(0, maxLevels);
}
```

**Worked example**: How many Fertile Soil levels (base=25, scale=1.08) can you buy from level 20 with 5,000 Sunlight?
```
firstTerm = 25 * 1.08^21 = 25 * 5.034 = 125.85
inner     = 5000 * 0.08 / 125.85 + 1 = 3.178 + 1 = 4.178
maxLevels = floor(log(4.178) / log(1.08)) = floor(1.430 / 0.0770) = floor(18.58) = 18 levels
```

### 6.3 Buy-10 Quick Reference Costs

Cost of buying exactly 10 levels at various starting points, for each scaling factor:

| Starting Level | scale=1.07 | scale=1.08 | scale=1.10 | scale=1.12 | scale=1.13 | scale=1.15 |
|---|---|---|---|---|---|---|
| 0 (first 10) | 14.8x base | 15.6x base | 17.5x base | 19.7x base | 20.8x base | 23.3x base |
| 25 | 80.5x base | 101x base | 168x base | 283x base | 369x base | 639x base |
| 50 | 437x base | 681x base | 1,613x base | 4,067x base | 6,614x base | 18,100x base |

> These multipliers are relative to `baseCost`. Multiply by `baseCost` to get absolute Sunlight cost.

---

## 7. Quick Reference: All Cost Formulas

| Formula | Expression |
|---|---|
| Upgrade cost at level L | `baseCost * scalingFactor^L` |
| Cumulative cost Lv.1 to N | `baseCost * r * (r^N - 1) / (r - 1)` |
| Buy-N cost from level L | `baseCost * r^(L+1) * (r^N - 1) / (r - 1)` |
| Buy-Max levels | `floor(log(balance*(r-1)/(baseCost*r^(L+1)) + 1) / log(r))` |
| Bloomling level-up | `baseCost_rarity * 1.10^level` |
| Evo cost (Sprout->Bloom) | Fixed per rarity (see Section 4.1) |
| Evo cost (Bloom->Elder) | Fixed Sunlight + Nectar per rarity (see Section 4.2) |
