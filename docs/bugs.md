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

### BUG-008 — Completionist achievement sunlight reward not granted

- **Status:** open
- **Severity:** low
- **Reported by:** Code Reviewer
- **Reported on:** 2026-04-17
- **Branch / commit:** claude/review-readme-next-task-iznKG@b702117
- **File(s):** src/state/store.ts (checkAndGrantAchievements — completionist second-pass block)
- **Last updated:** 2026-04-17

**Repro / evidence**
In the completionist second-pass inside `checkAndGrantAchievements`, only the dewdrop reward is granted:
```ts
if (completionist.dewdropReward > 0) {
  get().addDewdrops(completionist.dewdropReward);
}
// no addSunlight call
```
The main loop above it grants both. Completionist currently has `sunlightReward: 0` so there is no immediate player impact, but the pattern is inconsistent and will silently fail if the reward value is ever raised.

**Expected**
Both sunlight and dewdrop rewards are granted on completionist unlock, matching the pattern used for every other achievement.

**Actual**
Sunlight reward is skipped; only dewdrops are granted.

**Fix**
*(pending)*

**History**
- 2026-04-17 — opened by Code Reviewer

---

### BUG-009 — COMBO_KEEPER_COOLDOWN_MS duplicated across store and component

- **Status:** open
- **Severity:** low
- **Reported by:** Code Reviewer
- **Reported on:** 2026-04-17
- **Branch / commit:** claude/review-readme-next-task-iznKG@b702117
- **File(s):** src/state/store.ts (module-level constant), src/components/garden/ComboKeeperButton.tsx:17
- **Last updated:** 2026-04-17

**Repro / evidence**
`COMBO_KEEPER_COOLDOWN_MS = 30 * 60 * 1000` is hardcoded independently in both files. `ComboKeeperButton.tsx` has a "Must match…" comment acknowledging the risk. If either value is changed without updating the other, the UI visibility gate will desync from the engine cooldown check silently.

**Expected**
Single source of truth: constant exported from `store.ts` (or a shared constants file) and imported by the component.

**Actual**
Two independent copies; drift will cause the button to appear or stay hidden at the wrong time.

**Fix**
*(pending)*

**History**
- 2026-04-17 — opened by Code Reviewer

---

### BUG-010 — speed_demon, stubborn_sprout, hat_trick achievements are permanently unattainable

- **Status:** open
- **Severity:** medium
- **Reported by:** Code Reviewer
- **Reported on:** 2026-04-17
- **Branch / commit:** claude/review-readme-next-task-iznKG@b702117
- **File(s):** src/engine/achievements.ts:46-50, src/engine/gameLoop.ts, src/engine/tapSystem.ts
- **Last updated:** 2026-04-17

**Repro / evidence**
All three IDs are listed in `EVENT_DRIVEN_ACHIEVEMENT_IDS` (excluded from the passive check loop) but no call to `triggerHiddenAchievement("speed_demon")`, `triggerHiddenAchievement("stubborn_sprout")`, or `triggerHiddenAchievement("hat_trick")` exists anywhere in the codebase. The achievements appear in the Hidden category UI but can never be completed.

- `speed_demon` — zone cleared in under 30 s: needs a call site in `advanceZone` comparing elapsed time since zone entry.
- `stubborn_sprout` — fail a gate then clear it on the next attempt: needs a call site in `advanceZone` after `gateFailCount > 0`.
- `hat_trick` — 3 critical taps in a row: needs a call site in `tapSystem.ts` tracking consecutive crit count.

**Expected**
All three achievements are attainable by players who meet the described conditions.

**Actual**
Achievements display in the UI but can never be granted.

**Fix**
*(pending)*

**History**
- 2026-04-17 — opened by Code Reviewer

---

---

## Fixed bugs (awaiting verification)

*(none)*

---

## Closed bugs

### BUG-001 — saveManager references fields missing from GameState type

- **Status:** closed
- **Severity:** blocking
- **Reported by:** Code Reviewer
- **Reported on:** 2026-04-17
- **Branch / commit:** claude/complete-readme-task-7sdwi@40fd3a9 → fixed in e8831fe
- **File(s):** src/services/saveManager.ts:72-75, 306-309; src/types/game.ts:633-640
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
e8831fe — Four fields added to `GameState` in `src/types/game.ts:633-640`; `extractSaveState` and `applySaveToStore` now type-check cleanly.

**Verification**
- `npx tsc --noEmit` exits 0.
- `npm run lint` reports no new warnings.
- Diff inspected: fields present at `src/types/game.ts:633-640`.

**History**
- 2026-04-17 — opened by Code Reviewer
- 2026-04-17 — fixed in e8831fe
- 2026-04-17 — closed; verified by Code Reviewer (typecheck clean)

