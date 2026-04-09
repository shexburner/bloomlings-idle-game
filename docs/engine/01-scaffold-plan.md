# Engine Scaffold Plan

> This document describes the exact project setup before any commands are run.
> Written as part of Engine Task 1.

---

## Expo SDK Version

**Expo SDK 52** (latest stable as of April 2026).

Reasoning:
- SDK 52 is the current stable release with the best community support
- Ships with React Native 0.76+, Expo Router v4, and the New Architecture enabled by default
- TypeScript template included out of the box

---

## Project Initialization

```bash
npx create-expo-app@latest . --template blank-typescript
```

- Uses the `blank-typescript` template for a clean starting point with TypeScript
- Initialized in the current directory (`.`) to preserve existing `.git`, `.claude`, and `docs` folders
- Expo Router will be added as a dependency (the `blank-typescript` template is minimal)

---

## Dependency List

### Core Dependencies

| Package | Version | Purpose | Install Command |
|---|---|---|---|
| `zustand` | ^5.x | Lightweight state management — stores game state with slices | `npx expo install zustand` |
| `react-native-reanimated` | ^3.x | High-performance animations for Bloomling evolution, tap effects, combo meter | `npx expo install react-native-reanimated` |
| `react-native-gesture-handler` | ^2.x | Tap detection with precise timing for combo system | `npx expo install react-native-gesture-handler` |
| `react-native-mmkv` | ^3.x | Fast synchronous key-value storage for save/load (10x faster than AsyncStorage) | `npx expo install react-native-mmkv` |
| `expo-router` | ^4.x | File-based navigation between Garden, Shop, Collection, Prestige screens | `npx expo install expo-router expo-linking expo-constants` |
| `expo-haptics` | ^14.x | Haptic feedback on taps, critical hits, evolution events | `npx expo install expo-haptics` |
| `expo-notifications` | ^0.29.x | Local notifications for offline earnings, streak reminders | `npx expo install expo-notifications` |

### Ad SDK (Deferred)

| Package | Version | Purpose | Notes |
|---|---|---|---|
| `react-native-google-mobile-ads` | ^14.x | AdMob rewarded video ads for all 7 ad touchpoints | Requires a config plugin and an AdMob account. Will be installed later when ad integration begins. Noted here for planning purposes. |

**Note**: `react-native-google-mobile-ads` requires native configuration (AdMob App ID in `app.json` config plugin). We will add this dependency in a later task dedicated to ad integration to avoid blocking the scaffold.

### Dev Dependencies

| Package | Purpose |
|---|---|
| `typescript` | Comes with template |
| `@types/react` | Comes with template |
| `eslint` | Comes with Expo default config |
| `eslint-config-expo` | Expo's ESLint configuration preset |

---

## Full Install Commands (in order)

```bash
# 1. Initialize the Expo project
npx create-expo-app@latest . --template blank-typescript

# 2. Install core gameplay dependencies
npx expo install zustand react-native-reanimated react-native-gesture-handler react-native-mmkv

# 3. Install Expo modules
npx expo install expo-router expo-linking expo-constants expo-haptics expo-notifications

# 4. Install expo-status-bar (likely comes with template, ensure present)
npx expo install expo-status-bar
```

---

## TypeScript Configuration (tsconfig.json)

The template provides a base `tsconfig.json` that extends Expo's config. We enforce strict mode:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

Key decisions:
- `strict: true` — enables all strict type checks (noImplicitAny, strictNullChecks, etc.)
- `noUncheckedIndexedAccess` — forces undefined checks on array/object index access
- `paths` alias `@/*` maps to `src/*` for clean imports

---

## Folder Structure

```
src/
├── engine/             # Core game loop, tick system, tap handler, production calculator
├── state/              # Zustand store and state management
│   └── slices/         # Individual store slices (resources, bloomlings, upgrades, etc.)
├── services/           # Save/load manager, ad service, notification service
├── types/              # TypeScript interfaces, enums, type definitions
├── hooks/              # Custom React hooks (useGameLoop, useTap, useBloomling, etc.)
├── components/         # Reusable UI components (BloomlingCard, CurrencyDisplay, etc.)
├── constants/          # Game balance constants, formulas, feature unlock thresholds
└── utils/              # Pure utility functions (formatting, math helpers, etc.)
```

### Folder Purposes

| Folder | Contains | Example Files |
|---|---|---|
| `src/engine/` | Game loop, tap system, production math | `gameLoop.ts`, `tapSystem.ts`, `production.ts` |
| `src/state/` | Zustand store creation, middleware | `store.ts`, `selectors.ts` |
| `src/state/slices/` | Individual state slices | `resourceSlice.ts`, `bloomlingSlice.ts` |
| `src/services/` | External system integrations | `saveManager.ts`, `adService.ts`, `notificationService.ts` |
| `src/types/` | All TypeScript type definitions | `game.ts`, `events.ts` |
| `src/hooks/` | Custom React hooks | `useGameLoop.ts`, `useTap.ts` |
| `src/components/` | Shared UI components | `BloomlingCard.tsx`, `CurrencyDisplay.tsx` |
| `src/constants/` | Balance numbers, enums of config | `balance.ts`, `unlocks.ts` |
| `src/utils/` | Pure utility functions | `formatNumber.ts`, `math.ts` |

---

## ESLint Configuration

Use Expo's default ESLint configuration which comes preconfigured:

```js
// .eslintrc.js (or eslint.config.js if using flat config)
// Expo's default config handles React, React Native, TypeScript, and import rules
module.exports = {
  extends: ["expo"],
};
```

No additional Prettier config for now — Expo's ESLint preset handles formatting rules. Can add Prettier later if the team wants it.

---

## Build Verification

After scaffold is complete, verify with:

```bash
npx tsc --noEmit
```

This ensures TypeScript compilation passes without generating output files. If `tsc` is not directly available, use:

```bash
npx expo export --platform web
```

---

## What's NOT in This Scaffold

These will be added in later tasks:
- `react-native-google-mobile-ads` — requires AdMob account setup (Task TBD)
- `@react-native-firebase/*` — analytics, if needed (post-launch)
- Testing libraries (`jest`, `@testing-library/react-native`) — added when test tasks begin
- CI/CD configuration — separate infrastructure task
