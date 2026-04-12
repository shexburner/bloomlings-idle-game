# Bloomlings — Current Status

> Updated every work session. Read this first to know where things stand.

## Current Phase
**Phase 1: Foundation** — COMPLETE
**Phase 2: Core Engine** — COMPLETE
**Phase 3: Content & UI** — COMPLETE
**Phase 4: Progression Systems** — COMPLETE (5 / 5 tasks done)

## Completed Work

### Phase 1-2 (Foundation + Engine)
- Expo SDK 54 scaffold, all dependencies, TypeScript strict
- 694-line type definitions (10 enums, 21 interfaces)
- Zustand store with 6 slices + MetaSlice + selectors
- Game loop (delta-time, offline progress, AppState handling)
- Tap system (combo, crits, anti-autoclicker)
- Save/load (MMKV, auto-save, export/import)
- Economy balance sheets (6 docs: rates, costs, stats, prestige, ads, pacing)

### Phase 3: Content & UI (ALL DONE)

**Content Creator (4/4 tasks):**
1. `docs/content/01-biome1-bloomlings.md` — 4 Bloomlings (Fernley, Mosswick, Petaline, Thornwick) + 3 synergies
2. `docs/content/02-biome2-bloomlings.md` — 4 Bloomlings (Solara, Dapplebark, Honeyveil, Briarthorn) + 3 synergies + 2 cross-biome
3. `docs/content/03-upgrades-flavor.md` — 31 upgrades with flavor text (6 tap, 6 idle, 10 Nectar, 9 Essence)
4. `docs/content/04-achievements.md` — 36 achievements (8 Growth, 9 Power, 7 Journey, 6 Rebirth, 6 Hidden)

**UI/UX Developer (4/4 tasks):**
1. Navigation: Expo Router with 4-tab dark theme layout, game loop + auto-save wired in root layout
2. Garden screen: CurrencyBar, TapArea, TapFeedback (pool of 8 animated labels), ComboMeter (glow at 50+), ZoneProgress, BloomlingDisplay
3. Shop screen: ShopScreen (tab-based), UpgradeCard (affordability states), BuyMultiplierToggle (x1/x10/x25/x100/Max)
4. Collection: CollectionGrid (3-column FlatList), BloomlingCard (rarity borders), BloomlingDetail (modal with lore/stats/evolution/synergy), ZoneInfo (expandable panel), BloomlingTemplates data file (8 Bloomlings)

### Phase 4: Progression Systems (IN PROGRESS)

**Engine Developer:**
1. **Evolution system** — DONE. `src/engine/evolution.ts` — `canEvolve`, `getEvolutionCost`, `evolveBloomling`, `getNextEvolutionStage`. Sprout→Bloom and Bloom→Elder cost tables (Sunlight + Nectar) sourced from `docs/economy/02-upgrade-costs.md`. `bloomlingSlice.evolveBloomling` wires the engine to the store, deducts costs, and applies the transformation.
2. **Garden management** — DONE. `src/engine/garden.ts` — `getMaxGardenSlots`, `computeGardenSlotBreakdown`, `canAddToGarden`/`validateAddToGarden`, `placeBloomlingInSlot`, `removeBloomlingFromGarden`, `applyCapacityChange`, `getGardenBloomlings`. Slot sources: base 1 + zone unlocks at 5/15/30 + upgrade levels (`idle_garden_slots`, `nectar_garden_expansion`, `essence_eternal_garden`) + `dewdrop_bonus_slot` perk, hard-capped at 9. `bloomlingSlice` delegates all garden mutations to the engine and exposes `syncGardenCapacity()`, which is auto-called from `advanceZone`, `buyUpgrade`/`setUpgradeLevel` (for slot upgrades), `executeRebirth`, and `executeTranscendence` so capacity stays in sync with progression, purchases, and prestige resets.
3. **Synergy system** — DONE. `src/engine/synergies.ts` — pure engine: `getTagSynergyMultiplier` (tier table: 2→1.15, 3→1.35, 4+→1.60), `findActiveTagSynergies` (Elder-only gate controlled by `TAG_SYNERGIES_REQUIRE_ELDER`), `findActiveNamedSynergies`, `calculateActiveSynergies` (combines both, returns per-Bloomling production and tap-value multipliers with multiplicative stacking), `reconcileSynergyDiscovery` (computes newly-discovered IDs for Dewdrop rewards). `NAMED_SYNERGIES` registry holds all 8 pair synergies sourced from `docs/content/01-biome1-bloomlings.md` + `02-biome2-bloomlings.md`: Undergrowth Alliance, Bloom and Briar, Cradle Guard (+10% tap value — the one non-production synergy), Golden Canopy, Nectar and Thorn, Meadow Chorus, Thorned Pact, First Light. Synergy IDs: `tag:<Name>` for tag synergies, `synergy_<name>` for named. Wiring: `totalSunlightPerSecondFromRegistry` in `selectors.ts` pulls base production from `BLOOMLING_TEMPLATE_MAP` and applies synergy multipliers — the game loop now calls this instead of the `Simple` placeholder. `bloomlingSlice.recomputeActiveSynergies()` writes `garden.activeSynergyIds` and folds new activations into `stats.discoveredSynergyIds` + `stats.synergiesDiscovered`; auto-called from `addToGarden`, `removeFromGarden`, `removeBloomling`, `evolveBloomling`, and `syncGardenCapacity`. New type field: `GameStats.discoveredSynergyIds: string[]`.

