# Architecture Review — 2026-04-28

Reviewer: Code Reviewer (Architect Level)
Scope: Full codebase at `/Users/dulan.manujaya/bloomlings-idle-game`

---

## Architecture Overview

### Layer Diagram

```
┌─────────────────────────────────────────────────┐
│  UI Layer (React Components)                     │
│  app/(tabs)/index.tsx, src/components/**          │
│  Reads store via useGameStore selectors           │
│  Calls store actions, never engine functions      │
├─────────────────────────────────────────────────┤
│  State Layer (Zustand Store + Slices)            │
│  src/state/store.ts, src/state/slices/**          │
│  Thin wrappers: setState calls, delegates to      │
│  engine for complex logic                         │
├─────────────────────────────────────────────────┤
│  Selector Layer (Pure Derived Values)            │
│  src/state/selectors.ts                           │
│  Pure functions: state → computed values          │
├─────────────────────────────────────────────────┤
│  Engine Layer (Pure Game Logic)                  │
│  src/engine/** (gameLoop, tapSystem, synergies,   │
│  abilities, zoneGates, bossFight, rebirth, etc.)  │
│  Pure functions operating on state snapshots       │
├─────────────────────────────────────────────────┤
│  Data Layer (Static Templates)                   │
│  src/data/** (bloomlingTemplates, perkTemplates,  │
│  achievementTemplates)                            │
├─────────────────────────────────────────────────┤
│  Types Layer (Interfaces & Enums)                │
│  src/types/game.ts                                │
├─────────────────────────────────────────────────┤
│  Services Layer (Side Effects)                   │
│  src/services/** (saveManager, adManager,         │
│  audioService, notificationService, analytics)    │
└─────────────────────────────────────────────────┘
```

### Dependency Direction Assessment

**Mostly correct.** Dependencies generally flow downward: UI → State → Selectors → Engine → Types. However, there are notable violations:

1. **`gameLoop.ts` and `tapSystem.ts` import `useGameStore` directly.** These engine files contain React hooks (`useGameLoop`, `useTapHandler`) that couple them to the store. The pure functions within them (`gameTick`, `calculateTapReward`) are properly separated, but the hooks should live in `src/hooks/` to maintain the engine-as-pure-functions boundary.

2. **`applyOfflineProgress` in `gameLoop.ts` (line 216)** calls `useGameStore.getState()` directly — this is an imperative side-effect function living in the engine layer. It should be a store action or a hook.

3. **`upgradeSlice.ts` imports from `~/services/analyticsService`** — a slice reaching into the services layer. Analytics tracking should be done at the store action level in `store.ts`, not inside individual slices.

### Module Boundary Assessment

- **Types** (`src/types/game.ts`): Clean, comprehensive, well-documented. 28KB of types with thorough JSDoc. No circular dependencies.
- **Engine**: 19 modules. Pure functions are well-separated from hooks in most files. The `synergies.ts` (28KB) and `garden.ts` (13KB) are the largest and could benefit from splitting.
- **State**: 7 slices + main store + selectors. The main `store.ts` at 30KB is a monolith — the `MetaSlice` contains ~20 actions that should be split into dedicated slices.
- **Components**: Well-organized by feature area (garden, prestige, shop, collection, etc.).

---

## Pattern Consistency

### Engine Modules — Pure Function Pattern

| Module | Pure Functions | Hooks/Side Effects | Verdict |
|--------|---------------|-------------------|---------|
| `zoneGates.ts` | ✅ All pure | None | ✅ Clean |
| `bossFight.ts` | ✅ All pure | None | ✅ Clean |
| `abilities.ts` | ✅ All pure | None | ✅ Clean |
| `biomeMechanics.ts` | ✅ All pure | None | ✅ Clean |
| `synergies.ts` | ✅ All pure | None | ✅ Clean |
| `offlineProgress.ts` | ✅ All pure | None | ✅ Clean |
| `rebirth.ts` | ✅ All pure | None | ✅ Clean |
| `evolution.ts` | ✅ All pure | None | ✅ Clean |
| `gameLoop.ts` | `gameTick` pure ✅ | `useGameLoop` hook, `applyOfflineProgress` imperative | ⚠️ Mixed |
| `tapSystem.ts` | `calculateTapReward` pure ✅ | `useTapHandler` hook | ⚠️ Mixed |

**Verdict:** Core engine modules (`zoneGates`, `bossFight`, `abilities`, `biomeMechanics`, `synergies`) follow the pure-function pattern perfectly. `gameLoop.ts` and `tapSystem.ts` mix pure functions with React hooks — the hooks should be extracted to `src/hooks/`.

### Store Slices — Thin Wrapper Pattern

