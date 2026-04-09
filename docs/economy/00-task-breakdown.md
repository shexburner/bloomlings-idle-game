# Economy Balancer — Task Breakdown

> Each task produces one MD file. Work sequentially — each builds on the previous.
> Read `docs/design/01-core-game-loop.md` through `05-ad-economy.md` for design context.

## Task 1: Currency & Production Rates (`01-currency-rates.md`)
**Objective**: Define exact production numbers for the core economy.
**Deliver**:
- Sunlight per tap: base value, per-upgrade-level scaling
- Sunlight per second (idle): base rate, per-Bloomling-level scaling
- Combo multiplier formula with worked examples
- Critical tap multiplier and chance scaling
- Active vs idle income ratio verification at key points
- Number formatting thresholds (when K/M/B/T kicks in)
**Input**: `docs/design/01-core-game-loop.md`
**Status**: NOT STARTED

## Task 2: Upgrade Cost Curves (`02-upgrade-costs.md`)
**Objective**: Define every upgrade's cost formula and verify pacing.
**Deliver**:
- Tap upgrade costs: base, scaling factor, values at levels 1/10/25/50/100
- Idle upgrade costs: same format
- Bloomling level-up costs per rarity tier
- Evolution costs (Sprout->Bloom, Bloom->Elder) per rarity
- Garden slot expansion costs
- Buy-10/Buy-100 cost calculation formula
- "Time to afford next upgrade" estimates at key milestones
**Input**: `docs/design/01-core-game-loop.md`, `docs/design/02-bloomling-mechanics.md`
**Status**: NOT STARTED

## Task 3: Bloomling Stats (`03-bloomling-stats.md`)
**Objective**: Define per-rarity base stats and scaling.
**Deliver**:
- Base Sunlight/sec per rarity (Common through Mythic)
- Per-level production increase formula
- Evolution multipliers (3x per stage as per design, verify this works)
- Level 1 vs level 100 production per rarity
- Ability strength values per rarity
- Synergy bonus percentage verification
- Garden composition examples: "Best 4-slot team at Zone 25" etc.
**Input**: `docs/design/02-bloomling-mechanics.md`
**Depends on**: Task 1 (needs production rates to anchor Bloomling values)
**Status**: NOT STARTED

## Task 4: Prestige Math (`04-prestige-math.md`)
**Objective**: Tune prestige formulas for satisfying reset cycles.
**Deliver**:
- Nectar formula with tuned constants, table of Zone -> Nectar earned
- Optimal Rebirth point analysis (when is it worth resetting?)
- Nectar upgrade costs and cumulative spend needed
- Time-to-first-Rebirth verification (target: 2-4 hours)
- Post-Rebirth speedup factor: how much faster is run 2 vs run 1?
- Essence formula with tuned constants
- Transcendence timing verification (target: 1-2 weeks)
- Prestige multiplier stacking: total player power after N Rebirths
**Input**: `docs/design/04-prestige-systems.md`, Tasks 1-3
**Depends on**: Tasks 1-3
**Status**: NOT STARTED

## Task 5: Ad Reward Values (`05-ad-reward-values.md`)
**Objective**: Set exact reward amounts for each of the 7 ad touchpoints.
**Deliver**:
- Sunbeam Boost: 2x production duration, effective value at milestones
- Double Offline: expected offline earnings and doubled value at milestones
- Dewdrop earn rate: base, streak bonuses, daily cap verification
- Lucky Sprout: reward pool with probabilities and expected values
- Gate Assist: timer extension value, Sunlight boost value
- Boss Smash: 25% HP value at each biome boss
- Combo Keeper: value of frozen combo (saved income over 5 min)
- "One ad = X minutes of idle progress" verification at each stage
- Daily ad cap impact: max possible advantage from 15 ads/day
**Input**: `docs/design/05-ad-economy.md`, Tasks 1-4
**Depends on**: Tasks 1-4
**Status**: NOT STARTED

## Task 6: Pacing Sheet (`06-pacing-sheet.md`)
**Objective**: Full timeline of expected player state from first tap to Transcendence.
**Deliver**:
- Player state snapshots at: 10min, 30min, 1hr, 2hr, 4hr, 1day, 3day, 1week, 2week
- Each snapshot includes: zone, Sunlight/sec, tap value, Bloomlings owned, evolution stages, Nectar total, Rebirths completed
- "Dead zone" check: verify no stretch of 30+ minutes without a new unlock or milestone
- Session length modeling: what does a 5-min session accomplish? A 30-min session?
- Identification of any balance problems or pacing walls
**Input**: All previous tasks
**Depends on**: Tasks 1-5
**Status**: NOT STARTED
