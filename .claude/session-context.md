# Bloomlings Idle Game — Session Context

> This file is a living document. It is updated after every significant conversation to preserve context across sessions.

## Last Updated
2026-04-08

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

## Decisions Made
- Tech stack: React Native + Expo + TypeScript (chosen for cross-platform mobile support, strong ecosystem, easy ad SDK integration)
- Ad currency working name: "Dewdrops"
- No forced ads — all ad viewing is voluntary
- Bloomlings are conscious plant creatures with individual backstories

## Open Questions
- Specific Bloomling species and lore (Content Creator will develop)
- Prestige system design (Game Designer will develop)
- Economy curves and balance numbers (Economy Balancer will develop)
- Visual style / art direction (UI/UX Developer will develop)
- Biome themes and progression order

## Session Log
### Session 1 — 2026-04-08
- Established project concept and core pillars
- Chose tech stack (React Native + Expo + TypeScript)
- Created 6 agent personas
- Created this session context file
