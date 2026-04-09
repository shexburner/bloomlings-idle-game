# Economy Balance Sheet 6: Pacing Sheet

> Player timeline with state snapshots, dead zone analysis, session modeling, and balance assessment.
> References: `01-currency-rates.md`, `02-upgrade-costs.md`, `03-bloomling-stats.md`, `04-prestige-math.md`, `05-ad-reward-values.md`, `docs/design/01-core-game-loop.md`

---

## 1. Player State Snapshots

Assumptions:
- Mix of active (60%) and idle (40%) play
- Moderate ad watching (~5/day, ~1 per session)
- Player invests Sunlight into upgrades as they become available
- First run (no prestige bonuses)

### 1.1 First Run Timeline

| Time | Zone | Sun/sec (idle) | Tap Value (avg combo ~25) | Bloomlings Owned | Highest Rarity | Evo Stage | Nectar | Rebirths | Dewdrops |
|---|---|---|---|---|---|---|---|---|---|
| **10 min** | 10 | 55 | 5 x 2.25 = 11 | 2 | Common | Sprout | 0 | 0 | 0 |
| **30 min** | 20 | 250 | 15 x 2.25 = 34 | 3 | Uncommon | Sprout | 0 | 0 | 1 |
| **1 hr** | 30 | 1,200 | 30 x 3.5 = 105 | 4 | Rare | Bloom (1 Common) | 0 | 0 | 2 |
| **2 hr** | 40 | 4,800 | 60 x 4.0 = 240 | 5 | Rare | Bloom (2) | 0 | 0 | 3 |
| **3 hr** | 50 | 14,400 | 120 x 5.0 = 600 | 6 | Epic | Bloom (3) | 0 | 0 | 5 |
| **4 hr** | 55 (R1) | 55 -> reset | 180 x 2.25 = 405 | 6 (Sprout reset) | Epic | Sprout (post-Rebirth) | 5 | 1 | 6 |

> **Rebirth 1** occurs at ~3h (Zone 50, 3 Nectar). Row at 4h shows the player mid-way through Run 2 with Enriched Soil Lv.1 (+25% prod) and Stronger Roots Lv.1 (+20% tap).

### 1.2 Multi-Day Timeline

| Time | Zone | Sun/sec (idle) | Tap Value (avg combo) | Bloomlings | Highest Rarity | Evo Stage | Nectar (total earned) | Rebirths | Dewdrops |
|---|---|---|---|---|---|---|---|---|---|
| **1 day** (~3h play) | Run 2, Zone 55 | 18,000 | 225 x 5.0 = 1,125 | 6 | Epic | Bloom (2) | 8 | 2 | 10 |
| **3 days** (~9h play) | Run 5, Zone 73 | 60,000 | 800 x 5.0 = 4,000 | 8 | Epic | Bloom (4), Elder (1 Common) | 33 | 5 | 30 |
| **1 week** (~14h play) | Run 10, Zone 95 | 250,000 | 2,500 x 5.0 = 12,500 | 10 | Legendary | Elder (2) | 120 | 10 | 70 |
| **2 weeks** (~25h play) | Run 15, Zone 113 | 2,000,000 | 8,000 x 5.0 = 40,000 | 12 | Legendary | Elder (4) | 350 | 15 | 125 |

> By 2 weeks the player approaches Transcendence eligibility (10+ Rebirths, Zone 150+). Actual Transcendence around Run 14-16 per `04-prestige-math.md`.

### 1.3 Cumulative Sunlight & Spending Power

| Time | Approx. Cumulative Sunlight | Typical Format | Key Purchases Affordable |
|---|---|---|---|
| 10 min | ~5K | K | T1 Lv.10, I1 Lv.5, Common Bloomling Lv.10 |
| 30 min | ~80K | K | T2 Lv.10, I2 Lv.5, Uncommon Bloomling Lv.15 |
| 1 hr | ~500K | K | T3 Lv.10, I3 Lv.5, first Sprout->Bloom evo (Common) |
| 2 hr | ~5M | M | T4 Lv.10, I4 Lv.5, Rare Bloomling Lv.25 |
| 3 hr | ~50M | M | T6 Lv.5, I6 Lv.3, Sprout->Bloom evo (Rare) |
| 1 day | ~200M | M | Multiple evo, approaching Epic level-ups |
| 1 week | ~10B | B | Elder evos, Legendary level-ups |
| 2 weeks | ~100B | B | Deep Elder investment, approaching Transcendence |

---

## 2. Feature Unlock Cadence

From `docs/design/01-core-game-loop.md` mapped against the timeline:

