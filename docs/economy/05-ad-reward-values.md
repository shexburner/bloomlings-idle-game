# Economy Balance Sheet 5: Ad Reward Values

> Defines exact reward values for all 7 ad touchpoints at each game stage.
> References: `docs/design/05-ad-economy.md`, `01-currency-rates.md`, `02-upgrade-costs.md`, `03-bloomling-stats.md`, `04-prestige-math.md`

---

## 1. Production Rates Reference

From `01-currency-rates.md` and `03-bloomling-stats.md`, the idle and active rates used throughout this document:

| Zone | Idle Rate (Sun/sec) | Active Tap Rate (Sun/sec) | Total Active Rate |
|---|---|---|---|
| 10 (early) | 55 | 105 | 160 |
| 50 (mid) | 14,400 | 4,800 | 19,200 |
| 100 (late) | 5,000,000 | 500,000 | 5,500,000 |

Active tap rate assumes 5 taps/sec with sustained combo and crit chance per `01-currency-rates.md`.

---

## 2. Ad Touchpoint Values

### 2.1 Sunbeam Boost (2x Production for 10 Minutes)

**Unlocks**: Zone 15
**Mechanic**: All Sunlight production (tap + idle) doubled for 10 minutes.

The bonus Sunlight is the *extra* production above normal: `idleRate * 600 seconds`.

| Game Stage | Zone | Normal 10-min Production | Bonus (2x - 1x) | Idle-Minutes Equivalent |
|---|---|---|---|---|
| Early | 10 | 33,000 | **33,000** | 10.0 min |
| Mid | 50 | 8,640,000 | **8,640,000** | 10.0 min |
| Late | 100 | 3,000,000,000 | **3,000,000,000** | 10.0 min |

**Analysis**: Sunbeam Boost is always exactly 10 minutes of idle production. This is by design — the most predictable and straightforward ad value. Stacking duration (watching another ad) extends to 20 min but doesn't stack the multiplier.

---

### 2.2 Double Offline Earnings (Welcome Back Screen)

**Mechanic**: Doubles the Sunlight earned while the app was closed.
**Offline rate**: 50% of idle rate (from design docs).

Assuming a typical 2-hour offline absence:

| Game Stage | Zone | Offline Earned (2hr) | Ad Bonus (doubles it) | Idle-Minutes Equivalent |
|---|---|---|---|---|
| Early | 10 | 198,000 | **198,000** | 60.0 min |
| Mid | 50 | 51,840,000 | **51,840,000** | 60.0 min |
| Late | 100 | 18,000,000,000 | **18,000,000,000** | 60.0 min |

**Scaling by absence duration**:

| Absence | Offline Earned (Zone 50) | Ad Bonus | Idle-Min Equiv |
|---|---|---|---|
| 30 min | 12,960,000 | 12,960,000 | 15 min |
| 1 hour | 25,920,000 | 25,920,000 | 30 min |
| 2 hours | 51,840,000 | 51,840,000 | 60 min |
| 4 hours | 103,680,000 | 103,680,000 | 120 min |
| 8 hours (overnight) | 207,360,000 | 207,360,000 | 240 min |

**Analysis**: This is the highest-value ad in the game, especially for overnight returns. A player who sleeps 8 hours and doubles their offline earnings gets 4 hours of idle production for one ad. This justifies the industry-highest watch rates (target: 80%+). The value scales with absence duration, making it most valuable for the exact players who need re-engagement the most.

---

### 2.3 Dewdrop Garden (Watch & Earn)

**Unlocks**: Zone 20
**Cooldown**: 3-minute cooldown between watches
**Reward**: 1-3 Dewdrops (see Dewdrop earn rate in Section 4)

| Game Stage | Zone | Sunlight Value | Dewdrops Earned | Idle-Minutes Equivalent |
|---|---|---|---|---|
| Early | 10 | 0 | 1 | 0 (Dewdrop value is non-Sunlight) |
| Mid | 50 | 0 | 1 | 0 |
| Late | 100 | 0 | 1-3 | 0 |

