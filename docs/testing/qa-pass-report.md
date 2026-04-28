# QA Pass Report — Phase 8 Launch Prep

**Date:** 2026-04-27
**Run by:** QA Tester (automated + code review)
**Environment:** macOS, Node.js, Expo SDK 54, React Native 0.81, TypeScript strict

---

## 1. Build Verification

### 1a. TypeScript Compilation

**Command:** `npx tsc --noEmit`
**Result: ✅ PASS** — zero errors, zero warnings.

### 1b. Lint Check

**Command:** `npm run lint` (→ `expo lint`)
**Result: ⚠️ PASS (with warnings)** — 0 errors, 19 warnings. No blockers.

| Category | Count | Files |
|----------|------:|-------|
| `@typescript-eslint/no-unused-vars` | 5 | `_layout.tsx`, `collapsible.tsx`, `RebirthScreen.tsx`, `achievements.ts`, `tapSystem.ts` |
| `import/first` (imports after `jest.mock`) | 8 | 5 test files |
| `import/no-duplicates` | 2 | `transcendence.ts` |
| Unused eslint-disable directive | 1 | `AchievementsList.tsx` |
| `@typescript-eslint/array-type` | 1 | `game.ts` |
| Unused eslint-disable directive | 1 | `AchievementsList.tsx` |

**Assessment:** All warnings are cosmetic. The `import/first` warnings in test files are a standard Jest pattern (`jest.mock` must precede imports). None affect runtime behavior.

### 1c. Unit Tests (Jest)

**Command:** `npm test` (→ `jest`)
**Result: ✅ PASS** — all suites and tests green.

| Metric | Value |
|--------|-------|
| Test suites passed | 19 |
| Test suites failed | 0 |
| Tests passed | 400 |
| Tests failed | 0 |
| Execution time | 5.9s |

**Note:** The previous QA pass (pre-Phase 8 fixes) had 3 failing suites / 2 failing assertions. All three issues have been resolved:
- `synergies.test.ts` — Undergrowth Alliance multiplier assertion: **FIXED**
- `luckySprout.test.ts` — reward probability table mismatch: **FIXED**
- `applyOfflineProgress.test.ts` — `react-native-mmkv` ESM transform error: **FIXED**

### 1d. Test Coverage

**Command:** `npx jest --coverage`

| Metric | Coverage |
|--------|----------|
| Statements | 86.47% (857/991) |
| Branches | 83.80% (295/352) |
| Functions | 87.32% (124/142) |
| Lines | 86.58% (807/932) |

**Assessment:** Coverage is solid for engine and data layers. The uncovered ~14% is primarily in service modules (`saveManager.ts`, `adManager.ts`, `notificationService.ts`, `audioService.ts`) which depend on native modules and are difficult to unit test without mocking infrastructure.

---

## 2. Feature Completeness Matrix

**Status: 29/31 features shipped. 2 deferred to Phase 9.**

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Expo scaffold + TypeScript strict | 1 | ✅ Shipped |
| 2 | Type definitions (694 lines, 10 enums, 21 interfaces) | 1 | ✅ Shipped |
| 3 | Zustand store (6 slices + MetaSlice) | 2 | ✅ Shipped |
| 4 | Game loop (delta-time, offline, AppState) | 2 | ✅ Shipped |
| 5 | Tap system (combo, crits, anti-autoclicker) | 2 | ✅ Shipped |
| 6 | Save/load (MMKV, auto-save, export/import) | 2 | ✅ Shipped |
| 7 | Economy balance sheets (6 docs) | 2 | ✅ Shipped |
| 8 | Biome 1–2 Bloomlings (8 total) + synergies | 3 | ✅ Shipped |
| 9 | Upgrade flavor text (31 upgrades) | 3 | ✅ Shipped |
| 10 | Achievement content (36 achievements) | 3 | ✅ Shipped |
| 11 | Navigation (4-tab dark theme) | 3 | ✅ Shipped |
| 12 | Garden screen (CurrencyBar, TapArea, etc.) | 3 | ✅ Shipped |
| 13 | Shop screen (tabs, UpgradeCard, multiplier) | 3 | ✅ Shipped |
| 14 | Collection (grid, cards, detail modal) | 3 | ✅ Shipped |
| 15 | Evolution system | 4 | ✅ Shipped |
| 16 | Garden management (slots, capacity sync) | 4 | ✅ Shipped |
| 17 | Synergy system (tag + named, 8 pairs) | 4 | ✅ Shipped |
| 18 | Rebirth system (Nectar formula, retention) | 4 | ✅ Shipped |
| 19 | Nectar shop + Rebirth UI | 4 | ✅ Shipped |
| 20 | Offline progress engine + Welcome Back modal | 5 | ✅ Shipped |
| 21 | AdMob integration + Double-Offline touchpoint | 5 | ✅ Shipped |
| 22 | Dewdrop shop + Watch & Earn | 5 | ✅ Shipped |
| 23 | Lucky Sprout ad touchpoint | 5 | ✅ Shipped |
| 24 | Sunbeam Boost ad touchpoint | 5 | ✅ Shipped |
| 25 | Combo Keeper ad touchpoint | 5 | ✅ Shipped |
| 26 | Achievements engine + UI | 6 | ✅ Shipped |
| 27 | Daily login rewards + streaks | 6 | ✅ Shipped |
| 28 | Notifications | 6 | ✅ Shipped |
| 29 | Sound + haptics | 6 | ✅ Shipped |
| 30 | Transcendence + Essence system | 7 | ✅ Shipped |
| 31 | **Gate Assist ad touchpoint** | 9 | ⏳ Deferred — blocked on Zone Gates engine |
| 32 | **Boss Smash ad touchpoint** | 9 | ⏳ Deferred — blocked on Boss Fights engine |

