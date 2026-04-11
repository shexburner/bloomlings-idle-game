# Bloomlings Idle Game — Session Context

> This file is a living document. It is updated after every significant conversation to preserve context across sessions.

## Last Updated
2026-04-11

## Project Overview

**Bloomlings** is a mobile idle/incremental game for **Android and iOS**. It merges mechanics from three inspirations:

- **Tap Hero** — Active tap-based gameplay loops
- **Slime Castle** — Ad-based unique currency system, creature progression
- **Trimps** — Deep idle/incremental progression, prestige layers, long-term strategy

### Core Theme
Living, conscious plant creatures called **Bloomlings**. Each Bloomling has a unique backstory, personality, and lore. They are not just collectibles — they are characters the player bonds with.

### Monetization Philosophy
- **Zero forced ads.** No interstitials, no unskippable ads. Ever.
- Players **voluntarily opt in** to watch ads for:
  - Temporary bonuses (speed boosts, multipliers, etc.)
  - A **unique ad-only currency** (working name: "Dewdrops") that can be exchanged for exclusive perks, cosmetics, or unlocks
- The goal: make ad-watching feel **rewarding, not punishing**. Players should *want* to watch ads because the value proposition is clear and generous.

### Tech Stack
- **React Native + Expo** — Cross-platform mobile (iOS + Android)
- **TypeScript** — Type safety across the entire codebase
- **Zustand** — Lightweight state management for game state
- **React Native Reanimated** — Smooth animations for tap feedback, Bloomling idle animations
- **MMKV / AsyncStorage** — Fast local save/load
- **react-native-google-mobile-ads** — AdMob integration for rewarded ads
- **Expo Router** — Navigation

### Key Design Pillars
1. **Addictive core loop** — Tap to grow, idle to progress, prestige to ascend
2. **Emotional attachment** — Bloomlings have names, stories, personalities
3. **Generous ad economy** — Watching ads feels like a smart choice, not a tax
4. **Deep progression** — Multiple prestige layers, unlockable biomes, evolution paths
5. **Beautiful and tactile** — Satisfying tap feedback, lush visuals, ambient sound

## Personas Created
1. Game Designer (`game-designer.md`)
2. Economy Balancer (`economy-balancer.md`)
3. UI/UX Developer (`ui-ux-developer.md`)
4. Engine Developer (`engine-developer.md`)
5. Content Creator (`content-creator.md`)
6. QA Tester (`qa-tester.md`)
7. Project Manager (`project-manager.md`)

## Game Design Document (Complete)
Located in `docs/design/`, split into 6 sections:

1. **`01-core-game-loop.md`** — Tap system (combo, crits, anti-autoclicker), idle production, active vs idle ratios, 4 currencies (Sunlight/Nectar/Essence/Dewdrops), feature unlock timeline
2. **`02-bloomling-mechanics.md`** — Leveling (1.10x cost scaling), 3-stage evolution (Sprout/Bloom/Elder), Garden roster (1-8 slots), synergy tag system, 6 ability types, rarity tiers (Common through Mythic)
3. **`03-zone-progression.md`** — Zone threshold scaling (1.12x per zone), gate zones every 5th, 4 biomes (Mossy Cradle/Sunlit Glade/Twilight Hollow/Crystal Caverns), biome bosses with HP bars and failure stacking
4. **`04-prestige-systems.md`** — Rebirth (resets Sunlight/zones, earns Nectar, ~2-4hr first run), Transcendence (resets Nectar, earns Essence, ~1-2 weeks), nested loop structure
5. **`05-ad-economy.md`** — 7 ad touchpoints (Sunbeam Boost, Double Offline, Dewdrop Garden, Lucky Sprout, Gate Assist, Boss Smash, Combo Keeper), Dewdrop shop (cosmetics, QoL, exclusive Bloomlings), daily cap of 15 ads
6. **`06-retention-hooks.md`** — 7-day login cycle (no punishment for missing), streak system with grace period, achievements (5 categories + hidden), local notifications (max 2/day), "just one more" psychology hooks