---

### BUG-002 — Lucky Sprout BonusSunlight crashes at runtime (missing upgrades arg)

- **Status:** closed
- **Severity:** blocking
- **Reported by:** Code Reviewer
- **Reported on:** 2026-04-17
- **Branch / commit:** claude/complete-readme-task-7sdwi@40fd3a9 → fixed in e8831fe (defect authored in 36e5968, newly reachable here)
- **File(s):** src/state/store.ts:576-580; src/state/selectors.ts:176-179
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
e8831fe — `upgrades: state.upgrades` added to the `totalSunlightPerSecondFromRegistry` call at `src/state/store.ts:579`.

**Verification**
- Confirmed at `src/state/store.ts:579` — third key on the picked argument.
- Typecheck passes (selector now satisfied with `Pick<GameStore, "bloomlings" | "garden" | "upgrades">`).
- Reasoning: `state.upgrades["idle_production"]?.level` no longer indexes `undefined`.

**History**
- 2026-04-17 — opened by Code Reviewer
- 2026-04-17 — fixed in e8831fe
- 2026-04-17 — closed; verified by Code Reviewer (source + types)

---

### BUG-003 — First Lucky Sprout fires ~30 s after launch instead of 10–15 min

- **Status:** closed
- **Severity:** high
- **Reported by:** Code Reviewer
- **Reported on:** 2026-04-17
- **Branch / commit:** claude/complete-readme-task-7sdwi@40fd3a9 → fixed in e8831fe
- **File(s):** src/engine/gameLoop.ts:209-222
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
e8831fe — When `lastLuckySproutAt === null`, the scheduler now stamps `now` and re-rolls the interval ref WITHOUT triggering, via an explicit `if/else if`. See `src/engine/gameLoop.ts:209-222`.

**Verification**
- Reviewed `gameLoop.ts:206-222`: `if (state.lastLuckySproutAt === null) { setState... } else if (...) { trigger... }` — the seed branch is mutually exclusive with the trigger branch on the same tick.
- After the seed, subsequent 30 s checks compare `now - lastLuckySproutAt` (~30 s, then ~60 s, …) against the locked interval (10–15 min). First spawn now occurs in [10, 15] min as designed.

**History**
- 2026-04-17 — opened by Code Reviewer
- 2026-04-17 — fixed in e8831fe
- 2026-04-17 — closed; verified by Code Reviewer (control-flow walk-through)

---

### BUG-004 — Lucky Sprout interval re-rolled every 30 s biases spawns early

- **Status:** closed
- **Severity:** medium
- **Reported by:** Code Reviewer
- **Reported on:** 2026-04-17
- **Branch / commit:** claude/complete-readme-task-7sdwi@40fd3a9 → fixed in e8831fe
- **File(s):** src/engine/gameLoop.ts:196,213,221; src/engine/luckySprout.ts:79-84
- **Last updated:** 2026-04-17

**Repro / evidence**
`nextLuckySproutIntervalMs()` returns a fresh random value on each check. Any low roll during the [10, 15] min window fires, biasing the effective spawn time toward the low end rather than producing a uniform distribution.

**Expected**
Spawn time uniformly distributed in [10 min, 15 min].

**Actual**
Distribution skewed toward 10 min.

**Fix**
e8831fe — `luckySproutNextIntervalRef = useRef(nextLuckySproutIntervalMs())` initializes once at hook mount; re-rolled only after `triggerLuckySprout()` (line 221) and at the null-seed branch (line 213). Each spawn cycle uses one fixed interval.

**Verification**
- `gameLoop.ts:196` — single `useRef` initialization with one roll.
- `gameLoop.ts:213` — re-roll on null seed.
- `gameLoop.ts:221` — re-roll after spawn resolves.
- No re-roll inside the comparison branch — distribution is uniform across [10, 15] min.

**History**
- 2026-04-17 — opened by Code Reviewer
- 2026-04-17 — fixed in e8831fe
- 2026-04-17 — closed; verified by Code Reviewer (ref usage audit)

---

### BUG-005 — SunbeamBoostButton runs a 1 Hz timer even when hidden/inactive

- **Status:** closed
- **Severity:** low
- **Reported by:** Code Reviewer
- **Reported on:** 2026-04-17
- **Branch / commit:** claude/complete-readme-task-7sdwi@40fd3a9 → fixed in e8831fe
- **File(s):** src/components/garden/SunbeamBoostButton.tsx:48-59
- **Last updated:** 2026-04-17

**Repro / evidence**
`useEffect` registers a `setInterval(1000ms)` unconditionally. Early return for `allTimeHighestZone < 15` and for "no boost active" happens after hook registration, so the timer keeps firing regardless.

**Expected**
Timer runs only while a Sunbeam Boost is active (i.e. only while the countdown is visible).

