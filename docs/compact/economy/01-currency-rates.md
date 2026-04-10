<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->
<!-- Source: docs/economy/01-currency-rates.md -->

# Economy Balance Sheet 1: Currency & Production Rates (Compact Context)

> Auto-generated from the canonical source file. Edit the source markdown, then regenerate compact docs.

## Quick Map
- 1. Sunlight Per Tap
  - Base Value
  - Tap Formula
  - Tap Scaling with Upgrades
- 2. Sunlight Per Second (Idle Production)
  - Base Rate Per Bloomling
  - Total Idle Rate
  - Idle Rate at Key Milestones
- 3. Combo Multiplier
  - Formula
  - Worked Examples
  - Combo Build Rate
  - Average Combo Multiplier During Active Play
- 4. Critical Taps
  - Base Stats
  - Chance Scaling Per Upgrade
  - Critical Chance Progression
  - Expected Value of Critical Taps
  - Tap Income with Crit (Full Formula)
- 5. Active vs Idle Income Ratio Verification
  - Methodology
  - Zone 10 Verification
  - Zone 25 Verification
  - Zone 50 Verification
  - Ratio Summary
- 6. Number Formatting Thresholds
  - Formatting Rules
  - Expected Number Ranges by Game Phase
  - JavaScript Safety
- Quick Reference: All Core Formulas

## Key Points
### 1. Sunlight Per Tap
- (No concise bullet/summary found; use grep in source file for details.)

### Base Value
- (No concise bullet/summary found; use grep in source file for details.)

### Tap Formula
- tapReward = baseTapValue * tapMultiplier * comboMultiplier * (isCritical ? critMultiplier : 1)

### Tap Scaling with Upgrades
- Effective base tap value at key milestones (assuming typical upgrade progression):

### 2. Sunlight Per Second (Idle Production)
- (No concise bullet/summary found; use grep in source file for details.)

### Base Rate Per Bloomling
- `baseProduction` depends on rarity (see `03-bloomling-stats.md`)
- `level` ranges from 1-100 per evolution stage
- `evolutionMultiplier`: Sprout = 1x, Bloom = 3x, Elder = 9x

### Total Idle Rate
- `idleMultiplier` starts at 1.0 and is increased by Idle Upgrades
- `synergyBonus` is 1.0 (no synergy) up to 1.60 (4+ matching tags)

### Idle Rate at Key Milestones
- (No concise bullet/summary found; use grep in source file for details.)

### 3. Combo Multiplier
- (No concise bullet/summary found; use grep in source file for details.)

### Formula
- Combo builds by tapping within a **1.5-second window** of the previous tap
- Combo resets to 0 if no tap for 1.5 seconds
- Combo is capped at **100 hits**

### Worked Examples
- (No concise bullet/summary found; use grep in source file for details.)

### Combo Build Rate
- Reach 10 combo in **2 seconds**
- Reach 25 combo in **5 seconds**
- Reach 50 combo in **10 seconds**
- Reach 100 combo (max) in **20 seconds**

### Average Combo Multiplier During Active Play
- First 20 seconds: building combo from 0 to 100 (average combo ~50, multiplier ~3.5x)
- Remaining 40 seconds: at max combo (6.0x)
- Weighted average over 60s: `(20/60 * 3.5) + (40/60 * 6.0)` = **5.17x**

### 4. Critical Taps
- (No concise bullet/summary found; use grep in source file for details.)

### Base Stats
- (No concise bullet/summary found; use grep in source file for details.)

### Chance Scaling Per Upgrade
- **Lucky Fingers** upgrade: +1% per level (see `02-upgrade-costs.md`)
- Bloomling abilities can add +2% to +5% depending on rarity

### Critical Chance Progression
- (No concise bullet/summary found; use grep in source file for details.)

### Expected Value of Critical Taps
- The expected multiplier per tap accounting for crits:

### Tap Income with Crit (Full Formula)
- Expected income per tap:

### 5. Active vs Idle Income Ratio Verification
- Design target from `01-core-game-loop.md`:

### Methodology
- Active income = tap income per second (at sustained tapping rate)

### Zone 10 Verification
- (No concise bullet/summary found; use grep in source file for details.)

### Zone 25 Verification
- Casual tapping (no combo, 2 taps/sec): `25 * 1.0 * 1.0 * 1.20 * 2 = 60` => total `510 / 450 = 1.13x`. This is the "casual" range -- acceptable since casual players are barely tapping.

### Zone 50 Verification
- **Analysis**: At Zone 50 the idle income dominates because Bloom-stage Bloomlings are very productive. This is **intentional** -- by Zone 50, the player has invested heavily in Bloomlings and the game is transitioning toward prestige. Active play still adds meaningful income, but the ratio shifts toward idle as designed.

### Ratio Summary
- **Balance note**: The Zone 50 active ratio is lower than target. This is acceptable because: (1) Zone 50 is near first-Rebirth territory where idle dominance encourages the prestige reset, and (2) post-Rebirth `tapMultiplier` from Nectar upgrades will restore the ratio. Post-Rebirth at Zone 50 with `tapMultiplier=1.5`: active ratio becomes `~1.5x`, and the post-Rebirth push to higher zones (60-75) will have better ratios since tap upgrades scale with the new run.

### 6. Number Formatting Thresholds
- All numbers use abbreviated notation past certain thresholds for readability.

### Formatting Rules
- function formatSunlight(value) {

### Expected Number Ranges by Game Phase
- (No concise bullet/summary found; use grep in source file for details.)

### JavaScript Safety
- All values remain within `Number.MAX_SAFE_INTEGER` (9,007,199,254,740,991, roughly 9e15) through the main progression. Deep endgame values approaching the T/scientific range should use careful float arithmetic but do not require BigInt. If a future expansion pushes beyond 9e15 accumulated Sunlight, a precision layer should be added.

### Quick Reference: All Core Formulas
- (No concise bullet/summary found; use grep in source file for details.)
