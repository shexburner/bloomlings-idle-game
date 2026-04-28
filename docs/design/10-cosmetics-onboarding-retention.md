# Bloomlings Game Design — Section 10: Cosmetics, Onboarding & Retention Hooks

## Phase 9 Overview

Three feature areas that round out the player experience before global launch:

1. **Cosmetic System** — Dewdrop-purchasable visual customization (hats, themes, tap effects, decorations)
2. **Onboarding / Tutorial** — Guided first-run experience and contextual feature tooltips
3. **Retention Hooks** — Streak protection, next-unlock preview, almost-affordable indicators, collection hints, auto-tap

These systems share a common goal: give players reasons to stay, reasons to return, and reasons to spend Dewdrops on things that feel good without affecting balance.

---

## Part 1: Cosmetic System

### Design Philosophy

Cosmetics are the primary Dewdrop sink for mid-to-late-game players who have already purchased the gameplay perks. They must feel **worth earning** without ever feeling **required**. Every cosmetic is permanent, visible, and purely aesthetic.

The existing Dewdrop shop (`DewdropShop.tsx`) currently shows two sections: Permanent Perks and Consumables. Cosmetics add a third top-level section rendered between the `DewdropEarnCard` and the existing perk sections.

### Cosmetic Categories

#### 1. Bloomling Hats (Wearable Accessories)

Small accessories rendered as an overlay on `BloomlingDisplay`. Each hat is a 48×48 sprite positioned relative to the Bloomling's top anchor point.

| Hat | Price | Description |
|---|---|---|
| Tiny Top Hat | 15 💧 | A dapper little cylinder. Fernley wears it best. |
| Flower Crown | 15 💧 | Woven from meadow wildflowers. Smells like Tuesday. |
| Mushroom Cap | 20 💧 | A spotted toadstool perched at a jaunty angle. |
| Leaf Beret | 20 💧 | For the artistically inclined Bloomling. |
| Acorn Helmet | 20 💧 | Protection from falling acorns. Fashion-forward. |
| Crystal Tiara | 25 💧 | Refracts light into tiny rainbows. Very distracting. |
| Bee Crown | 25 💧 | Three friendly bees orbit the wearer. They don't sting. Probably. |
| Starlight Halo | 30 💧 | A soft ring of light. Unlocked after Transcendence. |
| Dewdrop Diadem | 30 💧 | Made of crystallized Dewdrops. The ultimate flex. |
| Golden Sprout | 30 💧 | A tiny golden seedling. It doesn't grow, but it glows. |

**Rendering**: `BloomlingDisplay` receives an optional `hatId` prop. A `HatOverlay` component absolutely positions the hat sprite above the Bloomling's bounding box. Hats animate with a subtle idle bob (Reanimated `withRepeat` + `withSequence`).

**Hat Collector achievement**: `ACHIEVEMENT_HAT_TRICK` (id: `hat_trick`, target: 5) is already defined in `achievementTemplates.ts` and wired to `triggerHiddenAchievement`. Purchasing a hat calls `triggerHiddenAchievement("hat_trick")` with progress incremented per unique hat owned. This achievement becomes achievable once the cosmetic system ships.

#### 2. Garden Themes (Background / Ambient Changes)

Swap the Garden screen's `LinearGradient` colors, ambient particle effects, and optional background illustration.

| Theme | Price | Description |
|---|---|---|
| Moonlit Garden | 40 💧 | Silver-blue gradients, firefly particles, crescent moon. |
| Autumn Harvest | 45 💧 | Warm oranges and reds, falling leaf particles. |
| Crystal Cavern | 50 💧 | Deep purples, floating crystal shards, echo ambience. |
| Sakura Grove | 60 💧 | Soft pinks, cherry blossom petal drift, gentle wind. |

**Rendering**: `GardenScreen` reads `cosmetics.activeThemeId` from the store. Each theme defines a `ThemeConfig`: gradient `colors[]`, `locations[]`, optional `ParticleEffect` component, and an ambient color tint applied to `CurrencyBar` and `ComboMeter` borders. The default theme (`null`) uses the current `COLORS.biomeCradle*` values. Theme swap is instant — no loading screen.

#### 3. Tap Effects (Visual Tap Feedback Skins)

Replace the default floating-number style in `TapFeedback` with themed animations.

