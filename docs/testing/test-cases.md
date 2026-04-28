# Bloomlings — Test Case Catalog

**Owner:** Quality Engineer Lead
**Last updated:** 2026-04-17
**Scope:** Phases 1–7 (all shipped ad touchpoints covered; Gate Assist and Boss Smash excluded — engine loops not yet built). Phase 6–7 additions: Achievements, Daily Rewards, Transcendence & Essence Shop, Offline Progress upgrades, Save Migration.

Priority key: **P0** = critical path, automated in `.maestro/`. **P1** = important, automated where feasible. **P2** = manual only.
Automation key: `auto` (covered by a Maestro flow), `manual` (exploratory/manual only), `planned` (P1 flow stubbed with TODO).

IDs use `TC-<AREA>-<NNN>`.

---

## 1. Tap Loop (`TC-TAP`)

| ID | Title | Pre | Steps | Expected | Pri | Auto |
|----|-------|-----|-------|----------|-----|------|
| TC-TAP-001 | Single tap awards Sunlight | Fresh launch | Tap `tap-area` once | `currency-sunlight` increases by ≥1 | P0 | auto |
| TC-TAP-002 | Ten taps accumulate linearly | Fresh launch | Tap `tap-area` ×10 | `currency-sunlight` ≥ 10 | P0 | auto |
| TC-TAP-003 | Tap upgrade scales tap value | Bought Bigger Tap L1 | Tap once | Gained Sunlight > baseline (tracked value) | P1 | planned |
| TC-TAP-004 | Combo meter displays after threshold | Fresh launch | Tap ~50× quickly | `combo-meter` visible, `combo-count` shows ≥50 | P1 | planned |
| TC-TAP-005 | Combo multiplier increments at tiers | Combo ≥ 50 | Continue tapping | `combo-multiplier` shows >1× | P1 | manual |
| TC-TAP-006 | Autoclicker anti-cheat triggers | Simulated high-rate taps | Tap >20 Hz for 3s | Combo drops or tap value caps | P2 | manual |
| TC-TAP-007 | Tap feedback animation renders | Fresh launch | Single tap | Floating "+N" feedback appears briefly | P2 | manual |
| TC-TAP-008 | Tap area accessible via testID | Fresh launch | Query `tap-area` | Element exists and is pressable | P0 | auto |

## 2. Currency & Persistence (`TC-CUR`)

| ID | Title | Pre | Steps | Expected | Pri | Auto |
|----|-------|-----|-------|----------|-----|------|
| TC-CUR-001 | Sunlight display initialises at 0 | Fresh install (data cleared) | Launch app | `currency-sunlight` reads `0` | P0 | auto |
| TC-CUR-002 | Manual save persists across restart | Some Sunlight earned | Settings → Save → force-stop → relaunch | Same Sunlight shown | P0 | auto |
| TC-CUR-003 | Auto-save fires within 30s | Tap then wait 35s | Force-stop, relaunch | Same Sunlight shown | P1 | planned |
| TC-CUR-004 | Export produces non-empty save string | Tap a few times | Settings → Export Save | `settings-export-text` non-empty | P0 | auto |
| TC-CUR-005 | Import round-trip restores state | Exported string available | Clear → Import → confirm | Restored Sunlight matches | P0 | auto |
| TC-CUR-006 | Import rejects invalid string | — | Paste garbage → Load | Alert with "Invalid save data"; state unchanged | P1 | planned |
| TC-CUR-007 | Nectar balance visible after rebirth | Completed 1 rebirth (seed) | Launch | `currency-nectar` ≥ 1 | P0 | auto |
| TC-CUR-008 | Dewdrops shown once unlocked | Seed with dewdrop feature | Launch | `currency-dewdrops` visible | P2 | manual |
| TC-CUR-009 | Large numbers format with K/M/B suffixes | Seed 1e12 Sunlight | Launch | Text shows "1T" or equivalent | P1 | manual |

## 3. Bloomlings & Collection (`TC-COL`)

