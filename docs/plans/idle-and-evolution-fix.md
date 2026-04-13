# Plan: Make Idle Production & Evolution Work in Built APK

## Context

When the user builds and runs the APK, **only tapping and buying upgrades work**. Idle production shows 0/s and evolution never happens. The engine (game loop at 10 ticks/sec, `totalSunlightPerSecondFromRegistry`, `canEvolve`/`getEvolutionCost`/`evolveBloomling`) is fully implemented. The problem is **three missing wires** between engine and UI/state:

1. **No Bloomling discovery system.** `src/data/bloomlingTemplates.ts` defines 8 species with `unlockCondition: "zone_1" | "zone_3" | "zone_10" | ...`, but nothing reads those conditions. `advanceZone()` in `src/state/store.ts:192-228` only updates zone/stats. `initialBloomlings = {}` means the garden is always empty, so `totalSunlightPerSecondFromRegistry` returns 0 forever.
2. **No Level-Up UI, and `levelUpBloomling` doesn't charge.** `bloomlingSlice.ts:95-110` is a raw `level + 1` with no cost. No UI triggers it. Bloomlings can never reach level 100, so evolution is permanently blocked.
3. **No Evolve button.** `BloomlingDetail.tsx` shows a display-only Sprout → Bloom → Elder timeline (lines 205-246). The only button in the modal is Garden toggle (lines 265-292). The existing `evolveBloomling` store action is never called from any UI.

Why tapping works: `useTapHandler` calls `selectEffectiveTapValue()` + `addSunlight()` — no Bloomling dependency. Why upgrades work: Shop uses inline template arrays, not the Bloomling registry.

Fix = one new pure engine module + small slice changes + UI additions in `BloomlingDetail.tsx`, plus a retro hook in `app/_layout.tsx`.

---

## Recommended Approach

### Step 1 — Bloomling Discovery System

**New file:** `src/engine/discovery.ts` (pure, no store dependency — matches the separation used by `evolution.ts`, `rebirth.ts`, `garden.ts`).

Public surface:
- `parseUnlockCondition(condition: string): { kind: "zone"; zone: number } | { kind: "boss"; biomeIndex: number } | null` — parses `"zone_N"` and `"boss_biomeN"`.
- `createBloomlingInstance(template: BloomlingTemplate): Bloomling` — returns `{ templateId: template.id, instanceId: "${template.id}-1", level: 1, evolutionStage: Sprout, inGarden: false, gardenSlot: null, unlocked: true, totalProduced: 0 }`. Stable, templateId-derived instanceId keeps saves stable and makes re-running discovery idempotent.
- `getZoneUnlockTemplates(currentZone: number, existing: Record<string, Bloomling>): BloomlingTemplate[]` — iterates `BLOOMLING_TEMPLATES`, returns those with `unlockMethod === ZoneMilestone` whose parsed zone ≤ `currentZone` and whose `id` is not already present as a `templateId` in `existing`. Also handles retroactive grants for returning players.

**Design choice — one instance per species.** The registry is species-keyed and both `garden.slots` and synergies iterate by ID. Multi-instance would multiply garden pressure and complicate dedup during retro-grant. Simple rule: species == instance.

**Modify `src/state/slices/bloomlingSlice.ts`:**

Add two actions to `BloomlingSlice`:

```ts
discoverBloomlingsForZone: (zone: number) => void;
ensureInitialDiscoveries: () => void;
```

`discoverBloomlingsForZone(zone)`:
1. Reads `state.bloomlings` and calls `getZoneUnlockTemplates(zone, state.bloomlings)`.
2. For each new template, creates an instance and merges into `state.bloomlings`.
3. **Auto-place only the first-ever Bloomling** — if `Object.keys(state.bloomlings).length === 0` before the merge, use `placeBloomlingInSlot` (from `src/engine/garden.ts`) inside the same `set` call to atomically put the first instance into garden slot 0. Later discoveries go to collection only; the player places manually.
4. Recompute `stats.bloomlingsDiscovered = Object.keys(nextBloomlings).length` (simpler than delta math; robust against double-calls).
5. Calls `get().recomputeActiveSynergies()` after `set`.

`ensureInitialDiscoveries()` — thin wrapper that calls `discoverBloomlingsForZone(get().zoneProgress.currentZone)`. Exists as a named entry point for launch and post-rebirth hooks.

**Modify `src/state/store.ts` `advanceZone()` (lines 192-228):**

After the `set(...)` call **and** after `get().syncGardenCapacity()` (order matters — new garden slot must exist before placement), add:
```ts
get().discoverBloomlingsForZone(get().zoneProgress.currentZone);
```

**Modify `app/_layout.tsx`:**

After `initializeFromDisk()` resolves, call `useGameStore.getState().ensureInitialDiscoveries()`. Covers:
- Fresh install (zone 1) → grants Fernley, auto-places her in slot 0 → idle production starts.
- Returning player whose save predates this fix → retroactively grants every species whose threshold has been met. Idempotent.

