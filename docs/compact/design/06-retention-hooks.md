<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->
<!-- Source: docs/design/06-retention-hooks.md -->

# Bloomlings Game Design — Section 6: Retention & Addiction Hooks (Compact Context)

> Auto-generated from the canonical source file. Edit the source markdown, then regenerate compact docs.

## Quick Map
- Overview
- Daily Login Rewards
  - How It Works
  - Cycle 1 (First Week)
  - Subsequent Cycles
  - Why No Punishment for Missing Days?
- Streak System
  - How It Works
  - Streak Bonuses
  - Streak Protection
- Achievement System
  - Categories
    - Growth Achievements (Bloomling Progression)
    - Power Achievements (Production Milestones)
    - Journey Achievements (Zone Progression)
    - Rebirth Achievements (Prestige)
    - Hidden Achievements (Discoverable)
  - Achievement Rewards
- Notifications (Local, Opt-In)
  - Types
  - Notification Rules
- The "Just One More" Hooks
  - 1. Next Unlock Preview
  - 2. Almost-Affordable Upgrades
  - 3. Rebirth Preview Escalation
  - 4. New Run Acceleration
  - 5. Collection Gaps
  - 6. Lucky Sprout Anticipation
  - 7. Combo Investment
- Session Length Targets
- Anti-Churn Design
  - Why Players Quit Idle Games
  - How Bloomlings Addresses Each
- Future Retention Systems (Post-Launch)
- Design Document Complete
  - Full Section Index

## Key Points
### Overview
- Retention is everything in a free-to-play game. A player who opens the app every day is worth 100x more than one who plays once. This section defines every system designed to bring players back and keep them engaged.

### Daily Login Rewards
- (No concise bullet/summary found; use grep in source file for details.)

### How It Works
- Each day the player opens the app, they collect a daily reward
- Rewards are on a **7-day rotating cycle** that escalates
- Missing a day **does not reset** the cycle — it just pauses (no punishment, only reward)
- After completing a 7-day cycle, the next cycle starts with better rewards

### Cycle 1 (First Week)
- (No concise bullet/summary found; use grep in source file for details.)

### Subsequent Cycles
- Sunlight rewards scale with the player's current idle production rate (always relevant)
- Dewdrop rewards slowly increase: Cycle 2 gives +1 more per Dewdrop day, etc.
- Every 4th completed cycle (monthly milestone) grants a special cosmetic or exclusive reward

### Why No Punishment for Missing Days?
- Punishing absence creates guilt, guilt creates uninstalls
- The streak system (below) handles the "consecutive days" incentive separately
- Daily rewards say: "Welcome back, whenever you return"

### Streak System
- (No concise bullet/summary found; use grep in source file for details.)

### How It Works
- A **separate counter** tracks consecutive days of opening the app
- Each consecutive day adds to the streak
- Streak grants **passive multipliers** to all production

### Streak Bonuses
- (No concise bullet/summary found; use grep in source file for details.)

### Streak Protection
- Missing **one day** doesn't break the streak — it freezes it (grace period)
- Missing **two consecutive days** resets the streak to 0
- Watching an ad can **retroactively protect** one missed day per week ("Streak Shield")
- This prevents frustration while still incentivizing daily play

### Achievement System
- (No concise bullet/summary found; use grep in source file for details.)

### Categories
- (No concise bullet/summary found; use grep in source file for details.)

### Growth Achievements (Bloomling Progression)
- "First Sprout" — Unlock your first Bloomling
- "Full Bloom" — Evolve a Bloomling to Bloom stage
- "Ancient Wisdom" — Evolve a Bloomling to Elder stage
- "The Collector" — Own 10 / 25 / 50 / all Bloomlings

### Power Achievements (Production Milestones)
- "Sunshine" — Earn 10,000 total Sunlight
- "Solar Flare" — Earn 1,000,000 total Sunlight
- "Supernova" — Earn 1,000,000,000 total Sunlight
- "Tap Dancer" — Tap 1,000 / 10,000 / 100,000 times

### Journey Achievements (Zone Progression)
- "First Steps" — Clear Zone 5
- "Into the Wild" — Clear Zone 25 (leave the greenhouse)
- "Twilight Explorer" — Reach the Twilight Hollow (Zone 51)
- "Deep Diver" — Reach the Crystal Caverns (Zone 76)

### Rebirth Achievements (Prestige)
- "New Season" — Complete your first Rebirth
- "Seasonal Veteran" — Complete 10 / 25 / 50 Rebirths
- "Nectar Hoarder" — Accumulate 100 / 500 / 2000 Nectar total
- "Transcendent" — Complete your first Transcendence

### Hidden Achievements (Discoverable)
- "Patient Gardener" — Leave the app closed for exactly 24 hours, then return
- "Speed Demon" — Clear 10 zones in under 60 seconds
- "Stubborn" — Fail a gate zone 10 times, then beat it
- "Hat Collector" — Buy 5 different Bloomling hats

### Achievement Rewards
- Each achievement grants a **one-time Sunlight or Dewdrop bonus**
- Tiered achievements (Bronze/Silver/Gold) grant escalating rewards
- Hidden achievements grant Dewdrops (extra incentive)
- Achievement percentage shown in profile — drives completionism

### Notifications (Local, Opt-In)
- (No concise bullet/summary found; use grep in source file for details.)

### Types
- All notifications are **local** (no server needed) and **opt-in** during onboarding.

### Notification Rules
- **Max 2 notifications per day** (never spam)
- **No notifications in the first 24 hours** (let the player settle in)
- Player can disable any category individually in Settings
- Tone is always warm and in-character (from the Bloomlings' perspective)

### The "Just One More" Hooks
- These are micro-design patterns embedded throughout the game:

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

### Session Length Targets
- The game should be satisfying in 5-minute bursts but rewarding enough to sustain hour-long sessions for those who want them.

### Anti-Churn Design
- (No concise bullet/summary found; use grep in source file for details.)

### Why Players Quit Idle Games
- Hit a wall with no clear path forward
- Feel punished for not playing
- Get overwhelmed by complexity
- Numbers become meaningless

### How Bloomlings Addresses Each
- **No walls**: There's always Rebirth, ads for boosts, or the gate-failure stacking bonus
- **No punishment**: Streaks have grace periods, offline progress is generous, Bloomlings welcome you back
- **Drip-feed complexity**: Features unlock gradually over zones, never all at once
- **Meaningful numbers**: Number formatting keeps things readable; prestige resets keep numbers fresh

### Future Retention Systems (Post-Launch)
- **Seasonal Events**: Limited-time biomes with exclusive Bloomlings (holiday themes)
- **Community Goals**: "All players collectively generate X Sunlight this week" for shared rewards
- **Friend Gardens**: Visit friends' gardens, gift Dewdrops
- **Weekly Challenges**: "Reach Zone 50 without using Solara" for bonus rewards

### Design Document Complete
- (No concise bullet/summary found; use grep in source file for details.)

### Full Section Index
- `01-core-game-loop.md` — Tapping, idle production, currencies, feature timeline
- `02-bloomling-mechanics.md` — Growth, evolution, synergies, Garden, abilities
- `03-zone-progression.md` — Zones, gates, biomes, bosses
- `04-prestige-systems.md` — Rebirth, Transcendence, nested loops
