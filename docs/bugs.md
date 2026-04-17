# Bugs

Central log of defects found during code review, QA, or production triage.

## Status workflow

Every bug has one of four statuses. The transitions are:

```
open  ──(developer fixes)──▶  fixed  ──(reviewer/tester verifies)──▶  closed
  ▲                             │
  │                             └──(reviewer/tester rejects fix)──▶  reopen
  │                                                                    │
  └────────────────────────(developer picks up again)──────────────────┘
```

- **open** — newly filed. Not yet worked on. *Default status for every new bug.*
- **fixed** — developer believes the bug is resolved. Awaiting verification.
- **closed** — reviewer/tester has verified the fix. Terminal state.
- **reopen** — reviewer/tester confirmed the fix is incomplete or regressed. Back to the developer.

## Rules

1. A new bug **MUST** be filed with `Status: open`.
2. A developer **works only on bugs whose status is `open` or `reopen`**. `fixed` and `closed` bugs are off-limits.
3. When a developer believes a fix has landed, they change the status from `open`/`reopen` to `fixed` and record the commit SHA in the `Fix` field.
4. A reviewer or tester **MUST NOT** mark a bug `closed` until they have independently verified the fix (typecheck, test run, manual repro — whatever applies).
5. If verification fails, the reviewer/tester changes the status from `fixed` to `reopen` and adds a note explaining what still breaks.
6. Never skip states. Valid transitions only: `open → fixed`, `reopen → fixed`, `fixed → closed`, `fixed → reopen`.
7. Every status change must be accompanied by updating `Last updated` and leaving a one-line note under `History`.

## Bug entry template

Copy this block when filing a new bug. Give each bug a unique incrementing ID.

```markdown
### BUG-XXX — <short title>

- **Status:** open
- **Severity:** blocking | high | medium | low
- **Reported by:** <name / persona>
- **Reported on:** YYYY-MM-DD
- **Branch / commit:** <branch@sha>
- **File(s):** path/to/file.ts:line
- **Last updated:** YYYY-MM-DD

**Repro / evidence**
<exact command, stack trace, or screenshot path>

**Expected**
<what should happen>

**Actual**
<what happens instead>

**Fix**
<commit SHA once status moves to `fixed`>

**History**
- YYYY-MM-DD — opened by <name>
```

---

## Open bugs

### BUG-001 — saveManager references fields missing from GameState type

- **Status:** open
- **Severity:** blocking
- **Reported by:** Code Reviewer
- **Reported on:** 2026-04-17
- **Branch / commit:** claude/complete-readme-task-7sdwi@40fd3a9
- **File(s):** src/services/saveManager.ts:72-75, 306-309; src/types/game.ts:565
- **Last updated:** 2026-04-17

**Repro / evidence**
`npx tsc --noEmit` fails with 5 errors:
```
src/services/saveManager.ts(72,5):   TS2353 — 'lastLuckySproutAt' does not exist in type 'Omit<GameState, "combo" | "engineRunning">'
src/services/saveManager.ts(306,30): TS2339 — Property 'lastLuckySproutAt' does not exist on save.state
src/services/saveManager.ts(307,41): TS2339 — 'luckySproutTapBoostExpiresAt' ...
src/services/saveManager.ts(308,30): TS2339 — 'lastComboKeeperAt' ...
src/services/saveManager.ts(309,31): TS2339 — 'pendingNectarBonus' ...
```

**Expected**
Branch typechecks cleanly. All persisted fields are declared on `GameState`.

**Actual**
Four new fields live only on `MetaSlice` (`src/state/store.ts:97-122`). `SaveData.state` is typed `Omit<GameState, "combo" | "engineRunning">`, so both the write path (object literal excess property) and the read path (property access) fail to compile.

**Fix**
<pending>

**History**
- 2026-04-17 — opened by Code Reviewer

---

### BUG-002 — Lucky Sprout BonusSunlight crashes at runtime (missing upgrades arg)

- **Status:** open
- **Severity:** blocking
- **Reported by:** Code Reviewer
- **Reported on:** 2026-04-17
- **Branch / commit:** claude/complete-readme-task-7sdwi@40fd3a9 (defect authored in 36e5968, newly reachable here)
- **File(s):** src/state/store.ts:576-579; src/state/selectors.ts:176-179
- **Last updated:** 2026-04-17

**Repro / evidence**
Lucky Sprout modal rolls `BonusSunlight` (35% weight, `src/engine/luckySprout.ts:52`). Handler calls:
```ts
totalSunlightPerSecondFromRegistry({
  bloomlings: state.bloomlings,
  garden: state.garden,
});
```
Signature requires `Pick<GameStore, "bloomlings" | "garden" | "upgrades">`. Inside, line 179 indexes `state.upgrades["idle_production"]`. With `upgrades === undefined` this throws `TypeError: Cannot read properties of undefined (reading 'idle_production')`. The optional chain `?.level` does NOT protect the index access.

**Expected**
`BonusSunlight` reward pays out the expected Sunlight grant and idle production is computed with the `idle_production` upgrade multiplier.

**Actual**
App crashes for ~35% of Lucky Sprout watches.

**Fix**
<pending — pass `upgrades: state.upgrades` (or pass `state` directly)>

