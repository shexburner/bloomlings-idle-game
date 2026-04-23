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
| Full QA pass | QA Tester | — | NOT STARTED |
| App store assets | UI/UX Developer | — | NOT STARTED |
| Analytics integration | Engine Developer | — | NOT STARTED |
| Production ad ID swap | Engine Developer | `src/services/adManager.ts` | NOT STARTED |
| Beta distribution (TestFlight + Play Internal) | Project Manager | — | NOT STARTED |
| Soft launch (NZ + PH) | Project Manager | — | NOT STARTED |
| Global launch | Project Manager | — | NOT STARTED |