| ID | Title | Pre | Steps | Expected | Pri | Auto |
|----|-------|-----|-------|----------|-----|------|
| TC-COL-001 | Collection tab renders grid | Fresh launch | Open Collection tab | `collection-grid` visible | P0 | auto |
| TC-COL-002 | Discovered count reflects state | Seed with 3 discovered | Open Collection | `collection-discovered-count` reads "3 / 8" | P1 | planned |
| TC-COL-003 | Locked bloomling shows locked card | Fresh launch | Tap any locked species | `bloomling-card-<id>-locked` visible, no modal opens | P0 | auto |
| TC-COL-004 | Discovered bloomling opens detail modal | Seed Fernley discovered | Tap `bloomling-card-fernley` | `bloomling-detail` visible | P0 | auto |
| TC-COL-005 | Detail modal close button works | Detail modal open | Tap `bloomling-detail-close` | Modal dismissed | P0 | auto |
| TC-COL-006 | Detail modal shows lore text | Detail open | — | Non-empty description region | P2 | manual |
| TC-COL-007 | Level-up button appears when affordable | Seed Fernley with enough Sunlight | Open detail | `bloomling-detail-level-up` visible and enabled | P1 | planned |
| TC-COL-008 | Level-up button disabled when too poor | Seed Fernley, 0 Sunlight | Open detail | Level-up button disabled | P1 | planned |
| TC-COL-009 | Garden toggle button present | Discovered bloomling | Open detail | `bloomling-detail-garden-toggle` visible | P1 | planned |
| TC-COL-010 | Evolve button gated correctly | Bloomling Lv.99 (not 100) | Open detail | `bloomling-detail-evolve` disabled or hidden | P1 | manual |

**Note:** Level-up logic currently a no-op per `docs/plans/idle-and-evolution-fix.md`. TC-COL-007/008 are documented but awaiting the fix to go green.

## 4. Shop Upgrades (`TC-SHOP`)

| ID | Title | Pre | Steps | Expected | Pri | Auto |
|----|-------|-----|-------|----------|-----|------|
| TC-SHOP-001 | Shop screen renders | Fresh launch | Open Shop tab | `shop-screen` visible | P0 | auto |
| TC-SHOP-002 | Tap tab is default | Open Shop | — | `shop-tab-tap` active | P0 | auto |
| TC-SHOP-003 | Idle tab switches view | Open Shop | Tap `shop-tab-idle` | Idle upgrades list visible | P0 | auto |
| TC-SHOP-004 | Buy multiplier x1 default | Open Shop | — | `multiplier-x1` active | P0 | auto |
| TC-SHOP-005 | Buy multiplier x10 selectable | Open Shop | Tap `multiplier-x10` | Cost preview updates | P0 | auto |
| TC-SHOP-006 | Buy multiplier Max selectable | Seed 1e6 Sunlight | Tap `multiplier-max` | Cost reflects max affordable | P1 | planned |
| TC-SHOP-007 | Unaffordable upgrade shows disabled buy | Fresh launch (0 Sunlight) | View any upgrade | `upgrade-buy-<id>` disabled state | P0 | auto |
| TC-SHOP-008 | Affordable upgrade buys and levels up | Seed enough Sunlight | Tap `upgrade-buy-bigger-tap` | `upgrade-level-bigger-tap` increments | P0 | auto |
| TC-SHOP-009 | Cost increases with level | Bought Bigger Tap | Re-read cost | Cost > previous cost | P1 | planned |
| TC-SHOP-010 | x10 buys 10 levels at once | Seed enough Sunlight + x10 | Tap buy | Level jumps by 10 | P1 | planned |
| TC-SHOP-011 | Idle upgrades listed | Idle tab open | — | At least 1 upgrade card visible | P0 | auto |
| TC-SHOP-012 | Switching tabs preserves multiplier | x10 selected on Tap tab | Switch to Idle | x10 still active | P2 | manual |

## 5. Garden & Synergies (`TC-GRD`)