| Time | Zone | Unlock / Milestone |
|---|---|---|
| 0:00 | 1 | Tapping, first Bloomling (Fernley) |
| 0:02 | 3 | Tap Upgrades shop |
| 0:04 | 5 | 2nd Garden slot, Idle Upgrades shop |
| 0:10 | 10 | Bloomling Evolution (Sprout -> Bloom) |
| 0:15 | 15 | Ad rewards (Sunbeam Boost) |
| 0:25 | 20 | Dewdrop Shop |
| 0:40 | 25 | Biome 1 Boss, Biome 2 unlocked, 3rd Garden slot |
| 0:55 | 30 | Bloomling Synergies visible |
| 1:40 | 40 | Rebirth button appears |
| 3:00 | 50 | Elder Evolution unlocked |

### Average Gap Between Unlocks

| Segment | Duration | Unlocks | Avg Gap |
|---|---|---|---|
| Zone 1-10 (0-10 min) | 10 min | 4 | 2.5 min |
| Zone 10-25 (10-40 min) | 30 min | 3 | 10 min |
| Zone 25-40 (40-100 min) | 60 min | 2 | 30 min |
| Zone 40-50 (100-180 min) | 80 min | 2 | 40 min |

---

## 3. Dead Zone Check

**Rule**: Flag any stretch of 30+ minutes without a new unlock, milestone, or meaningful purchase.

| Segment | Duration | Unlocks/Milestones | Gap Exceeds 30 min? | Status |
|---|---|---|---|---|
| Zone 1-10 | ~10 min | 4 unlocks | No | OK |
| Zone 10-15 | ~5 min | 1 unlock (ads) | No | OK |
| Zone 15-20 | ~10 min | 1 unlock (Dewdrop Shop) | No | OK |
| Zone 20-25 | ~15 min | 1 unlock (Boss/Biome 2) | No | OK |
| Zone 25-30 | ~15 min | 1 unlock (Synergies) | No | OK |
| **Zone 30-40** | **~45 min** | **1 unlock (Rebirth at 40)** | **YES** | **FLAG** |
| **Zone 40-50** | **~80 min** | **1 unlock (Elder Evo at 50)** | **YES** | **FLAG** |

### Flagged Dead Zones

**Dead Zone 1: Zone 30-40 (~45 min gap)**

- Only unlock is Rebirth at Zone 40. The player has seen Synergies at Zone 30 and then has nothing new for ~45 minutes.
- Mitigating factors: upgrade purchases (T5 at Zone 30, I5 at Zone 35) and new Bloomlings in Biome 2 provide some engagement.
- Severity: **Moderate**. The upgrade unlocks help but the player may feel the grind between 30-40.

**Dead Zone 2: Zone 40-50 (~80 min gap)**

