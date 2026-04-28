# Bloomlings — QA Full Report

**Date:** 2026-04-28
**Author:** QE Lead (automated audit)
**Scope:** Pre-launch quality gate — all phases (1–9)
**Test Runner:** Jest 29 · TypeScript 5 · Expo/React Native

---

## Build Verification

### TypeScript Compilation (`tsc --noEmit`)

| Metric | Result |
|--------|--------|
| **Status** | ✅ PASS |
| Errors | 0 |
| Warnings | 0 |

Clean compile. No type errors across the entire codebase.

### Linting (`expo lint`)

| Metric | Result |
|--------|--------|
| **Status** | ⚠️ WARNINGS ONLY |
| Errors | 0 |
| Warnings | 32 |
| Auto-fixable | 12 |

Breakdown of warnings:
- **Unused imports/variables** (17): Scattered across components and test files (`Text`, `Animated`, `Rarity`, `BOSS_INTERVAL`, etc.)
- **Import ordering** (`import/first`) (8): Test files with mocks before imports — acceptable Jest pattern but should use `eslint-disable` comments
- **Duplicate imports** (2): `transcendence.ts` imports from `game.ts` twice
- **Unused eslint-disable** (1): `AchievementsList.tsx`
- **Array type style** (1): `game.ts` uses `ReadonlyArray<T>` instead of `readonly T[]`

**Verdict:** No blockers. The 32 warnings are cosmetic. Zero errors is the gate requirement — **PASSED**.

### Jest Test Suite

| Metric | Result |
|--------|--------|
| **Status** | ✅ ALL PASS |
| Test Suites | 24 passed, 24 total |
| Tests | 507 passed, 507 total |
| Failures | 0 |
| Snapshots | 0 |
| Duration | 7.048s |

### Code Coverage Summary

| Category | % Coverage |
|----------|-----------|
| **Statements** | 83.26% |
| **Branches** | 76.53% |
| **Functions** | 80.72% |
| **Lines** | 83.44% |

Coverage by directory:

| Directory | Stmts | Branch | Funcs | Lines | Notes |
|-----------|-------|--------|-------|-------|-------|
| `data/` | 100% | 100% | 100% | 100% | ✅ Perfect |
| `state/` | 98.03% | 96.87% | 95.83% | 97.82% | ✅ Excellent |
| `types/` | 100% | 100% | 100% | 100% | ✅ Perfect |
| `utils/` | 94.73% | 85.71% | 100% | 94.73% | ✅ Strong |
| `engine/` | 80.46% | 73.90% | 78.83% | 80.69% | ⚠️ Gaps below |
| `services/` | 65.45% | 60.00% | 46.15% | 64.81% | 🔴 Weak |


---

## Test Coverage Analysis

### Engine Modules

| Module | Test File | Tests | Stmts | Lines | Verdict |
|--------|-----------|-------|-------|-------|---------|
| gameLoop | `gameLoop.test.ts` | 15 | 45.16% | 45.33% | 🔴 **Critical gap** — `applyTick` tested but `startGameLoop`, `useGameLoop` hook, and biome-mechanic integration (lines 273–410) untested |
| tapSystem | `tapSystem.test.ts` | 22 | 48.10% | 47.94% | 🔴 **Critical gap** — pure functions tested but `useTap` hook and `handleTap` store integration (lines 174–272) untested |
| synergies | `synergies.test.ts` | 27 | 98.97% | 98.90% | ✅ Excellent |
| evolution | `evolution.test.ts` | 22 | 100% | 100% | ✅ Perfect |
| garden | `garden.test.ts` + `garden.additional.test.ts` | 46 | 100% | 100% | ✅ Perfect |
| rebirth | `rebirth.test.ts` | 36 | 100% | 100% | ✅ Perfect |
| transcendence | `transcendence.test.ts` | 18 | 100% | 100% | ✅ Perfect |
| offlineProgress | `offlineProgress.test.ts` + `applyOfflineProgress.test.ts` | 25 | 100% | 100% | ✅ Perfect |
| achievements | `achievements.test.ts` | 30 | 92.59% | 95.83% | ✅ Strong — `grantAchievement` reward delivery (lines 84–87) untested |
| dailyRewards | `dailyRewards.test.ts` | 20 | 100% | 100% | ✅ Perfect |
| luckySprout | `luckySprout.test.ts` | 16 | 100% | 100% | ✅ Perfect |
| discovery | `discovery.test.ts` | 19 | 97.14% | 100% | ✅ Strong |
| zoneGates | `zoneGates.test.ts` | 20 | 100% | 100% | ✅ Perfect |
| bossFight | `bossFight.test.ts` | 28 | 100% | 100% | ✅ Perfect |
| abilities | `abilities.test.ts` | 10 | 83.33% | 84.78% | ⚠️ Good — some ability type branches uncovered (lines 98–124) |
| autoTap | `autoTap.test.ts` | 4 | 100% | 100% | ✅ Perfect |
| biomeMechanics | `biomeMechanics.test.ts` | 44 | 59.39% | 61.41% | 🔴 **Gap** — Sunbursts, Luminescence, and Windfall mechanics untested; only Resonance, EruptionSurge, PressureTide, ThawCycle covered |