| ID | Title | Pre | Steps | Expected | Pri | Auto |
|----|-------|-----|-------|----------|-----|------|
| TC-GRD-001 | Add bloomling to garden via toggle | Discovered bloomling | Detail → `bloomling-detail-garden-toggle` | Toggle state changes | P0 | auto |
| TC-GRD-002 | Remove bloomling via toggle again | In-garden bloomling | Toggle → toggle | Toggle flips back | P0 | auto |
| TC-GRD-003 | Max garden slots respected | Seed max slots filled | Try to add another | Toggle blocked / shows full | P1 | planned |
| TC-GRD-004 | Named synergy unlocks with correct pair | Seed Fernley + Mosswick in garden | View garden/detail | Synergy entry shown | P1 | manual |
| TC-GRD-005 | Tag synergy tiers correctly | Seed 3 matching-tag bloomlings | View garden | Tier-2 tag synergy active | P1 | manual |
| TC-GRD-006 | Synergy recomputes on removal | Active synergy, remove one | Toggle off | Synergy removed from list | P1 | manual |
| TC-GRD-007 | Idle production reflects active garden | Active bloomling in garden | Observe `currency-sunlight-rate` | Rate > 0 | P0 | auto |

**Note:** Idle-production-reflects-garden is currently broken per the idle/evolution-fix plan — expected to fail until that lands. Case remains P0 to surface the regression.

## 6. Zone Progression (`TC-ZONE`)

| ID | Title | Pre | Steps | Expected | Pri | Auto |
|----|-------|-----|-------|----------|-----|------|
| TC-ZONE-001 | Zone bar renders | Fresh launch | Garden tab | `zone-progress` visible | P0 | auto |
| TC-ZONE-002 | Zone label shows current zone | Fresh launch | — | `zone-label` reads "Zone 1" (or seeded value) | P0 | auto |
| TC-ZONE-003 | Biome name displayed | Fresh launch | — | `zone-biome` non-empty | P1 | planned |
| TC-ZONE-004 | Progress fill width reflects % | Seed 50% progress | — | `zone-progress-fill` at ~50% width | P1 | manual |
| TC-ZONE-005 | Zone advances at threshold | Seed near-threshold | Earn more | Zone number increments | P2 | manual |

## 7. Evolution (`TC-EVO`)

| ID | Title | Pre | Steps | Expected | Pri | Auto |
|----|-------|-----|-------|----------|-----|------|
| TC-EVO-001 | Evolve button hidden at low level | Fernley Lv.10 | Open detail | `bloomling-detail-evolve` hidden/disabled | P1 | planned |
| TC-EVO-002 | Sprout → Bloom at Lv.100 with 10k | Seed Lv.100, 10k Sunlight | Tap evolve | Stage becomes Bloom, costs deducted | P1 | planned |
| TC-EVO-003 | Bloom → Elder at Lv.100, 100k + Nectar | Seed ready | Tap evolve | Stage becomes Elder | P1 | manual |
| TC-EVO-004 | Production multiplier applies post-evolve | Pre/post evolve same bloomling | Compare rates | Bloom 3×, Elder 9× vs Sprout | P2 | manual |

**Note:** Evolve UI button wiring is part of the in-progress fix; flows are planned but will be authored after the fix ships.

## 8. Rebirth (`TC-REB`)

| ID | Title | Pre | Steps | Expected | Pri | Auto |
|----|-------|-----|-------|----------|-----|------|
| TC-REB-001 | Rebirth tab shows locked state below Zone 40 | Fresh launch | Rebirth tab | `rebirth-screen-locked` visible | P0 | auto |
| TC-REB-002 | Rebirth tab unlocks at Zone 40 | Seed allTimeHighestZone=40 | Rebirth tab | `rebirth-screen` visible (not locked) | P0 | auto |
| TC-REB-003 | Nectar preview shows non-zero when eligible | Seed past Zone 40 | Rebirth tab | Preview shows ≥1 Nectar | P0 | auto |
| TC-REB-004 | Rebirth button enabled when eligible | Seed past Zone 40 | — | `rebirth-button` enabled | P0 | auto |
| TC-REB-005 | Rebirth requires confirm | Eligible | Tap `rebirth-button` | `rebirth-confirm` + `rebirth-cancel` visible | P0 | auto |
| TC-REB-006 | Cancel aborts rebirth | Confirm dialog open | Tap `rebirth-cancel` | Returns to preview, no reset | P0 | auto |
| TC-REB-007 | Confirm executes rebirth | Confirm dialog open | Tap `rebirth-confirm` | Nectar increased, tap/idle upgrades reset | P1 | planned |
| TC-REB-008 | Seasonal Memory lifts starting zone | Seed Seasonal Memory L1 | Rebirth | Post-rebirth starting zone ≥ 5 | P1 | manual |
| TC-REB-009 | Bloomling discovery preserved across rebirth | Discovered some pre-rebirth | Rebirth | Same bloomlings still discovered | P1 | manual |
| TC-REB-010 | Nectar upgrades preserved across rebirth | Bought nectar upgrade | Rebirth | Upgrade level intact | P1 | manual |

