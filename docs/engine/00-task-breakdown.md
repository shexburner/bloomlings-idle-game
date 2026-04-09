# Engine Developer — Task Breakdown

> Each task produces working code or a plan saved to a specific file.
> Read `docs/design/` for game design context.

## Task 1: Scaffold Plan (`01-scaffold-plan.md`)
**Objective**: Document exactly what gets installed and how the project is structured, BEFORE running any commands.
**Deliver**:
- Expo project init command
- Full dependency list with versions and reasons
- `tsconfig.json` configuration (strict mode)
- Complete folder structure tree
- ESLint / Prettier config decisions
- Which Expo SDK version and why
**Status**: NOT STARTED

## Task 2: Execute Scaffold (code)
**Objective**: Run the scaffold plan. Working app that builds.
**Deliver**:
- Initialized Expo project
- All dependencies installed
- Folder structure created
- App boots on simulator (or at minimum `npx expo start` works)
- Commit: "Scaffold Expo project with dependencies"
**Depends on**: Task 1
**Status**: NOT STARTED

## Task 3: TypeScript Type Definitions (`src/types/game.ts`)
**Objective**: Define every interface and type the game needs.
**Deliver**:
- `GameState` — full state shape
- `Bloomling` — all attributes
- `Upgrade` — tap/idle/prestige upgrades
- `Perk` — Dewdrop shop items
- `Biome` — zone grouping
- `Zone` — individual zone
- `Achievement` — achievement tracking
- `SaveData` — serializable save format
- `AdReward` — ad touchpoint definitions
- All enums: `Rarity`, `EvolutionStage`, `BiomeType`, `UpgradeType`, `AbilityType`
**Input**: `docs/design/01-06`, `docs/economy/03-bloomling-stats.md` (when available)
**Depends on**: Task 2
**Status**: NOT STARTED

## Task 4: Zustand Store Setup (`src/state/store.ts`)
**Objective**: Create the Zustand store with initial state and slice structure.
**Deliver**:
- Store creation with TypeScript types
- Slices: resources, bloomlings, upgrades, prestige, settings, ads
- Initial default state
- Basic actions: addSunlight, spendSunlight, levelUpBloomling
- Selector functions for computed values
**Input**: Task 3 (types), `docs/economy/01-currency-rates.md` (when available)
**Depends on**: Task 3
**Status**: NOT STARTED

## Task 5: Game Loop (`src/engine/gameLoop.ts`)
**Objective**: Core tick system that drives idle production.
**Deliver**:
- Delta-time based tick function
- Hook into React Native lifecycle (app active/background/foreground)
- Idle Sunlight accumulation per tick
- Integration with Zustand store
- Performance: no unnecessary re-renders
**Depends on**: Task 4
**Status**: NOT STARTED

## Task 6: Tap System (`src/engine/tapSystem.ts`)
**Objective**: Tap handling with combo and crit mechanics.
**Deliver**:
- Tap handler function
- Combo tracking (1.5s window, 0.05 per hit, cap at 100)
- Critical tap roll (5% base, configurable)
- Tap reward calculation (pure function)
- Anti-autoclicker (20 taps/sec cap)
**Input**: `docs/economy/01-currency-rates.md`
**Depends on**: Task 4
**Status**: NOT STARTED

## Task 7: Save/Load System (`src/services/saveManager.ts`)
**Objective**: Persistent game state with MMKV.
**Deliver**:
- Save to MMKV (serialized GameState)
- Load from MMKV with validation
- Auto-save every 30 seconds
- Save on app background
- Save versioning (version number in save data)
- Migration stub (v1 -> v2 pattern)
- Export/import as base64 string
**Depends on**: Task 4
**Status**: NOT STARTED

## Notes
- Tasks 5, 6, and 7 can run in parallel (all depend on Task 4, not on each other)
- Economy Balancer outputs feed into Tasks 4-6 for exact constants
- After Task 7, we have a playable (but ugly) engine — Phase 2 complete
