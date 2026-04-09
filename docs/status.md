# Bloomlings — Current Status

> Updated every work session. Read this first to know where things stand.

## Current Phase
**Phase 1: Foundation** (50% complete) + **Phase 2: Economy** (starting in parallel)

## Active Workstreams

### Workstream A: Engine Developer — Project Scaffolding
**Status**: NOT STARTED
**Tasks** (each saves to its own file):
1. `docs/engine/01-scaffold-plan.md` — Expo project init, dependency list, folder structure
2. `src/types/game.ts` — All TypeScript interfaces
3. Verify build runs on iOS + Android sim

### Workstream B: Economy Balancer — Balance Sheets
**Status**: NOT STARTED
**Tasks** (each saves to its own file):
1. `docs/economy/01-currency-rates.md` — Production rates, tap values, idle rates at milestones
2. `docs/economy/02-upgrade-costs.md` — All upgrade cost curves with formulas and tables
3. `docs/economy/03-bloomling-stats.md` — Per-rarity base stats, per-level scaling, evolution multipliers
4. `docs/economy/04-prestige-math.md` — Nectar formula tuning, Essence formula tuning, optimal reset points
5. `docs/economy/05-ad-reward-values.md` — Exact reward per touchpoint at progression milestones
6. `docs/economy/06-pacing-sheet.md` — Expected player state at 1hr, 4hr, 1day, 3day, 1week, 2week

## Blockers
None currently.

## Recent Decisions
- Economy Balancer and Engine Developer work in parallel (no dependency between them until `calculations.ts`)
- All work broken into sections saved as individual MD files for token resilience

## Next Up After Current Workstreams
- Engine Developer implements game loop using Economy Balancer's numbers
- Content Creator begins Bloomling species design (can start anytime, no code dependency)