## 9. Nectar Shop (`TC-NEC`)

| ID | Title | Pre | Steps | Expected | Pri | Auto |
|----|-------|-----|-------|----------|-----|------|
| TC-NEC-001 | Nectar shop tab opens | Past rebirth unlock | Rebirth → `rebirth-tab-shop` | `nectar-shop` visible | P0 | auto |
| TC-NEC-002 | All 10 Nectar upgrades listed | Shop open | Scroll | At least 10 `nectar-shop-item-*` present | P1 | planned |
| TC-NEC-003 | Enriched Soil buyable with 1 Nectar | Seed 1+ Nectar | Tap `nectar-shop-buy-enriched_soil` | Level increments, Nectar deducted | P0 | auto |
| TC-NEC-004 | Buy disabled when insufficient Nectar | Seed 0 Nectar | View buy button | Button disabled | P0 | auto |
| TC-NEC-005 | Rebirth-count-gated upgrade locked | 0 rebirths done | View seasonal_memory | Blocked / cost unreachable | P1 | manual |
| TC-NEC-006 | Max-level upgrade shows MAX | Seed upgrade at maxLevel | View | Shows "MAX" label | P2 | manual |

## 10. Offline Progress (`TC-OFF`)

| ID | Title | Pre | Steps | Expected | Pri | Auto |
|----|-------|-----|-------|----------|-----|------|
| TC-OFF-001 | Welcome Back modal appears after time skip | Seed lastActiveAt 1h ago | Launch | `welcome-back-modal` visible | P0 | auto |
| TC-OFF-002 | Collect button dismisses modal | Modal visible | Tap `welcome-back-collect` | Modal closes | P0 | auto |
| TC-OFF-003 | Collected Sunlight added to balance | Modal visible, collect | Compare `currency-sunlight` before/after | Balance increases | P1 | planned |
| TC-OFF-004 | 24h cap enforced | Seed lastActiveAt 48h ago | Launch | Modal shows "Capped at 24h" note | P1 | manual |
| TC-OFF-005 | Efficiency displayed | Any offline session | View modal | Shows "at N% offline rate" | P1 | manual |
| TC-OFF-006 | No modal when lastActiveAt is recent | Launch within 60s of prior exit | Launch | Modal not shown | P2 | manual |

## 11. Ad Touchpoints (`TC-AD`)

| ID | Title | Pre | Steps | Expected | Pri | Auto |
|----|-------|-----|-------|----------|-----|------|
| TC-AD-001 | Lucky Sprout modal visible when pending | Seed `luckySproutPending=true` | Launch | `lucky-sprout-modal` visible | P1 | manual |
| TC-AD-002 | Lucky Sprout dismiss clears modal | Modal visible | Tap `lucky-sprout-dismiss` | Modal dismissed | P1 | manual |
| TC-AD-003 | Sunbeam FAB absent below Zone 15 | Fresh launch (Zone 1) | Garden tab | `sunbeam-boost-button` not present | P1 | auto |
| TC-AD-004 | Sunbeam FAB visible at Zone 15+ | Seed `allTimeHighestZone=15` | Garden tab | `sunbeam-boost-button` visible | P1 | manual |
| TC-AD-005 | Combo Keeper pill absent when combo < 50 | Fresh launch | Garden tab | `combo-keeper-button` not present | P1 | auto |
| TC-AD-006 | Combo Keeper pill appears at combo ≥ 50 | Rapid-tap or seeded combo | Garden tab | `combo-keeper-button` visible | P1 | manual |