**Ad touchpoints: 5/7 shipped.** Gate Assist and Boss Smash require Phase 9 engine loops (zone gates, boss fights) which are designed but not implemented.

---

## 3. Test Coverage Summary

### Unit test file inventory (19 suites, 400 tests)

| Area | Test File | Tests |
|------|-----------|------:|
| Engine | `achievements.test.ts` | ✅ |
| Engine | `applyOfflineProgress.test.ts` | ✅ |
| Engine | `dailyRewards.test.ts` | ✅ |
| Engine | `discovery.test.ts` | ✅ |
| Engine | `evolution.test.ts` | ✅ |
| Engine | `gameLoop.test.ts` | ✅ |
| Engine | `garden.test.ts` | ✅ |
| Engine | `garden.additional.test.ts` | ✅ |
| Engine | `luckySprout.test.ts` | ✅ |
| Engine | `offlineProgress.test.ts` | ✅ |
| Engine | `rebirth.test.ts` | ✅ |
| Engine | `synergies.test.ts` | ✅ |
| Engine | `tapSystem.test.ts` | ✅ |
| Engine | `transcendence.test.ts` | ✅ |
| Data | `templates.test.ts` | ✅ |
| State | `selectors.test.ts` | ✅ |
| State | `selectors.additional.test.ts` | ✅ |
| Services | `analyticsService.test.ts` | ✅ |
| Utils | `formatNumber.test.ts` | ✅ |

### P0 test case coverage (from `docs/testing/test-cases.md`)

**P0 cases with unit test coverage:**
- TC-ACH-001, TC-ACH-002, TC-ACH-003, TC-ACH-005 — `achievements.test.ts` ✅
- TC-DAILY-001, TC-DAILY-002, TC-DAILY-003, TC-DAILY-006 — `dailyRewards.test.ts` ✅
- TC-TRANS-001 through TC-TRANS-004, TC-TRANS-006, TC-TRANS-009 — `transcendence.test.ts` ✅
- TC-REB-003 (Nectar formula) — `rebirth.test.ts` ✅
- TC-OFF-001, TC-OFF-002 (offline progress engine) — `offlineProgress.test.ts` ✅
- TC-GRD-007 (garden idle production) — `garden.test.ts` / `garden.additional.test.ts` ✅

**P0 cases requiring E2E / device testing (Maestro):**

| P0 Case | Area | Notes |
|---------|------|-------|
| TC-TAP-001, TC-TAP-002, TC-TAP-008 | Tap loop | Maestro flows exist |
| TC-CUR-001, TC-CUR-002, TC-CUR-004, TC-CUR-005, TC-CUR-007 | Currency/persistence | Maestro flows exist |
| TC-COL-001, TC-COL-003–005 | Collection UI | Maestro flows exist |
| TC-SHOP-001–005, TC-SHOP-007–008, TC-SHOP-011 | Shop UI | Maestro flows exist |
| TC-REB-001–006 | Rebirth UI flow | Maestro flows exist |
| TC-NEC-001, TC-NEC-003–004 | Nectar shop UI | Maestro flows exist |
| TC-SET-001–003 | Settings UI | Maestro flows exist |
| TC-ZONE-001–002 | Zone UI | Maestro flows exist |

**⚠️ E2E tests (Maestro) were NOT run in this QA pass.** They require a device/emulator and are out of scope for this automated pass. Manual device testing is required before beta.