| Effect | Price | Description |
|---|---|---|
| Sparkle Burst | 20 💧 | Golden sparkles radiate from each tap. |
| Leaf Scatter | 20 💧 | Small leaves flutter outward on impact. |
| Starfall | 25 💧 | Tiny stars rain down from the tap point. |
| Ripple Wave | 25 💧 | Concentric water ripples expand from each tap. |
| Ember Trail | 35 💧 | Warm embers float upward. Pairs well with Autumn Harvest. |

**Rendering**: `TapFeedback` reads `cosmetics.activeTapEffectId`. Each effect defines a `TapEffectConfig` with a particle sprite, count, spread angle, duration, and easing. The floating damage number always renders on top — tap effects are purely additive visual flair beneath it.

#### 4. Garden Decorations (Placeable Items)

Small decorative sprites placed in fixed positions around the Garden screen edges (not on the tap area). Up to 3 active at once.

| Decoration | Price | Description |
|---|---|---|
| Mossy Rock | 10 💧 | A comfortable-looking rock. Bloomlings nap on it. |
| Tiny Lantern | 10 💧 | Warm glow. Flickers gently. |
| Butterfly Jar | 15 💧 | Three butterflies in a jar. They seem happy. |
| Sundial | 15 💧 | Tells time inaccurately but looks great. |
| Miniature Fountain | 20 💧 | Trickles softly. Very zen. |
| Wind Chime | 20 💧 | Sways in a breeze that doesn't exist. |
| Fairy Ring | 25 💧 | A circle of tiny mushrooms. Occasionally sparkles. |

**Rendering**: `GardenScreen` renders a `DecorationLayer` component below the `TapArea`. Decorations are absolutely positioned at predefined anchor points (bottom-left, bottom-right, top-left corners). Each decoration is a small animated sprite (32×32 to 48×48) with a looping idle animation.

### Cosmetic State

New `CosmeticState` interface added to `src/types/game.ts`:

```typescript
interface CosmeticItem {
  id: string;
  category: "hat" | "theme" | "tapEffect" | "decoration";
  purchasedAt: number; // Date.now() timestamp
}

interface CosmeticState {
  /** All cosmetics the player owns, keyed by item ID. */
  owned: Record<string, CosmeticItem>;
  /** Currently equipped hat ID, or null. */
  activeHatId: string | null;
  /** Currently active garden theme ID, or null (default theme). */
  activeThemeId: string | null;
  /** Currently active tap effect ID, or null (default). */
  activeTapEffectId: string | null;
  /** Up to 3 active decoration IDs. */
  activeDecorationIds: string[]; // max length 3
}
```

**Store integration**: New `cosmeticSlice` in `src/state/slices/cosmeticSlice.ts` with actions:
- `buyCosmetic(itemId)` — deducts Dewdrops, adds to `owned`, triggers `hat_trick` progress if category is `hat`
- `equipCosmetic(itemId)` — sets the appropriate `active*` field based on category
- `unequipCosmetic(category)` — clears the active field for that category
- `placeDecoration(itemId, slotIndex)` — adds to `activeDecorationIds` (max 3)
- `removeDecoration(slotIndex)` — removes from `activeDecorationIds`

**Save persistence**: `extractSaveState` and `applySaveToStore` in `saveManager.ts` include the full `CosmeticState`. Existing saves default to `{ owned: {}, activeHatId: null, activeThemeId: null, activeTapEffectId: null, activeDecorationIds: [] }`.

### Cosmetic Preview

Before purchasing, players can preview any cosmetic:

- **Hats**: Tapping a hat card in the shop shows a modal with the hat rendered on the player's currently active Garden Bloomling. "Try It On" → "Buy for X 💧" flow.
- **Themes**: Preview renders a small Garden mockup (200×300) with the theme's gradient and particle effect. No full-screen takeover.
- **Tap Effects**: Preview plays a 2-second looping animation of the effect in a contained box on the card.
- **Decorations**: Preview shows the decoration sprite at actual size with its idle animation.

The preview modal reuses the `BloomlingDetail` modal pattern from `CollectionGrid` — a bottom-sheet with a "Buy" CTA.

### Monthly Milestone Cosmetic Rewards

Every 4th completed daily login cycle (28 cumulative login days) grants a free cosmetic:

| Milestone | Reward |
|---|---|
| Cycle 4 (Month 1) | Flower Crown hat (free) |
| Cycle 8 (Month 2) | Leaf Scatter tap effect (free) |
| Cycle 12 (Month 3) | Mossy Rock decoration (free) |
| Cycle 16 (Month 4) | Moonlit Garden theme (free) |
| Cycle 20+ (Month 5+) | Rotating: 3 Dewdrops + random cosmetic from uncollected pool |

This gives free-to-play-focused players a path to cosmetics without watching ads, while keeping the pace slow enough that Dewdrop purchases remain attractive.

**Implementation**: `getDailyReward` in `dailyRewards.ts` checks `loginCyclesCompleted % 4 === 0` on cycle completion (day 7 claim) and returns an additional `cosmeticRewardId` field. `DailyRewardModal` renders the cosmetic reward with a special "New cosmetic!" banner. The cosmetic is auto-added to `cosmetics.owned`.

### Pricing Summary

| Category | Range | Average | Items |
|---|---|---|---|
| Hats | 15–30 💧 | 22 💧 | 10 |
| Themes | 40–60 💧 | 49 💧 | 4 |
| Tap Effects | 20–35 💧 | 25 💧 | 5 |
| Decorations | 10–25 💧 | 16 💧 | 7 |
| **Total catalog** | — | — | **26 items** |
| **Full collection cost** | — | **~615 💧** | — |

At max daily Dewdrop earn rate (25/day with streak), a dedicated player can buy the entire catalog in ~25 days. A casual player watching 3–5 ads/day takes 2–3 months. This pacing aligns with the monthly milestone rewards as a "taste" that drives further engagement.

---

## Part 2: Onboarding / Tutorial

### Design Philosophy

The game has 6 tabs and multiple interlocking systems (tapping, combos, idle production, zones, evolution, synergies, prestige, Dewdrops). A new player seeing all of this at once will bounce. The tutorial exists to **drip-feed complexity** so the first 10 minutes feel simple: tap, grow, smile.

The tutorial is **in-character**. Fernley — the first Bloomling — guides the player. Fernley's voice is warm, slightly nervous, and encouraging. This matches the game's tone and makes the tutorial feel like part of the world, not a UI overlay bolted on top.

### First-Run Experience (Guided Tutorial)

The tutorial triggers on first app launch when no save data exists. It is a linear sequence of spotlight steps that highlight specific UI elements and block interaction with everything else.

#### Tutorial Steps

| Step | Trigger | Spotlight Target | Fernley Says | Player Action |
|---|---|---|---|---|
| 1 | App opens, no save | Center of screen | "Oh! A Gardener! I've been waiting so long… I'm Fernley. Tap me to wake me up!" | Tap the screen 3 times |
| 2 | After 3 taps | Sunlight counter | "See that golden number? That's Sunlight — you made it by tapping! Everything in the garden runs on Sunlight." | Tap 5 more times |
| 3 | After 8 total taps | Bloomling display | "That's me! I'm your first Bloomling. I'll make Sunlight for you even when you're not tapping. Watch…" | Wait 3 seconds (idle tick visible) |
| 4 | Idle tick fires | Idle production number | "See? I'm working! The more Bloomlings you have, the more Sunlight flows in while you rest." | Tap "Got it" |
| 5 | Acknowledged | Combo meter area | "Try tapping fast! If you keep a rhythm, your combo builds and each tap gets stronger." | Reach 10 combo |
| 6 | 10 combo reached | Zone progress bar | "Brilliant! Now, see that bar? Fill it with Sunlight to clear zones and explore further." | Tap "Got it" |
| 7 | Acknowledged | — (dismiss) | "I'll be here if you need me. Tap, grow, explore — the garden is yours now. 🌱" | Tutorial ends |

**Duration**: ~60–90 seconds for a player who reads everything. Fast tappers finish in 30 seconds.

#### Spotlight UI Pattern

Each tutorial step renders a `TutorialOverlay` component (mounted in `app/_layout.tsx`):
- Semi-transparent dark overlay (`rgba(0,0,0,0.75)`) covers the entire screen
- A "cutout" hole (rounded rect or circle) reveals the spotlight target
- Fernley's dialogue appears in a speech bubble anchored below or above the cutout
- A small Fernley avatar (48×48) sits beside the speech bubble
- Only the spotlighted element is interactive; all other touch events are consumed by the overlay
- A subtle pulse animation on the cutout draws the eye