## Decisions Made
- Tech stack: React Native + Expo + TypeScript (chosen for cross-platform mobile support, strong ecosystem, easy ad SDK integration)
- Ad currency working name: "Dewdrops"
- No forced ads — all ad viewing is voluntary
- Bloomlings are conscious plant creatures with individual backstories
- 3 currencies: Sunlight (primary), Nectar (prestige 1), Essence (prestige 2), Dewdrops (ad-only)
- Zone scaling: 1.12x per zone, base threshold 50
- Evolution: 3 stages (Sprout -> Bloom -> Elder), level resets on evolution
- Garden: limited active slots (1-8), forces team composition decisions
- Synergy tags activate when 2+ matching Bloomlings in Garden
- 4 biomes at launch, 4+ more post-Transcendence
- Rebirth unlocks at Zone 40, first viable at ~Zone 50
- Transcendence unlocks after 10+ Rebirths and Zone 150+
- 7 distinct ad touchpoints, all voluntary, daily cap 15 ads
- Streak system with 1-day grace period
- No punishment for missing daily login

## Open Questions
- Specific Bloomling species and full lore (Content Creator will develop)
- Exact economy balance numbers and tuning (Economy Balancer will develop)
- Visual style / art direction / screen layouts (UI/UX Developer will develop)
- Sound design and ambient audio
- Detailed content for Biomes 5-8 (post-Transcendence)
- Seasonal event structure
- Save file format and migration strategy (Engine Developer will develop)

## Session Log
### Session 1 — 2026-04-08
- Established project concept and core pillars
- Chose tech stack (React Native + Expo + TypeScript)
- Created 6 agent personas
- Created this session context file

### Session 2 — 2026-04-09
- Completed full game design document (6 sections)
- Designed core game loop: tap system with combos and crits, idle production, 4 currencies
- Designed Bloomling mechanics: leveling, 3-stage evolution, Garden roster, synergies, abilities, rarities
- Designed zone/biome progression: 4 biomes, gate zones, biome bosses
- Designed 2-layer prestige: Rebirth (Nectar) and Transcendence (Essence)
- Designed ad economy: 7 touchpoints, Dewdrop shop, monetization philosophy
- Designed retention: dailies, streaks, achievements, notifications, "just one more" hooks
- Added Project Manager persona
- Created roadmap.md, status.md, and task breakdowns for Economy + Engine
- **Economy Balancer Tasks 1-3 COMPLETE**: currency rates, upgrade costs (12 upgrades), Bloomling stats (all rarities, synergy math verified)
- **Engine Developer Tasks 1-3 COMPLETE**: Expo SDK 54 scaffold (boots clean, tsc passes), 694-line type definitions (10 enums, 21 interfaces, 3 computed types)
- Phase 1 Foundation: COMPLETE
- Phase 2 Core Engine: IN PROGRESS
- **Economy Balancer Tasks 4-6 COMPLETE**: prestige math tuned (Nectar/Essence formulas, optimal reset analysis), ad reward values at all progression stages, full pacing sheet with 2 dead zones identified and fixes proposed
- **Engine Developer Tasks 4-7 COMPLETE**: Zustand store with 6 slices + MetaSlice + selectors, delta-time game loop with offline progress, tap system with combo/crits/anti-autoclicker, MMKV save/load with auto-save and export/import
- Phase 2 Core Engine: COMPLETE
- **Content Creator Tasks 1-4 COMPLETE**: 8 Bloomlings across Biomes 1-2 with full lore/abilities/synergies, 31 upgrades with flavor text, 36 achievements across 5 categories
- **UI/UX Developer Tasks 1-4 COMPLETE**: 4-tab dark theme navigation, Garden screen (CurrencyBar, TapArea, TapFeedback, ComboMeter, ZoneProgress, BloomlingDisplay), Shop screen (UpgradeCard, BuyMultiplierToggle), Collection (3-col grid, BloomlingDetail modal, ZoneInfo panel), BloomlingTemplates data file
- Phase 3 Content & UI: COMPLETE
- Ready for Phase 4: Progression Systems