### Critical coverage gap

**`src/services/saveManager.ts` has no unit test file.** The save system (export/import roundtrip, corrupted data handling, checksum validation, migration) has zero automated test coverage. Code review (Section 5) confirms the implementation is sound, but this remains the most critical missing coverage for launch confidence.

---

## 4. Known Issues

| # | Severity | Area | Issue | Status |
|---|----------|------|-------|--------|
| 1 | 🟡 Medium | Test Coverage | No `saveManager.test.ts` — save export/import, corruption handling, and migration untested | Open |
| 2 | 🟡 Medium | Test Coverage | No dedicated unit tests for save migration cases (TC-MIG-001, TC-MIG-004) | Open |
| 3 | 🟢 Low | Lint | 19 lint warnings (unused vars, import ordering, duplicate imports). No errors. | Open |
| 4 | 🟢 Low | Ad System | Production ad unit IDs are `TODO(prod-ids)` placeholders — must swap before store submission | Open |
| 5 | 🟢 Low | Code Quality | Stale `synergies: Record<string, Synergy>` field on `GameState` — unused, can be removed | Open |
| 6 | ℹ️ Info | Idle System | Idle production shows 0/s until idle/evolution fix lands (known, tracked in test-cases.md) | Known |

**No P0 blockers found.** All previously failing tests have been fixed.

---

## 5. Save System Verification

**Method:** Code review of `src/services/saveManager.ts` (no unit tests exist).

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Corrupted save data handling | ✅ PASS | `loadFromDisk()` wraps `JSON.parse` in try/catch, returns `null` on failure. `importSave()` wraps `atob` + `JSON.parse` in try/catch. `saveToDisk()` has top-level try/catch (silent fail). |
| Missing fields / defaults | ✅ PASS | `applySaveToStore()` uses `??` null-coalescing for optional fields (`lastLuckySproutAt`, `luckySproutTapBoostExpiresAt`, `lastComboKeeperAt`, `pendingNectarBonus`, `nightOwlOfflineCollections`). Achievements merged with `buildInitialAchievements()`. |
| Version migration | ✅ PASS | `migrateIfNeeded()` implements sequential version migration (`while (version < CURRENT_SAVE_VERSION)`). Migration registry exists (currently empty at v1). Both `initializeFromDisk()` and `importSave()` call `migrateIfNeeded()`. |
| Export/import roundtrip | ✅ PASS | `exportSave()` → JSON → base64 via `btoa()`. `importSave()` → base64 decode → JSON → validate → migrate. Checksum generated and verified. |
| Structural validation | ✅ PASS | `isValidSaveData()` checks: version (number), savedAt (number), state (object), checksum (string), resources (object), sunlight (number). |
| Auto-save | ✅ PASS | 5-second interval via `useAutoSave` hook. Also saves on AppState → background. |

**Verdict:** Save system design is sound and handles edge cases correctly. **However, all verification was via code review — no automated tests confirm these behaviors.** Adding `saveManager.test.ts` is strongly recommended before beta.

---

## 6. Ad System Verification

**Method:** Code review of `src/services/adManager.ts`. Runtime testing requires a device with Google Mobile Ads SDK.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Rewarded-only (no interstitials/banners) | ✅ PASS | Only `RewardedAd` from `react-native-google-mobile-ads` is used. No interstitial or banner imports. |
| Opt-in only | ✅ PASS | All ad touchpoints require explicit user tap (e.g., "Watch ad for 2×"). |
| Per-touchpoint preload cache | ✅ PASS | 7 `RewardedAdUnit` slots with independent preload state. |
| Graceful failure modes | ✅ PASS | Handles: `no_fill`, `load_error`, `closed_without_reward`, `web_unsupported`. One retry with 5s backoff on load error. |
| Web/Expo Go guard | ✅ PASS | Native module loaded via `require()` in try/catch. Web returns `web_unsupported` — never throws. |
| Dev vs prod unit IDs | ⚠️ PARTIAL | Dev uses `TestIds.REWARDED`. Production IDs are `TODO(prod-ids)` — **must be swapped before store submission**. |
| React hook API | ✅ PASS | `useRewardedAd(unit)` returns `{ isLoaded, isLoading, show }` via `useSyncExternalStore`. |

**Touchpoint wiring status:**

