<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->
<!-- Source: docs/economy/02-upgrade-costs.md -->

# Economy Balance Sheet 2: Upgrade Cost Curves (Compact Context)

> Auto-generated from the canonical source file. Edit the source markdown, then regenerate compact docs.

## Quick Map
- 1. Tap Upgrades
  - 1.1 Tap Upgrade Table
  - 1.2 Tap Upgrade Cost at Key Levels
    - T1: Stronger Rays (base=10, scale=1.07)
    - T2: Focused Light (base=200, scale=1.10)
    - T3: Lucky Fingers (base=500, scale=1.12)
    - T4: Solar Flare (base=2000, scale=1.10)
    - T5: Prismatic Touch (base=5000, scale=1.15)
    - T6: Radiant Burst (base=50000, scale=1.12)
- 2. Idle Upgrades
  - 2.1 Idle Upgrade Table
  - 2.2 Idle Upgrade Cost at Key Levels
    - I1: Fertile Soil (base=25, scale=1.08)
    - I2: Sunlit Canopy (base=400, scale=1.10)
    - I3: Root Network (base=1000, scale=1.12)
    - I4: Growth Spurt (base=5000, scale=1.10)
    - I5: Ancient Wisdom (base=15000, scale=1.13)
    - I6: Greenhouse Effect (base=100000, scale=1.12)
- 3. Bloomling Level-Up Costs
  - 3.1 Cost Formula
  - 3.2 Level-Up Cost Table by Rarity
    - Common (baseCost = 5)
    - Uncommon (baseCost = 20)
    - Rare (baseCost = 100)
    - Epic (baseCost = 500)
    - Legendary (baseCost = 5,000)
    - Mythic (baseCost = 50,000)
  - 3.3 Cumulative Cost Formula (Geometric Series)
- 4. Evolution Costs
  - 4.1 Sprout -> Bloom Evolution Cost
  - 4.2 Bloom -> Elder Evolution Cost
  - 4.3 Total Investment to Max a Bloomling
- 5. "Time to Afford" Estimates
  - 5.1 Early Game (Zone 5-10, idle ~10-55 Sun/sec)
  - 5.2 Mid Game (Zone 20-30, idle ~200-1,500 Sun/sec)
  - 5.3 Late Game (Zone 40-50, idle ~5K-15K Sun/sec)
- 6. Buy-10 and Buy-Max Cost Formulas
  - 6.1 Buy-N Formula (Geometric Series)
  - 6.2 Buy-Max Formula
  - 6.3 Buy-10 Quick Reference Costs
- 7. Quick Reference: All Cost Formulas

## Key Points
### 1. Tap Upgrades
- All tap upgrades use geometric cost scaling:

### 1.1 Tap Upgrade Table
- (No concise bullet/summary found; use grep in source file for details.)

### 1.2 Tap Upgrade Cost at Key Levels
- (No concise bullet/summary found; use grep in source file for details.)

### T1: Stronger Rays (base=10, scale=1.07)
- (No concise bullet/summary found; use grep in source file for details.)

### T2: Focused Light (base=200, scale=1.10)
- (No concise bullet/summary found; use grep in source file for details.)

### T3: Lucky Fingers (base=500, scale=1.12)
- (No concise bullet/summary found; use grep in source file for details.)

### T4: Solar Flare (base=2000, scale=1.10)
- (No concise bullet/summary found; use grep in source file for details.)

### T5: Prismatic Touch (base=5000, scale=1.15)
- (No concise bullet/summary found; use grep in source file for details.)

### T6: Radiant Burst (base=50000, scale=1.12)
- (No concise bullet/summary found; use grep in source file for details.)

### 2. Idle Upgrades
- Same formula: `cost(level) = baseCost * scalingFactor^level`

### 2.1 Idle Upgrade Table
- (No concise bullet/summary found; use grep in source file for details.)

### 2.2 Idle Upgrade Cost at Key Levels
- (No concise bullet/summary found; use grep in source file for details.)