4. **Rebirth system** — DONE. `src/engine/rebirth.ts` — pure engine: `calculateNectarEarned` (tuned constants: threshold=32, exponent=3.1 from economy doc, with Nectar Roots bonus multiplier), `canRebirth` (zone 40+ and ≥1 Nectar), `getRebirthPreview` (Nectar earned, percentage increase, recommended flag, push-further projections), `getRetainedEvolutionStage` (Bloom/Elder Retention Nectar upgrades), `getStartingZone` (Seasonal Memory: Lv.1→Zone 5, Lv.2→10, Lv.3→15, Lv.4→20), `getStartingComboCount` (Combo Memory: start at 10), `resetBloomlingsForRebirth` (level→1, stage respects retention, clears garden placement), `filterUpgradesForRebirth` (keeps Nectar + Essence upgrades, discards Tap + Idle). `NECTAR_UPGRADE_IDS` (10 IDs) and `ESSENCE_UPGRADE_IDS` (9 IDs) exported as constants for category filtering. `prestigeSlice.executeRebirth` refactored to thin wrapper calling all engine functions. Fixed bugs: old code zeroed Essence on Rebirth and wiped all upgrades (including Nectar/Essence). `selectors.ts` Nectar formula updated to use tuned constants from engine (was using design-doc defaults: threshold=40, exponent=2.2). `stats.discoveredSynergyIds` confirmed NOT reset on Rebirth — lifetime meta-progression.

5. **Nectar shop + Rebirth UI** — DONE. `src/components/prestige/RebirthScreen.tsx` — main prestige screen with two tabs: Rebirth (preview + action) and Nectar Shop. `RebirthPanel` shows season number, current run highest zone, Nectar preview (earned, percentage increase, recommended badge), push-further projections (+5/10/15/20 zones), two-step confirmation, and reset/keep info panel. `NectarShop` defines all 10 Nectar upgrade templates (`enriched_soil`, `stronger_roots`, `rapid_growth`, `seasonal_memory`, `nectar_roots`, `nectar_garden_expansion`, `combo_memory`, `deep_roots`, `bloom_retention`, `elder_retention`) with costs approximating the design doc sequences via `baseCost * costScaling^level`. `NectarUpgradeCard` adapts the Sunlight `UpgradeCard` pattern for Nectar currency (purple theme, ✧ icon, `spendNectar` instead of `spendSunlight`, bulk buy with `BuyMultiplierToggle`). Feature-gated: `allTimeHighestZone >= 40` unlocks the full screen; below that, a locked state shows progress toward Zone 40. New Rebirth tab added to `app/(tabs)/_layout.tsx` with `arrow.2.circlepath` / `autorenew` icon. Route: `app/(tabs)/rebirth.tsx`.

## What's Next: Phase 5 — Monetization

See `docs/roadmap.md` Phase 5 for the full task list: AdMob integration, 7 ad touchpoints, Dewdrop shop, offline progress.

### Dependencies / Notes for next session
- The `idle_garden_slots` Sunlight upgrade from Phase 3 is a placeholder that may be retired now that the Nectar shop ships with `nectar_garden_expansion`. Both contribute to garden capacity via the engine; either can be deprecated without changing engine code.
- `executeTranscendence` in `prestigeSlice.ts` still has inline logic — same refactoring pattern should be applied when Transcendence engine work begins (Phase 7).
- Tag synergies are Elder-gated, so you won't see any tag synergies in the current UI until a Bloomling hits Elder stage (Bloom Lv.100 + Nectar cost). Named pair synergies activate at any stage — **Undergrowth Alliance** (Fernley + Mosswick) is the earliest, achievable once the player has both Bloomlings placed in the Garden. Consider unlocking a visible synergy panel in the Garden UI so players see the bonus firing even without Elders.
- `TAG_SYNERGIES_REQUIRE_ELDER` flag in `synergies.ts` can be flipped to `false` for early playtests to make tag synergies work at any stage. Revert before shipping.
- The `synergies: Record<string, Synergy>` field on `GameState` is still a stale placeholder (initialized to `{}` at store init and never written). The engine now uses `stats.discoveredSynergyIds` instead; that field can be removed when we do a cleanup pass, or repurposed for persisted per-synergy metadata if needed.

## Blockers
None.
