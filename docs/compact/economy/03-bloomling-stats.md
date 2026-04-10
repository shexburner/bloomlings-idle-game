<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->
<!-- Source: docs/economy/03-bloomling-stats.md -->

# Economy Balance Sheet 3: Bloomling Stats (Compact Context)

> Auto-generated from the canonical source file. Edit the source markdown, then regenerate compact docs.

## Quick Map
- 1. Base Sunlight/sec Per Rarity Tier
- 2. Per-Level Production Formula
  - Why Linear?
- 3. Production at Key Levels Per Rarity
  - 3.1 Sprout Stage (evolutionMultiplier = 1x)
  - 3.2 Bloom Stage (evolutionMultiplier = 3x)
  - 3.3 Elder Stage (evolutionMultiplier = 9x)
- 4. Evolution Multiplier Verification
  - 4.1 Sprout vs Bloom vs Elder at Lv.1
  - 4.2 Evolution Transition Analysis
  - 4.3 Full Lifecycle Production Curve
- 5. Ability Strength Values Per Rarity
  - 5.1 Ability Strength Table
  - 5.2 Elder Enhancement (2x)
  - 5.3 Ability Value Analysis
- 6. Synergy Bonus Verification
  - 6.1 Synergy Tiers (from design doc)
  - 6.2 Synergy Math Verification
  - 6.3 Synergy vs Higher Rarity Trade-off
- 7. Example Garden Compositions
  - 7.1 Early Game Garden (Zone 10, 2 slots)
  - 7.2 Mid Game Garden (Zone 25, 3 slots)
  - 7.3 Late Game Garden (Zone 50, 4 slots, post-first-Rebirth)
  - 7.4 Garden Composition Summary
- 8. Production Scaling Summary
  - 8.1 Rarity Comparison at Max Investment (Elder Lv.100)
  - 8.2 JavaScript Safety Verification
- 9. Quick Reference: All Bloomling Formulas

## Key Points
### 1. Base Sunlight/sec Per Rarity Tier
- From the design doc, rarity production multipliers are:

### 2. Per-Level Production Formula
- `baseProduction` = rarity base from the table above
- `level` = current level (1-100)
- `evolutionMultiplier` = Sprout: 1x, Bloom: 3x, Elder: 9x

### Why Linear?
- Exponential production scaling combined with exponential cost scaling creates runaway inflation. Linear production with geometric costs (`1.10^level`) means each level gives diminishing returns per Sunlight spent, creating natural soft walls that encourage diversifying (leveling other Bloomlings, pursuing evolution, or prestiging).

### 3. Production at Key Levels Per Rarity
- (No concise bullet/summary found; use grep in source file for details.)

### 3.1 Sprout Stage (evolutionMultiplier = 1x)
- **Worked example**: Rare Sprout Lv.50 = `5 * 50 * 1 = 250 Sun/sec`

### 3.2 Bloom Stage (evolutionMultiplier = 3x)
- **Worked example**: Epic Bloom Lv.25 = `12 * 25 * 3 = 900 Sun/sec`

### 3.3 Elder Stage (evolutionMultiplier = 9x)
- **Worked example**: Legendary Elder Lv.100 = `30 * 100 * 9 = 27,000 Sun/sec`

### 4. Evolution Multiplier Verification
- The design doc specifies 3x per evolution stage. Let us verify this creates satisfying progression.

### 4.1 Sprout vs Bloom vs Elder at Lv.1
- The 3x multiplier is consistent. At evolution, the Bloomling's level resets to 1, but production starts at 3x the **base** -- meaning a freshly evolved Bloom Lv.1 produces the same as a Sprout Lv.3. This creates a brief "dip" in production right after evolution that is quickly recovered.

### 4.2 Evolution Transition Analysis
- A Sprout at Lv.100 evolves to a Bloom at Lv.1:

### 4.3 Full Lifecycle Production Curve
- Taking a Common Bloomling through all stages:

### 5. Ability Strength Values Per Rarity
- Abilities unlock at Bloom stage (base power) and enhance at Elder stage (2x power, per design doc).

### 5.1 Ability Strength Table
- (No concise bullet/summary found; use grep in source file for details.)

### 5.2 Elder Enhancement (2x)
- At Elder stage, all ability values double:

### 5.3 Ability Value Analysis
- **Example**: A Legendary Elder with "+40% production to all Garden Bloomlings" applied to a 4-slot garden averaging 5,000 Sun/sec total idle:

### 6. Synergy Bonus Verification
- (No concise bullet/summary found; use grep in source file for details.)

### 6.1 Synergy Tiers (from design doc)
- Synergies only apply to Elder-stage Bloomlings (who have Synergy Tags).

### 6.2 Synergy Math Verification
- **Test Case: 2 Matching Elders (15% bonus)**

### 6.3 Synergy vs Higher Rarity Trade-off
- Is it better to run 4 synergized Rare Elders or 2 Rare Elders + 1 Epic Bloom + 1 unmatched Legendary Bloom?

### 7. Example Garden Compositions
- (No concise bullet/summary found; use grep in source file for details.)

### 7.1 Early Game Garden (Zone 10, 2 slots)
- **Composition**: Fernley (Common Bloom Lv.5) + Mosswick (Common Sprout Lv.10)

### 7.2 Mid Game Garden (Zone 25, 3 slots)
- **Composition**: Petaline (Uncommon Bloom Lv.20) + Thornwick (Rare Sprout Lv.15) + Fernley (Common Bloom Lv.25)

### 7.3 Late Game Garden (Zone 50, 4 slots, post-first-Rebirth)
- **Composition**: Honeyveil (Rare Bloom Lv.40) + Thornwick (Rare Elder Lv.25) + Nightbloom (Epic Bloom Lv.30) + Deeproot (Epic Bloom Lv.20)

### 7.4 Garden Composition Summary
- (No concise bullet/summary found; use grep in source file for details.)

### 8. Production Scaling Summary
- (No concise bullet/summary found; use grep in source file for details.)

### 8.1 Rarity Comparison at Max Investment (Elder Lv.100)
- The rarity multipliers are preserved exactly through all evolution stages. A Mythic is always 100x a Common at the same level and stage.

### 8.2 JavaScript Safety Verification
- Maximum possible single-Bloomling production:

### 9. Quick Reference: All Bloomling Formulas
- (No concise bullet/summary found; use grep in source file for details.)
