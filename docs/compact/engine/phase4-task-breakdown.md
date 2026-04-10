<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->
<!-- Source: docs/engine/phase4-task-breakdown.md -->

# Engine Developer — Phase 4 Task Breakdown (Progression Systems) (Compact Context)

> Auto-generated from the canonical source file. Edit the source markdown, then regenerate compact docs.

## Quick Map
- Task 1: Evolution System (`src/engine/evolution.ts`)
- Task 2: Garden Management (`src/engine/garden.ts`)
- Task 3: Synergy System (`src/engine/synergies.ts`)
- Task 4: Rebirth System (`src/engine/rebirth.ts`)
- Task 5: Nectar Shop + Rebirth UI (`src/components/prestige/`)

## Key Points
### Task 1: Evolution System (`src/engine/evolution.ts`)
- `canEvolve(bloomling, state)` — checks level >= 100 and can afford evolution cost
- `getEvolutionCost(bloomling)` — cost per rarity from docs/economy/02-upgrade-costs.md
- `evolveBloomling(bloomlingId, state)` — resets level to 1, advances stage, applies 3x production multiplier, unlocks ability
- Elder evolution requires Nectar cost (from prestige currency)

### Task 2: Garden Management (`src/engine/garden.ts`)
- `getMaxGardenSlots(state)` — calculates available slots from progression + upgrades
- `canAddToGarden(bloomlingId, state)` — checks slot availability and not already in garden
- `addToGarden(bloomlingId, state)` — adds Bloomling to active roster
- `removeFromGarden(bloomlingId, state)` — removes from roster

### Task 3: Synergy System (`src/engine/synergies.ts`)
- `calculateActiveSynergies(gardenBloomlings)` — finds all tag matches among garden Bloomlings
- `getSynergyBonus(matchCount)` — returns multiplier (2=1.15, 3=1.35, 4+=1.60)
- `getNamedSynergies(gardenBloomlings)` — checks for special pair synergies from content docs
- `applysynergyBonuses(bloomling, activeSynergies)` — returns adjusted production rate

### Task 4: Rebirth System (`src/engine/rebirth.ts`)
- `calculateNectarEarned(state)` — Nectar formula from docs/economy/04-prestige-math.md
- `getRebirthPreview(state)` — shows Nectar earned, comparison to current total, "push X more zones" preview
- `canRebirth(state)` — must be zone 40+ and earn at least 1 Nectar
- `executeRebirth(state)` — resets: Sunlight, zones, Bloomling levels/evolution (respecting retention upgrades), tap/idle upgrades. Keeps: Nectar, Bloomling unlocks, Dewdrops, achievements, settings

### Task 5: Nectar Shop + Rebirth UI (`src/components/prestige/`)
- `RebirthScreen.tsx` — Shows current Nectar, Nectar earned if rebirth now, "push X more zones" hint, Rebirth button with confirmation
- `NectarShop.tsx` — List of Nectar upgrades: name, description, current level, max level, cost, buy button
- `NectarUpgradeCard.tsx` — Individual upgrade card (similar to UpgradeCard but for Nectar)
- Wire into navigation (new tab or accessible from settings/prestige button on garden screen)
