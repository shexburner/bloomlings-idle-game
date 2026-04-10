# UI/UX Developer — Task Breakdown

> Each task produces working React Native components.
> Read `.claude/personas/ui-ux-developer.md` for design principles.
> Read `docs/design/01-core-game-loop.md` for screen map and feature timeline.
> Read `src/types/game.ts` for TypeScript interfaces.
> Read `src/state/store.ts` and `src/state/selectors.ts` for state access patterns.
> Read `src/engine/tapSystem.ts` for tap handler hook.
> Read `src/engine/gameLoop.ts` for game loop hook.

## Task 1: Navigation + Layout (`app/` setup)
**Objective**: Set up Expo Router tab navigation and shared layout.
**Deliver**:
- `app/_layout.tsx` — Root layout with game loop initialization and auto-save
- `app/(tabs)/_layout.tsx` — Tab bar with 4 tabs: Garden (main), Shop, Collection, Settings
- `app/(tabs)/index.tsx` — Garden screen (placeholder, wired to game loop)
- `app/(tabs)/shop.tsx` — Shop screen (placeholder)
- `app/(tabs)/collection.tsx` — Collection screen (placeholder)
- `app/(tabs)/settings.tsx` — Settings screen (placeholder)
- Tab bar styling: dark theme, plant-themed icons, bottom navigation
- Game loop starts on app mount, auto-save runs
**Status**: DONE

## Task 2: Main Game Screen (`src/components/garden/`)
**Objective**: Build the core tap-to-play screen.
**Deliver**:
- `CurrencyBar.tsx` — Top bar showing Sunlight (with /sec rate), Nectar, Dewdrops
- `TapArea.tsx` — Full-screen tappable area, connects to useTapHandler()
- `TapFeedback.tsx` — Floating "+X Sunlight" numbers on tap, crit effects
- `ComboMeter.tsx` — Combo counter display with multiplier
- `ZoneProgress.tsx` — Current zone number + progress bar toward next zone
- `BloomlingDisplay.tsx` — Placeholder Bloomling sprite area (centered, with idle animation stub)
- Wire everything together in `app/(tabs)/index.tsx`
- All components use StyleSheet.create, dark theme, functional components
**Status**: DONE

## Task 3: Upgrade Shop Screen (`src/components/shop/`)
**Objective**: Build the upgrade purchasing interface.
**Deliver**:
- `ShopScreen.tsx` — Tab-based shop (Tap Upgrades | Idle Upgrades)
- `UpgradeCard.tsx` — Single upgrade: name, description, level, cost, buy button
- `BuyMultiplierToggle.tsx` — x1/x10/x25/x100/xMax toggle
- Affordability states: green (can afford), gray (can't afford), with cost display
- Connects to Zustand store for upgrade state and buy actions
- Wire into `app/(tabs)/shop.tsx`
**Status**: NOT STARTED

## Task 4: Collection + Zone UI (`src/components/`)
**Objective**: Build Bloomling collection grid and zone progression display.
**Deliver**:
- `collection/CollectionGrid.tsx` — Grid of Bloomling cards (discovered = visible, undiscovered = silhouette "???")
- `collection/BloomlingCard.tsx` — Individual Bloomling: name, rarity color, evolution stage, level
- `collection/BloomlingDetail.tsx` — Modal/screen for single Bloomling: lore, stats, ability, evolution progress
- `zones/ZoneInfo.tsx` — Expanded zone info: current biome name, zone number, threshold, gate indicator
- Wire collection into `app/(tabs)/collection.tsx`
**Status**: NOT STARTED