### State Modules

| Module | Test File | Tests | Stmts | Lines | Verdict |
|--------|-----------|-------|-------|-------|---------|
| selectors | `selectors.test.ts` + `selectors.additional.test.ts` | 40 | 98.03% | 97.82% | ✅ Excellent |
| store | — | 0 | N/A | N/A | 🔴 **No direct tests** — store.ts (30K+ lines) has zero unit tests. Store actions are only tested indirectly via `applyOfflineProgress.test.ts` mocks |

### Services

| Service | Test File | Tests | Stmts | Lines | Verdict |
|---------|-----------|-------|-------|-------|---------|
| analyticsService | `analyticsService.test.ts` | 6 | 65.45% | 64.81% | ⚠️ Partial — `trackEvent`/`flush`/`summary` tested; event-specific tracking functions untested |
| saveManager | — | 0 | N/A | N/A | 🔴 **No tests** — 14K file handling save/load/export/import/migration with zero coverage |
| adManager | — | 0 | N/A | N/A | 🔴 **No tests** — 14K file managing all ad touchpoints |
| audioService | — | 0 | N/A | N/A | 🔴 **No tests** — 4.8K file |
| notificationService | — | 0 | N/A | N/A | 🔴 **No tests** — 5.2K file |

### Data Templates

| Module | Test File | Tests | Verdict |
|--------|-----------|-------|---------|
| achievementTemplates | `templates.test.ts` | 7 | ✅ Integrity validated |
| bloomlingTemplates | `templates.test.ts` | 5 | ✅ Integrity validated |
| perkTemplates | `templates.test.ts` | 5 | ✅ Integrity validated |

### Utilities

| Module | Test File | Tests | Verdict |
|--------|-----------|-------|---------|
| formatNumber | `formatNumber.test.ts` | 16 | ✅ Strong (94.73% lines) |
| haptics | — | 0 | ⚠️ No tests — thin wrapper, low risk |

### Coverage Gaps Summary

**Critical (blocks launch confidence):**
1. `saveManager.ts` — 0% coverage on the most critical service (data persistence, migration, import/export)
2. `store.ts` — 0% direct coverage on 30K+ lines of state management
3. `gameLoop.ts` — 45% coverage; the main game tick orchestrator has untested integration paths
4. `tapSystem.ts` — 48% coverage; the core player interaction has untested hook logic

**Significant:**
5. `biomeMechanics.ts` — 59% coverage; 3 of 7 biome mechanics completely untested
6. `adManager.ts` — 0% coverage on ad integration
7. `analyticsService.ts` — 65% coverage; event-specific functions untested

**Low risk:**
8. `audioService.ts` — 0% but thin wrapper around expo-av
9. `notificationService.ts` — 0% but thin wrapper around expo-notifications
10. `haptics.ts` — 0% but trivial utility


---

## Test Quality Assessment

### Behavior vs. Implementation Testing

**Verdict: ✅ Predominantly behavior-focused — well done.**

The test suite overwhelmingly tests *what* functions return rather than *how* they compute it. Examples of good practice:
- `rebirth.test.ts`: Tests `calculateNectarEarned` by asserting output properties (increases with zones, floors result) rather than asserting internal formula steps
- `garden.test.ts`: Tests `validateAddToGarden` by asserting error codes for invalid states
- `synergies.test.ts`: Tests `calculateActiveSynergies` by asserting multiplier values and synergy IDs
- `bossFight.test.ts`: Tests `tickBoss` by asserting defeat/failure outcomes

Minor concern: `applyOfflineProgress.test.ts` is heavily mock-dependent (9 mocked modules, mock store with individual action spies). This is necessary for integration-style testing but makes the test fragile to refactors. Acceptable tradeoff given the function's side-effect-heavy nature.

### Edge Case Coverage