## 12. Settings (`TC-SET`)

| ID | Title | Pre | Steps | Expected | Pri | Auto |
|----|-------|-----|-------|----------|-----|------|
| TC-SET-001 | Settings screen renders | Fresh launch | Settings tab | `settings-screen` visible | P0 | auto |
| TC-SET-002 | Save button persists state | Tap once | `settings-save` → confirm alert | No crash, alert shows "Saved" | P0 | auto |
| TC-SET-003 | Export produces non-empty string | Play briefly | `settings-export` | `settings-export-text` contains characters | P0 | auto |
| TC-SET-004 | Import rejects empty input | Empty input | `settings-import` | Alert: "Please paste a save code first" | P1 | planned |
| TC-SET-005 | Import with invalid data | Junk text | `settings-import` | Alert: "Invalid save data" | P1 | planned |
| TC-SET-006 | SFX toggle persists | Toggle off | Relaunch | SFX still off | P2 | manual |
| TC-SET-007 | Music toggle persists | Toggle off | Relaunch | Music still off | P2 | manual |
| TC-SET-008 | Haptics toggle persists | Toggle off | Relaunch | Haptics still off | P2 | manual |

---

## 13. Achievements (`TC-ACH`)

| ID | Title | Pre | Steps | Expected | Pri | Auto |
|----|-------|-----|-------|----------|-----|------|
| TC-ACH-001 | Achievement granted on milestone | Seed totalTaps=1000, `tap_dancer` target=1000 | Trigger `checkAchievements` | `tap_dancer` returned as newly completed | P0 | auto |
| TC-ACH-002 | Hidden achievement triggered by event | Active game session | Call `triggerHiddenAchievement("patient_gardener")` | Achievement marked completed, reward granted | P0 | auto |
| TC-ACH-003 | Progress tracks correctly for zone achievements | Seed allTimeHighestZone=42 | Read `computeProgress("first_steps")` | Returns 42 | P0 | auto |
| TC-ACH-004 | Reward delivery adds sunlight on completion | Seed achievement with sunlightReward=500 | Grant achievement | `currency-sunlight` increases by 500 | P1 | planned |
| TC-ACH-005 | Completed achievements excluded from check | Seed `tap_dancer` already completed | Run `checkAchievements` | `tap_dancer` not in result | P0 | auto |
| TC-ACH-006 | Event-driven achievements skipped by passive check | Seed `patient_gardener` uncompleted | Run `checkAchievements` | `patient_gardener` not in result | P1 | auto |
| TC-ACH-007 | Completionist counts other completed achievements | Seed 5 achievements completed | Read `computeProgress("completionist")` | Returns 5 | P1 | auto |
| TC-ACH-008 | Achievement toast displays on grant | Playing | Earn an achievement | Toast/banner appears with achievement name | P2 | manual |

## 14. Daily Rewards (`TC-DAILY`)

| ID | Title | Pre | Steps | Expected | Pri | Auto |
|----|-------|-----|-------|----------|-----|------|
| TC-DAILY-001 | Day 1 reward is 500 sunlight | Fresh cycle (day 1, cycle 0) | Claim daily reward | 500 sunlight added, no dewdrops | P0 | auto |
| TC-DAILY-002 | Day 3 reward is 1 dewdrop | Cycle day 3 | Claim daily reward | 1 dewdrop added, 0 sunlight | P0 | auto |
| TC-DAILY-003 | Day 7 reward is 5 dewdrops | Cycle day 7 | Claim daily reward | 5 dewdrops added | P0 | auto |
| TC-DAILY-004 | Day 6 includes Sunbeam Boost | Cycle day 6 | Claim daily reward | 5000 sunlight + 30-min Sunbeam Boost active | P1 | planned |
| TC-DAILY-005 | Streak advances day counter | Claimed day 1 yesterday | Login today | Daily screen shows day 2 | P1 | planned |
| TC-DAILY-006 | Cycle wraps after day 7 | Claimed day 7 | Login next day | Resets to day 1, `loginCyclesCompleted` increments | P0 | auto |
| TC-DAILY-007 | Cycle 2 scales sunlight by 1.5× | Cycle 2 day 1 (loginCyclesCompleted=1) | Claim reward | 750 sunlight (500 × 1.5) | P1 | auto |
| TC-DAILY-008 | Cycle 2 scales dewdrops by 2× | Cycle 2 day 3 (loginCyclesCompleted=1) | Claim reward | 2 dewdrops (1 × 2) | P1 | auto |
| TC-DAILY-009 | Cannot claim twice in same day | Already claimed today | Tap claim button | Button disabled or hidden | P0 | manual |
| TC-DAILY-010 | Missed day does not advance streak | Skipped a day | Login after gap | Day counter resets to 1 or stays (per design) | P1 | manual |