**Implementation**: `TutorialOverlay` reads `tutorial.currentStep` from the store. Each step defines a `spotlightRef` (React ref to the target component), `position` (above/below), and `dialogue` string. The overlay uses `measure()` on the ref to position the cutout. On web, the cutout is a CSS `clip-path`; on native, it's a `MaskedView` or SVG path.

### Contextual Feature Tooltips (Drip-Feed)

After the initial tutorial, new systems get a one-time tooltip when they first become relevant:

| Feature | Trigger | Tooltip |
|---|---|---|
| Combo system | First time combo reaches 20 | "Nice combo! Keep tapping within 1.5 seconds to keep it going. Higher combos = bigger taps!" |
| Shop | First time player can afford any upgrade | "You can afford an upgrade! Check the Shop tab to power up." |
| Evolution | First Bloomling reaches evolution threshold | "Fernley is ready to evolve! Head to the Collection tab to transform them." |
| Synergies | First synergy discovered | "Synergy discovered! Some Bloomlings work better together. Check the Collection for details." |
| Zones / Gates | First gate zone reached | "This is a Gate zone — you need a burst of Sunlight to break through. Keep tapping!" |
| Rebirth | Zone 35 reached (5 before unlock) | "Something powerful is stirring… At Zone 40, you'll unlock Rebirth — a way to start fresh with permanent bonuses." |
| Dewdrop Shop | Zone 18 reached (2 before unlock) | "The Dewdrop Shop opens at Zone 20. Watch short ads to earn Dewdrops for exclusive perks!" |
| Offline earnings | First return after 30+ minutes | "Welcome back! Your Bloomlings kept working while you were away." (handled by WelcomeBackModal) |

**Implementation**: Each tooltip has a stable ID stored in `tutorial.seenTooltips: string[]`. The `useFeatureTooltip(id, condition)` hook checks if the tooltip has been shown and the condition is met, then renders a dismissible banner at the top of the screen. Dismissing adds the ID to `seenTooltips`.

### Skip Option