**Analysis**: Dewdrop Garden provides zero immediate Sunlight value. Its value is entirely in the Dewdrop currency — a long-term investment toward cosmetics, QoL items, and exclusive Bloomlings. See Section 4 for Dewdrop economy analysis.

---

### 2.4 Lucky Sprout (Random Pop-up, Every 10-15 min)

**Mechanic**: Random reward wheel with 5 possible outcomes.

#### Reward Probabilities and Values

| Reward | Probability | Value at Zone 10 | Value at Zone 50 | Value at Zone 100 |
|---|---|---|---|---|
| 5 min of idle production | 40% | 16,500 Sun | 4,320,000 Sun | 1,500,000,000 Sun |
| 2x tap value for 5 min | 25% | 31,500 Sun | 1,440,000 Sun | 150,000,000 Sun |
| 1 bonus Dewdrop | 15% | 1 Dewdrop | 1 Dewdrop | 1 Dewdrop |
| Free Bloomling level-up | 12% | ~50-200 Sun saved | ~5K-50K Sun saved | ~500K-5M Sun saved |
| 10% Nectar bonus on next Rebirth | 8% | N/A (pre-Rebirth) | ~0.3 Nectar | ~3.5 Nectar |

#### Expected Sunlight Value Per Watch

```
EV = 0.40 * (5 min prod) + 0.25 * (5 min extra tap) + 0.12 * (level-up savings)
```

| Game Stage | Zone | EV (Sunlight Only) | Idle-Minutes Equivalent |
|---|---|---|---|
| Early | 10 | ~14,500 | 4.4 min |
| Mid | 50 | ~2,100,000 | 2.4 min |
| Late | 100 | ~640,000,000 | 2.1 min |

**Analysis**: The Sunlight-equivalent value of Lucky Sprout is 2-5 minutes of idle production — below the 10-minute target. However, the 15% chance of a Dewdrop and 8% chance of a Nectar bonus add significant non-Sunlight value. The mystery-box excitement factor compensates for the lower raw value. The design doc targets a 60%+ watch rate based on "what will I get?" psychology, which doesn't require matching the 10-minute benchmark.

---

### 2.5 Gate Assist (Gate Zones)

**Mechanic**: Appears when a player fails or is struggling with a gate zone.
**Options**: +15 seconds on gate timer OR 1.5x Sunlight during the gate.

Gate zones require generating 2x the normal zone threshold in 30 seconds. At the frontier, this is where players are most likely to fail.

#### Frontier Gate Analysis

At the player's pushing frontier, production rates are lower than the "established" rates:

| Frontier Zone | Gate Threshold | Frontier Rate (Sun/sec) | 30s Output | Pass? | With +15s? | With 1.5x? |
|---|---|---|---|---|---|---|
| 25 | 1,700 | 250 | 7,500 | Yes | - | - |
| 30 | 2,996 | 500 | 15,000 | Yes | - | - |
| 35 | 5,280 | 800 | 24,000 | Yes | - | - |
| 40 | 9,305 | 1,200 | 36,000 | Yes | - | - |
| 45 | 16,399 | 2,000 | 60,000 | Yes | - | - |
| 50 | 28,900 | 3,500 | 105,000 | Yes | - | - |

**Analysis**: Gates are generally clearable even at frontier rates because the 30-second burst window combined with active tapping generates substantial Sunlight. Gate Assist's primary value appears at extreme frontier pushes (Zone 60+ on early runs) where the rate gap narrows. Its real value is **psychological** — it removes the anxiety of a close gate and acts as a safety net. The design doc targets 70% watch rates for gate/boss assists.

**Idle-minutes equivalent**: Highly contextual. If the ad prevents a gate failure that would require 5-10 minutes of grinding to retry, the effective value is 5-10 minutes. Estimated at **5-10 min** when it's actually needed.

---

### 2.6 Boss Smash (Biome Bosses)

