# Bloomlings — Current Status

> Updated every work session. Read this first to know where things stand.

## Current Phase
**Phase 1: Foundation** — COMPLETE
**Phase 2: Core Engine** — IN PROGRESS (Economy 50%, Engine 43%)

## Completed Work

### Workstream A: Engine Developer — Project Scaffolding (Tasks 1-3 DONE)
1. `docs/engine/01-scaffold-plan.md` — DONE — Expo SDK 54, full dependency list, folder structure
2. Scaffold executed — DONE — Expo project boots, `npx tsc --noEmit` passes, all deps installed
3. `src/types/game.ts` — DONE — 694 lines, 10 enums, 21 interfaces, 3 computed types, zero `any`

### Workstream B: Economy Balancer — Balance Sheets (Tasks 1-3 DONE)
1. `docs/economy/01-currency-rates.md` — DONE — Tap/idle rates, combo math, crit scaling, active:idle ratios
2. `docs/economy/02-upgrade-costs.md` — DONE — 12 upgrades with full cost tables, evolution costs, Buy-Max formula
3. `docs/economy/03-bloomling-stats.md` — DONE — All rarity production tables, synergy verification, Garden examples

## Remaining Work

### Economy Balancer Tasks 4-6
4. `docs/economy/04-prestige-math.md` — NOT STARTED — Nectar/Essence formulas, optimal reset points
5. `docs/economy/05-ad-reward-values.md` — NOT STARTED — Exact rewards per ad touchpoint
6. `docs/economy/06-pacing-sheet.md` — NOT STARTED — Full player timeline, dead zone check

### Engine Developer Tasks 4-7
4. `src/state/store.ts` — NOT STARTED — Zustand store with slices and actions
5. `src/engine/gameLoop.ts` — NOT STARTED — Delta-time tick system
6. `src/engine/tapSystem.ts` — NOT STARTED — Taps, combos, crits
7. `src/services/saveManager.ts` — NOT STARTED — MMKV save/load

## Blockers
None.

## Dependencies
- Engine Task 4 (store) depends on Engine Task 3 (types) — RESOLVED
- Engine Tasks 5-7 depend on Engine Task 4 (store) — WAITING
- Engine Tasks 5-6 benefit from Economy Tasks 1-3 for exact constants — AVAILABLE
- Economy Tasks 4-6 depend on Economy Tasks 1-3 — RESOLVED

## Next Actions
1. **Economy Balancer**: Tasks 4-6 (prestige math, ad values, pacing sheet)
2. **Engine Developer**: Tasks 4-7 (store, game loop, tap system, save/load)
3. **Content Creator**: Can begin Bloomling species design (no code dependency)