**Rebirth interaction:** after `executeRebirth()` completes (in `prestigeSlice.ts`), also call `discoverBloomlingsForZone(startingZone)` so Seasonal Memory higher starting zones grant the right species. Safe because discovery filters by existing `templateId`s.

---

### Step 2 — Level-Up Mechanic

**New helper in `src/state/selectors.ts`:** `calculateLevelUpCost(baseLevelCost: number, currentLevel: number, rapidGrowthLevel: number): number` — centralizes the math so slice and UI agree:
- `raw = calculateUpgradeCost(baseLevelCost, 1.15, currentLevel)` (existing function; 1.15 matches Tap Power scaling).
- `discount = Math.max(0.25, 1 - rapidGrowthLevel * 0.10)` (cap at 25% floor since Rapid Growth's maxLevel is 15 and would otherwise invert).
- Return `Math.ceil(raw * discount)`.

**Rewrite `levelUpBloomling(instanceId)` in `bloomlingSlice.ts:95-110`:**

1. Look up `bloomling` and `template` via `getBloomlingTemplate(templateId)`. No-op if missing or `level >= 100`.
2. `const rapidGrowthLevel = getUpgradeLevel(state.upgrades, "rapid_growth")` (already exported from `rebirth.ts`).
3. `const cost = calculateLevelUpCost(template.baseLevelCost, bloomling.level, rapidGrowthLevel)`.
4. If `state.resources.sunlight < cost`, return state unchanged.
5. Otherwise: deduct sunlight, increment level, return updated slice. Mirror the pattern from the existing `evolveBloomling` action (lines 112-146).

**Modify `BloomlingDetail.tsx` — add Level Up section between Stats (line 188) and Ability (line 191):**

- Card uses existing `styles.section` look.
- Title: "LEVEL UP".
- Two `StatRow`s:
  - "Current": `formatNumber(production)/s`.
  - "Next": `formatNumber(calculateBloomlingProduction(template.baseProduction, instance.level + 1, instance.evolutionStage))/s` with a subtle green `+Δ/s` suffix.
- Button styled like `UpgradeCard` affordability pattern (green when affordable, gray when not).
  - Label: `Level Up — ${formatNumber(cost)} ☀`.
  - Disabled when `sunlight < cost`.
  - At `level === 100`, swap for a disabled "MAX LEVEL — Ready to Evolve" indicator that visually points at the Evolution section below.
- `onPress={() => levelUpBloomling(instance.instanceId)}`.

Hook requirements: `levelUpBloomling`, `resources.sunlight`, `state.upgrades["rapid_growth"]?.level ?? 0`.

---

### Step 3 — Evolve Button

**Modify `BloomlingDetail.tsx` — inside the existing Evolution section (lines 205-246), below the timeline `evolutionRow`:**

Imports: `canEvolve`, `getEvolutionCost`, `getNextEvolutionStage` from `src/engine/evolution.ts`.

```tsx
const evolveBloomling = useGameStore((s) => s.evolveBloomling);
const sunlight = useGameStore((s) => s.resources.sunlight);
const nectar = useGameStore((s) => s.resources.nectar);
const cost = getEvolutionCost(instance);
const nextStage = getNextEvolutionStage(instance.evolutionStage);
const canEvolveNow = canEvolve(instance, { sunlight, nectar });
```

Four button states:
1. **Elder** (`nextStage === null`) — hide button, show muted text "Fully evolved."
2. **Level < 100** — disabled gray button. Label: `Level 100 Required (${instance.level}/100)`. Thin progress bar.
3. **Locked by cost** (level 100 but `!canEvolveNow`) — disabled button. Label: `Evolve — ${formatNumber(cost.sunlight)} ☀${cost.nectar > 0 ? ` + ${cost.nectar} ✧` : ""}` with cost numbers in red (`#f44336`).
4. **Ready** — colored button. Sprout→Bloom uses `COLORS.accent` (green). Bloom→Elder uses purple `#9c27b0` (matches Nectar theme). Nectar portion of cost text rendered in pink `#e91e63` to distinguish from gold sunlight.

`onPress={() => evolveBloomling(instance.instanceId)}`. The existing slice action handles cost deduction + `recomputeActiveSynergies`, so no additional logic is required in the component.

---

## Files to Modify / Create

| File | Change |
|---|---|
| `src/engine/discovery.ts` | **New** — `parseUnlockCondition`, `createBloomlingInstance`, `getZoneUnlockTemplates` |
| `src/state/selectors.ts` | Add `calculateLevelUpCost(baseLevelCost, currentLevel, rapidGrowthLevel)` helper |
| `src/state/slices/bloomlingSlice.ts` | Rewrite `levelUpBloomling` with cost; add `discoverBloomlingsForZone` + `ensureInitialDiscoveries` |
| `src/state/store.ts` | Wire `discoverBloomlingsForZone` into `advanceZone()` after `syncGardenCapacity()` |
| `src/state/slices/prestigeSlice.ts` | Call `discoverBloomlingsForZone(startingZone)` at the end of `executeRebirth()` |
| `app/_layout.tsx` | Call `ensureInitialDiscoveries()` after `initializeFromDisk()` |
| `src/components/collection/BloomlingDetail.tsx` | Add Level Up section + Evolve button inside Evolution section |

### Reused Existing Functions
- `calculateUpgradeCost(baseCost, scaling, level)` — `src/state/selectors.ts`
- `calculateBloomlingProduction(base, level, stage)` — `src/state/selectors.ts`
- `canEvolve`, `getEvolutionCost`, `getNextEvolutionStage` — `src/engine/evolution.ts`
- `getBloomlingTemplate(id)` — `src/data/bloomlingTemplates.ts:164`
- `getUpgradeLevel(upgrades, id)` — `src/engine/rebirth.ts:302`
- `placeBloomlingInSlot` — `src/engine/garden.ts`
- `recomputeActiveSynergies`, `evolveBloomling`, `addToGarden` — existing `bloomlingSlice` actions

### Sequencing / Dependencies
1. Add `src/engine/discovery.ts` (pure, no deps).
2. Add `calculateLevelUpCost` to `src/state/selectors.ts`.
3. Modify `bloomlingSlice.ts` (rewrite `levelUpBloomling`, add discovery actions, update interface).
4. Modify `store.ts` `advanceZone()`.
5. Modify `prestigeSlice.ts` `executeRebirth()` to call discovery with new starting zone.
6. Modify `app/_layout.tsx` to call `ensureInitialDiscoveries()`.
7. Modify `BloomlingDetail.tsx` (Level Up section + Evolve button).

Steps 1-6 unblock idle production (step 6 alone places Fernley for existing saves). Step 7 enables the evolution path end-to-end.

### Edge Cases Handled
- **Save migration**: no schema change. `bloomlings` gains entries on boot via `ensureInitialDiscoveries`; idempotent through `existing`-filter. No `CURRENT_SAVE_VERSION` bump needed.
- **First-launch Fernley**: `advanceZone` fires only on zone→zone+1 transition, so zone 1 grant lives in `ensureInitialDiscoveries`, not `advanceZone`.
- **Rebirth + Seasonal Memory**: post-rebirth discovery call ensures higher starting zones retroactively grant species.
- **Garden full on discovery**: only the first-ever Bloomling auto-places in slot 0. Later species go to Collection — player places manually. No eviction of curated gardens.
- **Boss unlocks**: out of scope for this fix. `parseUnlockCondition` returns the boss variant but `discoverBloomlingsForZone` skips it. Boss-defeat pathway can reuse the same action later.
- **Elder already**: `nextStage === null` hides the Evolve button entirely.
- **Rapid Growth cost floor**: clamped at 25% of raw cost to prevent degenerate free level-ups (Rapid Growth maxLevel 15 × 10% would otherwise invert).
- **Instance ID stability**: `${templateId}-1` ensures saves round-trip cleanly and retro-grants never duplicate.
- **Stats drift**: `bloomlingsDiscovered` recomputed as `Object.keys(bloomlings).length` — no delta math, safe against double-call.

## Verification

1. **Clean install path:**
   - Delete save (or fresh build). Launch → land on Garden tab.
   - **Expect**: Fernley auto-placed in slot 0; CurrencyBar shows `X/s > 0` within one tick (~100ms). Sunlight increases without tapping.

2. **Zone progression discovery:**
   - Advance to zone 3 → Collection shows Mosswick. Zone 10 → Petaline.
   - Confirm `useGameStore.getState().bloomlings` entries and `stats.bloomlingsDiscovered` match expectation.

3. **Retroactive save migration:**
   - Load a pre-fix save already at zone 20. On boot, Fernley + Mosswick + Petaline appear in Collection; Fernley is auto-placed only if the garden was empty.

4. **Level up:**
   - Open Fernley in BloomlingDetail → press Level Up.
   - **Expect**: Sunlight decreases by `ceil(10 * 1.15^1)` ≈ 12 (at rapidGrowth=0); level increments to 2; production rate in CurrencyBar bumps up. Costs scale geometrically over multiple presses.
   - With Rapid Growth upgrade purchased, confirm cost discount applied (never below 25% of raw).

5. **Evolution (Sprout → Bloom):**
   - Push a Bloomling to level 100 (playtest or save edit). Open detail → press Evolve.
   - **Expect**: 10,000 Sunlight deducted; stage → Bloom; level resets to 1; production multiplier 3× reflected in CurrencyBar.

6. **Evolution (Bloom → Elder):**
   - Requires 100,000 Sunlight + 5 Nectar (Common). Nectar earned via Rebirth. Confirm button disabled until both costs met; purple styling + pink nectar cost color visible when ready.

7. **Run the APK:** `npm run android` or the user's `eas build` flow. Verify all above on-device.

8. **Regression checks:**
   - Tap still earns Sunlight at the correct rate (nothing in `tapSystem.ts` touched).
   - Shop upgrades still buy correctly (no changes to `upgradeSlice`).
   - Save/load round-trips with Bloomlings present; no instance duplication after multiple reloads.