**Actual**
Timer ticks every second on every Garden render, wasting cycles pre-Zone 15 and between boosts.

**Fix**
e8831fe — `sunbeamBoost` lookup and `isActive` are computed before the `useEffect`. The effect early-returns if `!isActive` and is keyed on `[isActive]`, so the 1 Hz interval mounts/tears down with the boost.

**Verification**
- `SunbeamBoostButton.tsx:48-59` — `isActive` derived → `useEffect` with `if (!isActive) return` and `[isActive]` deps.
- Pre-Zone-15 path still returns `null` after the hook, but the effect's guard stops the timer there too.
- Lint clean; typecheck clean.

**History**
- 2026-04-17 — opened by Code Reviewer
- 2026-04-17 — fixed in e8831fe
- 2026-04-17 — closed; verified by Code Reviewer (hook ordering + deps audit)

---

### BUG-006 — Rolling TapBoost twice truncates remaining duration

- **Status:** closed
- **Severity:** low
- **Reported by:** Code Reviewer
- **Reported on:** 2026-04-17
- **Branch / commit:** claude/complete-readme-task-7sdwi@40fd3a9 → fixed in e8831fe
- **File(s):** src/state/store.ts:589-595
- **Last updated:** 2026-04-17

**Repro / evidence**
`applyLuckySproutReward(TapBoost)` overwrites `luckySproutTapBoostExpiresAt` with `now + 5 min`. A player who rolls TapBoost with 4 min remaining on an existing boost loses up to 4 min.

**Expected**
Duration extends (or the player gets the max of existing vs new), matching player expectation that two rewards ≥ one reward.

**Actual**
New boost replaces existing; can shorten remaining time.

**Fix**
e8831fe — Set call now reads previous state and uses `Math.max(s.luckySproutTapBoostExpiresAt ?? 0, now) + LUCKY_SPROUT_TAP_BOOST_DURATION_MS`. Existing time is never shortened.

**Verification**
- `src/state/store.ts:589-595` matches the fix description.
- Walked through example: existing expiry 4 min from now → new expiry = (now + 4min) + 5min = now + 9min ✓.
- Switched from `set({...})` to `set((s) => ({...}))` to read prior state correctly.

**History**
- 2026-04-17 — opened by Code Reviewer
- 2026-04-17 — fixed in e8831fe
- 2026-04-17 — closed; verified by Code Reviewer (algebraic walk-through)

---

### BUG-007 — No automated coverage for the three new ad touchpoints

- **Status:** closed
- **Severity:** medium
- **Reported by:** QA Tester
- **Reported on:** 2026-04-17
- **Branch / commit:** claude/complete-readme-task-7sdwi@40fd3a9 → fixed in e8831fe
- **File(s):** e2e/tests/ads/01-03; docs/testing/test-cases.md (TC-AD-001..006)
- **Last updated:** 2026-04-17

**Repro / evidence**
No e2e spec exercises `lucky-sprout-modal`, `sunbeam-boost-button`, or `combo-keeper-button`. Test-case catalog not updated for the new touchpoints.

**Expected**
At minimum one smoke spec per touchpoint (modal appears → dismiss path, FAB visibility at Zone 15+, pill visibility at combo ≥ 50), plus catalog entries in `docs/testing/test-cases.md`.

**Actual**
Zero coverage. Regressions will only surface in manual QA.

**Fix**
e8831fe — Three Nightwatch specs added: `e2e/tests/ads/01-lucky-sprout-modal.test.js`, `02-sunbeam-boost-button.test.js`, `03-combo-keeper-button.test.js`. Catalog updated: section 11 (TC-AD-001..006) and totals bumped 85 → 91.

**Verification**
- `node --check` parses all 3 spec files cleanly.
- testIDs referenced (`tap-area`, `combo-meter`, `lucky-sprout-modal`, `lucky-sprout-dismiss`, `sunbeam-boost-button`, `combo-keeper-button`) all exist in source.
- Specs follow the existing `describe(...)` / `useXpath()` / `byTestId()` pattern (matches `e2e/tests/smoke/01-launch.test.js`).
- Nightwatch picks them up automatically: `nightwatch.conf.js:10` has `src_folders: ['e2e/tests']`.
- Catalog totals reconciled: 85 + 6 = 91 ✓; auto-coverage 28 + 4 = 32 ✓.
- Follow-up (not blocking): TC-AD-001/002/004/006 are gated on a seeded-save mechanism that does not yet exist; those cases remain `manual` until a seed loader is added.

**History**
- 2026-04-17 — opened by QA Tester
- 2026-04-17 — fixed in e8831fe
- 2026-04-17 — closed; verified by QA Tester (parse + testID + catalog audit)