| Edge Case Type | Coverage | Examples |
|---------------|----------|----------|
| Zero state | ✅ Strong | Empty garden, 0 sunlight, 0 upgrades, empty bloomlings map tested across all modules |
| Boundary values | ✅ Strong | Zone 40 rebirth threshold, combo cap at 100, garden slot hard cap at 9, exactly-affordable checks |
| Max/overflow | ✅ Good | Combo cap 100, garden cap 9, Deep Roots max level, Cosmic Roots max level, boss fail bonus cap 1.50 |
| Negative numbers | ⚠️ Partial | Negative zones tested in bossFight/zoneGates; negative clock delta tested in offlineProgress; but no NaN/Infinity input tests for core formulas |
| NaN/undefined | 🔴 Missing | No tests for NaN inputs to `calculateUpgradeCost`, `calculateBloomlingProduction`, `getZoneThreshold`, or `calculateNectarEarned` |
| Floating point | ✅ Good | Uses `toBeCloseTo` for decimal comparisons throughout; `rollLuckySproutReward` tests floating-point boundary at 0.95/1.0 |

### Error Path Testing

| Area | Coverage |
|------|----------|
| Unknown template IDs | ✅ Tested in evolution, synergies, discovery |
| Unknown bloomling IDs | ✅ Tested in garden (`unknown_bloomling` error) |
| Out-of-bounds slots | ✅ Tested in garden (`invalid_slot` error) |
| Already-in-garden | ✅ Tested in garden (`already_in_garden` error) |
| Clock going backward | ✅ Tested in offlineProgress |
| Brand-new save (lastTickAt=0) | ✅ Tested in applyOfflineProgress |
| Save migration missing fields | ❌ Not unit-tested (only in test-cases.md as TC-MIG) |
| Import invalid save data | ❌ Not unit-tested (saveManager has no tests) |

### Test Naming Quality

**Verdict: ✅ Excellent.**

Test names consistently follow the pattern: `"<action/condition> → <expected outcome>"`. Examples:
- `"returns 0 when highestZone is below REBIRTH_UNLOCK_ZONE"`
- `"caps at GARDEN_SLOT_HARD_CAP (9)"`
- `"does not reset when frozen even if gap exceeds decay window"`
- `"evicts displaced bloomling when a slot is occupied"`

All names are descriptive enough to serve as documentation. No generic names like "works correctly" or "test 1".

### Test Isolation

**Verdict: ✅ Good — no inter-test dependencies detected.**

- Each test constructs its own state via helper functions (`makeBloomling`, `baseState`, `buildState`)
- `beforeEach` blocks properly clear mocks in `analyticsService.test.ts` and `applyOfflineProgress.test.ts`
- No shared mutable state between tests
- One minor concern: `abilities.test.ts` uses a module-level `templates` registry with `beforeEach` cleanup — functional but slightly fragile


---

## Test Case Catalog Audit

### Case Count by Priority

| Priority | Count | % of Total |
|----------|-------|-----------|
| P0 (Critical path) | 48 | 36.9% |
| P1 (Important) | 61 | 46.9% |
| P2 (Manual only) | 20 | 15.4% |
| **Total** | **130** | — |

### Automation Status

| Status | Count | % of Total |
|--------|-------|-----------|
| `auto` (Maestro flow) | 60 | 46.2% |
| `planned` (stubbed) | 29 | 22.3% |
| `manual` | 41 | 31.5% |

### P0 Cases — Automated Coverage Audit

**P0 cases with `auto` coverage (unit or Maestro): 38/48 (79.2%)**

| Area | P0 Cases | Auto | Gap |
|------|----------|------|-----|
| Tap Loop | 3 | 3 | — |
| Currency & Persistence | 4 | 4* | TC-CUR-002 relies on Maestro save/restart flow |
| Bloomlings & Collection | 3 | 3 | — |
| Shop Upgrades | 7 | 7 | — |
| Garden & Synergies | 3 | 3 | — |
| Zone Progression | 2 | 2 | — |
| Rebirth | 6 | 6 | — |
| Nectar Shop | 2 | 2 | — |
| Offline Progress | 2 | 2 | — |
| Settings | 3 | 3 | — |
| Achievements | 3 | 3 | ✅ All 3 have Jest unit coverage |
| Daily Rewards | 3 | 3 | ✅ All 3 have Jest unit coverage |
| Transcendence | 5 | 5* | TC-TRANS-004 (bloomling reset) has Jest coverage via `resetBloomlingsForTranscendence` |
| Save Migration | 2 | 2* | TC-MIG-001/004 covered by Maestro but **no Jest unit tests for saveManager** |

### P0 Cases MISSING Automation

