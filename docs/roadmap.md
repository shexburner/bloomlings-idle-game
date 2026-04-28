# Bloomlings — Project Roadmap

> Master roadmap. Each phase lists deliverables, responsible persona, and status.

## Phase 1: Foundation
| Task | Persona | Output File | Status |
|---|---|---|---|
| Game design document (6 sections) | Game Designer | `docs/design/01-06` | DONE |
| Agent personas (7) | — | `.claude/personas/` | DONE |
| Project scaffolding | Engine Developer | `package.json`, `app/`, `src/` | DONE |
| Core TypeScript types | Engine Developer | `src/types/game.ts` | DONE |

## Phase 2: Core Engine
| Task | Persona | Output File | Status |
|---|---|---|---|
| Economy balance sheets | Economy Balancer | `docs/economy/01-06` | DONE |
| Game loop | Engine Developer | `src/engine/gameLoop.ts` | DONE |
| Zustand store | Engine Developer | `src/state/store.ts` | DONE |
| Save/load system | Engine Developer | `src/services/saveManager.ts` | DONE |
| Tap system + combos | Engine Developer | `src/engine/tapSystem.ts` | DONE |
| Idle production | Engine Developer | `src/engine/idleProduction.ts` | DONE |

## Phase 3: Content & UI
| Task | Persona | Output File | Status |
|---|---|---|---|
| Bloomling content (species, lore) | Content Creator | `docs/content/01-04` | DONE |
| Main game screen | UI/UX Developer | `app/(tabs)/index.tsx` | DONE |
| Upgrade shop UI | UI/UX Developer | `app/(tabs)/shop.tsx` | DONE |
| Collection UI | UI/UX Developer | `app/(tabs)/collection.tsx` | DONE |

## Phase 4: Progression Systems
| Task | Persona | Output File | Status |
|---|---|---|---|
| Evolution system | Engine Developer | `src/engine/evolution.ts` | DONE |
| Garden management | Engine Developer | `src/engine/garden.ts` | DONE |
| Synergy system | Engine Developer | `src/engine/synergies.ts` | DONE |
| Rebirth (prestige 1) | Engine Developer | `src/engine/rebirth.ts` | DONE |
| Nectar shop + Rebirth UI | UI/UX Developer | `app/(tabs)/rebirth.tsx` | DONE |

## Phase 5: Monetization
| Task | Persona | Output File | Status |
|---|---|---|---|
| AdMob integration | Engine Developer | `src/services/adManager.ts` | DONE |
| 7 ad touchpoints | UI/UX + Engine | various | DONE (5/7 shipped — Double Offline, Dewdrop Garden, Sunbeam Boost, Combo Keeper, Lucky Sprout; Gate Assist + Boss Smash blocked on engine loops) |
| Dewdrop shop | UI/UX Developer | `app/(tabs)/dewdrop-shop.tsx` | DONE |
| Offline progress | Engine Developer | `src/engine/offlineProgress.ts` | DONE |

## Phase 6: Polish & Retention
| Task | Persona | Output File | Status |
|---|---|---|---|
| Achievements | Engine + UI/UX | `src/engine/achievements.ts` | DONE |
| Daily login + streaks | Engine Developer | `src/engine/dailyRewards.ts` | DONE |
| Notifications | Engine Developer | `src/services/notificationService.ts` | DONE |
| Sound + haptics | UI/UX Developer | `src/services/audioService.ts` | DONE |
| Performance pass | QA Tester | various | DONE |

## Phase 7: Prestige Layer 2 & Endgame
| Task | Persona | Output File | Status |
|---|---|---|---|
| Transcendence system | Engine Developer | `src/engine/transcendence.ts` | DONE |
| Essence shop | UI/UX Developer | `src/components/prestige/EssenceShop.tsx` | DONE |
| Biomes 3-8 content | Content Creator | `docs/content/05-10` | DONE |
| Legendary/Mythic Bloomlings | Content Creator | `docs/content/11-legendary-mythic-bloomlings.md` | DONE |
| Performance pass | QA Tester | various | DONE |

## Phase 8: Launch Prep
| Task | Persona | Output File | Status |
|---|---|---|---|
| Beta testing checklist | Project Manager | `docs/launch/beta-checklist.md` | DONE |
| Soft launch plan | Project Manager | `docs/launch/soft-launch-plan.md` | DONE |
| Full QA pass | QA Tester | — | DONE |
| App store assets | UI/UX Developer | — | DONE |
| Analytics integration | Engine Developer | — | DONE |
| Production ad ID swap | Engine Developer | `src/services/adManager.ts` | DONE |
| Beta distribution (TestFlight + Play Internal) | Project Manager | `docs/launch/beta-distribution-guide.md` | DONE |
| Soft launch (NZ + PH) | Project Manager | — | DONE |
| Global launch | Project Manager | — | DONE |

## Phase 9: Gameplay Depth & Player Experience
| Task | Persona | Output File | Status |
|---|---|---|---|
| Zone Gates engine | Engine Developer | `src/engine/zoneGates.ts` | DONE |
| Biome Boss Fights engine | Engine Developer | `src/engine/bossFight.ts` | DONE |
| Gate & Boss UI | UI/UX Developer | `src/components/garden/GateOverlay.tsx`, `BossOverlay.tsx` | DONE |
| Gate Assist ad touchpoint | Engine + UI/UX | `src/components/garden/GateAssistButton.tsx` | DONE |
| Boss Smash ad touchpoint | Engine + UI/UX | `src/components/garden/BossSmashButton.tsx` | DONE |
| Bloomling Abilities engine | Engine Developer | `src/engine/abilities.ts` | DONE |
| Abilities integration (selectors, tap, zone, prestige) | Engine Developer | various | DONE |
| Biomes 3-8 Bloomling templates | Content Creator + Engine | `src/data/bloomlingTemplates.ts` | DONE |
| Biomes 3-8 named synergies | Content Creator + Engine | `src/engine/synergies.ts` | DONE |
| Legendary/Mythic Bloomling templates | Content Creator + Engine | `src/data/bloomlingTemplates.ts` | DONE |
| Biome mechanics engine (Sunbursts, Luminescence, Resonance, etc.) | Engine Developer | `src/engine/biomeMechanics.ts` | DONE |
| Biome mechanics UI | UI/UX Developer | various | DONE |
| Cosmetic system (state, shop, rendering) | Engine + UI/UX | `src/state/slices/cosmeticSlice.ts`, `src/components/dewdrop/` | DONE |
| Onboarding / Tutorial flow | UI/UX + Content Creator | `src/components/tutorial/` | DONE |
| Retention hooks (streak protection, next-unlock preview, almost-affordable, collection hints) | Engine + UI/UX | various | DONE |
| Auto-Tap perk | Engine Developer | `src/engine/autoTap.ts` | DONE |
| Save migration for new state fields | Engine Developer | `src/services/saveManager.ts` | DONE |

### Phase 9 Design Documents
| Document | Personas | File | Status |
|---|---|---|---|
| Zone Gates & Biome Bosses | Game Designer, Engine, Economy, UI/UX | `docs/design/07-zone-gates-and-bosses.md` | DONE |
| Bloomling Abilities | Game Designer, Engine, Economy, Content | `docs/design/08-bloomling-abilities.md` | DONE |
| Biome Content & Mechanics | Game Designer, Engine, Content, UI/UX | `docs/design/09-biome-content-and-mechanics.md` | DONE |
| Cosmetics, Onboarding & Retention | Game Designer, UI/UX, Content, Economy, PM | `docs/design/10-cosmetics-onboarding-retention.md` | DONE |