- **`resourceSlice.ts`**: ✅ Pure thin wrappers. Simple `set()` calls.
- **`comboSlice.ts`**: ✅ Pure thin wrappers.
- **`upgradeSlice.ts`**: ⚠️ Imports `trackEvent` from analytics — side effect in a slice.
- **`bloomlingSlice.ts`**: Would need full read to verify, but at 11KB it likely contains some business logic.
- **`prestigeSlice.ts`**: At 8.6KB, likely contains prestige calculation logic that should be in engine.
- **`settingsSlice.ts`**: ✅ Expected to be thin.

**Verdict:** Most slices are thin. `upgradeSlice` has a minor analytics coupling. The `MetaSlice` in `store.ts` is the main concern — it's a 500+ line catch-all with actions for perks, ads, achievements, daily rewards, and Lucky Sprout that should be split into dedicated slices.

### Selectors — Side Effect Free

✅ **All selectors in `selectors.ts` are pure functions.** They take state slices as input and return computed values. No `set()` calls, no mutations, no side effects. Well-structured with clear JSDoc.

### Game Loop Structure

✅ **Properly structured.** The `gameTick` function is pure (takes state snapshot, returns `TickResult`). `applyTick` is a separate function that applies the result. The `useGameLoop` hook orchestrates timing, AppState handling, and offline progress. Lucky Sprout and achievement checks run on 30-second intervals to avoid per-tick overhead.

**One concern:** `applyOfflineProgress` (line 210-260) directly calls `useGameStore.getState()` and `useGameStore.setState()` — it's an imperative function that bypasses the action pattern. This makes it harder to test and breaks the convention.

---

## Code Quality Issues

### Type Safety Concerns

1. **`as any` casts in `saveManager.ts` (lines 307-327):** Four `as any` casts used for backward-compatible save loading:
   ```typescript
   streakFrozenAt: (state.daily as any).streakFrozenAt ?? null,
   cosmetics: (state as any).cosmetics ?? { ... },
   tutorial: (state as any).tutorial ?? { ... },
   ```
   These should use a proper migration function in the `migrations` registry instead of inline `as any` fallbacks.

2. **`_showOpts` stashed on cache entry in `adManager.ts`:** The ad manager uses `(entry as { _showOpts?: AdShowOptions })._showOpts` to pass options through event callbacks. This is a type-unsafe pattern — the `CacheEntry` interface should include `_showOpts` as an optional field.

3. **`ad: unknown` in `adManager.ts` `CacheEntry`:** The ad instance is typed as `unknown` with runtime casts to `{ show: () => Promise<void> }`. Acceptable given the conditional native module import, but a type guard would be safer.

### Dead Code / Unused Exports

1. **`initAnalytics` imported but never called** in `app/_layout.tsx` (line 27). The import exists but no `initAnalytics()` call appears in the `useEffect`. Analytics initialization is silently skipped.

2. **`GATE_ASSIST_SUNLIGHT_MULTIPLIER` exported from `zoneGates.ts`** but grep shows no consumers. Likely intended for a future feature or was superseded by the timer-bonus approach.

### Inconsistent Naming

- **`BOSS_INTERVAL` re-exported from `zoneGates.ts`** (`export { BOSS_INTERVAL }`) — confusing to import a boss constant from the zone gates module. Consumers should import directly from `bossFight.ts`.

### Missing Error Handling

1. **`saveToDisk` silently swallows all errors** (`catch {}` with no logging). In production, save failures should at minimum increment a counter or flag for the user.

2. **`loadFromDisk` returns `null` on any parse error** with no distinction between "no save exists" and "save is corrupted." The caller (`initializeFromDisk`) can't differentiate these cases to show a recovery UI.

### Potential Memory Leaks

1. **`CollectionGrid.tsx` (line 59):** `setTimeout` without cleanup in a callback. If the component unmounts during the 300ms delay, the callback will fire on an unmounted component. Should use a ref-based cleanup pattern.

2. **`GateOverlay.tsx` and `BossOverlay.tsx`:** Both use `setInterval` with proper cleanup via `useEffect` return — ✅ no leak.

3. **`adManager.ts` cache:** The `cache` Map and `listeners` Map are module-level singletons. Ad entries are cleaned up on close (`cache.delete(unit)`), but if the native module throws during `show()` and the CLOSED event never fires, the entry leaks. The error retry timeout partially mitigates this.

### State Management Anti-Patterns

1. **Module-level mutable state in `store.ts`:** `let zoneEnteredAt = Date.now()` (line ~195) is a module-level mutable variable used for the `speed_demon` achievement. This is invisible to the store, not persisted, and not testable. Should be part of the store state or a ref in the game loop hook.

