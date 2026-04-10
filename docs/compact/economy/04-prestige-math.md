<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->
<!-- Source: docs/economy/04-prestige-math.md -->

# Economy Balance Sheet 4: Prestige Math (Compact Context)

> Auto-generated from the canonical source file. Edit the source markdown, then regenerate compact docs.

## Quick Map
- 1. Nectar Formula — Tuned Constants
  - Formula
  - Tuned Constants
  - Verification Math
  - Nectar Table
- 2. Optimal Rebirth Analysis
  - Nectar Per Hour
    - First Run Estimates
    - Post-Rebirth Runs (with Nectar upgrades)
  - When To Rebirth (General Rule)
- 3. Nectar Upgrade Costs — Cumulative Verification
  - Upgrade Priority Path
  - Milestone Purchases
- 4. Time-to-First-Rebirth Verification
  - First Run Timeline
  - Assumptions
- 5. Post-Rebirth Speedup Factor
  - Run 2 vs Run 1
  - Run 5 vs Run 1
- 6. Total Player Power After N Rebirths
  - Multiplicative Power Scaling
  - Effective Zone Push by Rebirth Count
- 7. Essence Formula — Tuned Constants
  - Formula
  - Constants (from design doc — verified as balanced)
  - Essence Table
  - Verification Calculation
- 8. Transcendence Timing Verification
  - Requirements
  - Timeline to Meeting Requirements
  - Real-World Calendar Time
  - Nectar Spent at First Transcendence
- 9. JavaScript Safety Check
  - Maximum Values at Key Milestones
- 10. Quick Reference: All Prestige Formulas

## Key Points
### 1. Nectar Formula — Tuned Constants
- (No concise bullet/summary found; use grep in source file for details.)

### Formula
- nectarEarned = floor(baseNectar * (highestZone / nectarThreshold)^nectarExponent)

### Tuned Constants
- (No concise bullet/summary found; use grep in source file for details.)

### Verification Math
- // Zone 50: floor(1 * (50/32)^3.1) = floor(1.5625^3.1) = floor(4.01) = 4

### Nectar Table
- **Design check**: The curve rewards pushing further but with diminishing returns per zone. Going from Zone 40 to 50 gains +2 Nectar; Zone 50 to 60 gains +3; Zone 60 to 75 gains +8. Each "extra push" is proportionally less efficient, creating the intended tension: reset now or push further?

### 2. Optimal Rebirth Analysis
- (No concise bullet/summary found; use grep in source file for details.)

### Nectar Per Hour
- The key metric for optimal Rebirth is **Nectar earned per hour of play**. Pushing further gives more Nectar but takes longer.

### First Run Estimates
- **First run optimal Rebirth point**: Zone 50-55. Pushing past Zone 55 yields diminishing Nectar/hour on the first run due to the production wall. Zone 50 is the natural inflection point (Biome 2 Boss creates a satisfying narrative endpoint).

### Post-Rebirth Runs (with Nectar upgrades)
- **Acceleration curve**: Nectar/hour improves dramatically with each Rebirth. By Run 10, the player earns Nectar 35x faster than their first run. This acceleration is the core dopamine loop of the prestige system — each Rebirth feels faster and more powerful.

### When To Rebirth (General Rule)
- Rebirth is optimal when the player's zone progress has slowed to a crawl — roughly when clearing the next zone takes 3+ minutes of active play. At that point, the time spent pushing is better spent on a fresh run with new Nectar upgrades.

### 3. Nectar Upgrade Costs — Cumulative Verification
- From `docs/design/04-prestige-systems.md`, with cumulative Nectar spend:

### Upgrade Priority Path
- (No concise bullet/summary found; use grep in source file for details.)

### Milestone Purchases
- **Design check**: Each Rebirth gives the player enough Nectar for 1-2 meaningful upgrades. No single Rebirth feels wasted. The upgrade costs scale appropriately with Nectar income.

### 4. Time-to-First-Rebirth Verification
- **Target**: 2-4 hours of play (from design doc).

### First Run Timeline
- **Result**: First viable Rebirth at ~1h 40m (Zone 40, 1 Nectar). Recommended first Rebirth at ~3h (Zone 50, 3 Nectar). This falls within the 2-4 hour target window.

### Assumptions
- Mix of active and idle play (~60% active, 40% idle)
- Player invests Sunlight in upgrades and Bloomling levels as available
- No ad boosts used (ads would speed this up by ~20-30%)
- Gates cleared on first or second attempt through Zone 40; Boss at Zone 25 may require 1-2 attempts

### 5. Post-Rebirth Speedup Factor
- (No concise bullet/summary found; use grep in source file for details.)

### Run 2 vs Run 1
- **Enriched Soil Lv.1**: +25% idle production
- **Stronger Roots Lv.1**: +20% tap value
- Kept: all discovered Bloomlings (return as Sprout Lv.1)
- Player knowledge: knows optimal upgrade order

### Run 5 vs Run 1
- **Enriched Soil Lv.3**: +75% production (1.75x)
- **Stronger Roots Lv.3**: +60% tap value (1.60x)
- **Seasonal Memory Lv.1**: Start at Zone 5
- **Rapid Growth Lv.1**: -10% level-up costs

### 6. Total Player Power After N Rebirths
- (No concise bullet/summary found; use grep in source file for details.)

### Multiplicative Power Scaling
- Nectar Roots: compounding +10%/level on future Nectar income
- Rapid Growth: -10%/level on Bloomling leveling costs (frees up Sunlight)
- Bloom/Elder Retention: keeps evolution stages through Rebirth (massive time savings)
- Garden Expansion: +1-2 garden slots (multiplicative with production)

### Effective Zone Push by Rebirth Count
- (No concise bullet/summary found; use grep in source file for details.)

### 7. Essence Formula — Tuned Constants
- (No concise bullet/summary found; use grep in source file for details.)

### Formula
- essenceEarned = floor(baseEssence * (totalNectarSpent / essenceThreshold)^essenceExponent)

### Constants (from design doc — verified as balanced)
- (No concise bullet/summary found; use grep in source file for details.)

### Essence Table
- (No concise bullet/summary found; use grep in source file for details.)

### Verification Calculation
- // At Transcendence with 500 Nectar spent:

### 8. Transcendence Timing Verification
- **Target**: First Transcendence after 1-2 weeks of play.

### Requirements
- 10+ Rebirths completed
- Reach Zone 150+ in a single run

### Timeline to Meeting Requirements
- (No concise bullet/summary found; use grep in source file for details.)

### Real-World Calendar Time
- **Result**: Regular players hit Transcendence in ~1.5-2 weeks. Hardcore players can reach it in under a week. Casual players take about 3 weeks. This is slightly wider than the 1-2 week target for casuals, but acceptable — casual players aren't expected to Transcend quickly.

### Nectar Spent at First Transcendence
- Primordial Vigor Lv.1 (1 Essence): All production x2
- Ancient Wisdom Lv.1 (2 Essence): All Nectar x1.5
- Biome Attunement Lv.1 (3 Essence): Unlock biome mechanic from Zone 1
- Accelerated Seasons Lv.1 (4 Essence): Higher starting zone for Rebirths

### 9. JavaScript Safety Check
- (No concise bullet/summary found; use grep in source file for details.)

### Maximum Values at Key Milestones
- All values remain within `Number.MAX_SAFE_INTEGER` (9.007e15). No BigInt required.

### 10. Quick Reference: All Prestige Formulas
- (No concise bullet/summary found; use grep in source file for details.)
