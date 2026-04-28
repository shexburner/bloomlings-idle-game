<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->
<!-- Source: docs/design/07-zone-gates-and-bosses.md -->

# Bloomlings Game Design — Section 7: Zone Gates & Biome Bosses (Compact Context)

> Auto-generated from the canonical source file. Edit the source markdown, then regenerate compact docs.

## Quick Map
- 1. Game Design
  - 1.1 Zone Gates
    - When Gates Trigger
    - Gate Rules
    - Gate Flow
    - Interaction with Existing Systems
    - Gate Rewards
    - Player Experience
  - 1.2 Biome Bosses
    - When Bosses Trigger
    - Boss Rules
    - Boss Flow
    - Boss HP Phases
    - Interaction with Existing Systems
    - Boss Rewards
    - Player Experience
- 2. Engine Architecture
  - 2.1 New Module: `src/engine/zoneGates.ts`
  - 2.2 New Module: `src/engine/bossFight.ts`
  - 2.3 Integration: `gameLoop.ts` Changes
    - Modified `gameTick`
    - Modified `applyTick`
    - Key Constraint: No Auto-Advance During Encounters
  - 2.4 Integration: `tapSystem.ts` Changes
  - 2.5 Integration: `store.ts` Changes
    - Modified `advanceZone`
    - Modified `addZoneProgress`
  - 2.6 State Transitions
- 3. Economy Balance
  - 3.1 Gate Threshold Verification
    - Worked Examples
    - Idle-Only Gate Analysis
  - 3.2 Boss HP Verification
    - Idle-Only Boss Analysis
  - 3.3 Gate Assist Ad Value
  - 3.4 Boss Smash Ad Value
  - 3.5 Failure Bonus Stacking
    - Gate Failure Progression
    - Boss Failure Progression
    - With Boss Smash Ad
- 4. UI/UX Design
  - 4.1 Gate UI
    - Zone Progress Bar Transformation
    - Urgency Effects
    - Gate Success Animation
    - Gate Failure Animation
  - 4.2 Boss UI
    - Boss Fight Screen
    - Boss Entrance Animation
    - Boss Phase Transitions
    - Boss Victory Sequence
  - 4.3 Gate Assist Button
    - Placement
    - Visibility Rules
    - Button States
  - 4.4 Boss Smash Button
    - Placement
    - Visibility Rules
    - Button States
  - 4.5 Screen Transitions
    - Offline / Background Handling
- 5. Implementation Checklist
- Next Section

## Key Points
### 1. Game Design
- (No concise bullet/summary found; use grep in source file for details.)

### 1.1 Zone Gates
- (No concise bullet/summary found; use grep in source file for details.)

### When Gates Trigger
- Every zone where `zone % 5 === 0` is a **Gate Zone**. When the player would

### Gate Rules
- (No concise bullet/summary found; use grep in source file for details.)

### Gate Flow
- Normal zone N-1 clears

### Interaction with Existing Systems
- **Combo**: combo continues to build and decay normally during a gate. A
- **Active boosts**: Sunbeam Boost (2× production) stacks multiplicatively
- **Failure bonus**: applied as a multiplier on all Sunlight generated during
- **Gate Assist ad**: the player chooses one of two options per attempt:

### Gate Rewards
- (No concise bullet/summary found; use grep in source file for details.)

### Player Experience
- Progress bar changes to a **gate bar** with a countdown timer overlay.
- The bar pulses with increasing urgency as time runs out.
- A burst Sunlight counter shows how much has been generated this attempt.
- On success: satisfying shatter animation, bonus Sunlight rains down.

### 1.2 Biome Bosses
- (No concise bullet/summary found; use grep in source file for details.)

### When Bosses Trigger
- Every zone where `zone % 25 === 0` is a **Boss Zone**. A boss zone is also a

### Boss Rules
- (No concise bullet/summary found; use grep in source file for details.)

### Boss Flow
- Normal zone N-1 clears

### Boss HP Phases
- The boss has visual phases at HP thresholds:

### Interaction with Existing Systems
- **Combo**: continues normally. The 2× tap bonus stacks with combo
- **Active boosts**: Sunbeam Boost doubles idle production, which also
- **Failure bonus**: applied as a multiplier on all damage dealt:
- **Boss Smash ad**: deals `0.25 * bossHpMax` instant damage. At 50× zone

### Boss Rewards
- (No concise bullet/summary found; use grep in source file for details.)

### Player Experience
- Screen transitions to a **boss fight view** with dramatic entrance animation.
- Full-width boss HP bar replaces the zone progress bar.
- A "2× TAP POWER" indicator pulses on screen.
- Timer counts down prominently.

### 2. Engine Architecture
- (No concise bullet/summary found; use grep in source file for details.)

### 2.1 New Module: `src/engine/zoneGates.ts`
- Gate burst threshold: 2× the normal zone threshold.
- Accepts the pre-computed normal threshold to stay pure.
- Start a gate encounter. Returns the new ZoneProgressState fields.
- Called by the store when advanceZone lands on a gate zone.

### 2.2 New Module: `src/engine/bossFight.ts`
- Start a boss encounter. Returns new ZoneProgressState fields.
- Tick the boss fight. Reduces HP by sunlightGenerated (already includes
- the 2× tap bonus applied upstream). Returns updated HP, timer, and
- whether the boss was defeated or the timer expired.

### 2.3 Integration: `gameLoop.ts` Changes
- The `gameTick` function and `applyTick` function change when a gate or boss

### Modified `gameTick`
- function gameTick(state, now, deltaMs):

### Modified `applyTick`
- IF result.gateTickResult:

### Key Constraint: No Auto-Advance During Encounters
- The existing `hasReachedZoneThreshold` check in `gameTick` must be gated:

