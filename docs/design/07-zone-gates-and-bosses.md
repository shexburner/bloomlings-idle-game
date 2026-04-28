# Bloomlings Game Design — Section 7: Zone Gates & Biome Bosses

> **Phase 9** — The two missing engine systems that block Gate Assist and Boss
> Smash ad touchpoints. Covers mechanics, engine architecture, economy
> balance, and UI/UX.
>
> References:
> - `03-zone-progression.md` — canonical gate/boss rules
> - `05-ad-economy.md` — Gate Assist (#5) and Boss Smash (#6) touchpoints
> - `01-currency-rates.md` — production rate tables used for balance proofs
> - `src/types/game.ts` `ZoneProgressState` — already-declared runtime fields

---

## 1. Game Design

### 1.1 Zone Gates

#### When Gates Trigger

Every zone where `zone % 5 === 0` is a **Gate Zone**. When the player would
normally advance into a gate zone, the engine starts a gate encounter instead
of auto-clearing.

#### Gate Rules

| Parameter | Value |
|---|---|
| Timer | 30 seconds |
| Burst threshold | 2× the normal zone threshold |
| Sunlight sources | Tapping + idle production (both count) |
| Failure penalty | None — player stays on the zone, timer resets |
| Failure bonus | +5% additive per fail (stacks, max +50%) |
| Gate Assist ad | Once per attempt: +15s timer **or** 1.5× Sunlight |

#### Gate Flow

```
Normal zone N-1 clears
  → Zone N is a gate zone (N % 5 === 0)
  → Gate starts: timer = 30s, threshold = 2 * getZoneThreshold(N)
  → Player taps + idle generates Sunlight toward threshold
  → IF threshold met before timer expires:
      Gate cleared → grant rewards → advance to zone N+1
  → IF timer expires:
      Gate failed → gateFailCount++ → player retries (same zone, bonus applied)
```

#### Interaction with Existing Systems

- **Combo**: combo continues to build and decay normally during a gate. A
  high combo before entering a gate is a strategic advantage.
- **Active boosts**: Sunbeam Boost (2× production) stacks multiplicatively
  with the gate's own Sunlight generation — a well-timed boost before a gate
  is powerful.
- **Failure bonus**: applied as a multiplier on all Sunlight generated during
  the gate attempt: `1 + (gateFailCount * 0.05)`, capped at
  `1 + (10 * 0.05) = 1.50`.
- **Gate Assist ad**: the player chooses one of two options per attempt:
  - **+15 seconds**: timer becomes 45s total (50% more time).
  - **1.5× Sunlight**: all Sunlight generated during this attempt is
    multiplied by 1.5 (stacks with failure bonus and active boosts).

#### Gate Rewards

| Reward | Amount |
|---|---|
| Bonus Sunlight | 5× the normal zone threshold |
| First-time clear | Enhanced reward (new Bloomling discovery or achievement) |
| Stats | `stats.totalGatesCleared` incremented |

#### Player Experience

1. Progress bar changes to a **gate bar** with a countdown timer overlay.
2. The bar pulses with increasing urgency as time runs out.
3. A burst Sunlight counter shows how much has been generated this attempt.
4. On success: satisfying shatter animation, bonus Sunlight rains down.
5. On failure: bar cracks and resets, "+5% bonus next try" message appears.
6. Gate Assist button appears after the first failure or when < 10s remain.

---

### 1.2 Biome Bosses

#### When Bosses Trigger

Every zone where `zone % 25 === 0` is a **Boss Zone**. A boss zone is also a
gate zone (25 is divisible by 5), but the boss encounter **replaces** the gate
— the player fights the boss, not a gate.

#### Boss Rules

| Parameter | Value |
|---|---|
| Timer | 2 minutes (120 seconds) |
| Boss HP | 50× the normal zone threshold |
| Tap value during fight | 2× normal (before combo/crit) |
| Idle production | Counts toward HP damage at normal rate |
| Failure penalty | None — boss resets, player retries |
| Failure bonus | +5% additive per fail (stacks, max +50%) |
| Boss Smash ad | Once per attempt: deal 25% of boss max HP instantly |

#### Boss Flow

```
Normal zone N-1 clears
  → Zone N is a boss zone (N % 25 === 0)
  → Boss starts: timer = 120s, HP = 50 * getZoneThreshold(N)
  → All Sunlight generated (tap + idle) reduces boss HP
  → Tap value is doubled for the duration of the fight
  → IF HP reaches 0 before timer expires:
      Boss defeated → grant rewards → advance to zone N+1 (new biome)
  → IF timer expires:
      Boss failed → bossFailCount++ → player retries (bonus applied)
```

#### Boss HP Phases

The boss has visual phases at HP thresholds:

| HP Remaining | Phase | Visual |
|---|---|---|
| 100%–76% | Full | Boss idle animation |
| 75%–51% | Damaged | Boss shakes, cracks appear |
| 50%–26% | Wounded | Boss visibly wilting, particles |
| 25%–1% | Critical | Boss flickering, desperate animation |
| 0% | Defeated | Dramatic collapse + victory sequence |

#### Interaction with Existing Systems

- **Combo**: continues normally. The 2× tap bonus stacks with combo
  multiplier — reaching max combo during a boss fight is extremely powerful.
- **Active boosts**: Sunbeam Boost doubles idle production, which also
  damages the boss. The 2× tap bonus is separate from Sunbeam.
- **Failure bonus**: applied as a multiplier on all damage dealt:
  `1 + (bossFailCount * 0.05)`, capped at `1.50`.
- **Boss Smash ad**: deals `0.25 * bossHpMax` instant damage. At 50× zone
  threshold, this equals 12.5× zone threshold — roughly 30 seconds of
  combined active+idle DPS saved.
- **Critical taps**: crits apply normally on top of the 2× boss tap bonus.
  A crit during a boss fight deals `baseTap * 2 * 5 * comboMult` = 10× base.

#### Boss Rewards

| Reward | Description |
|---|---|
| Unique Bloomling | Boss-specific Bloomling (e.g., Thornwick from The Overgrowth) |
| Achievement | "Defeated [Boss Name]" achievement unlocked |
| New biome | Next 25-zone biome opens with narrative transition |
| Bonus Sunlight | 10× the normal zone threshold |

#### Player Experience

1. Screen transitions to a **boss fight view** with dramatic entrance animation.
2. Full-width boss HP bar replaces the zone progress bar.
3. A "2× TAP POWER" indicator pulses on screen.
4. Timer counts down prominently.
5. Boss reacts visually at each HP phase threshold.
6. Boss Smash button appears after the first failure or when < 30s remain.
7. On victory: dramatic collapse animation → unique Bloomling reveal →
   biome transition cinematic → new biome ambient loads.
8. On failure: boss roars and resets, "+5% bonus next try" message appears.


---

## 2. Engine Architecture

### 2.1 New Module: `src/engine/zoneGates.ts`

Pure functions — no store imports, no side effects. All state is passed in
and results are returned.

```ts
// --- Constants ---
const GATE_INTERVAL = 5;
const GATE_TIMER_MS = 30_000;
const GATE_THRESHOLD_MULTIPLIER = 2;
const GATE_REWARD_MULTIPLIER = 5;
const GATE_FAIL_BONUS_PER_FAIL = 0.05;
const GATE_FAIL_BONUS_CAP = 0.50;
const GATE_ASSIST_TIMER_BONUS_MS = 15_000;
const GATE_ASSIST_SUNLIGHT_MULTIPLIER = 1.5;

// --- Pure functions ---

/** True when the zone number is a gate (every 5th zone). */
function isGateZone(zone: number): boolean;

/** True when the zone is a boss zone (takes priority over gate). */
function isBossZone(zone: number): boolean;

/**
 * Gate burst threshold: 2× the normal zone threshold.
 * Accepts the pre-computed normal threshold to stay pure.
 */
function getGateThreshold(normalThreshold: number): number;

/** Failure bonus multiplier: 1 + min(failCount * 0.05, 0.50). */
function getGateFailBonus(failCount: number): number;

/**
 * Start a gate encounter. Returns the new ZoneProgressState fields.
 * Called by the store when advanceZone lands on a gate zone.
 */
function startGate(normalThreshold: number): Partial<ZoneProgressState>;
// Returns: { gateActive: true, gateTimerRemainingMs: 30000, currentZoneProgress: 0 }

/**
 * Tick the gate timer. Returns updated timer and whether the gate failed.
 * Called every game tick while gateActive === true.
 */
function tickGate(
  timerRemainingMs: number,
  deltaMs: number
): { timerRemainingMs: number; failed: boolean };

/**
 * Process a gate failure. Returns updated ZoneProgressState fields.
 * Increments fail count, resets progress, resets timer.
 */
function failGate(currentFailCount: number): Partial<ZoneProgressState>;
// Returns: { gateFailCount: currentFailCount + 1, currentZoneProgress: 0,
//            gateTimerRemainingMs: 30000 }

/**
 * Clear a gate (threshold met). Returns fields to reset gate state.
 */
function clearGate(): Partial<ZoneProgressState>;
// Returns: { gateActive: false, gateTimerRemainingMs: null, gateFailCount: 0 }
```

### 2.2 New Module: `src/engine/bossFight.ts`

Same pattern — pure functions, no side effects.

```ts
// --- Constants ---
const BOSS_INTERVAL = 25;
const BOSS_TIMER_MS = 120_000;
const BOSS_HP_MULTIPLIER = 50;
const BOSS_TAP_MULTIPLIER = 2;
const BOSS_FAIL_BONUS_PER_FAIL = 0.05;
const BOSS_FAIL_BONUS_CAP = 0.50;
const BOSS_AD_DAMAGE_FRACTION = 0.25;
const BOSS_REWARD_MULTIPLIER = 10;

// --- Pure functions ---

/** True when the zone number is a boss zone (every 25th). */
function isBossZone(zone: number): boolean;

/** Boss HP: 50× the normal zone threshold. */
function getBossHp(normalThreshold: number): number;

/** Failure bonus multiplier: 1 + min(failCount * 0.05, 0.50). */
function getBossFailBonus(failCount: number): number;

/** Boss Smash ad damage: 25% of max HP. */
function getBossAdDamage(bossHpMax: number): number;

/**
 * Start a boss encounter. Returns new ZoneProgressState fields.
 */
function startBoss(normalThreshold: number): Partial<ZoneProgressState>;
// Returns: { bossActive: true, bossHpMax: hp, bossHpRemaining: hp,
//            bossTimerRemainingMs: 120000, currentZoneProgress: 0 }

/**
 * Tick the boss fight. Reduces HP by sunlightGenerated (already includes
 * the 2× tap bonus applied upstream). Returns updated HP, timer, and
 * whether the boss was defeated or the timer expired.
 */
function tickBoss(
  hpRemaining: number,
  timerRemainingMs: number,
  deltaMs: number,
  sunlightGenerated: number,
  failBonus: number
): { hpRemaining: number; timerRemainingMs: number; defeated: boolean; failed: boolean };

/**
 * Process a boss failure. Increments fail count, resets HP and timer.
 */
function failBoss(
  currentFailCount: number,
  bossHpMax: number
): Partial<ZoneProgressState>;

/**
 * Process a boss defeat. Returns fields to reset boss state.
 */
function defeatBoss(): Partial<ZoneProgressState>;
```

### 2.3 Integration: `gameLoop.ts` Changes

The `gameTick` function and `applyTick` function change when a gate or boss
is active.

#### Modified `gameTick`

```
function gameTick(state, now, deltaMs):
  // ... existing idle sunlight calculation ...

  IF state.zoneProgress.gateActive:
    // Idle sunlight still generates, but it goes toward the gate threshold
    // (via addZoneProgress in applyTick). The tick also decrements the
    // gate timer.
    gateTickResult = tickGate(state.zoneProgress.gateTimerRemainingMs, deltaMs)
    // Check if gate threshold is met (currentZoneProgress >= gateThreshold)
    gateThresholdMet = state.zoneProgress.currentZoneProgress + sunlightEarned
                       >= getGateThreshold(getZoneThreshold(state.zoneProgress.currentZone))
    return { ...result, gateTickResult, gateThresholdMet }

  IF state.zoneProgress.bossActive:
    // Idle sunlight damages the boss. Timer decrements.
    bossTickResult = tickBoss(
      state.zoneProgress.bossHpRemaining,
      state.zoneProgress.bossTimerRemainingMs,
      deltaMs,
      sunlightEarned,  // idle portion of damage this tick
      getBossFailBonus(state.zoneProgress.bossFailCount)
    )
    return { ...result, bossTickResult }

  // ... existing zone threshold check (only when no gate/boss active) ...
```

#### Modified `applyTick`

```
IF result.gateTickResult:
  IF result.gateThresholdMet:
    store.setState(clearGate())
    store.addSunlight(gateRewardSunlight)
    store.advanceZone()  // will check if next zone is also special
  ELSE IF result.gateTickResult.failed:
    store.setState(failGate(state.zoneProgress.gateFailCount))
  ELSE:
    store.updateGateTimer(result.gateTickResult.timerRemainingMs)

IF result.bossTickResult:
  IF result.bossTickResult.defeated:
    store.setState(defeatBoss())
    store.addSunlight(bossRewardSunlight)
    store.advanceZone()
  ELSE IF result.bossTickResult.failed:
    store.setState(failBoss(...))
  ELSE:
    store.updateBossState(result.bossTickResult)

// Existing auto-advance only fires when NO gate/boss is active
IF result.zoneThresholdReached AND NOT gateActive AND NOT bossActive:
  store.advanceZone()
```

#### Key Constraint: No Auto-Advance During Encounters

The existing `hasReachedZoneThreshold` check in `gameTick` must be gated:

```ts
const zoneThresholdReached =
  !state.zoneProgress.gateActive &&
  !state.zoneProgress.bossActive &&
  hasReachedZoneThreshold(state);
```

### 2.4 Integration: `tapSystem.ts` Changes

The `useTapHandler` hook applies the 2× boss tap bonus:

```ts
// In useTapHandler, after calculating rawResult:
const bossActive = state.zoneProgress.bossActive;
const bossTapMultiplier = bossActive ? BOSS_TAP_MULTIPLIER : 1;

// Combine with existing Lucky Sprout tap boost
const totalTapMultiplier = bossTapMultiplier * (tapBoostActive ? LUCKY_SPROUT_TAP_BOOST_MULTIPLIER : 1);

const result: TapResult = totalTapMultiplier !== 1
  ? { ...rawResult, sunlight: rawResult.sunlight * totalTapMultiplier }
  : rawResult;
```

When `bossActive`, the tap sunlight also reduces boss HP. This happens
naturally because `addZoneProgress` is already called — but during a boss
fight, `addZoneProgress` should route to boss HP reduction instead. This is
handled in the store (see §2.5).

### 2.5 Integration: `store.ts` Changes

#### Modified `advanceZone`

The current `advanceZone` unconditionally increments the zone. It must now
detect gate/boss zones and start encounters:

```ts
advanceZone: () => {
  const state = get();
  const nextZone = state.zoneProgress.currentZone + 1;
  const normalThreshold = getZoneThreshold(nextZone);

  if (isBossZone(nextZone)) {
    // Boss takes priority over gate (zone 25, 50, 75, 100...)
    set({ zoneProgress: { ...state.zoneProgress, currentZone: nextZone, ...startBoss(normalThreshold) } });
    return;
  }

  if (isGateZone(nextZone)) {
    set({ zoneProgress: { ...state.zoneProgress, currentZone: nextZone, ...startGate(normalThreshold) } });
    return;
  }

  // Normal zone — existing logic (increment, reset progress, update stats)
  // ... existing code unchanged ...
}
```

#### Modified `addZoneProgress`

During a boss fight, Sunlight generated reduces boss HP instead of
accumulating toward a zone threshold:

```ts
addZoneProgress: (amount: number) => {
  set((state) => {
    if (state.zoneProgress.bossActive && state.zoneProgress.bossHpRemaining !== null) {
      const failBonus = getBossFailBonus(state.zoneProgress.bossFailCount);
      const effectiveDamage = amount * failBonus;
      return {
        zoneProgress: {
          ...state.zoneProgress,
          bossHpRemaining: Math.max(0, state.zoneProgress.bossHpRemaining - effectiveDamage),
        },
      };
    }
    // Gate or normal zone: accumulate toward threshold
    const failBonus = state.zoneProgress.gateActive
      ? getGateFailBonus(state.zoneProgress.gateFailCount)
      : 1;
    return {
      zoneProgress: {
        ...state.zoneProgress,
        currentZoneProgress: state.zoneProgress.currentZoneProgress + amount * failBonus,
      },
    };
  });
},
```

### 2.6 State Transitions

```
┌─────────────┐    zone % 5 ≠ 0     ┌─────────────┐
│ Normal Zone  │ ──────────────────→ │ Normal Zone  │
│   N - 1      │    auto-advance     │     N        │
└─────────────┘                      └─────────────┘

┌─────────────┐    zone % 5 === 0    ┌─────────────┐   threshold met   ┌─────────────┐
│ Normal Zone  │ ──────────────────→ │  Gate Zone   │ ───────────────→ │ Normal Zone  │
│   N - 1      │    start gate       │     N        │   clear gate      │   N + 1      │
└─────────────┘                      └──────┬───────┘                   └─────────────┘
                                            │ timer expires
                                            ↓
                                     ┌─────────────┐
                                     │  Gate Retry  │ (same zone, failCount++)
                                     └─────────────┘

┌─────────────┐    zone % 25 === 0   ┌─────────────┐   HP reaches 0    ┌─────────────┐
│ Normal Zone  │ ──────────────────→ │  Boss Fight  │ ───────────────→ │ New Biome    │
│   N - 1      │    start boss       │     N        │   defeat boss     │   N + 1      │
└─────────────┘                      └──────┬───────┘                   └─────────────┘
                                            │ timer expires
                                            ↓
                                     ┌─────────────┐
                                     │  Boss Retry  │ (same zone, failCount++)
                                     └─────────────┘
```


---

## 3. Economy Balance

### 3.1 Gate Threshold Verification

Gate threshold = `2 × normalZoneThreshold`. The player has 30 seconds to
generate this amount from tapping + idle combined.

Using milestone data from `01-currency-rates.md`:

```
normalThreshold(zone) = 50 * 1.12^zone
gateThreshold(zone)   = 2 * normalThreshold(zone)
```

#### Worked Examples

| Zone | Normal Threshold | Gate Threshold | Idle Rate (Sun/s) | Tap DPS (5 taps/s, avg combo) | Total DPS | 30s Output | Clearable? |
|---|---|---|---|---|---|---|---|
| 5 | 88 | 176 | 10 | 52 | 62 | 1,860 | ✅ 10.6× over |
| 10 | 155 | 310 | 55 | 105 | 160 | 4,800 | ✅ 15.5× over |
| 15 | 274 | 548 | ~150 | 250 | 400 | 12,000 | ✅ 21.9× over |
| 20 | 482 | 964 | ~300 | 450 | 750 | 22,500 | ✅ 23.3× over |
| 25 | 850 | — | — | — | — | — | Boss, not gate |

**Tap DPS calculation** (Zone 10 example):
```
baseTap=5, tapMult=1.0, avgCombo=3.5x, expectedCrit=1.20x, tapsPerSec=5
= 5 * 1.0 * 3.5 * 1.20 * 5 = 105 Sun/sec
```

**Conclusion**: Gates are comfortably clearable with active tapping at all
milestones. The 2× multiplier is a speed bump, not a wall. Players who are
purely idle will fail gates (by design — gates reward active play), but the
stacking failure bonus ensures they eventually clear.

#### Idle-Only Gate Analysis

A pure-idle player at Zone 10 generates 55 Sun/s. In 30s: 1,650 Sun vs
310 threshold. Even idle clears easily at early gates.

At Zone 20 with ~300 Sun/s idle: 30s = 9,000 vs 964 threshold. Still fine.

Gates become a genuine active-play check only in later zones (40+) where
the threshold scaling outpaces idle growth and the player is approaching
Rebirth territory.

### 3.2 Boss HP Verification

Boss HP = `50 × normalZoneThreshold`. The player has 120 seconds with 2×
tap value.

| Zone | Normal Threshold | Boss HP | Idle Rate | Tap DPS (2× boss bonus) | Total DPS | 120s Output | Clearable? |
|---|---|---|---|---|---|---|---|
| 25 | 850 | 42,500 | 450 | 1,400 | 1,850 | 222,000 | ✅ 5.2× over |
| 50 | 14,500 | 725,000 | 14,400 | 9,600 | 24,000 | 2,880,000 | ✅ 3.97× over |
| 75 | 263,000 | 13,150,000 | 250,000 | 625,000 | 875,000 | 105,000,000 | ✅ 7.98× over |
| 100 | 4,700,000 | 235,000,000 | 5,000,000 | 10,000,000 | 15,000,000 | 1,800,000,000 | ✅ 7.66× over |

**Tap DPS with boss bonus** (Zone 25 example):
```
baseTap=25, tapMult=1.0, bossMult=2x, avgCombo=4.0x, expectedCrit=1.40x, tapsPerSec=5
= 25 * 1.0 * 2 * 4.0 * 1.40 * 5 = 1,400 Sun/sec
```

**Conclusion**: Bosses are clearable with active play + idle at all
milestones, with a comfortable margin. The 2× tap bonus makes active
tapping feel impactful during the fight.

#### Idle-Only Boss Analysis

At Zone 25, pure idle = 450 Sun/s × 120s = 54,000 vs 42,500 HP. Barely
clearable idle-only — this is intentional. Bosses should feel like they
*need* active participation.

At Zone 50, pure idle = 14,400 × 120 = 1,728,000 vs 725,000. Comfortable
idle clear — by Zone 50 the player's Bloomling roster is strong enough.

### 3.3 Gate Assist Ad Value

**Option A: +15 seconds**
- Base timer: 30s → becomes 45s
- Time increase: +50%
- At Zone 10 (DPS 160): extra 15s = +2,400 Sunlight generated
- Value: equivalent to ~50% more total output

**Option B: 1.5× Sunlight**
- All generation multiplied by 1.5 for the attempt
- At Zone 10 (30s, DPS 160): base output 4,800 → boosted 7,200
- Extra: +2,400 Sunlight
- Value: equivalent to +50% more total output

**Design note**: Both options are intentionally similar in value (~50% boost)
so neither feels like a trap choice. The +15s option is better for players
who tap slowly (more time to build combo); the 1.5× option is better for
players who already have high DPS.

### 3.4 Boss Smash Ad Value

- Instant damage: 25% of boss max HP
- At Zone 25 (HP 42,500): deals 10,625 damage instantly
- Player total DPS: ~1,850 Sun/s
- Time saved: 10,625 / 1,850 ≈ **5.7 seconds** of the 120s fight
- As percentage of fight: ~4.8%

At Zone 50 (HP 725,000): deals 181,250 damage. DPS ~24,000. Time saved:
~7.6 seconds (6.3% of fight).

**Design note**: Boss Smash is a comfort pick, not a fight-winner. It shaves
a few seconds and provides a dramatic "power moment." The real value is
psychological — it feels amazing to chunk 25% of the boss's HP bar in one
hit. For struggling players who have stacked failure bonuses, it can be the
difference between a close win and another retry.

### 3.5 Failure Bonus Stacking

The +5% per fail (max +50%) ensures struggling players eventually clear.

#### Gate Failure Progression

Assuming a player whose DPS can only generate 80% of the gate threshold in
30 seconds:

| Attempt | Fail Bonus | Effective Output | Clears? |
|---|---|---|---|
| 1 | 1.00× | 80% | ❌ |
| 2 | 1.05× | 84% | ❌ |
| 3 | 1.10× | 88% | ❌ |
| 4 | 1.15× | 92% | ❌ |
| 5 | 1.20× | 96% | ❌ |
| 6 | 1.25× | 100% | ✅ Clears |

A player at 80% power needs **5 failures** (6 total attempts) to clear.

#### Boss Failure Progression

Assuming a player whose total damage over 120s is 70% of boss HP:

| Attempt | Fail Bonus | Effective Damage | Clears? |
|---|---|---|---|
| 1 | 1.00× | 70% | ❌ |
| 2 | 1.05× | 73.5% | ❌ |
| 3 | 1.10× | 77% | ❌ |
| 4 | 1.15× | 80.5% | ❌ |
| 5 | 1.20× | 84% | ❌ |
| 6 | 1.25× | 87.5% | ❌ |
| 7 | 1.30× | 91% | ❌ |
| 8 | 1.35× | 94.5% | ❌ |
| 9 | 1.40× | 98% | ❌ |
| 10 | 1.45× | 101.5% | ✅ Clears |

A player at 70% power needs **9 failures** (10 total attempts, ~20 minutes
of retrying). This is the worst case — most players will be closer to 90%+
and clear in 2-3 attempts.

#### With Boss Smash Ad

Same 70% player, uses Boss Smash on attempt 1:
- Deals 25% HP instantly → only needs 45% from DPS
- 70% DPS × 120s easily covers 45% → **clears on first attempt with ad**

This makes Boss Smash feel like a genuine lifeline for struggling players
without being mandatory for skilled ones.


---

## 4. UI/UX Design

### 4.1 Gate UI

#### Zone Progress Bar Transformation

When a gate starts, the existing `ZoneProgress` bar transforms:

1. Bar border changes from green to **amber/gold** with a pulsing glow.
2. A **countdown timer** (`mm:ss`) appears above the bar, right-aligned.
3. The fill color shifts to a gradient (amber → red as time runs out).
4. A **burst counter** appears below the bar: "⚡ 1,240 / 3,500 Sunlight".

#### Urgency Effects

| Time Remaining | Effect |
|---|---|
| > 15s | Steady amber glow |
| 10–15s | Pulse speed increases, bar border brightens |
| 5–10s | Bar shakes slightly, timer turns red |
| < 5s | Rapid pulse, screen edge vignette, haptic buzz each second |

#### Gate Success Animation

1. Bar fills completely → **shatter effect** (bar fragments outward).
2. Bonus Sunlight numbers rain down from the top of the screen.
3. Brief "GATE CLEARED" banner with the bonus amount.
4. Smooth transition back to normal zone progress bar.

#### Gate Failure Animation

1. Timer hits 0 → bar **cracks** with a glass-breaking effect.
2. Bar resets to empty with a brief fade.
3. "+5% bonus on next attempt" pill appears and fades after 2 seconds.
4. Timer resets to 30s, bar returns to amber state.

### 4.2 Boss UI

#### Boss Fight Screen

The boss fight is a **full-screen overlay** that replaces the normal garden
view, keeping the tap area active:

```
┌─────────────────────────────────────┐
│  ⏱ 1:45                    Zone 25  │  ← Timer + zone label
│                                     │
│  ┌─────────────────────────────┐    │
│  │ THE OVERGROWTH              │    │  ← Boss name
│  │ ████████████░░░░░░░░░░░░░░░ │    │  ← HP bar (full width)
│  │ 31,200 / 42,500 HP          │    │  ← HP numbers
│  └─────────────────────────────┘    │
│                                     │
│         [Boss Sprite Area]          │  ← Animated boss visual
│         (tap anywhere to            │
│          deal damage)               │
│                                     │
│  ┌──────────┐                       │
│  │ 2× TAP ⚡│                       │  ← Tap bonus indicator
│  └──────────┘                       │
│                                     │
│              [Boss Smash 📺]        │  ← Ad button (conditional)
│                                     │
│  Combo: 47  │  DPS: 1,850/s         │  ← Stats bar
└─────────────────────────────────────┘
```

#### Boss Entrance Animation

1. Screen dims slightly.
2. Boss name appears with a dramatic font treatment.
3. Boss sprite slides/grows into view with a rumble haptic.
4. HP bar fills from left to right.
5. "2× TAP POWER" indicator flashes on.
6. Timer starts counting down.

#### Boss Phase Transitions

At each HP threshold (75%, 50%, 25%), a brief visual event plays:
- Screen flash.
- Boss sprite changes animation state (idle → damaged → wounded → critical).
- Particle effects intensify.
- Short haptic burst.

#### Boss Victory Sequence

1. Boss HP reaches 0 → boss sprite **collapses/dissolves** with particles.
2. Screen brightens to white.
3. "VICTORY" banner with dramatic typography.
4. Unique Bloomling reveal: silhouette → full reveal with sparkle effect.
5. "[Bloomling Name] has joined your garden!"
6. Achievement toast slides in.
7. Biome transition: current biome fades out, new biome fades in with its
   ambient audio crossfading.

### 4.3 Gate Assist Button

#### Placement
- Floating button, bottom-right of the gate progress bar area.
- Same golden ad-button styling as Sunbeam Boost (distinct from gameplay buttons).

#### Visibility Rules
- Hidden by default when a gate starts.
- Appears when **either**:
  - The player has failed the gate at least once (`gateFailCount >= 1`), OR
  - Less than 10 seconds remain on the timer.
- Hidden after the player watches the ad (one use per attempt).

#### Button States

| State | Appearance |
|---|---|
| Hidden | Not rendered |
| Available | Golden border, "📺 Gate Assist" label, slight bounce animation |
| Tapped (choosing) | Expands to show two options: "+15s Timer" / "1.5× Sunlight" |
| Used | Fades out, small checkmark briefly shown |
| No ad fill | Grayed out, "No boost available" tooltip |

### 4.4 Boss Smash Button

#### Placement
- Centered below the boss sprite, above the stats bar.
- Larger than Gate Assist — this is a dramatic moment.

#### Visibility Rules
- Hidden by default when a boss fight starts.
- Appears when **either**:
  - The player has failed the boss at least once (`bossFailCount >= 1`), OR
  - Less than 30 seconds remain on the timer.
- Hidden after the player watches the ad (one use per attempt).

#### Button States

| State | Appearance |
|---|---|
| Hidden | Not rendered |
| Available | Large golden button, "📺 Channel the Sun's Power!" with energy particles |
| Tapped | Ad plays immediately (single action, no sub-choice) |
| Reward applied | Boss HP bar chunks down 25% with a dramatic slam effect + screen shake |
| No ad fill | Grayed out, "No boost available" tooltip |

### 4.5 Screen Transitions

```
Normal Play
  │
  ├── Zone clears (non-gate, non-boss)
  │     → Brief celebration → next zone loads (no screen change)
  │
  ├── Gate zone reached
  │     → Progress bar transforms (amber, timer appears)
  │     → Gate cleared: shatter animation → normal bar returns
  │     → Gate failed: crack animation → bar resets → retry
  │
  └── Boss zone reached
        → Screen dims → boss entrance animation
        → Full boss fight overlay
        → Boss defeated: victory sequence → biome transition
        → Boss failed: boss roars → overlay resets → retry
```

#### Offline / Background Handling

- If the app goes to background during a gate or boss, the encounter
  **pauses**. Timers do not tick while backgrounded.
- On foreground resume, the encounter resumes from where it left off.
- Offline progress does **not** apply to gate/boss encounters — only to
  normal zone progression. If the player was on a gate/boss zone when they
  left, they return to the start of that encounter (timer and progress reset,
  but `failCount` is preserved).

---

## 5. Implementation Checklist

| # | Task | File(s) | Depends On |
|---|---|---|---|
| 1 | `zoneGates.ts` pure functions | `src/engine/zoneGates.ts` | — |
| 2 | `bossFight.ts` pure functions | `src/engine/bossFight.ts` | — |
| 3 | Unit tests for gate/boss math | `src/engine/__tests__/` | 1, 2 |
| 4 | Store: modify `advanceZone` to detect gate/boss | `src/state/store.ts` | 1, 2 |
| 5 | Store: modify `addZoneProgress` for boss HP routing | `src/state/store.ts` | 2 |
| 6 | Store: add gate/boss ad reward actions | `src/state/store.ts` | 1, 2 |
| 7 | Game loop: gate/boss tick integration | `src/engine/gameLoop.ts` | 1, 2, 4 |
| 8 | Tap system: 2× boss tap bonus | `src/engine/tapSystem.ts` | 2 |
| 9 | Gate UI overlay component | `src/components/garden/` | 4 |
| 10 | Boss fight screen component | `src/components/garden/` | 5 |
| 11 | Gate Assist button + ad integration | `src/components/garden/` | 6, 9 |
| 12 | Boss Smash button + ad integration | `src/components/garden/` | 6, 10 |
| 13 | Save migration: persist gate/boss fields | `src/services/saveManager.ts` | 4 |
| 14 | Docs: update roadmap + status | `docs/` | All |

---

## Next Section
See `05-ad-economy.md` for the full ad touchpoint catalog including Gate Assist (#5) and Boss Smash (#6).
