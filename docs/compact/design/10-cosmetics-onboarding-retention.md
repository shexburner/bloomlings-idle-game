<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->
<!-- Source: docs/design/10-cosmetics-onboarding-retention.md -->

# Bloomlings Game Design — Section 10: Cosmetics, Onboarding & Retention Hooks (Compact Context)

> Auto-generated from the canonical source file. Edit the source markdown, then regenerate compact docs.

## Quick Map
- Phase 9 Overview
- Part 1: Cosmetic System
  - Design Philosophy
  - Cosmetic Categories
    - 1. Bloomling Hats (Wearable Accessories)
    - 2. Garden Themes (Background / Ambient Changes)
    - 3. Tap Effects (Visual Tap Feedback Skins)
    - 4. Garden Decorations (Placeable Items)
  - Cosmetic State
  - Cosmetic Preview
  - Monthly Milestone Cosmetic Rewards
  - Pricing Summary
- Part 2: Onboarding / Tutorial
  - Design Philosophy
  - First-Run Experience (Guided Tutorial)
    - Tutorial Steps
    - Spotlight UI Pattern
  - Contextual Feature Tooltips (Drip-Feed)
  - Skip Option
  - Tutorial State
- Part 3: Retention Hooks
  - 1. Streak Protection
    - Grace Period (1 Day)
    - Streak Shield (Ad-Based, 1 Per Week)
  - 2. Next Unlock Preview
  - 3. Almost-Affordable Indicator
  - 4. Collection Hint Text
  - 5. Auto-Tap Perk
- Part 4: Implementation Plan
  - Task Breakdown
    - Cosmetic System
    - Onboarding / Tutorial
    - Retention Hooks
  - Effort Summary
  - Suggested Implementation Order
  - Dependency Graph
  - What Ships Independently
  - New Ad Unit
- Cross-References
- Next Section

## Key Points
### Phase 9 Overview
- **Cosmetic System** — Dewdrop-purchasable visual customization (hats, themes, tap effects, decorations)
- **Onboarding / Tutorial** — Guided first-run experience and contextual feature tooltips
- **Retention Hooks** — Streak protection, next-unlock preview, almost-affordable indicators, collection hints, auto-tap

### Part 1: Cosmetic System
- (No concise bullet/summary found; use grep in source file for details.)

### Design Philosophy
- Cosmetics are the primary Dewdrop sink for mid-to-late-game players who have already purchased the gameplay perks. They must feel **worth earning** without ever feeling **required**. Every cosmetic is permanent, visible, and purely aesthetic.

### Cosmetic Categories
- (No concise bullet/summary found; use grep in source file for details.)

### 1. Bloomling Hats (Wearable Accessories)
- Small accessories rendered as an overlay on `BloomlingDisplay`. Each hat is a 48×48 sprite positioned relative to the Bloomling's top anchor point.

### 2. Garden Themes (Background / Ambient Changes)
- Swap the Garden screen's `LinearGradient` colors, ambient particle effects, and optional background illustration.

### 3. Tap Effects (Visual Tap Feedback Skins)
- Replace the default floating-number style in `TapFeedback` with themed animations.

### 4. Garden Decorations (Placeable Items)
- Small decorative sprites placed in fixed positions around the Garden screen edges (not on the tap area). Up to 3 active at once.

### Cosmetic State
- `buyCosmetic(itemId)` — deducts Dewdrops, adds to `owned`, triggers `hat_trick` progress if category is `hat`
- `equipCosmetic(itemId)` — sets the appropriate `active*` field based on category
- `unequipCosmetic(category)` — clears the active field for that category
- `placeDecoration(itemId, slotIndex)` — adds to `activeDecorationIds` (max 3)

### Cosmetic Preview
- **Hats**: Tapping a hat card in the shop shows a modal with the hat rendered on the player's currently active Garden Bloomling. "Try It On" → "Buy for X 💧" flow.
- **Themes**: Preview renders a small Garden mockup (200×300) with the theme's gradient and particle effect. No full-screen takeover.
- **Tap Effects**: Preview plays a 2-second looping animation of the effect in a contained box on the card.
- **Decorations**: Preview shows the decoration sprite at actual size with its idle animation.

### Monthly Milestone Cosmetic Rewards
- Every 4th completed daily login cycle (28 cumulative login days) grants a free cosmetic:

### Pricing Summary
- At max daily Dewdrop earn rate (25/day with streak), a dedicated player can buy the entire catalog in ~25 days. A casual player watching 3–5 ads/day takes 2–3 months. This pacing aligns with the monthly milestone rewards as a "taste" that drives further engagement.

### Part 2: Onboarding / Tutorial
- (No concise bullet/summary found; use grep in source file for details.)

### Design Philosophy
- The game has 6 tabs and multiple interlocking systems (tapping, combos, idle production, zones, evolution, synergies, prestige, Dewdrops). A new player seeing all of this at once will bounce. The tutorial exists to **drip-feed complexity** so the first 10 minutes feel simple: tap, grow, smile.

### First-Run Experience (Guided Tutorial)
- The tutorial triggers on first app launch when no save data exists. It is a linear sequence of spotlight steps that highlight specific UI elements and block interaction with everything else.

### Tutorial Steps
- **Duration**: ~60–90 seconds for a player who reads everything. Fast tappers finish in 30 seconds.

