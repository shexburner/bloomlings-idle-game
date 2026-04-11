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
- What's Next: Phase 4 remaining engine tasks
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

### What's Next: Phase 4 remaining engine tasks
- **Rebirth system** (`src/engine/rebirth.ts`) — Pull existing reset logic out of `prestigeSlice.executeRebirth` into a pure engine module. Add `calculateNectarEarned`, `getRebirthPreview`, `canRebirth`. Respect Bloom/Elder Retention and Seasonal Memory Nectar upgrades once the Nectar shop ships. Input: `docs/economy/04-prestige-math.md`, `docs/design/04-prestige-systems.md`.
- **Nectar shop + Rebirth UI** (`src/components/prestige/`) — `RebirthScreen`, `NectarShop`, `NectarUpgradeCard`. Wire feature-gating at Zone 40. Adds the real `nectar_garden_expansion` upgrade template (engine already reads it).

### Dependencies / Notes for next session
- The `idle_garden_slots` Sunlight upgrade from Phase 3 is a placeholder that will likely be retired once the Nectar shop ships with `nectar_garden_expansion`. Until then, both contribute to capacity; either can be deprecated in Task 5 without changing engine code.
- `src/state/slices/prestigeSlice.ts` still contains the rebirth/transcendence reset logic inline. Task 4 should extract it into `src/engine/rebirth.ts` as pure transformers and leave the slice as a thin wrapper — same pattern the evolution and garden tasks followed.
- `prestigeSlice.executeRebirth` should zero out `stats.discoveredSynergyIds` / `synergiesDiscovered`? Design call: synergy discoveries are lifetime-persistent (they're meta-progression, like achievements), so keep them across Rebirth and Transcendence. Task 4 should NOT reset them.
- Tag synergies are Elder-gated, so you won't see any tag synergies in the current UI until a Bloomling hits Elder stage (Bloom Lv.100 + Nectar cost). Named pair synergies activate at any stage — **Undergrowth Alliance** (Fernley + Mosswick) is the earliest, achievable once the player has both Bloomlings placed in the Garden. Consider unlocking a visible synergy panel in the Garden UI so players see the bonus firing even without Elders.

### Blockers
- None.
