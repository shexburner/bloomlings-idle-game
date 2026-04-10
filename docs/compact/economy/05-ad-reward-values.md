<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->
<!-- Source: docs/economy/05-ad-reward-values.md -->

# Economy Balance Sheet 5: Ad Reward Values (Compact Context)

> Auto-generated from the canonical source file. Edit the source markdown, then regenerate compact docs.

## Quick Map
- 1. Production Rates Reference
- 2. Ad Touchpoint Values
  - 2.1 Sunbeam Boost (2x Production for 10 Minutes)
  - 2.2 Double Offline Earnings (Welcome Back Screen)
  - 2.3 Dewdrop Garden (Watch & Earn)
  - 2.4 Lucky Sprout (Random Pop-up, Every 10-15 min)
    - Reward Probabilities and Values
    - Expected Sunlight Value Per Watch
  - 2.5 Gate Assist (Gate Zones)
    - Frontier Gate Analysis
  - 2.6 Boss Smash (Biome Bosses)
  - 2.7 Combo Keeper (During Active Play)
- 3. Summary: Minutes of Idle Progress Per Ad
  - "One Ad = 10-15 Minutes" Verification
  - Average Across All Ad Types
- 4. Dewdrop Economy
  - 4.1 Daily Dewdrop Income
  - 4.2 Dewdrop Shop Pricing — Days to Afford
  - 4.3 Pricing Verification
- 5. Lucky Sprout Reward Table
  - Full Probability Distribution
  - Expected Value Per Lucky Sprout
- 6. Daily Ad Cap Impact
  - Maximum Advantage: 15 Ads vs 0 Ads Per Day
    - Typical Allocation of 15 Ads
    - Impact on Daily Progression
  - Balance Verification
- 7. Quick Reference: All Ad Formulas

## Key Points
### 1. Production Rates Reference
- From `01-currency-rates.md` and `03-bloomling-stats.md`, the idle and active rates used throughout this document:

### 2. Ad Touchpoint Values
- (No concise bullet/summary found; use grep in source file for details.)

### 2.1 Sunbeam Boost (2x Production for 10 Minutes)
- **Unlocks**: Zone 15

### 2.2 Double Offline Earnings (Welcome Back Screen)
- **Mechanic**: Doubles the Sunlight earned while the app was closed.

### 2.3 Dewdrop Garden (Watch & Earn)
- **Unlocks**: Zone 20

### 2.4 Lucky Sprout (Random Pop-up, Every 10-15 min)
- **Mechanic**: Random reward wheel with 5 possible outcomes.

### Reward Probabilities and Values
- (No concise bullet/summary found; use grep in source file for details.)

### Expected Sunlight Value Per Watch
- EV = 0.40 * (5 min prod) + 0.25 * (5 min extra tap) + 0.12 * (level-up savings)

### 2.5 Gate Assist (Gate Zones)
- **Mechanic**: Appears when a player fails or is struggling with a gate zone.

### Frontier Gate Analysis
- At the player's pushing frontier, production rates are lower than the "established" rates:

### 2.6 Boss Smash (Biome Bosses)
- **Mechanic**: Deal 25% of boss's max HP as instant damage.

### 2.7 Combo Keeper (During Active Play)
- **Mechanic**: Freeze combo decay for 5 minutes. Appears when combo is above 50.

### 3. Summary: Minutes of Idle Progress Per Ad
- (No concise bullet/summary found; use grep in source file for details.)

### "One Ad = 10-15 Minutes" Verification
- (No concise bullet/summary found; use grep in source file for details.)

### Average Across All Ad Types
- **Result**: The average ad value across touchpoints (excluding Dewdrop Garden which provides non-Sunlight value) is **14-18 minutes of idle progress**. This slightly exceeds the 10-15 minute target, which is desirable — generous rewards drive higher voluntary watch rates.

### 4. Dewdrop Economy
- (No concise bullet/summary found; use grep in source file for details.)

### 4.1 Daily Dewdrop Income
- From `docs/design/05-ad-economy.md`:

### 4.2 Dewdrop Shop Pricing — Days to Afford
- (No concise bullet/summary found; use grep in source file for details.)

### 4.3 Pricing Verification
- Small cosmetics affordable within a week for casuals
- QoL items affordable within 2 weeks for casuals
- Premium items (exclusive Bloomlings) require 2-4 weeks for regular players
- Aspirational items (Auroravine) require 1-2 months for casuals — long-term goal

### 5. Lucky Sprout Reward Table
- (No concise bullet/summary found; use grep in source file for details.)

### Full Probability Distribution
- (No concise bullet/summary found; use grep in source file for details.)

### Expected Value Per Lucky Sprout
- At Zone 50 (mid-game reference):

### 6. Daily Ad Cap Impact
- (No concise bullet/summary found; use grep in source file for details.)

### Maximum Advantage: 15 Ads vs 0 Ads Per Day
- Assuming 2 hours of active play plus 6 hours offline per day:

### Typical Allocation of 15 Ads
- (No concise bullet/summary found; use grep in source file for details.)

### Impact on Daily Progression
- (No concise bullet/summary found; use grep in source file for details.)

### Balance Verification
- **Not too large**: 0-ad players can still progress at a satisfying rate; ads are never "required"
- **Not too small**: Ad-watching players feel meaningfully rewarded for their time investment
- **Soft power, not hard gates**: Ad advantages are production speed, not unique gameplay content
- **Diminishing returns**: The first 3-5 ads/day provide most of the value (Sunbeam Boost + Double Offline + a couple Dewdrops). Ads 6-15 provide primarily Dewdrops

### 7. Quick Reference: All Ad Formulas
- (No concise bullet/summary found; use grep in source file for details.)