### 2.4 Integration: `tapSystem.ts` Changes
- The `useTapHandler` hook applies the 2× boss tap bonus:

### 2.5 Integration: `store.ts` Changes
- (No concise bullet/summary found; use grep in source file for details.)

### Modified `advanceZone`
- The current `advanceZone` unconditionally increments the zone. It must now

### Modified `addZoneProgress`
- During a boss fight, Sunlight generated reduces boss HP instead of

### 2.6 State Transitions
- ┌─────────────┐ zone % 5 ≠ 0 ┌─────────────┐

### 3. Economy Balance
- (No concise bullet/summary found; use grep in source file for details.)

### 3.1 Gate Threshold Verification
- Gate threshold = `2 × normalZoneThreshold`. The player has 30 seconds to

### Worked Examples
- **Tap DPS calculation** (Zone 10 example):

### Idle-Only Gate Analysis
- A pure-idle player at Zone 10 generates 55 Sun/s. In 30s: 1,650 Sun vs

### 3.2 Boss HP Verification
- Boss HP = `50 × normalZoneThreshold`. The player has 120 seconds with 2×

### Idle-Only Boss Analysis
- At Zone 25, pure idle = 450 Sun/s × 120s = 54,000 vs 42,500 HP. Barely

### 3.3 Gate Assist Ad Value
- Base timer: 30s → becomes 45s
- Time increase: +50%
- At Zone 10 (DPS 160): extra 15s = +2,400 Sunlight generated
- Value: equivalent to ~50% more total output

### 3.4 Boss Smash Ad Value
- Instant damage: 25% of boss max HP
- At Zone 25 (HP 42,500): deals 10,625 damage instantly
- Player total DPS: ~1,850 Sun/s
- Time saved: 10,625 / 1,850 ≈ **5.7 seconds** of the 120s fight

### 3.5 Failure Bonus Stacking
- The +5% per fail (max +50%) ensures struggling players eventually clear.

### Gate Failure Progression
- Assuming a player whose DPS can only generate 80% of the gate threshold in

### Boss Failure Progression
- Assuming a player whose total damage over 120s is 70% of boss HP:

### With Boss Smash Ad
- Deals 25% HP instantly → only needs 45% from DPS
- 70% DPS × 120s easily covers 45% → **clears on first attempt with ad**

### 4. UI/UX Design
- (No concise bullet/summary found; use grep in source file for details.)

### 4.1 Gate UI
- (No concise bullet/summary found; use grep in source file for details.)

### Zone Progress Bar Transformation
- Bar border changes from green to **amber/gold** with a pulsing glow.
- A **countdown timer** (`mm:ss`) appears above the bar, right-aligned.
- The fill color shifts to a gradient (amber → red as time runs out).
- A **burst counter** appears below the bar: "⚡ 1,240 / 3,500 Sunlight".

### Urgency Effects
- (No concise bullet/summary found; use grep in source file for details.)

### Gate Success Animation
- Bar fills completely → **shatter effect** (bar fragments outward).
- Bonus Sunlight numbers rain down from the top of the screen.
- Brief "GATE CLEARED" banner with the bonus amount.
- Smooth transition back to normal zone progress bar.

### Gate Failure Animation
- Timer hits 0 → bar **cracks** with a glass-breaking effect.
- Bar resets to empty with a brief fade.
- "+5% bonus on next attempt" pill appears and fades after 2 seconds.
- Timer resets to 30s, bar returns to amber state.

### 4.2 Boss UI
- (No concise bullet/summary found; use grep in source file for details.)

### Boss Fight Screen
- The boss fight is a **full-screen overlay** that replaces the normal garden

### Boss Entrance Animation
- Screen dims slightly.
- Boss name appears with a dramatic font treatment.
- Boss sprite slides/grows into view with a rumble haptic.
- HP bar fills from left to right.

### Boss Phase Transitions
- Screen flash.
- Boss sprite changes animation state (idle → damaged → wounded → critical).
- Particle effects intensify.
- Short haptic burst.

### Boss Victory Sequence
- Boss HP reaches 0 → boss sprite **collapses/dissolves** with particles.
- Screen brightens to white.
- "VICTORY" banner with dramatic typography.
- Unique Bloomling reveal: silhouette → full reveal with sparkle effect.

### 4.3 Gate Assist Button
- (No concise bullet/summary found; use grep in source file for details.)

### Placement
- Floating button, bottom-right of the gate progress bar area.
- Same golden ad-button styling as Sunbeam Boost (distinct from gameplay buttons).

### Visibility Rules
- Hidden by default when a gate starts.
- Appears when **either**:
- The player has failed the gate at least once (`gateFailCount >= 1`), OR
- Less than 10 seconds remain on the timer.

### Button States
- (No concise bullet/summary found; use grep in source file for details.)

### 4.4 Boss Smash Button
- (No concise bullet/summary found; use grep in source file for details.)

### Placement
- Centered below the boss sprite, above the stats bar.
- Larger than Gate Assist — this is a dramatic moment.

### Visibility Rules
- Hidden by default when a boss fight starts.
- Appears when **either**:
- The player has failed the boss at least once (`bossFailCount >= 1`), OR
- Less than 30 seconds remain on the timer.

### Button States
- (No concise bullet/summary found; use grep in source file for details.)

### 4.5 Screen Transitions
- Normal Play

### Offline / Background Handling
- If the app goes to background during a gate or boss, the encounter
- On foreground resume, the encounter resumes from where it left off.
- Offline progress does **not** apply to gate/boss encounters — only to

### 5. Implementation Checklist
- (No concise bullet/summary found; use grep in source file for details.)

### Next Section
- See `05-ad-economy.md` for the full ad touchpoint catalog including Gate Assist (#5) and Boss Smash (#6).