### Spotlight UI Pattern
- Semi-transparent dark overlay (`rgba(0,0,0,0.75)`) covers the entire screen
- A "cutout" hole (rounded rect or circle) reveals the spotlight target
- Fernley's dialogue appears in a speech bubble anchored below or above the cutout
- A small Fernley avatar (48×48) sits beside the speech bubble

### Contextual Feature Tooltips (Drip-Feed)
- After the initial tutorial, new systems get a one-time tooltip when they first become relevant:

### Skip Option
- If `applySaveToStore` detects existing save data on first launch (e.g., save import), the tutorial is skipped entirely
- A "Skip Tutorial" button appears in the top-right corner of the `TutorialOverlay` at all times
- Skipping sets `tutorial.completed = true` and marks all initial tooltips as seen
- Contextual tooltips still fire even if the tutorial was skipped (they're independent)

### Tutorial State
- `advanceTutorialStep()` — increments `currentStep`, sets `completed = true` on final step
- `skipTutorial()` — sets `completed = true`, `currentStep = -1`
- `dismissTooltip(id)` — adds to `seenTooltips`

### Part 3: Retention Hooks
- These are the remaining retention systems specified in `06-retention-hooks.md` that are designed but not yet implemented.

### 1. Streak Protection
- **Current state**: The streak system exists in `dailyRewards.ts` and the store tracks `streakDays`. Missing a day currently has no grace period — the streak resets immediately on the second missed day (per the design doc). The Streak Shield ad mechanic is not implemented.

### Grace Period (1 Day)
- Missing **one calendar day** freezes the streak instead of resetting it
- The frozen state is tracked via `daily.streakFrozenAt: number | null` (timestamp of the missed day)
- If the player returns the next day, the streak resumes from where it was (frozen day does not count toward streak, but doesn't break it)
- Missing a **second consecutive day** resets the streak to 0

### Streak Shield (Ad-Based, 1 Per Week)
- When a player returns after missing 2+ days and their streak would reset, a "Streak Shield" prompt appears
- "Watch an ad to save your X-day streak!" — consumes `useRewardedAd("streakShield")` (new ad unit)
- On reward: streak is restored to its pre-reset value, `daily.lastStreakShieldAt` is stamped
- Cooldown: once per 7 calendar days (checked against `lastStreakShieldAt`)

### 2. Next Unlock Preview
- Next Bloomling unlock: "🌱 New Bloomling at Zone X (Y zones away)"
- Next feature unlock: "✨ [Feature] unlocks at Zone X (Y zones away)"
- Next evolution ready: "⬆️ [Bloomling] can evolve!"
- Rebirth recommendation: "🔄 Rebirth available — earn X Nectar"

### 3. Almost-Affordable Indicator
- `UpgradeCard` (Sunlight shop): amber badge with "Almost there! (X%)" when `currentSunlight / cost >= 0.8 && currentSunlight < cost`
- `PerkCard` (Dewdrop shop): same badge style, checking Dewdrop balance
- `NectarUpgradeCard` (Nectar shop): same pattern for Nectar
- Badge includes a small progress arc (circular) showing exact percentage

### 4. Collection Hint Text
- Locked Bloomlings now show a hint line: "Found somewhere in [Biome Name]…"
- The hint is derived from the Bloomling template's `biome` field and the zone range for that biome
- If the player has reached the biome but not unlocked the Bloomling: "Hiding in the [Biome Name] (Zone X–Y)"
- If the player hasn't reached the biome yet: "Found in distant lands…"

### 5. Auto-Tap Perk
- New `src/engine/autoTap.ts` module: `getAutoTapRate(state): number` returns 0, 2, or 5 based on owned perks
- The game loop's tick function checks `getAutoTapRate()`. If > 0, it calls `calculateTapReward` that many times per second (spread across ticks, not burst)
- Auto-taps do **not** build combo (combo requires real player input within the 1.5s window)
- Auto-taps **can** trigger critical hits (same 5% base chance)

### Part 4: Implementation Plan
- (No concise bullet/summary found; use grep in source file for details.)

### Task Breakdown
- (No concise bullet/summary found; use grep in source file for details.)

### Cosmetic System
- (No concise bullet/summary found; use grep in source file for details.)

### Onboarding / Tutorial
- (No concise bullet/summary found; use grep in source file for details.)

### Retention Hooks
- (No concise bullet/summary found; use grep in source file for details.)

### Effort Summary
- **Total estimated effort**: ~25–30 dev-days across all personas.

### Suggested Implementation Order
- C1 — Cosmetic state + slice + save migration
- T1 — Tutorial state + slice + save migration
- R1 — Streak grace period logic
- C2 — Cosmetic templates catalog

### Dependency Graph
- C1 (cosmetic state) ──┬── C3 (shop UI)

### What Ships Independently
- **R4** (almost-affordable badges) — pure UI enhancement, no new state
- **R5** (collection hints) — pure UI enhancement, no new state
- **R3** (next unlock preview) — new component, reads existing state
- **R1** (streak grace period) — engine logic change, backward-compatible

### New Ad Unit
- `streakShield` — added to `RewardedAdUnit` type in `adManager.ts`, with a `TODO(prod-ids)` placeholder

### Cross-References
- Dewdrop pricing and earn rates: `docs/design/05-ad-economy.md`
- Streak system and daily rewards: `docs/design/06-retention-hooks.md`
- Feature unlock timeline: `docs/design/01-core-game-loop.md`
- Achievement definitions: `docs/content/04-achievements.md`

### Next Section
- See `docs/roadmap.md` for phase tracking. This document covers Phase 9 deliverables.
