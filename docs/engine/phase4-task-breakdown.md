# Engine Developer — Phase 4 Task Breakdown (Progression Systems)

> Each task produces working TypeScript code. Save and commit after each.
> Read economy docs and design docs for exact formulas.

## Task 1: Evolution System (`src/engine/evolution.ts`)
**Objective**: Implement Bloomling evolution (Sprout -> Bloom -> Elder).
**Deliver**:
- `canEvolve(bloomling, state)` — checks level >= 100 and can afford evolution cost
- `getEvolutionCost(bloomling)` — cost per rarity from docs/economy/02-upgrade-costs.md
- `evolveBloomling(bloomlingId, state)` — resets level to 1, advances stage, applies 3x production multiplier, unlocks ability
- Elder evolution requires Nectar cost (from prestige currency)
- Integration with Zustand store action in bloomlingSlice
**Input**: docs/economy/02-upgrade-costs.md (evolution costs), docs/design/02-bloomling-mechanics.md
**Status**: NOT STARTED

## Task 2: Garden Management (`src/engine/garden.ts`)
**Objective**: Manage the active Bloomling roster with slot limits.
**Deliver**:
- `getMaxGardenSlots(state)` — calculates available slots from progression + upgrades
- `canAddToGarden(bloomlingId, state)` — checks slot availability and not already in garden
- `addToGarden(bloomlingId, state)` — adds Bloomling to active roster
- `removeFromGarden(bloomlingId, state)` — removes from roster
- `getGardenBloomlings(state)` — returns all active Bloomlings with computed production
- Slot sources: base (1) + zone unlocks + Nectar upgrades + Essence upgrades + Dewdrop perk
- Integration with Zustand store
**Input**: docs/design/02-bloomling-mechanics.md (Garden slots table)
**Status**: NOT STARTED

## Task 3: Synergy System (`src/engine/synergies.ts`)
**Objective**: Calculate and track synergy bonuses between Garden Bloomlings.
**Deliver**:
- `calculateActiveSynergies(gardenBloomlings)` — finds all tag matches among garden Bloomlings
- `getSynergyBonus(matchCount)` — returns multiplier (2=1.15, 3=1.35, 4+=1.60)
- `getNamedSynergies(gardenBloomlings)` — checks for special pair synergies from content docs
- `applysynergyBonuses(bloomling, activeSynergies)` — returns adjusted production rate
- Track first-time synergy discoveries for Dewdrop rewards
- Synergy data structure referencing content docs
**Input**: docs/design/02-bloomling-mechanics.md, docs/content/01-biome1-bloomlings.md, docs/content/02-biome2-bloomlings.md
**Status**: NOT STARTED

## Task 4: Rebirth System (`src/engine/rebirth.ts`)
**Objective**: Implement Prestige Layer 1 — Rebirth for Nectar.
**Deliver**:
- `calculateNectarEarned(state)` — Nectar formula from docs/economy/04-prestige-math.md
- `getRebirthPreview(state)` — shows Nectar earned, comparison to current total, "push X more zones" preview
- `canRebirth(state)` — must be zone 40+ and earn at least 1 Nectar
- `executeRebirth(state)` — resets: Sunlight, zones, Bloomling levels/evolution (respecting retention upgrades), tap/idle upgrades. Keeps: Nectar, Bloomling unlocks, Dewdrops, achievements, settings
- Bloom Retention / Elder Retention Nectar upgrades affect what evolution stages survive reset
- Seasonal Memory upgrade affects starting zone post-Rebirth
- Increment rebirth count, update highest zone record
**Input**: docs/economy/04-prestige-math.md, docs/design/04-prestige-systems.md
**Status**: NOT STARTED

## Task 5: Nectar Shop + Rebirth UI (`src/components/prestige/`)
**Objective**: Build the prestige screen and Nectar upgrade shop.
**Deliver**:
- `RebirthScreen.tsx` — Shows current Nectar, Nectar earned if rebirth now, "push X more zones" hint, Rebirth button with confirmation
- `NectarShop.tsx` — List of Nectar upgrades: name, description, current level, max level, cost, buy button
- `NectarUpgradeCard.tsx` — Individual upgrade card (similar to UpgradeCard but for Nectar)
- Wire into navigation (new tab or accessible from settings/prestige button on garden screen)
- Prestige button appears on garden screen after Zone 40 (feature gating)
**Input**: docs/content/03-upgrades-flavor.md (Nectar upgrade names/descriptions)
**Status**: NOT STARTED