**History**
- 2026-04-17 — opened by Code Reviewer

---

### BUG-003 — First Lucky Sprout fires ~30 s after launch instead of 10–15 min

- **Status:** open
- **Severity:** high
- **Reported by:** Code Reviewer
- **Reported on:** 2026-04-17
- **Branch / commit:** claude/complete-readme-task-7sdwi@40fd3a9
- **File(s):** src/engine/gameLoop.ts:206-213
- **Last updated:** 2026-04-17

**Repro / evidence**
On a brand-new save, `lastLuckySproutAt === null`. The scheduler condition
```ts
state.lastLuckySproutAt === null ||
  now - state.lastLuckySproutAt > nextLuckySproutIntervalMs()
```
short-circuits to `true` on the first 30 s check, triggering the modal ~30 s after first launch.

**Expected**
First Lucky Sprout appears 10–15 min after launch, per `docs/design/05-ad-economy.md` and the commit message.

**Actual**
Modal can appear within 30 s of opening a fresh save.

**Fix**
<pending — seed `lastLuckySproutAt = now` on first foreground, or treat `null` as "not yet eligible" and stamp it on the first check>

**History**
- 2026-04-17 — opened by Code Reviewer

---

### BUG-004 — Lucky Sprout interval re-rolled every 30 s biases spawns early

- **Status:** open
- **Severity:** medium
- **Reported by:** Code Reviewer
- **Reported on:** 2026-04-17
- **Branch / commit:** claude/complete-readme-task-7sdwi@40fd3a9
- **File(s):** src/engine/gameLoop.ts:206-213; src/engine/luckySprout.ts:79-84
- **Last updated:** 2026-04-17

**Repro / evidence**
`nextLuckySproutIntervalMs()` returns a fresh random value on each check. Any low roll during the [10, 15] min window fires, biasing the effective spawn time toward the low end rather than producing a uniform distribution.

**Expected**
Spawn time uniformly distributed in [10 min, 15 min].

**Actual**
Distribution skewed toward 10 min.

**Fix**
<pending — lock the next interval into a ref or store field at trigger/clear time; re-roll only after a spawn is resolved>

**History**
- 2026-04-17 — opened by Code Reviewer

---

### BUG-005 — SunbeamBoostButton runs a 1 Hz timer even when hidden/inactive

- **Status:** open
- **Severity:** low
- **Reported by:** Code Reviewer
- **Reported on:** 2026-04-17
- **Branch / commit:** claude/complete-readme-task-7sdwi@40fd3a9
- **File(s):** src/components/garden/SunbeamBoostButton.tsx:44-47
- **Last updated:** 2026-04-17

**Repro / evidence**
`useEffect` registers a `setInterval(1000ms)` unconditionally. Early return for `allTimeHighestZone < 15` and for "no boost active" happens after hook registration, so the timer keeps firing regardless.

**Expected**
Timer runs only while a Sunbeam Boost is active (i.e. only while the countdown is visible).

**Actual**
Timer ticks every second on every Garden render, wasting cycles pre-Zone 15 and between boosts.

**Fix**
<pending — gate the interval behind `isActive`, or move the re-render to a derived value>

**History**
- 2026-04-17 — opened by Code Reviewer

---

### BUG-006 — Rolling TapBoost twice truncates remaining duration

- **Status:** open
- **Severity:** low
- **Reported by:** Code Reviewer
- **Reported on:** 2026-04-17
- **Branch / commit:** claude/complete-readme-task-7sdwi@40fd3a9
- **File(s):** src/state/store.ts:588-594
- **Last updated:** 2026-04-17

**Repro / evidence**
`applyLuckySproutReward(TapBoost)` overwrites `luckySproutTapBoostExpiresAt` with `now + 5 min`. A player who rolls TapBoost with 4 min remaining on an existing boost loses up to 4 min.

**Expected**
Duration extends (or the player gets the max of existing vs new), matching player expectation that two rewards ≥ one reward.

**Actual**
New boost replaces existing; can shorten remaining time.

**Fix**
<pending — use `Math.max(existing ?? 0, now) + LUCKY_SPROUT_TAP_BOOST_DURATION_MS`>

**History**
- 2026-04-17 — opened by Code Reviewer

---

### BUG-007 — No automated coverage for the three new ad touchpoints

- **Status:** open
- **Severity:** medium
- **Reported by:** QA Tester
- **Reported on:** 2026-04-17
- **Branch / commit:** claude/complete-readme-task-7sdwi@40fd3a9
- **File(s):** e2e/tests/**; docs/testing/test-cases.md
- **Last updated:** 2026-04-17

**Repro / evidence**
No e2e spec exercises `lucky-sprout-modal`, `sunbeam-boost-button`, or `combo-keeper-button`. Test-case catalog not updated for the new touchpoints.

**Expected**
At minimum one smoke spec per touchpoint (modal appears → dismiss path, FAB visibility at Zone 15+, pill visibility at combo ≥ 50), plus catalog entries in `docs/testing/test-cases.md`.

**Actual**
Zero coverage. Regressions will only surface in manual QA.

**Fix**
<pending>

**History**
- 2026-04-17 — opened by QA Tester

---

## Fixed bugs (awaiting verification)

*(none)*

---

## Closed bugs

*(none)*