## 15. Transcendence & Essence Shop (`TC-TRANS`)

| ID | Title | Pre | Steps | Expected | Pri | Auto |
|----|-------|-----|-------|----------|-----|------|
| TC-TRANS-001 | Transcendence locked below requirements | Seed rebirthCount=5, zone=100 | Open Transcendence tab | `transcendence-screen-locked` visible | P0 | auto |
| TC-TRANS-002 | Transcendence unlocks at 10 rebirths + zone 150 | Seed rebirthCount=10, allTimeHighestZone=150 | Open Transcendence tab | `transcendence-screen` visible (not locked) | P0 | auto |
| TC-TRANS-003 | Essence earned matches formula | Seed totalNectarSpent=200 | View preview | Essence shown = floor((200/50)^1.8) | P0 | auto |
| TC-TRANS-004 | Transcendence resets bloomlings to Sprout Lv.1 | Seed Elder Lv.100 bloomlings | Confirm transcendence | All bloomlings Sprout Lv.1, out of garden | P0 | auto |
| TC-TRANS-005 | Transcendence resets nectar upgrades | Seed nectar upgrades purchased | Confirm transcendence | Nectar upgrade levels reset to 0 | P1 | planned |
| TC-TRANS-006 | Essence balance persists across transcendence | Seed 10 Essence | Transcend | Essence balance = previous + earned | P0 | auto |
| TC-TRANS-007 | Essence shop renders items | Post-transcendence with Essence | Open Essence shop | `essence-shop` visible with upgrade items | P1 | planned |
| TC-TRANS-008 | Essence shop purchase deducts Essence | Seed 5 Essence | Buy Cosmic Roots | Essence decremented, upgrade level increments | P1 | planned |
| TC-TRANS-009 | Essence shop item disabled when unaffordable | Seed 0 Essence | View Essence shop | Buy buttons disabled | P0 | auto |
| TC-TRANS-010 | Transcendence preview shows correct totals | Seed totalEssenceEarned=5, totalNectarSpent=200 | View preview | `totalEssenceAfter` = 5 + earned | P1 | auto |

## 16. Offline Progress (Phase 6–7 additions) (`TC-OFFLINE`)

| ID | Title | Pre | Steps | Expected | Pri | Auto |
|----|-------|-----|-------|----------|-----|------|
| TC-OFF-007 | Cosmic Roots raises offline efficiency | Seed cosmic_roots level 1 | Background 1h, relaunch | Efficiency shown > 50% (~66.7%) | P1 | auto |
| TC-OFF-008 | Cosmic Roots max level reaches 100% efficiency | Seed cosmic_roots level 3 | Background 1h, relaunch | Efficiency shown = 100% | P1 | auto |
| TC-OFF-009 | Deep Roots multiplier boosts offline yield | Seed deep_roots level 5 | Background 1h, relaunch | Yield = base × 1.5 | P1 | auto |
| TC-OFF-010 | Offline Boost perk raises efficiency floor to 75% | Seed Offline Boost perk purchased | Background 1h, relaunch | Efficiency shown ≥ 75% | P1 | auto |
| TC-OFF-011 | Ad double-offline doubles earnings | Offline session pending | Tap "Watch Ad to Double" | Sunlight earned = 2× collect amount | P1 | manual |
| TC-OFF-012 | 48h offline still caps at 24h with correct efficiency | Seed lastActiveAt 48h ago + cosmic_roots 2 | Launch | Duration capped at 24h, efficiency reflects upgrades | P1 | auto |

