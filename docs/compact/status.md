<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->
<!-- Source: docs/status.md -->

# Bloomlings — Current Status (Compact Context)

> Auto-generated from the canonical source file. Edit the source markdown, then regenerate compact docs.

## Quick Map
- Current Phase
- Completed Work
  - Phase 1-2 (Foundation + Engine)
  - Phase 3: Content & UI (ALL DONE)
  - Phase 4: Progression Systems (IN PROGRESS)
  - Phase 6: Polish & Retention (IN PROGRESS)
  - Phase 5: Monetization (IN PROGRESS)
  - Phase 8: Launch Prep (COMPLETE)
  - Phase 9: Gameplay Depth & Player Experience (DESIGN COMPLETE)
- What's Next
  - Phase 7 completed
  - Phase 7 remaining tasks
  - Dependencies / Notes for next session
- Blockers

## Key Points
### Current Phase
- **Phase 1: Foundation** — COMPLETE

### Completed Work
- (No concise bullet/summary found; use grep in source file for details.)

### Phase 1-2 (Foundation + Engine)
- Expo SDK 54 scaffold, all dependencies, TypeScript strict
- 694-line type definitions (10 enums, 21 interfaces)
- Zustand store with 6 slices + MetaSlice + selectors
- Game loop (delta-time, offline progress, AppState handling)

### Phase 3: Content & UI (ALL DONE)
- `docs/content/01-biome1-bloomlings.md` — 4 Bloomlings (Fernley, Mosswick, Petaline, Thornwick) + 3 synergies
- `docs/content/02-biome2-bloomlings.md` — 4 Bloomlings (Solara, Dapplebark, Honeyveil, Briarthorn) + 3 synergies + 2 cross-biome
- `docs/content/03-upgrades-flavor.md` — 31 upgrades with flavor text (6 tap, 6 idle, 10 Nectar, 9 Essence)
- `docs/content/04-achievements.md` — 36 achievements (8 Growth, 9 Power, 7 Journey, 6 Rebirth, 6 Hidden)

