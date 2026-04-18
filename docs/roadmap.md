# Bloomlings — Project Roadmap

> Master roadmap. Each phase lists deliverables, responsible persona, and status.

## Phase 1: Foundation
| Task | Persona | Output File | Status |
|---|---|---|---|
| Game design document (6 sections) | Game Designer | `docs/design/01-06` | DONE |
| Agent personas (7) | — | `.claude/personas/` | DONE |
| Project scaffolding | Engine Developer | `package.json`, `app/`, `src/` | NOT STARTED |
| Core TypeScript types | Engine Developer | `src/types/game.ts` | NOT STARTED |

## Phase 2: Core Engine
| Task | Persona | Output File | Status |
|---|---|---|---|
| Economy balance sheets | Economy Balancer | `docs/economy/01-06` | NOT STARTED |
| Game loop | Engine Developer | `src/engine/gameLoop.ts` | NOT STARTED |
| Zustand store | Engine Developer | `src/state/store.ts` | NOT STARTED |
| Save/load system | Engine Developer | `src/services/saveManager.ts` | NOT STARTED |
| Tap system + combos | Engine Developer | `src/engine/tapSystem.ts` | NOT STARTED |
| Idle production | Engine Developer | `src/engine/idleProduction.ts` | NOT STARTED |

## Phase 3: Content & UI
| Task | Persona | Output File | Status |
|---|---|---|---|
| Bloomling content (species, lore) | Content Creator | `docs/content/bloomlings/` | NOT STARTED |
| Main game screen | UI/UX Developer | `app/(tabs)/index.tsx` | NOT STARTED |
| Upgrade shop UI | UI/UX Developer | `app/(tabs)/shop.tsx` | NOT STARTED |
| Zone progression UI | UI/UX Developer | `app/(tabs)/zones.tsx` | NOT STARTED |
| Bloomling collection UI | UI/UX Developer | `app/(tabs)/collection.tsx` | NOT STARTED |

## Phase 4: Progression Systems
| Task | Persona | Output File | Status |
|---|---|---|---|
| Evolution system | Engine Developer | `src/engine/evolution.ts` | NOT STARTED |
| Garden management | Engine Developer | `src/engine/garden.ts` | NOT STARTED |
| Synergy system | Engine Developer | `src/engine/synergies.ts` | NOT STARTED |
| Rebirth (prestige 1) | Engine Developer | `src/engine/prestige.ts` | NOT STARTED |
| Nectar shop | UI/UX Developer | `app/(tabs)/nectar-shop.tsx` | NOT STARTED |

## Phase 5: Monetization
| Task | Persona | Output File | Status |
|---|---|---|---|
| AdMob integration | Engine Developer | `src/services/adManager.ts` | DONE |
| 7 ad touchpoints | UI/UX + Engine | various | IN PROGRESS (5 / 7 — Double Offline, Dewdrop Garden, Sunbeam Boost, Combo Keeper, Lucky Sprout) |
| Dewdrop shop | UI/UX Developer | `app/(tabs)/dewdrop-shop.tsx` | DONE |
| Offline progress | Engine Developer | `src/engine/offlineProgress.ts` | DONE |

## Phase 6: Polish & Retention
| Task | Persona | Output File | Status |
|---|---|---|---|
| Achievements | Engine + UI/UX | `src/engine/achievements.ts` | DONE |
| Daily login + streaks | Engine Developer | `src/engine/dailyRewards.ts` | DONE |
| Notifications | Engine Developer | `src/services/notificationService.ts` | DONE |
| Sound + haptics | UI/UX Developer | `src/services/audio.ts` | NOT STARTED |
| Performance pass | QA Tester | — | NOT STARTED |

## Phase 7: Prestige Layer 2 & Endgame
| Task | Persona | Output File | Status |
|---|---|---|---|
| Transcendence system | Engine Developer | `src/engine/transcendence.ts` | NOT STARTED |
| Essence shop | UI/UX Developer | — | NOT STARTED |
| Biomes 5-8 content | Content Creator | — | NOT STARTED |
| Legendary/Mythic Bloomlings | Content Creator | — | NOT STARTED |

## Phase 8: Launch Prep
| Task | Persona | Output File | Status |
|---|---|---|---|
| Full QA pass | QA Tester | — | NOT STARTED |
| Beta testing | QA Tester | — | NOT STARTED |
| App store assets | UI/UX Developer | — | NOT STARTED |
| Analytics integration | Engine Developer | — | NOT STARTED |
| Soft launch | Project Manager | — | NOT STARTED |