**Mechanic**: Deal 25% of boss's max HP as instant damage.
Boss HP = 50x normal zone threshold. Timer: 2 minutes. Tap value 2x during boss.

| Boss Zone | Boss HP | Frontier Rate (w/ 2x tap) | Time to Kill | Kill Possible? | With 25% Smash |
|---|---|---|---|---|---|
| 25 | 42,500 | 350/sec | 121s | **Barely fails** (1s over) | 91s — **Clears** |
| 50 | 722,505 | 4,900/sec | 147s | **Fails** (27s over) | 111s — **Clears** |
| 75 | 12,282,640 | 112,000/sec | 110s | Clears | 82s |
| 100 | 208,805,664 | 7,000,000/sec | 30s | Clears | 22s |

**Analysis**: Boss Smash is **critical** for first-time boss encounters at Zones 25 and 50. Without the ad, the Zone 25 boss barely fails and the Zone 50 boss clearly fails at frontier rates. The ad turns a near-certain failure into a clear. Later bosses (post-Rebirth) are easier due to accumulated power.

The 5% stacking fail bonus (from `docs/design/03-zone-progression.md`) means players who don't watch the ad can still beat bosses after 1-5 failed attempts. The ad accelerates this by 1-2 attempts.

**Idle-minutes equivalent**: Prevents 5-15 minutes of retrying/grinding. Estimated at **10-15 min** of effective time savings.

---

### 2.7 Combo Keeper (During Active Play)

**Mechanic**: Freeze combo decay for 5 minutes. Appears when combo is above 50.
**Cooldown**: Once per 30 minutes.

Value = preserved combo bonus income over 5 minutes. At combo 50, the combo multiplier is 3.5x, so the saved income is the 2.5x bonus portion of tap income.

```
savedIncome = (comboMult - 1.0) * tapRate * 300 seconds
            = 2.5 * tapRate * 300
```

| Game Stage | Zone | Tap Rate (Sun/sec) | Saved Income | Idle-Minutes Equivalent |
|---|---|---|---|---|
| Early | 10 | 105 | 78,750 | 23.9 min |
| Mid | 50 | 4,800 | 3,600,000 | 4.2 min |
| Late | 100 | 500,000 | 375,000,000 | 1.3 min |

**Analysis**: Combo Keeper has extremely high value in the early game (24 min equivalent!) because tap income dominates at that stage. By late game, idle income dominates and the combo preservation matters less. This inversion is desirable — it gives early-game active players a powerful ad option, while late-game players have Sunbeam Boost and Double Offline as their primary ad motivators.

---

## 3. Summary: Minutes of Idle Progress Per Ad

### "One Ad = 10-15 Minutes" Verification

| Ad Touchpoint | Zone 10 | Zone 50 | Zone 100 | Notes |
|---|---|---|---|---|
| Sunbeam Boost | 10 min | 10 min | 10 min | Always exactly 10 min |
| Double Offline (2hr) | 60 min | 60 min | 60 min | Scales with absence |
| Dewdrop Garden | 0 min | 0 min | 0 min | Non-Sunlight value |
| Lucky Sprout | 4.4 min | 2.4 min | 2.1 min | Mystery box factor |
| Gate Assist | 5-10 min | 5-10 min | 5-10 min | Strategic/contextual |
| Boss Smash | 10-15 min | 10-15 min | N/A | Critical for first kills |
| Combo Keeper | 24 min | 4 min | 1.3 min | High early, low late |

### Average Across All Ad Types

| Game Stage | Weighted Average (excl. Dewdrop Garden) | Target |
|---|---|---|
| Early (Zone 10) | ~18 min | 10-15 min |
| Mid (Zone 50) | ~15 min | 10-15 min |
| Late (Zone 100) | ~14 min | 10-15 min |

**Result**: The average ad value across touchpoints (excluding Dewdrop Garden which provides non-Sunlight value) is **14-18 minutes of idle progress**. This slightly exceeds the 10-15 minute target, which is desirable — generous rewards drive higher voluntary watch rates.