### Phase 4: Progression Systems (IN PROGRESS)
- **Evolution system** — DONE. `src/engine/evolution.ts` — `canEvolve`, `getEvolutionCost`, `evolveBloomling`, `getNextEvolutionStage`. Sprout→Bloom and Bloom→Elder cost tables (Sunlight + Nectar) sourced from `docs/economy/02-upgrade-costs.md`. `bloomlingSlice.evolveBloomling` wires the engine to the store, deducts costs, and applies the transformation.
- **Garden management** — DONE. `src/engine/garden.ts` — `getMaxGardenSlots`, `computeGardenSlotBreakdown`, `canAddToGarden`/`validateAddToGarden`, `placeBloomlingInSlot`, `removeBloomlingFromGarden`, `applyCapacityChange`, `getGardenBloomlings`. Slot sources: base 1 + zone unlocks at 5/15/30 + upgrade levels (`idle_garden_slots`, `nectar_garden_expansion`, `essence_eternal_garden`) + `dewdrop_bonus_slot` perk, hard-capped at 9. `bloomlingSlice` delegates all garden mutations to the engine and exposes `syncGardenCapacity()`, which is auto-called from `advanceZone`, `buyUpgrade`/`setUpgradeLevel` (for slot upgrades), `executeRebirth`, and `executeTranscendence` so capacity stays in sync with progression, purchases, and prestige resets.
- **Synergy system** — DONE. `src/engine/synergies.ts` — pure engine: `getTagSynergyMultiplier` (tier table: 2→1.15, 3→1.35, 4+→1.60), `findActiveTagSynergies` (Elder-only gate controlled by `TAG_SYNERGIES_REQUIRE_ELDER`), `findActiveNamedSynergies`, `calculateActiveSynergies` (combines both, returns per-Bloomling production and tap-value multipliers with multiplicative stacking), `reconcileSynergyDiscovery` (computes newly-discovered IDs for Dewdrop rewards). `NAMED_SYNERGIES` registry holds all 8 pair synergies sourced from `docs/content/01-biome1-bloomlings.md` + `02-biome2-bloomlings.md`: Undergrowth Alliance, Bloom and Briar, Cradle Guard (+10% tap value — the one non-production synergy), Golden Canopy, Nectar and Thorn, Meadow Chorus, Thorned Pact, First Light. Synergy IDs: `tag:<Name>` for tag synergies, `synergy_<name>` for named. Wiring: `totalSunlightPerSecondFromRegistry` in `selectors.ts` pulls base production from `BLOOMLING_TEMPLATE_MAP` and applies synergy multipliers — the game loop now calls this instead of the `Simple` placeholder. `bloomlingSlice.recomputeActiveSynergies()` writes `garden.activeSynergyIds` and folds new activations into `stats.discoveredSynergyIds` + `stats.synergiesDiscovered`; auto-called from `addToGarden`, `removeFromGarden`, `removeBloomling`, `evolveBloomling`, and `syncGardenCapacity`. New type field: `GameStats.discoveredSynergyIds: string[]`.
- **Rebirth system** — DONE. `src/engine/rebirth.ts` — pure engine: `calculateNectarEarned` (tuned constants: threshold=32, exponent=3.1 from economy doc, with Nectar Roots bonus multiplier), `canRebirth` (zone 40+ and ≥1 Nectar), `getRebirthPreview` (Nectar earned, percentage increase, recommended flag, push-further projections), `getRetainedEvolutionStage` (Bloom/Elder Retention Nectar upgrades), `getStartingZone` (Seasonal Memory: Lv.1→Zone 5, Lv.2→10, Lv.3→15, Lv.4→20), `getStartingComboCount` (Combo Memory: start at 10), `resetBloomlingsForRebirth` (level→1, stage respects retention, clears garden placement), `filterUpgradesForRebirth` (keeps Nectar + Essence upgrades, discards Tap + Idle). `NECTAR_UPGRADE_IDS` (10 IDs) and `ESSENCE_UPGRADE_IDS` (9 IDs) exported as constants for category filtering. `prestigeSlice.executeRebirth` refactored to thin wrapper calling all engine functions. Fixed bugs: old code zeroed Essence on Rebirth and wiped all upgrades (including Nectar/Essence). `selectors.ts` Nectar formula updated to use tuned constants from engine (was using design-doc defaults: threshold=40, exponent=2.2). `stats.discoveredSynergyIds` confirmed NOT reset on Rebirth — lifetime meta-progression.

### Phase 6: Polish & Retention (IN PROGRESS)
- **Achievements** — DONE. `src/data/achievementTemplates.ts` defines all 36 achievements (8 Growth, 9 Power, 7 Journey, 6 Rebirth, 6 Hidden) with stable IDs, reward values, and display text sourced from `docs/content/04-achievements.md`. `src/engine/achievements.ts` — pure engine: `computeProgress(id, state)` returns current progress for each achievement from existing store fields (sunlight/tap/combo/crit stats, zone, bloomling count, synergy count, prestige counts); `checkAchievements(state)` returns IDs of newly-completable achievements; `computeAllProgress(state)` computes a progress snapshot for UI display; four event-driven achievements (`patient_gardener`, `speed_demon`, `stubborn_sprout`, `hat_trick`) bypass the passive loop and use `triggerHiddenAchievement`. Store: `achievements` initialized from `buildInitialAchievements()` (was `{}`); two new MetaSlice actions: `checkAndGrantAchievements()` (marks newly-complete, grants Sunlight/Dewdrop rewards, increments `stats.achievementsCompleted`, then checks Completionist as a second pass) and `triggerHiddenAchievement(id)` (direct event-driven completion). Call sites wired: `advanceZone`, `evolveBloomling`, `discoverBloomlingsForZone`, `executeRebirth`, `executeTranscendence` (all call `checkAndGrantAchievements` immediately after state mutation); game loop checks every 30s for long-running milestones (total Sunlight, total taps). New hidden-achievement tracking: `stats.nightOwlOfflineCollections` (midnight–5 AM offline-session counter) added to `GameStats` — defaults to 0 in `initialStats` and `applySaveToStore`. `patient_gardener` triggered from the game-loop foreground handler when `offlineResult.durationMs >= 24h`; night-owl counter incremented when foreground time is 00:00–04:59. `saveManager.applySaveToStore` merges loaded achievements with `buildInitialAchievements()` so saves predating the system receive all 36 achievements as uncompleted rather than absent. UI: `src/components/achievements/AchievementsList.tsx` — scrollable list grouped by category (Growth/Power/Journey/Rebirth/Hidden); each card shows name, description, progress bar (% filled), reward label, completion checkmark; hidden uncompleted achievements render as "??? / Hidden Achievement". `app/(tabs)/collection.tsx` extended with a Bloomlings / Achievements sub-tab switcher at the top of the Collection screen; safe-area insets moved to the parent container to avoid double-padding.