### Session 3 — 2026-04-11
- PM persona continued Phase 4 progression work.
- Confirmed **Phase 4 Task 1 (Evolution System)** was already delivered in commit `5990b23`: `src/engine/evolution.ts` provides `canEvolve`, `getEvolutionCost`, `evolveBloomling`, `getNextEvolutionStage`, with Sprout→Bloom and Bloom→Elder cost tables from the economy doc. `bloomlingSlice.evolveBloomling` wires the engine to state.
- **Phase 4 Task 2 (Garden Management) COMPLETE.** New `src/engine/garden.ts` exposes pure functions: `getMaxGardenSlots`, `computeGardenSlotBreakdown`, `canAddToGarden`/`validateAddToGarden`, `placeBloomlingInSlot`, `removeBloomlingFromGarden`, `applyCapacityChange`, `getGardenBloomlings`, plus constants (`BASE_GARDEN_SLOTS=1`, zone thresholds `[5, 15, 30]`, `GARDEN_SLOT_HARD_CAP=9`, upgrade IDs, Dewdrop perk ID). `bloomlingSlice` now delegates all garden mutations to the engine and exposes `syncGardenCapacity()`, wired into `advanceZone`, `buyUpgrade`/`setUpgradeLevel` (slot upgrades only), `executeRebirth`, and `executeTranscendence`. The old dangling `idle_garden_slots` Sunlight upgrade now actually increases capacity. `tsc -p` clean, `expo lint` 0 errors.
- **Root README.md rewritten** earlier in this session: replaced the stock `create-expo-app` boilerplate with a Bloomlings overview, tech stack, getting-started commands, project-structure tree, and a Documentation section documenting the compact-docs workflow (`npm run docs:compact` → `python3 docs/build_compact_docs.py`). Links to `docs/compact/README.md` for the full source → compact file map.
- **Phase 4 Task 3 (Synergy System) COMPLETE.** New `src/engine/synergies.ts` — pure engine with tier table (2→1.15, 3→1.35, 4+→1.60, Elder-gated via `TAG_SYNERGIES_REQUIRE_ELDER=true`), `NAMED_SYNERGIES` registry (8 pairs from content docs: Undergrowth Alliance, Bloom and Briar, Cradle Guard — tap-value bonus, Golden Canopy, Nectar and Thorn, Meadow Chorus, Thorned Pact, First Light), `calculateActiveSynergies` returns per-instance production + tap-value multipliers (multiplicative stacking), `reconcileSynergyDiscovery` returns newly-discovered IDs. Synergy ID scheme: `tag:<Name>` and `synergy_<name>`. **Production wired**: new `totalSunlightPerSecondFromRegistry` selector pulls base production from `BLOOMLING_TEMPLATE_MAP` and applies synergy multipliers; game loop and offline progress calc both use it now (replacing the `Simple` placeholder). **State wired**: `bloomlingSlice.recomputeActiveSynergies()` writes `garden.activeSynergyIds` and folds new activations into `stats.discoveredSynergyIds` / `stats.synergiesDiscovered` (new `GameStats.discoveredSynergyIds: string[]` field). Auto-called from `addToGarden`, `removeFromGarden`, `removeBloomling`, `evolveBloomling`, `syncGardenCapacity`. `tsc -p` clean, `expo lint` 0 errors.
- User asked about building an APK mid-session. Concluded I can't deliver one from this sandbox (no Android SDK, no file-transfer channel) and recommended EAS Build cloud path or local Android Studio. User opted to keep pushing on development instead.
- **Phase 4 is now 3 / 5 engine tasks done.**
- **Next up: Phase 4 Task 4 (Rebirth)** — extract inline reset logic from `prestigeSlice.executeRebirth` into `src/engine/rebirth.ts` (pure transformers), add `calculateNectarEarned`/`getRebirthPreview`/`canRebirth`. Follow the same pattern as evolution/garden. IMPORTANT: do NOT reset `stats.discoveredSynergyIds` / `synergiesDiscovered` on rebirth — synergy discoveries are lifetime meta-progression.
- Phase 4 Task 5 (Nectar Shop UI) should add the real `nectar_garden_expansion` upgrade template so the Nectar upgrade path replaces the Phase 3 `idle_garden_slots` placeholder. Also consider adding a Garden-screen synergy panel so players see active pair bonuses (Elder-gated tag synergies won't be visible until much later).
- Stale state field: `GameState.synergies: Record<string, Synergy>` is still an empty placeholder never written to. Safe to delete in a cleanup pass; the engine now uses `stats.discoveredSynergyIds` for discovery tracking.
