# Bloomlings Game Design — Section 6: Retention & Addiction Hooks

## Overview

Retention is everything in a free-to-play game. A player who opens the app every day is worth 100x more than one who plays once. This section defines every system designed to bring players back and keep them engaged.

---

## Daily Login Rewards

### How It Works
- Each day the player opens the app, they collect a daily reward
- Rewards are on a **7-day rotating cycle** that escalates
- Missing a day **does not reset** the cycle — it just pauses (no punishment, only reward)
- After completing a 7-day cycle, the next cycle starts with better rewards

### Cycle 1 (First Week)

| Day | Reward |
|---|---|
| 1 | 500 Sunlight |
| 2 | 1,000 Sunlight |
| 3 | 1 Dewdrop |
| 4 | 2,500 Sunlight + Random Bloomling Level Up |
| 5 | 2 Dewdrops |
| 6 | 5,000 Sunlight + 2x Boost (30 min) |
| 7 | 5 Dewdrops + "Welcome Gift" cosmetic (one-time) |

### Subsequent Cycles
- Sunlight rewards scale with the player's current idle production rate (always relevant)
- Dewdrop rewards slowly increase: Cycle 2 gives +1 more per Dewdrop day, etc.
- Every 4th completed cycle (monthly milestone) grants a special cosmetic or exclusive reward

### Why No Punishment for Missing Days?
- Punishing absence creates guilt, guilt creates uninstalls
- The streak system (below) handles the "consecutive days" incentive separately
- Daily rewards say: "Welcome back, whenever you return"

---

## Streak System

### How It Works
- A **separate counter** tracks consecutive days of opening the app
- Each consecutive day adds to the streak
- Streak grants **passive multipliers** to all production

### Streak Bonuses

| Consecutive Days | Bonus |
|---|---|
| 1 | No bonus (day 1 is neutral) |
| 2 | +2% all production |
| 3 | +5% all production |
| 5 | +10% all production |
| 7 | +15% all production + 3 Dewdrops |
| 14 | +20% all production + 5 Dewdrops |
| 30 | +25% all production + 10 Dewdrops + exclusive "Devoted Gardener" title |

### Streak Protection
- Missing **one day** doesn't break the streak — it freezes it (grace period)
- Missing **two consecutive days** resets the streak to 0
- Watching an ad can **retroactively protect** one missed day per week ("Streak Shield")
- This prevents frustration while still incentivizing daily play

---

## Achievement System

### Categories

#### Growth Achievements (Bloomling Progression)
- "First Sprout" — Unlock your first Bloomling
- "Full Bloom" — Evolve a Bloomling to Bloom stage
- "Ancient Wisdom" — Evolve a Bloomling to Elder stage
- "The Collector" — Own 10 / 25 / 50 / all Bloomlings
- "Best Friends" — Discover your first Bloomling Synergy
- "Dream Team" — Have 4 Bloomlings with active synergies in the Garden

#### Power Achievements (Production Milestones)
- "Sunshine" — Earn 10,000 total Sunlight
- "Solar Flare" — Earn 1,000,000 total Sunlight
- "Supernova" — Earn 1,000,000,000 total Sunlight
- "Tap Dancer" — Tap 1,000 / 10,000 / 100,000 times
- "Combo Master" — Reach a 50 / 75 / 100 combo
- "Critical Mass" — Land 100 / 1,000 Critical Taps

#### Journey Achievements (Zone Progression)
- "First Steps" — Clear Zone 5
- "Into the Wild" — Clear Zone 25 (leave the greenhouse)
- "Twilight Explorer" — Reach the Twilight Hollow (Zone 51)
- "Deep Diver" — Reach the Crystal Caverns (Zone 76)
- "Zone Crusher" — Clear Zone 100 / 200 / 500

#### Rebirth Achievements (Prestige)
- "New Season" — Complete your first Rebirth
- "Seasonal Veteran" — Complete 10 / 25 / 50 Rebirths
- "Nectar Hoarder" — Accumulate 100 / 500 / 2000 Nectar total
- "Transcendent" — Complete your first Transcendence
- "Beyond Mortal" — Complete 5 Transcendences

#### Hidden Achievements (Discoverable)
- "Patient Gardener" — Leave the app closed for exactly 24 hours, then return
- "Speed Demon" — Clear 10 zones in under 60 seconds
- "Stubborn" — Fail a gate zone 10 times, then beat it
- "Hat Collector" — Buy 5 different Bloomling hats
- "Completionist" — Unlock every other achievement

### Achievement Rewards
- Each achievement grants a **one-time Sunlight or Dewdrop bonus**
- Tiered achievements (Bronze/Silver/Gold) grant escalating rewards
- Hidden achievements grant Dewdrops (extra incentive)
- Achievement percentage shown in profile — drives completionism

---

## Notifications (Local, Opt-In)

### Types
All notifications are **local** (no server needed) and **opt-in** during onboarding.

