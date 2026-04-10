<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->
<!-- Source: docs/ui/00-task-breakdown.md -->

# UI/UX Developer — Task Breakdown (Compact Context)

> Auto-generated from the canonical source file. Edit the source markdown, then regenerate compact docs.

## Quick Map
- Task 1: Navigation + Layout (`app/` setup)
- Task 2: Main Game Screen (`src/components/garden/`)
- Task 3: Upgrade Shop Screen (`src/components/shop/`)
- Task 4: Collection + Zone UI (`src/components/`)

## Key Points
### Task 1: Navigation + Layout (`app/` setup)
- `app/_layout.tsx` — Root layout with game loop initialization and auto-save
- `app/(tabs)/_layout.tsx` — Tab bar with 4 tabs: Garden (main), Shop, Collection, Settings
- `app/(tabs)/index.tsx` — Garden screen (placeholder, wired to game loop)
- `app/(tabs)/shop.tsx` — Shop screen (placeholder)

### Task 2: Main Game Screen (`src/components/garden/`)
- `CurrencyBar.tsx` — Top bar showing Sunlight (with /sec rate), Nectar, Dewdrops
- `TapArea.tsx` — Full-screen tappable area, connects to useTapHandler()
- `TapFeedback.tsx` — Floating "+X Sunlight" numbers on tap, crit effects
- `ComboMeter.tsx` — Combo counter display with multiplier

### Task 3: Upgrade Shop Screen (`src/components/shop/`)
- `ShopScreen.tsx` — Tab-based shop (Tap Upgrades | Idle Upgrades)
- `UpgradeCard.tsx` — Single upgrade: name, description, level, cost, buy button
- `BuyMultiplierToggle.tsx` — x1/x10/x25/x100/xMax toggle
- Affordability states: green (can afford), gray (can't afford), with cost display

### Task 4: Collection + Zone UI (`src/components/`)
- `collection/CollectionGrid.tsx` — Grid of Bloomling cards (discovered = visible, undiscovered = silhouette "???")
- `collection/BloomlingCard.tsx` — Individual Bloomling: name, rarity color, evolution stage, level
- `collection/BloomlingDetail.tsx` — Modal/screen for single Bloomling: lore, stats, ability, evolution progress
- `zones/ZoneInfo.tsx` — Expanded zone info: current biome name, zone number, threshold, gate indicator