### I1: Fertile Soil (base=25, scale=1.08)
- (No concise bullet/summary found; use grep in source file for details.)

### I2: Sunlit Canopy (base=400, scale=1.10)
- (No concise bullet/summary found; use grep in source file for details.)

### I3: Root Network (base=1000, scale=1.12)
- (No concise bullet/summary found; use grep in source file for details.)

### I4: Growth Spurt (base=5000, scale=1.10)
- (No concise bullet/summary found; use grep in source file for details.)

### I5: Ancient Wisdom (base=15000, scale=1.13)
- (No concise bullet/summary found; use grep in source file for details.)

### I6: Greenhouse Effect (base=100000, scale=1.12)
- (No concise bullet/summary found; use grep in source file for details.)

### 3. Bloomling Level-Up Costs
- (No concise bullet/summary found; use grep in source file for details.)

### 3.1 Cost Formula
- levelUpCost(level) = baseCost * 1.10^level

### 3.2 Level-Up Cost Table by Rarity
- Formula: `cost = baseCost * 1.10^level`

### Common (baseCost = 5)
- (No concise bullet/summary found; use grep in source file for details.)

### Uncommon (baseCost = 20)
- (No concise bullet/summary found; use grep in source file for details.)

### Rare (baseCost = 100)
- (No concise bullet/summary found; use grep in source file for details.)

### Epic (baseCost = 500)
- (No concise bullet/summary found; use grep in source file for details.)

### Legendary (baseCost = 5,000)
- (No concise bullet/summary found; use grep in source file for details.)

### Mythic (baseCost = 50,000)
- (No concise bullet/summary found; use grep in source file for details.)

### 3.3 Cumulative Cost Formula (Geometric Series)
- The cumulative cost to go from level 1 to level N:

### 4. Evolution Costs
- Evolution occurs when a Bloomling reaches Lv.100 in its current stage. The evolution itself has a one-time Sunlight cost (and Nectar for Elder).

### 4.1 Sprout -> Bloom Evolution Cost
- (No concise bullet/summary found; use grep in source file for details.)

### 4.2 Bloom -> Elder Evolution Cost
- Elder evolution requires both Sunlight and Nectar (prestige currency), gating it behind at least one Rebirth.

### 4.3 Total Investment to Max a Bloomling
- Total cost to bring a Bloomling from Sprout Lv.1 to Elder Lv.100:

### 5. "Time to Afford" Estimates
- Using idle production rates from `01-currency-rates.md`:

### 5.1 Early Game (Zone 5-10, idle ~10-55 Sun/sec)
- **Analysis**: Early upgrades are affordable within seconds to tens of seconds. Tapping adds significant income here, so actual times are shorter. Pacing feels brisk.

### 5.2 Mid Game (Zone 20-30, idle ~200-1,500 Sun/sec)
- **Analysis**: Mid-game upgrades take 15 seconds to a few minutes of idle accumulation. Active play halves these times. Players face meaningful choices about upgrade order.

### 5.3 Late Game (Zone 40-50, idle ~5K-15K Sun/sec)
- **Analysis**: Individual upgrade purchases remain in the seconds-to-minutes range. The total cost to max out all upgrades creates a longer-term goal. Evolution represents a satisfying milestone purchase.

### 6. Buy-10 and Buy-Max Cost Formulas
- (No concise bullet/summary found; use grep in source file for details.)

### 6.1 Buy-N Formula (Geometric Series)
- For any upgrade with scaling factor `r` at current level `L`, buying the next `N` levels:

### 6.2 Buy-Max Formula
- Buy-Max calculates the maximum number of levels affordable with current Sunlight balance:

### 6.3 Buy-10 Quick Reference Costs
- Cost of buying exactly 10 levels at various starting points, for each scaling factor:

### 7. Quick Reference: All Cost Formulas
- (No concise bullet/summary found; use grep in source file for details.)