2. **Module-level `sessionStartedAt` in `gameLoop.ts`:** Same pattern — mutable module-level variable for analytics session tracking.

3. **`store.ts` MetaSlice is 500+ lines:** The `MetaSlice` interface and its implementation in the store creator function handle perks, ads, achievements, daily rewards, Lucky Sprout, zone progression, and more. This violates the slice pattern used elsewhere and makes the store file hard to navigate.

---

## Dependency Analysis

### Circular Dependency Risks

No actual circular dependencies detected. However:

- `gameLoop.ts` imports from `~/state/store` and `~/state/selectors`, while `store.ts` imports from `~/engine/*`. This creates a **logical cycle** (engine ↔ state) even though the import graph is acyclic because `gameLoop.ts` only imports the store for its hooks, not for the pure functions. Still, this coupling means engine tests must mock the store.

### Tight Coupling

1. **`tapSystem.ts` ↔ `store.ts`:** The `useTapHandler` hook directly calls `useGameStore.getState()` and `useGameStore.setState()` for stats updates. The pure `calculateTapReward` is clean, but the hook is tightly coupled.

2. **`store.ts` ↔ multiple engine modules:** The store imports from `luckySprout`, `dailyRewards`, `zoneGates`, `bossFight`, `achievements`, `garden`, `synergies`, and `analyticsService`. This is expected for the orchestration layer but makes `store.ts` a dependency bottleneck.

### Missing Dependency Injection

- **`getBloomlingTemplate` in `selectors.ts`:** The selector functions use a hardcoded import of `getBloomlingTemplate` from the data layer. The `totalSunlightPerSecond` function already accepts a `getTemplate` parameter for DI, but `totalSunlightPerSecondFromRegistry` and `selectActiveSynergies` hardcode the import. This makes testing these selectors require mocking the data module.

---

## Performance Concerns

### Unnecessary Re-renders

1. **`GateOverlay.tsx` and `BossOverlay.tsx`:** Both use `setInterval` + `useState` to force re-renders every 250ms for countdown display. This is a common pattern but causes 4 re-renders/second even when the timer display hasn't visually changed. Consider using Reanimated shared values for the countdown.

2. **`useGameStore` selector granularity in `GardenScreen`:** The screen imports many child components that each subscribe to different store slices. This is correct (fine-grained selectors). No obvious over-subscription.

### Heavy Computations in Render Path

1. **`selectAbilityBonuses` called in `useTapHandler`** on every tap. This iterates all garden Bloomlings and their templates. With a full garden of 8+ Bloomlings, this is ~16 object lookups per tap. Acceptable at current scale but should be memoized if garden size grows.

2. **`totalSunlightPerSecondFromRegistry`** is called every game tick (100ms). It iterates garden Bloomlings, computes synergies, and computes ability bonuses. At 10 ticks/sec this is fine for 8 Bloomlings but would need caching for larger gardens.

### Selector Memoization Opportunities

- **`selectActiveSynergies`** and **`selectAbilityBonuses`** are called from multiple places (game loop, tap handler, UI). They recompute from scratch each time. A memoized version keyed on `garden.slots` + Bloomling levels/stages would eliminate redundant work.

### Game Loop Efficiency

✅ **Well-designed.** 100ms tick interval is appropriate. The tick function is O(n) in garden size. Lucky Sprout and achievement checks are throttled to 30-second intervals. Boost expiration is checked per-tick but is O(n) in active boosts (typically 0-2).

---

## Security & Data Integrity

### Save Data Validation

⚠️ **Minimal.** `isValidSaveData` checks:
- Top-level structure (version, savedAt, state, checksum)
- `state.resources.sunlight` exists and is a number

**Missing:**
- Checksum is generated but **never verified on load**. The `loadFromDisk` function doesn't call `generateChecksum` to compare.
- No range validation (negative sunlight, zone > 200, level > 100, etc.)
- No type validation for nested objects (bloomlings, upgrades, etc.)

### Ad Reward Verification

⚠️ **Client-side only.** Ad rewards are granted immediately on the `EARNED_REWARD` callback from the Google Mobile Ads SDK. There is no server-side verification. For a single-player idle game this is acceptable, but:
- The `totalAdsWatched` counter is incremented in multiple places (each touchpoint handler) — a centralized increment would be less error-prone.
- No rate limiting beyond the daily cap (15/day) which is only enforced for Dewdrop Garden ads.

### Anti-Cheat Considerations

