# Engine Scaffold Plan

> This document describes the exact project setup before any commands are run.
> Written as part of Engine Task 1.

---

## Expo SDK Version

**Expo SDK 54** (ships with `create-expo-app@latest` default template as of April 2026).

Reasoning:
- `create-expo-app@latest --template default` produces an SDK 54 project (`expo@~54.0.33`)
- Ships with React Native 0.81.5, React 19.1, and the New Architecture enabled by default
- Default template includes TypeScript, expo-router v6, and file-based routing out of the box
- Full community support and compatible dependency ecosystem
- SDK 55 exists on npm but the default template has not yet been updated to use it

---

## Project Initialization

```bash
npx create-expo-app@latest . --template default
```

- Uses the `default` template which includes TypeScript and expo-router (SDK 55+)
- Initialized in the current directory (`.`) to preserve existing `.git`, `.claude`, and `docs` folders
- Expo Router is included with the default template — no separate install needed

---

## Dependency List

### Core Dependencies

| Package | Version | Purpose | Install Command |
|---|---|---|---|
| `zustand` | ^5.0.12 | Lightweight state management — stores game state with slices, selectors, middleware | `npm install zustand` |
| `react-native-reanimated` | ~4.1.1 | High-performance UI-thread animations for tap effects, combo meter, evolution sequences | Included with template |
| `react-native-gesture-handler` | ~2.28.0 | Precise tap detection and gesture tracking for the combo system | Included with template |
| `react-native-mmkv` | ^4.3.1 | Ultra-fast synchronous KV storage for save/load (10x faster than AsyncStorage) | `npm install react-native-mmkv` |
| `expo-haptics` | ~15.0.8 | Haptic feedback on taps, critical hits, evolution events | Included with template |
| `expo-notifications` | ^55.0.18 | Local notifications for offline earnings, streak reminders | `npm install expo-notifications` |

### Ad SDK

| Package | Version | Purpose | Notes |
|---|---|---|---|
| `react-native-google-mobile-ads` | ^16.3.2 | AdMob rewarded video ads for all 7 ad touchpoints | Requires config plugin and AdMob App ID in app.json. Needs development build (not Expo Go). Install now, configure later. |

**Note**: `react-native-google-mobile-ads` requires native configuration (AdMob App ID in `app.json` config plugin) and a development build via EAS. We install the package now so it is in the dependency tree, but defer AdMob configuration to the ad integration task. If installation fails in this environment, we note the failure and continue.

### Dev Dependencies (Included with Template)

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
npx create-expo-app@latest . --template default

# 2. Install core gameplay dependencies
npx expo install zustand react-native-reanimated react-native-gesture-handler react-native-mmkv

# 3. Install Expo modules
npx expo install expo-haptics expo-notifications

# 4. Install ad SDK (may require config plugin setup later)
npx expo install react-native-google-mobile-ads
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
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@/*": ["./*"],
      "~/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

Key decisions:
- `strict: true` — enables all strict type checks (noImplicitAny, strictNullChecks, etc.)
- `noUncheckedIndexedAccess` — forces undefined checks on array/object index access
- `noImplicitReturns` — all code paths in a function must return a value
- `noFallthroughCasesInSwitch` — prevents accidental switch fallthrough
- `@/*` maps to root (used by Expo template code in `app/`, `components/`, `hooks/`, `constants/`)
- `~/*` maps to `src/*` for game-specific imports (engine, state, types, services)

---

## Folder Structure

```
src/
├── engine/             # Core game loop, tick system, tap handler, production calculator
│   └── .gitkeep
├── state/              # Zustand store and state management
│   ├── slices/         # Individual store slices (resources, bloomlings, upgrades, etc.)
│   │   └── .gitkeep
│   └── .gitkeep
├── services/           # Save/load manager, ad service, notification service
│   └── .gitkeep
├── types/              # TypeScript interfaces, enums, type definitions
│   └── .gitkeep
├── hooks/              # Custom React hooks (useGameLoop, useTap, useBloomling, etc.)
│   └── .gitkeep
├── components/         # Reusable UI components (BloomlingCard, CurrencyDisplay, etc.)
│   └── .gitkeep
├── constants/          # Game balance constants, formulas, feature unlock thresholds
│   └── .gitkeep
└── utils/              # Pure utility functions (formatting, math helpers, etc.)
    └── .gitkeep
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

Use Expo's default ESLint configuration which comes preconfigured with the template:

```js
// eslint.config.js (flat config, SDK 55 default)
// Expo's default config handles React, React Native, TypeScript, and import rules
```

No additional Prettier config for now — Expo's ESLint preset handles formatting rules. Can add Prettier later if the team wants it.

---

## Build Verification

After scaffold is complete, verify with:

```bash
npx tsc --noEmit
```

This ensures TypeScript compilation passes without generating output files.

---

## What's NOT in This Scaffold

These will be added in later tasks:
- AdMob native configuration (requires AdMob account + EAS build setup)
- App icons, splash screens, app.json branding
- Environment variables / `.env` setup
- EAS build configuration (`eas.json`)
- Testing libraries (`jest`, `@testing-library/react-native`) — added when test tasks begin
- CI/CD configuration — separate infrastructure task
- Firebase / analytics — post-launch consideration