Double Offline is an outlier at 60 min, but it only triggers once per return. Excluding it, the average is ~10 minutes, landing right on target.

---

## 4. Dewdrop Economy

### 4.1 Daily Dewdrop Income

From `docs/design/05-ad-economy.md`:

| Play Pattern | Ads/Day | Base Dewdrops | Bonus (every 3rd ad) | Streak Bonus (day 5+) | Total/Day |
|---|---|---|---|---|---|
| Minimal | 1 | 1 | 0 | 0 | **1** |
| Casual | 3 | 3 | +1 | 0 | **4** |
| Casual + Streak | 3 | 3 | +1 | +5 | **9** |
| Regular | 8 | 8 | +2 | +5 | **15** |
| Hardcore | 15 | 15 | +5 | 0 | **20** |
| Hardcore + Streak | 15 | 15 | +5 | +5 | **25** |

### 4.2 Dewdrop Shop Pricing — Days to Afford

| Item | Cost (Dewdrops) | Casual (4/day) | Casual+Streak (9/day) | Hardcore (20/day) | Hardcore+Streak (25/day) |
|---|---|---|---|---|---|
| Bloomling Hat | 5-15 | 1-4 days | 1-2 days | 1 day | 1 day |
| Number Fonts | 10 | 3 days | 2 days | 1 day | 1 day |
| Tap Effect Pack | 15-20 | 4-5 days | 2-3 days | 1 day | 1 day |
| Buy-Max Button | 20 | 5 days | 3 days | 1 day | 1 day |
| Garden Theme | 25-50 | 7-13 days | 3-6 days | 2-3 days | 1-2 days |
| Offline Boost | 40 | 10 days | 5 days | 2 days | 2 days |
| Auto-Tap (Slow) | 50 | 13 days | 6 days | 3 days | 2 days |
| Extra Garden Slot | 75 | 19 days | 9 days | 4 days | 3 days |
| Shimmerleaf (Legendary) | 80 | 20 days | 9 days | 4 days | 4 days |
| Dewpetal (Mythic) | 100 | 25 days | 12 days | 5 days | 4 days |
| Auto-Tap (Fast) | 150 | 38 days | 17 days | 8 days | 6 days |
| Auroravine (Mythic) | 200 | 50 days | 23 days | 10 days | 8 days |

### 4.3 Pricing Verification

**Design goals**:
1. Small cosmetics affordable within a week for casuals
2. QoL items affordable within 2 weeks for casuals
3. Premium items (exclusive Bloomlings) require 2-4 weeks for regular players
4. Aspirational items (Auroravine) require 1-2 months for casuals — long-term goal

**Verdict**:
- Bloomling Hats and Number Fonts: 1-5 days casual. **Good** — quick dopamine hit.
- Buy-Max Button: 5 days casual, 1 day hardcore. **Good** — meaningful QoL, earned relatively quickly.
- Auto-Tap (Slow): 13 days casual, 3 days hardcore. **Good** — strong motivation to watch ads regularly.
- Extra Garden Slot: 19 days casual. **Slightly long** — consider reducing to 60 Dewdrops (15 days casual) since this provides real gameplay power.
- Shimmerleaf/Dewpetal: 20-25 days casual. **Good** — exclusive Bloomlings should feel like earned achievements.
- Auroravine: 50 days casual. **Aspirational** — this is the "I've been playing for 2 months" badge. Appropriate.

---

## 5. Lucky Sprout Reward Table

### Full Probability Distribution

| Reward | Probability | Rarity Label | Expected Occurrences per 10 Sprouts |
|---|---|---|---|
| 5 minutes of idle production | 40% | Common | 4.0 |
| 2x tap value for 5 minutes | 25% | Uncommon | 2.5 |
| 1 bonus Dewdrop | 15% | Rare | 1.5 |
| Free Bloomling level-up | 12% | Rare | 1.2 |
| 10% Nectar bonus on next Rebirth | 8% | Very Rare | 0.8 |

### Expected Value Per Lucky Sprout

