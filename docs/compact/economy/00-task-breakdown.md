<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->
<!-- Source: docs/economy/00-task-breakdown.md -->

# Economy Balancer — Task Breakdown (Compact Context)

> Auto-generated from the canonical source file. Edit the source markdown, then regenerate compact docs.

## Quick Map
- Task 1: Currency & Production Rates (`01-currency-rates.md`)
- Task 2: Upgrade Cost Curves (`02-upgrade-costs.md`)
- Task 3: Bloomling Stats (`03-bloomling-stats.md`)
- Task 4: Prestige Math (`04-prestige-math.md`)
- Task 5: Ad Reward Values (`05-ad-reward-values.md`)
- Task 6: Pacing Sheet (`06-pacing-sheet.md`)

## Key Points
### Task 1: Currency & Production Rates (`01-currency-rates.md`)
- Sunlight per tap: base value, per-upgrade-level scaling
- Sunlight per second (idle): base rate, per-Bloomling-level scaling
- Combo multiplier formula with worked examples
- Critical tap multiplier and chance scaling

### Task 2: Upgrade Cost Curves (`02-upgrade-costs.md`)
- Tap upgrade costs: base, scaling factor, values at levels 1/10/25/50/100
- Idle upgrade costs: same format
- Bloomling level-up costs per rarity tier
- Evolution costs (Sprout->Bloom, Bloom->Elder) per rarity

### Task 3: Bloomling Stats (`03-bloomling-stats.md`)
- Base Sunlight/sec per rarity (Common through Mythic)
- Per-level production increase formula
- Evolution multipliers (3x per stage as per design, verify this works)
- Level 1 vs level 100 production per rarity

### Task 4: Prestige Math (`04-prestige-math.md`)
- Nectar formula with tuned constants, table of Zone -> Nectar earned
- Optimal Rebirth point analysis (when is it worth resetting?)
- Nectar upgrade costs and cumulative spend needed
- Time-to-first-Rebirth verification (target: 2-4 hours)

### Task 5: Ad Reward Values (`05-ad-reward-values.md`)
- Sunbeam Boost: 2x production duration, effective value at milestones
- Double Offline: expected offline earnings and doubled value at milestones
- Dewdrop earn rate: base, streak bonuses, daily cap verification
- Lucky Sprout: reward pool with probabilities and expected values

### Task 6: Pacing Sheet (`06-pacing-sheet.md`)
- Player state snapshots at: 10min, 30min, 1hr, 2hr, 4hr, 1day, 3day, 1week, 2week
- Each snapshot includes: zone, Sunlight/sec, tap value, Bloomlings owned, evolution stages, Nectar total, Rebirths completed
- "Dead zone" check: verify no stretch of 30+ minutes without a new unlock or milestone
- Session length modeling: what does a 5-min session accomplish? A 30-min session?