- Elder Evolution at Zone 50 is the only unlock. This is the longest gap in the game.
- Mitigating factors: Rebirth is newly available at Zone 40. Players who Rebirth at 40-45 break the monotony. Pushing to 50 is optional (for better Nectar).
- Severity: **Low** (if player Rebirths) / **High** (if player doesn't know to Rebirth). Tutorial prompt at Zone 40 is critical.

### Recommendations

| Problem | Suggested Fix |
|---|---|
| Zone 30-40 gap | Add a mid-zone milestone at Zone 35 (e.g., 4th Garden slot, or a cosmetic reward) |
| Zone 40-50 gap | Add a Nectar preview/counter at Zone 42-45 to encourage Rebirth; add a mini-boss at Zone 45 |

---

## 4. Session Length Modeling

### What does each session length accomplish?

#### 5-Minute Session

| Activity | Outcome |
|---|---|
| Collect offline earnings | 50% of idle rate x absence time (doubled with ad) |
| Buy queued upgrades | 2-5 upgrade purchases |
| Quick tap burst | 100-combo in 20s, ~3 min of boosted income |
| Check Dewdrop shop | Browse/purchase 1 item |
| **Net progress** | **Equivalent to ~15-30 min of pure idle** (with offline doubling ad) |

#### 15-Minute Session

| Activity | Outcome |
|---|---|
| Everything from 5-min session | (see above) |
| Push 2-5 zones | Clear current frontier |
| Level up 1-2 Bloomlings | Meaningful production increase |
| Watch 1-2 Lucky Sprout ads | Bonus resources |
| **Net progress** | **Equivalent to ~45-60 min of pure idle** |

#### 30-Minute Session

| Activity | Outcome |
|---|---|
| Everything from 15-min session | (see above) |
| Push 5-10 zones | Reach next unlock milestone |
| Evolve a Bloomling | Major production jump |
| Complete a Gate zone | Satisfying skill check |
| Use Sunbeam Boost (ad) | 10 min of doubled production |
| **Net progress** | **Equivalent to ~2-3 hours of pure idle** |

#### 60-Minute Session

| Activity | Outcome |
|---|---|
| Everything from 30-min session | (see above) |
| Push 10-20 zones | Major zone milestone |
| Complete a Rebirth cycle | Prestige reset with Nectar earnings |
| Strategic Bloomling team building | Optimize Garden synergies |
| **Net progress** | **Equivalent to a full Rebirth run (post-Run 5)** |

### Session Value Multiplier (vs Pure Idle)

| Session Length | Multiplier Over Pure Idle | Primary Value Source |
|---|---|---|
| 5 min | ~3-6x | Offline doubling ad + quick taps |
| 15 min | ~4-8x | Zone pushing + upgrades |
| 30 min | ~5-10x | Sustained combo + evolution |
| 60 min | ~6-12x | Full Rebirth cycle |

---

## 5. Balance Assessment

### Where Progression Feels Fast

| Segment | Why It Feels Fast |
|---|---|
| **Zone 1-10 (0-10 min)** | 4 unlocks in 10 minutes. New mechanics every 2-3 min. Upgrade costs are trivial (seconds of idle). Excellent onboarding pace. |
| **Zone 10-20 (10-25 min)** | First evolution is exciting. Ads unlock and provide immediate boost. Dewdrop Shop gives a new goal. |
| **Post-Rebirth early zones** | Player blasts through previously hard content. "Power fantasy" is strong. Zones 1-25 take ~15 min instead of 40. |
| **Run 5-10 acceleration** | Nectar/hour jumps from 1.0 to 34.7 per `04-prestige-math.md`. Each run noticeably faster. |

### Where Progression Might Drag

| Segment | Why It Drags | Severity |
|---|---|---|
| **Zone 30-40 (first run)** | 45-min gap between unlocks. Upgrade costs climbing. No prestige available yet. | Moderate |
| **Zone 40-50 (first run)** | 80-min push for better Nectar. Player unsure whether to Rebirth or keep pushing. | Moderate |
| **Pre-Bloom break-even (Lv.34)** | After evolution, production drops to 3% of pre-evo value. Takes ~34 levels to recover. | Low-Moderate |
| **Elder Nectar gating** | Elder evolution requires Nectar (5+ for Common). Players who don't understand prestige are stuck. | Low |
| **Dewdrop Shop grind (casuals)** | Auto-Tap (Slow) at 50 Dewdrops = 13 days for casual players. | Low |

### Suggested Fixes

| Issue | Fix | Impact |
|---|---|---|
| Zone 30-40 dead zone | Unlock 4th Garden slot at Zone 35 instead of tying it to Rebirth 3+ | Breaks 45-min gap into 2x ~22 min |
| Zone 40-50 uncertainty | Show Nectar preview at Zone 40 ("Rebirth now for 1 Nectar, push to 50 for 3") | Reduces decision paralysis |
| Post-evolution production dip | Grant 5 free levels on evolution (start Bloom at Lv.5 instead of Lv.1) | Softens the dip from 3% to 15% of pre-evo |
| Zone 45 emptiness | Add a mini-boss or intermediate biome event at Zone 45 | Gives mid-push engagement |
| Dewdrop Auto-Tap pricing | Reduce Auto-Tap (Slow) from 50 to 40 Dewdrops | Casual timeline drops from 13 to 10 days |

### Pacing Health Summary

| Phase | Zones | Time | Pacing Grade | Notes |
|---|---|---|---|---|
| Onboarding | 1-10 | 0-10 min | **A** | Excellent unlock cadence, every 2-3 min |
| Early game | 10-25 | 10-40 min | **A-** | Strong feature drip, first boss is exciting |
| Mid game | 25-40 | 40-100 min | **B-** | Dead zone at 30-40, needs a milestone |
| Late first run | 40-50 | 100-180 min | **B** | OK if player Rebirths early; drags if they don't |
| Post-Rebirth | 1-55 (Run 2) | 180-270 min | **A** | Power fantasy, fast clear, new push zone |
| Rebirth loop | Runs 3-10 | Day 1-7 | **A** | Strong acceleration curve, each run faster |
| Pre-Transcendence | Runs 10-15 | Week 1-2 | **B+** | Slight fatigue possible; Transcendence tease helps |

---

## 6. Quick Reference: Key Pacing Numbers

| Metric | Value | Source |
|---|---|---|
| Time to first unlock | ~2 min (Zone 3, Tap Upgrades) | `01-core-game-loop.md` |
| Time to first evolution | ~10 min (Zone 10) | `01-core-game-loop.md` |
| Time to first boss | ~40 min (Zone 25) | `04-prestige-math.md` |
| Time to first Rebirth (viable) | ~100 min (Zone 40, 1 Nectar) | `04-prestige-math.md` |
| Time to first Rebirth (optimal) | ~180 min (Zone 50, 3 Nectar) | `04-prestige-math.md` |
| Time to first Transcendence | ~16 hours / ~10-14 days | `04-prestige-math.md` |
| Longest dead zone | Zone 40-50, ~80 min | Section 3 above |
| Active:Idle ratio (early) | 2.9x | `01-currency-rates.md` |
| Active:Idle ratio (late) | 1.3x | `01-currency-rates.md` |
| Ad value average | 14-18 min of idle progress | `05-ad-reward-values.md` |
| 5-min session value | 3-6x idle equivalent | Section 4 above |