| Notification | Trigger | Message Example |
|---|---|---|
| Offline Earnings Ready | 2 hours since last open | "Your Bloomlings have been busy! 12,400 Sunlight is waiting for you." |
| Streak Reminder | 8pm if not opened today | "Don't lose your 5-day streak! Your Bloomlings miss you." |
| Boost Expired | Sunbeam Boost ends | "Your Sunbeam Boost has faded. Come back to recharge!" |
| Milestone Close | Player is 90%+ to a zone clear | "You're SO close to clearing Zone 34! One more push!" |
| New Bloomling Hint | Player is near an unlock threshold | "Something is stirring in Zone 25..." |

### Notification Rules
- **Max 2 notifications per day** (never spam)
- **No notifications in the first 24 hours** (let the player settle in)
- Player can disable any category individually in Settings
- Tone is always warm and in-character (from the Bloomlings' perspective)
- Never guilt-trip: "Your Bloomlings miss you" is fine; "Your Bloomlings are dying" is not

---

## The "Just One More" Hooks

These are micro-design patterns embedded throughout the game:

### 1. Next Unlock Preview
- Always show what's coming next: "Next Bloomling at Zone 15 (you're at Zone 13)"
- The progress bar for the next unlock is always visible
- When close (>80%), the bar pulses gently to draw attention

### 2. Almost-Affordable Upgrades
- The upgrade shop always shows items the player can *almost* afford
- "You need 340 more Sunlight" with a progress indicator
- This creates the "just 2 more minutes" feeling

### 3. Rebirth Preview Escalation
- The Rebirth screen constantly shows: "If you push 5 more zones, you'll earn 3 more Nectar"
- This rolling preview makes the player always feel they're on the verge of a better deal

### 4. New Run Acceleration
- After Rebirth, the early zones FLY by (due to Nectar upgrades)
- This creates a rush of power and excitement
- The contrast between "grinding zone 50" and "breezing through zone 20" is addictive

### 5. Collection Gaps
- The Bloomling collection shows silhouettes of undiscovered Bloomlings
- Gaps in the collection are psychologically uncomfortable — players want to fill them
- Hint text: "This Bloomling is found somewhere in the Twilight Hollow..."

### 6. Lucky Sprout Anticipation
- The random Lucky Sprout ad opportunity (every 10-15 min) creates **variable reward scheduling**
- The player never knows when it'll appear or what they'll get
- This is the same psychology that makes slot machines engaging (but ethical — it costs time, not money)

### 7. Combo Investment
- Once a player has a 50+ combo going, they don't want to stop tapping
- The combo meter creates a psychological "sunk cost" that keeps them engaged
- Combo Keeper (ad) extends this further

---

## Session Length Targets

| Player Type | Target Session | Sessions/Day |
|---|---|---|
| Casual | 5-10 minutes | 2-3 |
| Regular | 15-30 minutes | 2-4 |
| Hardcore | 30-60+ minutes | 3-5+ |

The game should be satisfying in 5-minute bursts but rewarding enough to sustain hour-long sessions for those who want them.

---

## Anti-Churn Design

### Why Players Quit Idle Games
1. Hit a wall with no clear path forward
2. Feel punished for not playing
3. Get overwhelmed by complexity
4. Numbers become meaningless
5. No emotional connection

### How Bloomlings Addresses Each
1. **No walls**: There's always Rebirth, ads for boosts, or the gate-failure stacking bonus
2. **No punishment**: Streaks have grace periods, offline progress is generous, Bloomlings welcome you back
3. **Drip-feed complexity**: Features unlock gradually over zones, never all at once
4. **Meaningful numbers**: Number formatting keeps things readable; prestige resets keep numbers fresh
5. **Emotional connection**: Bloomlings have names, stories, and personalities. Players care about Fernley

---

## Future Retention Systems (Post-Launch)

These are designed but not in v1.0:

- **Seasonal Events**: Limited-time biomes with exclusive Bloomlings (holiday themes)
- **Community Goals**: "All players collectively generate X Sunlight this week" for shared rewards
- **Friend Gardens**: Visit friends' gardens, gift Dewdrops
- **Weekly Challenges**: "Reach Zone 50 without using Solara" for bonus rewards
- **Leaderboards**: Optional competitive zones — highest zone this week

---

## Design Document Complete

### Full Section Index
1. `01-core-game-loop.md` — Tapping, idle production, currencies, feature timeline
2. `02-bloomling-mechanics.md` — Growth, evolution, synergies, Garden, abilities
3. `03-zone-progression.md` — Zones, gates, biomes, bosses
4. `04-prestige-systems.md` — Rebirth, Transcendence, nested loops
5. `05-ad-economy.md` — Dewdrops, ad touchpoints, monetization philosophy
6. `06-retention-hooks.md` — Dailies, streaks, achievements, addiction mechanics