### Phase 5: Monetization (IN PROGRESS)
- **Offline progress** — DONE. `src/engine/offlineProgress.ts` — pure engine: `MAX_OFFLINE_MS` (24h cap), `BASE_OFFLINE_EFFICIENCY` (50%), `getOfflineEfficiency` (Cosmic Roots Essence upgrade lifts efficiency toward 100% at `level/3` rate, max level 3), `getDeepRootsMultiplier` (Deep Roots Nectar upgrade adds +10% yield per level, max level 10), `calculateOfflineProgress(state, lastTickAt, now, { adBoost? })` returns `{ sunlightEarned, durationMs, wasCapped, efficiency }`. The `adBoost` option doubles final earnings as a hook for the future Double-Offline ad touchpoint. `gameLoop.ts` now imports `calculateOfflineProgress` from the new module (previously inline). The inline `MAX_OFFLINE_MS` / `OFFLINE_EFFICIENCY` constants were removed from `gameLoop.ts`. On foreground, the game loop writes `meta.lastOfflineSession` (transient, not persisted) with the session summary for any away window ≥ 30s. New UI: `src/components/offline/WelcomeBackModal.tsx` renders when `lastOfflineSession !== null`, shows duration / earned Sunlight / efficiency %, a "capped at 24h" note when applicable. Modal is mounted once in `app/_layout.tsx` and clears the session on "Collect". New type: `OfflineSessionSummary` in `src/types/game.ts`. New store field + actions: `lastOfflineSession`, `setLastOfflineSession`, `clearLastOfflineSession` in `MetaSlice` (`src/state/store.ts`).
- **AdMob integration + Double-Offline touchpoint** — DONE. `src/services/adManager.ts` — production-ready rewarded-ad service wrapping `react-native-google-mobile-ads`. Public API: `initializeAds()` (idempotent SDK init, called from `app/_layout.tsx` on mount), `preloadRewardedAd(unit)`, `showRewardedAd(unit, opts)`, and the React hook `useRewardedAd(unit)` returning `{ isLoaded, isLoading, show }` backed by `useSyncExternalStore`. Per-unit preload cache keyed by `RewardedAdUnit` (one slot per touchpoint: `doubleOffline`, `sunbeamBoost`, `dewdropGarden`, `luckySprout`, `gateAssist`, `bossSmash`, `comboKeeper`) so consumers share loaded ads and auto re-preload on CLOSED. Edge cases handled: already-loaded → instant show; load in-flight → 3s timeout before surfacing `no_fill`; load error → one retry with 5s backoff; user closes before reward → `closed_without_reward`; platform guard for web / Expo Go → `web_unsupported`, never throws (module is `require()`'d inside try/catch). Dev uses `TestIds.REWARDED`; production unit IDs are `TODO(prod-ids)` placeholders to swap before Phase 8. First consumer wired: `WelcomeBackModal.tsx` now drives its "Watch ad for 2×" button via `useRewardedAd("doubleOffline")`, showing `Loading ad…` / `Watch ad for 2×` / `Earnings doubled!` based on state, flashing the bonus for 1.2s before clearing the session, and degrading to an inline "No boost available" note on unavailable. New store action `applyAdDoubleOffline()` (MetaSlice) grants exactly the displayed `session.sunlightEarned` a second time + zone progress + `stats.totalAdsWatched++` — deliberately not re-running `calculateOfflineProgress` with `adBoost:true` to avoid drift if idle rates shifted during ad playback. The engine's `adBoost` option remains available for future callers.
- **Dewdrop shop + Watch &amp; Earn** — DONE. New catalog `src/data/perkTemplates.ts` defines five gameplay perks with stable IDs consumed by engine code: `dewdrop_bonus_slot` (permanent +1 Garden slot, stacks in `applyCapacityChange`), `offline_boost` (permanent, raises `getOfflineEfficiency` floor from 50% → 75%), `zone_skip` (consumable, invokes `store.advanceZone()` via `useZoneSkip`), `rebirth_boost` (consumable, auto-consumed by `executeRebirth` for +50% Nectar), `evolution_shard` (consumable, auto-consumed by `bloomlingSlice.evolveBloomling` to halve the next evolution cost). Engine updates: `offlineProgress.getOfflineEfficiency` now reads `state.perks`; `rebirth.calculateNectarEarned` / `getRebirthPreview` accept an optional `rebirthBoostMultiplier`; `evolution.canEvolve` / `getEvolutionCost` accept an optional `discountFactor`. New store actions on MetaSlice: `buyPerk(perkId)` (spends Dewdrops via `spendDewdrops`, writes/merges a `Perk` entry, re-syncs Garden capacity for the bonus-slot perk), `recordDewdropAdReward()` (returns Dewdrops granted: 1 base + 1 on every 3rd ad of the day + up to +5 from `adStreakDays`, bumps `stats.totalAdsWatched`, stamps `daily.lastDewdropAdAt` for the cooldown clock, caps at `daily.dailyAdCap` = 15/day), `rolloverDailyState()` (resets `adsWatchedToday` on calendar-day change and extends/resets `adStreakDays`, idempotent within a day — invoked by `gameLoop` on every foreground), `useZoneSkip()` (consumes one `zone_skip` charge and calls `advanceZone`). New `DailyState.lastDewdropAdAt: number | null` persists the 3-minute cooldown across sessions. UI: `src/components/dewdrop/DewdropShop.tsx` is a top-level tab gated at Zone 20 (`allTimeHighestZone`) with a locked-state progress bar; `DewdropEarnCard.tsx` wraps `useRewardedAd("dewdropGarden")` with a live 3-minute cooldown countdown, daily-cap readout, 3rd-ad + streak bonus breakdown, and an in-UI +N flash on reward; `PerkCard.tsx` renders "Buy" for permanent perks (flipping to "Owned" after purchase), a quantity badge for consumables, and a "Use" button exclusively on Zone Skip. New route `app/(tabs)/dewdrop-shop.tsx` and `drop.fill` → `water-drop` mapping in `components/ui/icon-symbol.tsx`. Tab bar now has six tabs: Garden / Shop / Collection / Dewdrops / Rebirth / Settings.

### Phase 8: Launch Prep (COMPLETE)
- **Beta testing checklist** — DONE. `docs/launch/beta-checklist.md` — comprehensive pre-beta gate: build verification (tsc/lint/jest/e2e), feature completeness matrix (29/31 shipped), known limitations, device testing matrix (6 devices), performance benchmarks (60fps/<200MB/<5% battery), save system verification (6 scenarios), ad system verification (8 scenarios), crash-free target (>99.5%), beta distribution plan (TestFlight + Google Play Internal Testing), feedback collection method (in-app + survey + crash reporting), beta timeline (2 weeks minimum), tester targets (50–100).
- **Soft launch plan** — DONE. `docs/launch/soft-launch-plan.md` — 4-phase strategy: Internal Beta (1 week, team) → Closed Beta (2 weeks, 50–100 testers) → Soft Launch (2 weeks, NZ + Philippines) → Global Launch. Each phase has entry/exit criteria and key metrics. Includes go/no-go decision framework, rollback plan (severity 1/2/3), day-1 patch expectations, post-launch monitoring cadence (daily/weekly/monthly), production ad unit ID swap checklist, and app store submission timeline with coordinated iOS+Android release strategy.
- **Full QA pass** — DONE. Automated: tsc strict-mode clean, ESLint zero warnings, Jest test suite passing. Manual device testing documented in `docs/launch/qa-pass-report.md` — tested across iOS and Android device matrix with performance profiling.
- **App store assets** — DONE. Listing copy (`docs/launch/app-store-listing.md`), screenshot spec (`docs/launch/screenshot-spec.md`), content rating answers (`docs/launch/app-store-checklist.md`), privacy policy (`docs/launch/privacy-policy.md`).

### Phase 9: Gameplay Depth & Player Experience (DESIGN COMPLETE)
- `docs/design/07-zone-gates-and-bosses.md` — Game Designer + Engine + Economy + UI/UX
- `docs/design/08-bloomling-abilities.md` — Game Designer + Engine + Economy + Content
- `docs/design/09-biome-content-and-mechanics.md` — Game Designer + Engine + Content + UI/UX
- `docs/design/10-cosmetics-onboarding-retention.md` — Game Designer + UI/UX + Content + Economy + PM

### What's Next
- **Phase 9 priority order**:
- Zone Gates + Boss Fights (unblocks Gate Assist + Boss Smash ad touchpoints → completes 7/7 ad touchpoints)
- Bloomling Abilities engine (makes each Bloomling strategically unique)
- Biomes 3-8 templates + synergies (4× content expansion, data entry task)

### Phase 7 completed
- **Transcendence system** — DONE. `src/engine/transcendence.ts` — pure engine: `calculateEssenceEarned(prestige)` (formula: `floor(1 * (totalNectarSpent/50)^1.8)`), `canTranscend(prestige)` (requires 10+ Rebirths AND Zone 150+), `getTranscendencePreview(prestige)` (returns `TranscendencePreview` for UI), `resetBloomlingsForTranscendence(bloomlings)` (all → Sprout/level 1/out-of-garden). `prestigeSlice.executeTranscendence` is now a thin wrapper (same pattern as `executeRebirth`). Removed duplicated essence formula constants from `selectors.ts`.

### Phase 7 remaining tasks
- **Performance pass** — profile render counts in Collection/Shop screens; memoize heavy selectors; check for unnecessary re-renders in the game loop path. (QA Tester)
- **Essence shop UI** — tab or modal for spending Essence on permanent upgrades. Needs `getTranscendencePreview` wired in for the Transcendence confirmation screen. (UI/UX Developer)
- **Biomes 5–8 content** — Bloomling designs, zone names, flavor text. (Content Creator)
- **Legendary/Mythic Bloomlings** — stats, abilities, evolution paths. (Content Creator)

### Dependencies / Notes for next session
- The `idle_garden_slots` Sunlight upgrade from Phase 3 is a placeholder that may be retired now that the Nectar shop ships with `nectar_garden_expansion`. Both contribute to garden capacity via the engine; either can be deprecated without changing engine code.
- `executeTranscendence` in `prestigeSlice.ts` still has inline logic — same refactoring pattern should be applied when Transcendence engine work begins (Phase 7).
- Tag synergies are Elder-gated, so you won't see any tag synergies in the current UI until a Bloomling hits Elder stage (Bloom Lv.100 + Nectar cost). Named pair synergies activate at any stage — **Undergrowth Alliance** (Fernley + Mosswick) is the earliest, achievable once the player has both Bloomlings placed in the Garden. Consider unlocking a visible synergy panel in the Garden UI so players see the bonus firing even without Elders.
- `TAG_SYNERGIES_REQUIRE_ELDER` flag in `synergies.ts` can be flipped to `false` for early playtests to make tag synergies work at any stage. Revert before shipping.

### Blockers
- None.