At Zone 50 (mid-game reference):

| Reward | Prob. | Sunlight Value | Dewdrop Value | Nectar Value | Weighted Sunlight |
|---|---|---|---|---|---|
| 5 min production | 40% | 4,320,000 | 0 | 0 | 1,728,000 |
| 2x tap 5 min | 25% | 1,440,000 | 0 | 0 | 360,000 |
| Bonus Dewdrop | 15% | 0 | 1 | 0 | 0 |
| Free level-up | 12% | ~25,000 saved | 0 | 0 | 3,000 |
| Nectar bonus | 8% | 0 | 0 | ~0.3 | 0 |
| **Expected Value** | | | **0.15 Dew** | **0.024 Nectar** | **~2,091,000 Sun** |

**In idle-minutes**: 2,091,000 / (14,400 * 60) = **2.4 minutes** of idle production (Sunlight only).

Including non-Sunlight value (Dewdrops and Nectar), the total value is closer to **5-7 minutes** when converted to equivalent game progress.

---

## 6. Daily Ad Cap Impact

### Maximum Advantage: 15 Ads vs 0 Ads Per Day

Assuming 2 hours of active play plus 6 hours offline per day:

#### Typical Allocation of 15 Ads

| Touchpoint | Uses/Day | Sunlight Bonus | Other Value |
|---|---|---|---|
| Sunbeam Boost | 4 | 40 min of 2x prod | - |
| Double Offline | 1 | 60 min of idle prod | - |
| Dewdrop Garden | 5 | 0 | 5-7 Dewdrops |
| Lucky Sprout | 3 | ~12 min of idle prod | 0.45 Dew, 0.07 Nectar |
| Gate/Boss Assist | 2 | 10-20 min saved | Unblocks progression |
| **Total** | **15** | **~125 min extra prod** | **~6 Dewdrops** |

#### Impact on Daily Progression

| Metric | 0 Ads/Day | 15 Ads/Day | Advantage |
|---|---|---|---|
| Effective daily production | 8 hours baseline | 8 hours + ~2 hours bonus | **+25%** Sunlight |
| Dewdrops earned | 0 | 20-25 | Shop access |
| Zone progression speed | Baseline | ~25% faster | +3-5 extra zones/day |
| Rebirth frequency | Baseline | ~20% more Rebirths | +1 extra Rebirth per 5 |
| Time to first Transcendence | ~16 hours play | ~13 hours play | **~20% faster** |

### Balance Verification

The 15-ad player is ~25% more powerful than the 0-ad player. This is intentionally moderate:
- **Not too large**: 0-ad players can still progress at a satisfying rate; ads are never "required"
- **Not too small**: Ad-watching players feel meaningfully rewarded for their time investment
- **Soft power, not hard gates**: Ad advantages are production speed, not unique gameplay content
- **Diminishing returns**: The first 3-5 ads/day provide most of the value (Sunbeam Boost + Double Offline + a couple Dewdrops). Ads 6-15 provide primarily Dewdrops

---

## 7. Quick Reference: All Ad Formulas

| Formula | Expression |
|---|---|
| Sunbeam Boost value | `idleRate * 600` (10 min of idle income) |
| Double Offline bonus | `0.5 * idleRate * absenceSeconds` |
| Lucky Sprout EV (Sunlight) | `0.40 * (idleRate*300) + 0.25 * (tapRate*300) + 0.12 * levelUpCost` |
| Gate Assist (+15s) | `totalActiveRate * 15` (Sunlight in 15 seconds) |
| Gate Assist (1.5x) | `totalActiveRate * 0.5 * 30` (bonus Sunlight over 30 seconds) |
| Boss Smash | `bossHP * 0.25` where `bossHP = 50 * zoneThreshold` |
| Combo Keeper | `(comboMult - 1.0) * tapRate * 300` |
| Dewdrops per day (casual) | 4 (3 ads + 1 bonus) |
| Dewdrops per day (max) | 25 (15 ads + 5 bonuses + 5 streak) |