The following P0 cases are marked `auto` in the catalog but have **no corresponding Jest unit test** for the underlying logic:

1. **TC-CUR-002** (Manual save persists across restart) — No `saveManager` unit tests
2. **TC-CUR-004/005** (Export/Import round-trip) — No `saveManager` unit tests
3. **TC-MIG-001/004** (Save migration) — No `saveManager` unit tests; relies entirely on Maestro E2E

These are covered by Maestro flows but lack the fast-feedback unit test safety net. If Maestro is flaky or slow, these P0 paths have no automated regression guard.

### Phase Coverage Assessment

| Phase | Description | Unit Test Coverage | E2E Coverage |
|-------|-------------|-------------------|--------------|
| Phase 1 | Tap Loop | ✅ Strong (tapSystem 48% but pure fns covered) | ✅ Maestro |
| Phase 2 | Idle & Garden | ✅ Strong (garden 100%, selectors 98%) | ✅ Maestro |
| Phase 3 | Synergies & Evolution | ✅ Excellent (synergies 99%, evolution 100%) | Partial |
| Phase 4 | Shop & Upgrades | ✅ Strong (selectors cover cost/afford) | ✅ Maestro |
| Phase 5 | Ad Touchpoints | ⚠️ Partial (luckySprout 100%, but adManager 0%) | Manual |
| Phase 6 | Achievements & Daily | ✅ Strong (achievements 93%, dailyRewards 100%) | Partial |
| Phase 7 | Transcendence & Offline | ✅ Strong (transcendence 100%, offline 100%) | Partial |
| Phase 8 | Zone Gates & Bosses | ✅ Excellent (zoneGates 100%, bossFight 100%) | Planned |
| Phase 9 | Biome Mechanics & Abilities | ⚠️ Partial (biomeMechanics 59%, abilities 83%) | None |

### Phase 9 — Missing Test Cases

The test-cases.md catalog has **no entries for Phase 9 features**. The following test cases should be added:

| Proposed ID | Title | Pri | Rationale |
|-------------|-------|-----|-----------|
| TC-BIOME-001 | Biome label changes at zone boundaries | P0 | Core progression feedback |
| TC-BIOME-002 | Sunburst spawns and awards burst sunlight | P1 | Untested mechanic |
| TC-BIOME-003 | Luminescence glow meter fills and releases | P1 | Untested mechanic |
| TC-BIOME-004 | Resonance applies 1.3x tap multiplier | P1 | Tested in Jest, needs E2E |
| TC-BIOME-005 | Eruption Surge cycles between 0.5x and 2.0x idle | P1 | Tested in Jest |
| TC-BIOME-006 | Pressure Tide auto-releases at 100% | P1 | Tested in Jest |
| TC-BIOME-007 | Windfall event spawns and grants buff stacks | P1 | Untested mechanic |
| TC-BIOME-008 | Thaw Cycle frost/warmth interaction | P1 | Tested in Jest |
| TC-BIOME-009 | Biome mechanic state persists across save/load | P0 | No coverage |
| TC-ABILITY-001 | Bloom-stage bloomling activates ability | P1 | Tested in Jest |
| TC-ABILITY-002 | Elder-stage ability has 2x power | P1 | Tested in Jest |
| TC-ABILITY-003 | Ability bonuses cap correctly (crit 50%, zone 30%) | P1 | Tested in Jest |
| TC-AUTOTAP-001 | Auto-tap perk triggers taps at correct rate | P1 | Tested in Jest |


---

## Recommendations

### Priority-Ordered Test Gaps to Fill