## 17. Save Migration (`TC-MIG`)

| ID | Title | Pre | Steps | Expected | Pri | Auto |
|----|-------|-----|-------|----------|-----|------|
| TC-MIG-001 | Old save without achievements field loads correctly | v1 save missing `achievements` | Load save | Achievements populated from templates, no crash | P0 | auto |
| TC-MIG-002 | Old save without nightOwlOfflineCollections defaults to 0 | v1 save missing stat field | Load save | `nightOwlOfflineCollections` = 0 | P1 | auto |
| TC-MIG-003 | Old save without daily field loads with defaults | v1 save missing `daily` | Load save | Daily state initialized, no crash | P1 | planned |
| TC-MIG-004 | New achievements added post-save appear uncompleted | Save with 5 achievements, templates now have 10 | Load save | 5 extra achievements present, uncompleted | P0 | auto |
| TC-MIG-005 | Checksum mismatch rejects corrupted save | Tampered save JSON | Import | Returns null / shows "Invalid save data" | P1 | planned |

---

## Summary

| Area | Cases | P0 | P1 | P2 | auto | planned | manual |
|------|------:|---:|---:|---:|-----:|--------:|-------:|
| Tap loop | 8 | 3 | 3 | 2 | 3 | 2 | 3 |
| Currency & persistence | 9 | 4 | 3 | 2 | 5 | 2 | 2 |
| Bloomlings & collection | 10 | 3 | 5 | 2 | 3 | 4 | 3 |
| Shop upgrades | 12 | 7 | 4 | 1 | 7 | 4 | 1 |
| Garden & synergies | 7 | 3 | 4 | 0 | 3 | 1 | 3 |
| Zone progression | 5 | 2 | 2 | 1 | 2 | 1 | 2 |
| Evolution | 4 | 0 | 2 | 2 | 0 | 2 | 2 |
| Rebirth | 10 | 6 | 4 | 0 | 6 | 1 | 3 |
| Nectar shop | 6 | 2 | 2 | 2 | 2 | 1 | 3 |
| Offline progress | 12 | 2 | 8 | 1 | 7 | 1 | 4 |
| Ad touchpoints | 6 | 0 | 6 | 0 | 2 | 0 | 4 |
| Settings | 8 | 3 | 2 | 3 | 3 | 2 | 3 |
| Achievements | 8 | 3 | 3 | 2 | 5 | 1 | 2 |
| Daily rewards | 10 | 3 | 5 | 2 | 3 | 2 | 5 |
| Transcendence & Essence | 10 | 5 | 5 | 0 | 6 | 3 | 1 |
| Save migration | 5 | 2 | 3 | 0 | 3 | 2 | 0 |
| **Total** | **130** | **48** | **61** | **20** | **60** | **29** | **41** |

---

## Known limitations captured by this catalog

- **Idle production shows 0/s until the idle/evolution fix lands.** TC-GRD-007 and several Evolution / Level-up cases will stay red until then. Do not mask them with skips — they are the regression canary.
- **Ad touchpoints (Phase 5):** Lucky Sprout, Sunbeam Boost, and Combo Keeper are covered by TC-AD-001–006. Gate Assist and Boss Smash remain out of scope — their engine loops are not yet built.
- **Seed-dependent cases** require MMKV save injection (see `.maestro/seeds/`). Manual-only cases that need mid-game state without a seed script are flagged explicitly.
- **Essence Shop UI (Phase 7):** TC-TRANS-007/008/009 cover the Essence shop purchase flow. Maestro flows will be authored once the Essence shop screen is wired.
- **Save migration (Phase 6–7):** Currently at v1 with no version bump needed — `applySaveToStore` handles missing fields via defaults and template merging. TC-MIG cases validate this forward-compatibility approach.
