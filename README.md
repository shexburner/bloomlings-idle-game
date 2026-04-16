# Bloomlings

A React Native / Expo idle game about growing creatures across biomes. Tap, collect, evolve, and rebirth your way through a garden of Bloomlings.

## Tech stack

- **Expo SDK 54** with Expo Router (file-based routing)
- **React Native 0.81** / React 19
- **Zustand** for state (sliced store + selectors)
- **react-native-mmkv** for saves
- **react-native-reanimated** for animations
- **react-native-google-mobile-ads** for monetization
- **TypeScript** (strict)

## Getting started

```bash
npm install
npm start          # Expo dev server
```

Platform-specific entry points:

```bash
npm run android
npm run ios
npm run web
npm run lint
```

## Project structure

```
app/            Expo Router screens (tabs, layouts)
src/            Engine, state, services, types
components/     Shared UI components
constants/      Theme, colors, layout constants
hooks/          Reusable React hooks
assets/         Fonts, images
docs/           Canonical design & engineering docs
docs/compact/   Auto-generated low-token companions (see below)
scripts/        Repo utility scripts
```

## Documentation

Design, economy, content, engine, and UI specs live under `docs/`, alongside `docs/roadmap.md` and `docs/status.md`. Every canonical doc has a token-light companion under `docs/compact/`, mirroring the source tree 1:1. The compact files are the default context for agents, PR reviews, and any other low-token workflow.

### Compact docs workflow

1. **Read `docs/compact/**` first.** Each compact file starts with a `<!-- Source: docs/... -->` header pointing to its canonical source.
2. **Need more detail?** Jump to the source file named in that header and grep for the section you need.
3. **Edit canonical docs only** — never hand-edit files in `docs/compact/`. They carry an `<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->` banner for a reason.
4. **Regenerate after editing** a canonical doc:

   ```bash
   npm run docs:compact
   # equivalent to: python3 docs/build_compact_docs.py
   ```

The generator lives at `docs/build_compact_docs.py`. It walks `docs/content/`, `docs/design/`, `docs/economy/`, `docs/engine/`, `docs/ui/`, plus `docs/roadmap.md` and `docs/status.md`, and writes a compact version of each one into `docs/compact/`. See [`docs/compact/README.md`](docs/compact/README.md) for the full source → compact file map.

## Status

- Current progress: [`docs/status.md`](docs/status.md)
- Phase breakdown: [`docs/roadmap.md`](docs/roadmap.md)

## In-flight work — Phase 5 ad touchpoints

Commit `485f35a` scaffolds the store/engine for three outstanding rewarded-ad
touchpoints. UI and game-loop integration are **not yet shipped**; the new
actions and fields are unreachable from the player-facing app. Picking this
up means finishing the list below.

**Landed (scaffold):**

- `src/engine/luckySprout.ts` — `LuckySproutReward` enum, weighted 5-entry
  wheel (`rollLuckySproutReward`), interval helper (`nextLuckySproutIntervalMs`),
  and duration/amount constants pulled from `docs/design/05-ad-economy.md`
- `src/state/store.ts` MetaSlice — new persistent fields
  (`lastLuckySproutAt`, `luckySproutTapBoostExpiresAt`, `lastComboKeeperAt`,
  `pendingNectarBonus`), transient `luckySproutPending`, and five actions:
  `applySunbeamBoost`, `applyComboKeeper`, `triggerLuckySprout`,
  `clearLuckySprout`, `applyLuckySproutReward`
- `src/state/slices/prestigeSlice.ts` — `pendingNectarBonus` multiplies into
  `calculateNectarEarned` on Rebirth and is cleared; also cleared on
  Transcendence along with `luckySproutTapBoostExpiresAt`

**Still to ship:**

- **Game-loop Lucky Sprout scheduler** — extend `useGameLoop` in
  `src/engine/gameLoop.ts` with a foreground-only interval (~30s tick) that
  calls `triggerLuckySprout()` when
  `Date.now() - lastLuckySproutAt > random(10min, 15min)`,
  `luckySproutPending === false`, and no offline-session modal is pending
- **`SunbeamBoostButton`** (`src/components/garden/SunbeamBoostButton.tsx`,
  new) — floating FAB bottom-right of the Garden screen; hidden until
  `prestige.allTimeHighestZone >= 15`; consumes `useRewardedAd("sunbeamBoost")`,
  calls `applySunbeamBoost()` on reward, displays `mm:ss` countdown from the
  Sunbeam entry in `activeBoosts` while active
- **`ComboKeeperButton`** (`src/components/garden/ComboKeeperButton.tsx`,
  new) — small pill beside `ComboMeter`, visible only when
  `combo.count >= 50 && !combo.frozen` and the 30-min cooldown is clear;
  consumes `useRewardedAd("comboKeeper")`, calls `applyComboKeeper()` on
  reward (it re-checks cooldown and returns `false` on miss)
- **`LuckySproutModal`** (`src/components/modals/LuckySproutModal.tsx`,
  new) — mounted in `app/_layout.tsx` next to `WelcomeBackModal`; visible
  while `luckySproutPending === true`; consumes `useRewardedAd("luckySprout")`,
  on reward calls `rollLuckySproutReward()` then `applyLuckySproutReward(kind)`
  and flashes the result via `describeLuckySproutReward`; on close without
  watching calls `clearLuckySprout()`
- **Mounting** — add `SunbeamBoostButton` and `ComboKeeperButton` to the
  container `<View>` in `app/(tabs)/index.tsx`; add `LuckySproutModal` to
  `app/_layout.tsx`
- **Tap-boost wiring** — `src/engine/tapSystem.ts` does not yet read
  `luckySproutTapBoostExpiresAt`. Either fold a `getTapBoostMultiplier`
  selector into `selectEffectiveTapValue`, or multiply the result inside
  `useTapHandler` before calling `calculateTapReward`. Without this, the
  Lucky Sprout "2× tap for 5 min" reward sets the field but never affects
  tap rewards
- **Save migration** — `src/services/saveManager.ts:extractSaveState` and
  `applySaveToStore` do not yet include the new persistent fields. Add
  `lastLuckySproutAt`, `luckySproutTapBoostExpiresAt`, `lastComboKeeperAt`,
  `pendingNectarBonus` to both. Existing saves default to initial values
  (all `null`), so no version bump is required — but the fields should be
  added to the save snapshot so they survive app restart
- **Docs** — bump the Phase 5 ad-touchpoint row in `docs/roadmap.md` from
  2/7 to 5/7 (adding Sunbeam Boost, Combo Keeper, Lucky Sprout); note in
  `docs/status.md` that Gate Assist and Boss Smash remain blocked on
  unbuilt Zone-Gate and Boss-Fight engine loops
  (`src/types/game.ts:527-541` declares the state shape but nothing ever
  writes to those fields); regenerate `docs/compact/**` via
  `npm run docs:compact`

**Gate Assist + Boss Smash are intentionally out of scope** — they require
new engine loops (gate timer decrement + consolation bonus; boss HP/damage/
timer) that don't exist anywhere in `src/engine/`. Those are separate
engine tickets, not "finish the remaining ad touchpoints" work.