| # | Priority | Action | Effort | Impact |
|---|----------|--------|--------|--------|
| 1 | 🔴 P0 | **Create `saveManager.test.ts`** — Test `applySaveToStore` (migration), `exportSave`/`importSave` (round-trip), checksum validation, missing-field defaults. This is the single biggest risk: 14K lines, zero tests, handles all persistence. | High (2–3 days) | Critical — covers TC-MIG-001–005, TC-CUR-002–006 |
| 2 | 🔴 P0 | **Create `store.test.ts`** — Test key store actions: `addSunlight`, `advanceZone`, `performRebirth`, `performTranscendence`, `buyUpgrade`. The store is 30K lines with complex slice composition. | High (3–4 days) | Critical — validates state transitions end-to-end |
| 3 | 🔴 P0 | **Expand `gameLoop.test.ts`** — Cover `startGameLoop` integration, biome mechanic tick dispatch, and the full tick→apply→store pipeline. Currently at 45% coverage. | Medium (1–2 days) | High — the game's heartbeat |
| 4 | 🟡 P1 | **Expand `biomeMechanics.test.ts`** — Add tests for Sunbursts, Luminescence, and Windfall mechanics. Currently 3 of 7 mechanics are untested. | Medium (1 day) | Medium — Phase 9 launch readiness |
| 5 | 🟡 P1 | **Expand `tapSystem.test.ts`** — Cover `handleTap` store integration and the `useTap` hook's anti-cheat enforcement. Currently at 48% coverage. | Medium (1 day) | Medium — core interaction path |
| 6 | 🟡 P1 | **Create `adManager.test.ts`** — Test reward application, cooldown enforcement, and ad-state management. 14K lines with zero coverage. | Medium (2 days) | Medium — monetization path |
| 7 | 🟡 P1 | **Add NaN/Infinity guard tests** — Add edge-case tests for NaN/Infinity/undefined inputs to core formulas (`calculateUpgradeCost`, `getZoneThreshold`, `calculateNectarEarned`, `calculateBloomlingProduction`). | Low (0.5 day) | Low-medium — defensive robustness |
| 8 | 🟢 P2 | **Create `notificationService.test.ts`** — Test scheduling logic and cancellation. | Low (0.5 day) | Low |
| 9 | 🟢 P2 | **Create `audioService.test.ts`** — Test init/play/sync state machine. | Low (0.5 day) | Low |
| 10 | 🟢 P2 | **Add Phase 9 test cases to `test-cases.md`** — Document TC-BIOME-001–009 and TC-ABILITY-001–003 as proposed above. | Low (0.5 day) | Documentation |

### Specific Test Files to Create

```
src/services/__tests__/saveManager.test.ts      ← P0, highest priority
src/state/__tests__/store.test.ts                ← P0
src/services/__tests__/adManager.test.ts         ← P1
src/services/__tests__/notificationService.test.ts ← P2
src/services/__tests__/audioService.test.ts      ← P2
```

### Flaky Test Concerns

**Current risk: LOW.** No flaky tests detected in this run. However:

- `applyOfflineProgress.test.ts` Night Owl test constructs a 2 AM timestamp using `new Date().setHours(2,0,0,0)`. This is timezone-dependent and could fail in CI environments with different TZ settings. **Recommendation:** Pin the timezone in the test or use a fixed epoch timestamp.
- `biomeMechanics.test.ts` uses `Date.now()` in some tests while passing explicit timestamps in others. Inconsistent — could cause intermittent failures if test execution is slow. **Recommendation:** Always use explicit timestamps.
- The 7-second total runtime is fast. No timeout concerns.

### E2E Readiness Assessment

| Dimension | Status |
|-----------|--------|
| Maestro flows exist | ✅ Yes (`.maestro/` directory with seed data) |
| P0 E2E coverage | ⚠️ 79% — save/migration P0s depend on Maestro but lack unit backup |
| Phase 9 E2E | 🔴 None — no Maestro flows for biome mechanics or abilities |
| CI integration | Unknown — not audited in this report |
| Device matrix | Unknown — not audited |

---

## Final Verdict

### Gate Status: ⚠️ CONDITIONAL PASS

The Bloomlings test suite is **strong for a mobile idle game** — 507 tests, 83% statement coverage, zero failures, clean TypeScript compilation, and well-structured behavioral tests. The engine's pure-function layer is thoroughly tested.

**However, three critical gaps block an unconditional pass:**

1. **`saveManager.ts` has zero tests.** This is the #1 risk. Save corruption or migration failure is a P0 user-facing bug that would cause data loss. The Maestro E2E flows provide some coverage, but unit tests are essential for fast regression detection.

2. **`store.ts` has zero direct tests.** The 30K-line state store is the backbone of the app. Store actions are only tested indirectly through mocks. A refactor could silently break state transitions.

3. **Phase 9 (Biome Mechanics) is 59% covered** with 3 of 7 mechanics completely untested. If Phase 9 is shipping, this needs to be addressed.

### Recommended Actions Before Launch

- [ ] Write `saveManager.test.ts` covering migration, export/import, and checksum validation
- [ ] Write `store.test.ts` covering critical state transitions (rebirth, transcendence, zone advance)
- [ ] Complete `biomeMechanics.test.ts` for Sunbursts, Luminescence, and Windfall
- [ ] Fix the 12 auto-fixable lint warnings (`npm run lint -- --fix`)
- [ ] Add Phase 9 test cases to `docs/testing/test-cases.md`
- [ ] Pin timezone in Night Owl test to prevent CI flakiness

Once items 1–3 are complete, this gate can be upgraded to **FULL PASS**.