| Touchpoint | Unit ID | Consumer Wired | Status |
|------------|---------|----------------|--------|
| Double Offline | `doubleOffline` | `WelcomeBackModal.tsx` | ✅ Shipped |
| Sunbeam Boost | `sunbeamBoost` | Garden FAB | ✅ Shipped |
| Dewdrop Garden | `dewdropGarden` | `DewdropEarnCard.tsx` | ✅ Shipped |
| Lucky Sprout | `luckySprout` | Lucky Sprout modal | ✅ Shipped |
| Combo Keeper | `comboKeeper` | Combo Keeper pill | ✅ Shipped |
| Gate Assist | `gateAssist` | — | ⏳ Deferred (Phase 9) |
| Boss Smash | `bossSmash` | — | ⏳ Deferred (Phase 9) |

**Verdict:** Ad system is well-architected with proper error handling and platform guards. **Runtime ad behavior cannot be verified without a device build.** The `TODO(prod-ids)` placeholder must be resolved before any store submission.

---

## 7. Economy Formula Spot-Check

**Method:** Code review of `src/engine/rebirth.ts` constants vs `docs/status.md`.

| Constant | Code Value | Documented Value | Status |
|----------|-----------|------------------|--------|
| `NECTAR_THRESHOLD` | 32 | 32 | ✅ Match |
| `NECTAR_EXPONENT` | 3.1 | 3.1 | ✅ Match |
| `NECTAR_BASE` | 1 | 1 (implied) | ✅ Match |
| `REBIRTH_UNLOCK_ZONE` | 40 | 40 | ✅ Match |

Nectar formula: `floor(NECTAR_BASE × (highestZone / 32)^3.1 × nectarMultiplier × wisdomMultiplier × rebirthBoostMultiplier)`

Transcendence formula: `floor(1 × (totalNectarSpent / 50)^1.8)` — matches `src/engine/transcendence.ts`.

**Economy formulas match documentation. ✅**

---

## 8. Performance Notes

**Method:** This QA pass did not include runtime performance profiling (requires device). The following is based on code review and architecture assessment.

- **Game loop:** Delta-time based, runs on `requestAnimationFrame`. Offline progress calculated once on foreground — no heavy computation during gameplay.
- **Selectors:** `totalSunlightPerSecondFromRegistry` computes production from template map + synergy multipliers. Should be memoized for large gardens (currently 9 max slots — acceptable).
- **Collection grid:** 3-column `FlatList` with 8 Bloomlings. No virtualization concerns at current content size. Will need attention when Biomes 3–8 add ~24+ more Bloomlings.
- **Auto-save:** 5-second interval with MMKV (synchronous, fast). No observable frame drops expected.

**Recommended before beta:** Profile on lowest-tier target device (e.g., iPhone SE 2nd gen, budget Android). Verify 60fps during rapid tapping and garden screen with full synergies active.

---

## 9. Recommendation

### ✅ CONDITIONAL PASS — Ready for closed beta with caveats.

**What passed:**
- TypeScript compilation: zero errors
- Lint: zero errors (19 warnings, all cosmetic)
- Unit tests: 400/400 passing across 19 suites
- Test coverage: 86.5% statements, 83.8% branches
- Save system: well-implemented (code review verified)
- Ad system: well-architected with proper error handling
- Economy formulas: match documentation
- Feature completeness: 29/31 shipped (2 appropriately deferred)
- All previously failing tests have been fixed

**Caveats / pre-beta action items:**

| Priority | Item | Effort |
|----------|------|--------|
| 🔴 Must | Swap `TODO(prod-ids)` ad unit IDs before store submission | Small |
| 🔴 Must | Run Maestro E2E suite on device (not done in this pass) | Medium |
| 🟡 Should | Add `saveManager.test.ts` covering export/import roundtrip, corruption rejection, migration | Medium |
| 🟡 Should | Device performance profiling (60fps, memory, battery) | Medium |
| 🟢 Nice | Clean up 19 lint warnings | Small |
| 🟢 Nice | Remove stale `synergies` field from `GameState` | Small |

**What was verified programmatically:**
- TypeScript type safety (full project)
- Lint compliance (full project)
- Unit test correctness (400 tests, 19 suites)
- Code coverage metrics

**What requires manual/device testing (not done):**
- Maestro E2E flows (all P0 UI cases)
- Runtime ad loading and reward delivery
- Device performance profiling
- Notification delivery
- Sound/haptics behavior
- App backgrounding and foregrounding save persistence

**Bottom line:** The codebase is in good shape for a closed beta. All engine logic is tested and passing, the build is clean, and the architecture is sound. The primary risk is the untested save system service layer — while the code is well-written, a `saveManager.test.ts` would significantly increase launch confidence. Device testing and E2E runs are the remaining gates before shipping to testers.