- **Anti-autoclicker:** ✅ Implemented in `tapSystem.ts` — max 20 taps/second with a 1-second sliding window.
- **Time manipulation:** ⚠️ The offline progress system uses `Date.now()` with a 24-hour cap, which limits time-travel exploits. However, there's no server-side time validation.
- **Save editing:** ⚠️ The checksum is a simple hash that's never verified. A determined player could edit the MMKV save and recalculate the checksum.

### Input Validation

- **`addSunlight`/`addNectar`/etc.:** No validation that `amount > 0`. Negative amounts would subtract resources.
- **`buyPerk`:** Validates template existence and Dewdrop balance. ✅
- **`buyUpgrade`:** Does not validate max level or cost — the caller is expected to check `canAffordUpgrade` first.

---

## Technical Debt Inventory

### TODO/FIXME/HACK Comments

| File | Line | Comment |
|------|------|---------|
| `adManager.ts` | 98 | `TODO(prod-ids): wire real unit IDs before Phase 8 (launch)` |
| `adManager.ts` | 108 | `TODO(prod-ids): Replace all placeholder IDs with real AdMob unit IDs before store submission` |

All 7 ad unit IDs are placeholders (`ca-app-pub-XXXXXXXXXXXXXXXX/...`). **This is a launch blocker.**

### Known Issues

1. **`initAnalytics` never called:** Analytics service is imported but initialization is missing from `_layout.tsx`. Events are being tracked via `trackEvent`/`trackSessionStart` but the SDK may not be properly initialized.

2. **`as any` casts in save loading:** Four instances in `saveManager.ts` for backward compatibility. Should be replaced with proper migration functions.

3. **`BiomeMechanicState` not persisted:** The `BiomeMechanicState` from `biomeMechanics.ts` is not part of `GameState` or `SaveData`. Biome mechanic progress (glow meter, pressure, warmth, etc.) resets on every app restart. This may be intentional but is undocumented.

4. **`store.ts` monolith:** The MetaSlice contains ~20 actions spanning perks, ads, achievements, daily rewards, Lucky Sprout, and zone progression. This should be split into `perkSlice`, `dailySlice`, `achievementSlice`, etc.

---

## Recommendations

### Critical (Must Fix Before Launch)

1. **Replace placeholder ad unit IDs** in `adManager.ts` (lines 110-116). All 7 touchpoints have `XXXXXXXXXXXXXXXX` placeholders. Without real IDs, no ad revenue will be generated.

2. **Call `initAnalytics()`** in `app/_layout.tsx`. The import exists (line 27) but the function is never invoked. Add `initAnalytics();` to the `useEffect` block.

3. **Verify save checksum on load.** `loadFromDisk` generates a checksum on save but never validates it on load. Add checksum verification in `loadFromDisk` after parsing, with a fallback to accept the save if the checksum field is missing (for backward compatibility).

4. **Validate resource amounts are non-negative** in `addSunlight`, `addNectar`, etc. A simple `if (amount <= 0) return;` guard prevents accidental resource subtraction through the add path.

### Important (Should Fix Before Launch)

5. **Extract hooks from engine files.** Move `useGameLoop` from `gameLoop.ts` and `useTapHandler` from `tapSystem.ts` into `src/hooks/`. Keep only pure functions in `src/engine/`.

6. **Replace `as any` casts in `saveManager.ts`** with proper migration functions in the `migrations` registry. This makes save format evolution explicit and testable.

7. **Split `MetaSlice` in `store.ts`** into dedicated slices: `perkSlice`, `dailySlice`, `achievementSlice`, `adSlice`, `luckySproutSlice`. This would reduce `store.ts` from ~800 lines to ~200.

8. **Remove analytics import from `upgradeSlice.ts`.** Move `trackEvent` calls to the store-level action wrappers.

9. **Add range validation to `applySaveToStore`** — clamp zone numbers, resource values, and levels to valid ranges to prevent corrupted saves from crashing the game.

### Nice-to-Have Improvements

10. **Memoize `selectActiveSynergies` and `selectAbilityBonuses`** with a cache keyed on garden slot composition and Bloomling evolution stages. Would reduce per-tick computation.

11. **Use Reanimated shared values for countdown timers** in `GateOverlay` and `BossOverlay` instead of `setInterval` + `useState` re-renders.

12. **Add error reporting to `saveToDisk`** — at minimum log to console in dev, and consider a user-visible indicator if saves fail repeatedly.

13. **Document the `BiomeMechanicState` persistence decision** — whether it's intentionally transient or a gap that needs addressing.

14. **Clean up the `BOSS_INTERVAL` re-export** from `zoneGates.ts` — consumers should import directly from `bossFight.ts`.

15. **Add a `setTimeout` cleanup ref** in `CollectionGrid.tsx` `handleCloseDetail` to prevent the 300ms deferred callback from firing on an unmounted component.