- If `applySaveToStore` detects existing save data on first launch (e.g., save import), the tutorial is skipped entirely
- A "Skip Tutorial" button appears in the top-right corner of the `TutorialOverlay` at all times
- Skipping sets `tutorial.completed = true` and marks all initial tooltips as seen
- Contextual tooltips still fire even if the tutorial was skipped (they're independent)

### Tutorial State

New `TutorialState` interface in `src/types/game.ts`:

```typescript
interface TutorialState {
  /** Whether the guided tutorial has been completed or skipped. */
  completed: boolean;
  /** Current step index (0-based) during the guided tutorial. -1 if not active. */
  currentStep: number;
  /** IDs of contextual tooltips the player has dismissed. */
  seenTooltips: string[];
}
```

**Store**: New `tutorialSlice` with actions:
- `advanceTutorialStep()` — increments `currentStep`, sets `completed = true` on final step
- `skipTutorial()` — sets `completed = true`, `currentStep = -1`
- `dismissTooltip(id)` — adds to `seenTooltips`

**Save persistence**: Included in `extractSaveState` / `applySaveToStore`. Existing saves default to `{ completed: true, currentStep: -1, seenTooltips: [] }` — returning players are treated as tutorial-complete but still see contextual tooltips.

---

## Part 3: Retention Hooks

These are the remaining retention systems specified in `06-retention-hooks.md` that are designed but not yet implemented.

### 1. Streak Protection

**Current state**: The streak system exists in `dailyRewards.ts` and the store tracks `streakDays`. Missing a day currently has no grace period — the streak resets immediately on the second missed day (per the design doc). The Streak Shield ad mechanic is not implemented.

**Changes**:

#### Grace Period (1 Day)
- Missing **one calendar day** freezes the streak instead of resetting it
- The frozen state is tracked via `daily.streakFrozenAt: number | null` (timestamp of the missed day)
- If the player returns the next day, the streak resumes from where it was (frozen day does not count toward streak, but doesn't break it)
- Missing a **second consecutive day** resets the streak to 0
- `rolloverDailyState()` in the store handles this logic during the calendar-day-change check

#### Streak Shield (Ad-Based, 1 Per Week)
- When a player returns after missing 2+ days and their streak would reset, a "Streak Shield" prompt appears
- "Watch an ad to save your X-day streak!" — consumes `useRewardedAd("streakShield")` (new ad unit)
- On reward: streak is restored to its pre-reset value, `daily.lastStreakShieldAt` is stamped
- Cooldown: once per 7 calendar days (checked against `lastStreakShieldAt`)
- If the player declines or the cooldown hasn't cleared, the streak resets normally
- UI: rendered as a banner inside `DailyRewardModal` when applicable, before the "Collect" button

**New store fields**: `daily.streakFrozenAt: number | null`, `daily.lastStreakShieldAt: number | null`

### 2. Next Unlock Preview

A persistent, non-intrusive UI element on the Garden screen showing the player's distance to the next meaningful unlock.

**What it shows** (priority order — first matching rule wins):
1. Next Bloomling unlock: "🌱 New Bloomling at Zone X (Y zones away)"
2. Next feature unlock: "✨ [Feature] unlocks at Zone X (Y zones away)"
3. Next evolution ready: "⬆️ [Bloomling] can evolve!"
4. Rebirth recommendation: "🔄 Rebirth available — earn X Nectar"

**Rendering**: A `NextUnlockPreview` component rendered in `GardenScreen` between `CurrencyBar` and `ZoneProgress`. Compact single-line design: icon + text + mini progress bar. Tapping it navigates to the relevant screen (Collection for Bloomlings, Shop for features, Rebirth for prestige).

**Pulse behavior**: When the player is within 80% of the target (e.g., 2 zones away from a 10-zone gap), the component's border gently pulses using Reanimated's `withRepeat(withTiming(...))`.

**Implementation**: A `useNextUnlock()` hook in `src/hooks/useNextUnlock.ts` reads zone, Bloomling, and prestige state to compute the current preview. Pure derivation, no new store fields needed.

### 3. Almost-Affordable Indicator

Shop items the player can *almost* afford get a visual badge that creates the "just 2 more minutes" feeling.

**Rule**: Any upgrade or perk where the player has ≥80% of the cost shows an "Almost there!" badge.

**UI changes**:
- `UpgradeCard` (Sunlight shop): amber badge with "Almost there! (X%)" when `currentSunlight / cost >= 0.8 && currentSunlight < cost`
- `PerkCard` (Dewdrop shop): same badge style, checking Dewdrop balance
- `NectarUpgradeCard` (Nectar shop): same pattern for Nectar
- Badge includes a small progress arc (circular) showing exact percentage

**Implementation**: A `useAlmostAffordable(cost, balance)` hook returns `{ isAlmostAffordable: boolean, percentage: number }`. Each card component calls this hook and conditionally renders the badge. No store changes needed — purely derived from existing state.

### 4. Collection Hint Text

Undiscovered Bloomlings in the Collection screen currently show as silhouettes with no information. Adding biome hints gives players a reason to push into new zones.

**Current state**: `BloomlingCard` in `CollectionGrid` renders locked Bloomlings as a dark silhouette with "???" text.

**Changes**:
- Locked Bloomlings now show a hint line: "Found somewhere in [Biome Name]…"
- The hint is derived from the Bloomling template's `biome` field and the zone range for that biome
- If the player has reached the biome but not unlocked the Bloomling: "Hiding in the [Biome Name] (Zone X–Y)"
- If the player hasn't reached the biome yet: "Found in distant lands…"

**Implementation**: `BloomlingCard` reads `prestige.allTimeHighestZone` and the template's biome/zone data. Pure UI change — no engine or store modifications.

### 5. Auto-Tap Perk

A Dewdrop-purchased quality-of-life perk that taps automatically at a slow rate. Explicitly designed as convenience, not power — active tapping remains 5–10× more effective.

**Two tiers** (matching `05-ad-economy.md`):

| Perk | Cost | Effect |
|---|---|---|
| Auto-Tap (Slow) | 50 💧 | 2 automatic taps per second while app is open |
| Auto-Tap (Fast) | 150 💧 | 5 automatic taps per second while app is open |

**Why 2/sec and not more**: At 2 taps/sec with no combo, auto-tap produces roughly 20–30% of what an active player generates (active tapping at 5–8 taps/sec with combo multiplier). At 5 taps/sec, it reaches ~40–50% of active play. This keeps active play rewarding while giving idle-preference players a meaningful QoL boost.

**Engine integration**:
- New `src/engine/autoTap.ts` module: `getAutoTapRate(state): number` returns 0, 2, or 5 based on owned perks
- The game loop's tick function checks `getAutoTapRate()`. If > 0, it calls `calculateTapReward` that many times per second (spread across ticks, not burst)
- Auto-taps do **not** build combo (combo requires real player input within the 1.5s window)
- Auto-taps **can** trigger critical hits (same 5% base chance)
- Auto-taps use the same `baseTapValue * tapMultiplier` formula but without combo multiplier
- Visual: auto-taps show a smaller, muted tap feedback (50% opacity, no screen shake) to distinguish from manual taps

**Perk templates**: Two new entries in `perkTemplates.ts`:

```typescript
{
  id: "auto_tap_slow",
  name: "Auto-Tap (Slow)",
  description: "Automatically taps 2 times per second while the app is open. Does not build combo.",
  cost: 50,
  category: "permanent",
  badge: "QoL",
}
{
  id: "auto_tap_fast",
  name: "Auto-Tap (Fast)",
  description: "Automatically taps 5 times per second. Replaces Slow. Does not build combo.",
  cost: 150,
  category: "permanent",
  badge: "QoL",
}
```

**Upgrade path**: Buying Auto-Tap (Fast) when Auto-Tap (Slow) is already owned costs the full 150 💧 (not the difference). The slow version is superseded — `getAutoTapRate` returns the highest tier owned.

**Store**: No new slice needed. Auto-tap perks use the existing `buyPerk` action and `perks` state. `getAutoTapRate` reads from `state.perks`.

---

## Part 4: Implementation Plan

### Task Breakdown

#### Cosmetic System

| # | Task | Persona | Size | Dependencies | Ships Independently? |
|---|---|---|---|---|---|
| C1 | `CosmeticState` type + `cosmeticSlice` + save migration | Engine | S | None | Yes (no UI yet) |
| C2 | `cosmeticTemplates.ts` — static catalog (26 items) | Content + Engine | S | None | Yes |
| C3 | Cosmetic section in `DewdropShop` — browse, preview, buy | UI/UX | M | C1, C2 | Yes |
| C4 | `HatOverlay` on `BloomlingDisplay` | UI/UX | M | C1 | Yes (with C1) |
| C5 | `ThemeConfig` system + theme swap in `GardenScreen` | UI/UX | M | C1 | Yes (with C1) |
| C6 | `TapEffectConfig` system + effect swap in `TapFeedback` | UI/UX | M | C1 | Yes (with C1) |
| C7 | `DecorationLayer` + placement UI | UI/UX | M | C1 | Yes (with C1) |
| C8 | Monthly milestone cosmetic rewards in `dailyRewards.ts` | Engine + UI/UX | S | C1, C2 | Yes (with C1, C2) |
| C9 | Wire `hat_trick` achievement to cosmetic purchases | Engine | S | C1 | Yes (with C1) |
| C10 | Cosmetic preview assets (placeholder sprites) | Content | M | None | Yes |

#### Onboarding / Tutorial

| # | Task | Persona | Size | Dependencies | Ships Independently? |
|---|---|---|---|---|---|
| T1 | `TutorialState` type + `tutorialSlice` + save migration | Engine | S | None | Yes |
| T2 | `TutorialOverlay` component (spotlight + speech bubble) | UI/UX | L | T1 | No (needs T3) |
| T3 | 7-step guided tutorial flow + Fernley dialogue | Content + UI/UX | M | T1, T2 | Yes (with T1, T2) |
| T4 | `useFeatureTooltip` hook + 8 contextual tooltips | UI/UX + Engine | M | T1 | Yes (with T1) |
| T5 | Skip detection (save import) + skip button | Engine + UI/UX | S | T1, T2 | Ships with T2 |

#### Retention Hooks

| # | Task | Persona | Size | Dependencies | Ships Independently? |
|---|---|---|---|---|---|
| R1 | Streak grace period (1-day freeze logic) | Engine | S | None | Yes |
| R2 | Streak Shield ad prompt in `DailyRewardModal` | UI/UX + Engine | M | R1 | Yes (with R1) |
| R3 | `NextUnlockPreview` component + `useNextUnlock` hook | UI/UX | M | None | Yes |
| R4 | Almost-affordable badge in `UpgradeCard` / `PerkCard` / `NectarUpgradeCard` | UI/UX | S | None | Yes |
| R5 | Collection hint text in `BloomlingCard` | UI/UX | S | None | Yes |
| R6 | Auto-tap engine (`autoTap.ts` + game loop integration) | Engine | M | None | Yes |
| R7 | Auto-tap perk templates + shop integration | Engine + UI/UX | S | R6 | Yes (with R6) |

### Effort Summary

| Size | Definition | Tasks |
|---|---|---|
| **S** (Small) | < 1 day, single file or minor changes | C1, C2, C8, C9, C10, T1, T5, R1, R4, R5, R7 |
| **M** (Medium) | 1–2 days, multiple files, some design decisions | C3, C4, C5, C6, C7, T3, T4, R2, R3, R6 |
| **L** (Large) | 2–3 days, new component system, cross-cutting | T2 |

**Total estimated effort**: ~25–30 dev-days across all personas.

### Suggested Implementation Order

The order optimizes for: (1) shipping value early, (2) unblocking dependent work, (3) grouping by persona to minimize context-switching.

**Wave 1 — Foundations (Week 1)**
1. C1 — Cosmetic state + slice + save migration
2. T1 — Tutorial state + slice + save migration
3. R1 — Streak grace period logic
4. C2 — Cosmetic templates catalog
5. R4 — Almost-affordable badges (zero dependencies, instant UX win)
6. R5 — Collection hint text (zero dependencies, instant UX win)

**Wave 2 — Core Retention (Week 2)**
7. R3 — Next Unlock Preview on Garden screen
8. R6 — Auto-tap engine module
9. R7 — Auto-tap perk templates + shop wiring
10. R2 — Streak Shield ad prompt
11. C9 — Wire hat_trick achievement

**Wave 3 — Cosmetic Rendering (Week 3)**
12. C4 — Hat overlay on BloomlingDisplay
13. C5 — Garden theme system
14. C6 — Tap effect system
15. C7 — Decoration layer
16. C3 — Cosmetic shop section (browse + preview + buy)
17. C8 — Monthly milestone cosmetic rewards

**Wave 4 — Onboarding (Week 4)**
18. T2 — TutorialOverlay component
19. T3 — Guided tutorial flow (7 steps)
20. T4 — Contextual feature tooltips (8 tooltips)
21. T5 — Skip detection + skip button
22. C10 — Placeholder cosmetic sprites

### Dependency Graph

```
C1 (cosmetic state) ──┬── C3 (shop UI)
                       ├── C4 (hats)
                       ├── C5 (themes)
                       ├── C6 (tap effects)
                       ├── C7 (decorations)
                       ├── C8 (monthly rewards) ── C2 (templates)
                       └── C9 (hat_trick)

T1 (tutorial state) ──┬── T2 (overlay) ──┬── T3 (guided flow)
                       │                  └── T5 (skip)
                       └── T4 (tooltips)

R1 (grace period) ──── R2 (streak shield)
R6 (auto-tap engine) ── R7 (auto-tap perks)
R3, R4, R5 — no dependencies (ship anytime)
```

### What Ships Independently

These tasks can be merged and released without waiting for anything else:
- **R4** (almost-affordable badges) — pure UI enhancement, no new state
- **R5** (collection hints) — pure UI enhancement, no new state
- **R3** (next unlock preview) — new component, reads existing state
- **R1** (streak grace period) — engine logic change, backward-compatible
- **C1 + C2** (cosmetic state + templates) — invisible to players until rendering ships, but unblocks everything else

### New Ad Unit

One new rewarded ad unit is introduced:
- `streakShield` — added to `RewardedAdUnit` type in `adManager.ts`, with a `TODO(prod-ids)` placeholder

This brings the total ad unit count to 8 (from 7).

---

## Cross-References

- Dewdrop pricing and earn rates: `docs/design/05-ad-economy.md`
- Streak system and daily rewards: `docs/design/06-retention-hooks.md`
- Feature unlock timeline: `docs/design/01-core-game-loop.md`
- Achievement definitions: `docs/content/04-achievements.md`
- Current perk catalog: `src/data/perkTemplates.ts`
- Current shop UI: `src/components/dewdrop/DewdropShop.tsx`

## Next Section

See `docs/roadmap.md` for phase tracking. This document covers Phase 9 deliverables.
