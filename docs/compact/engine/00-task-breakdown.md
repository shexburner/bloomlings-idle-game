<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->
<!-- Source: docs/engine/00-task-breakdown.md -->

# Engine Developer — Task Breakdown (Compact Context)

> Auto-generated from the canonical source file. Edit the source markdown, then regenerate compact docs.

## Quick Map
- Task 1: Scaffold Plan (`01-scaffold-plan.md`)
- Task 2: Execute Scaffold (code)
- Task 3: TypeScript Type Definitions (`src/types/game.ts`)
- Task 4: Zustand Store Setup (`src/state/store.ts`)
- Task 5: Game Loop (`src/engine/gameLoop.ts`)
- Task 6: Tap System (`src/engine/tapSystem.ts`)
- Task 7: Save/Load System (`src/services/saveManager.ts`)
- Notes

## Key Points
### Task 1: Scaffold Plan (`01-scaffold-plan.md`)
- Expo project init command
- Full dependency list with versions and reasons
- `tsconfig.json` configuration (strict mode)
- Complete folder structure tree

### Task 2: Execute Scaffold (code)
- Initialized Expo project
- All dependencies installed
- Folder structure created
- App boots on simulator (or at minimum `npx expo start` works)

### Task 3: TypeScript Type Definitions (`src/types/game.ts`)
- `GameState` — full state shape
- `Bloomling` — all attributes
- `Upgrade` — tap/idle/prestige upgrades
- `Perk` — Dewdrop shop items

### Task 4: Zustand Store Setup (`src/state/store.ts`)
- Store creation with TypeScript types
- Slices: resources, bloomlings, upgrades, prestige, settings, ads
- Initial default state
- Basic actions: addSunlight, spendSunlight, levelUpBloomling

### Task 5: Game Loop (`src/engine/gameLoop.ts`)
- Delta-time based tick function
- Hook into React Native lifecycle (app active/background/foreground)
- Idle Sunlight accumulation per tick
- Integration with Zustand store

### Task 6: Tap System (`src/engine/tapSystem.ts`)
- Tap handler function
- Combo tracking (1.5s window, 0.05 per hit, cap at 100)
- Critical tap roll (5% base, configurable)
- Tap reward calculation (pure function)

### Task 7: Save/Load System (`src/services/saveManager.ts`)
- Save to MMKV (serialized GameState)
- Load from MMKV with validation
- Auto-save every 30 seconds
- Save on app background

### Notes
- Tasks 5, 6, and 7 can run in parallel (all depend on Task 4, not on each other)
- Economy Balancer outputs feed into Tasks 4-6 for exact constants
- After Task 7, we have a playable (but ugly) engine — Phase 2 complete
