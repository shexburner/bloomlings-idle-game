# Bloomlings — Pre-Beta Checklist

> Owner: Project Manager / QA Tester
> Last updated: 2026-04-22
> Gate: Every item must be ✅ or explicitly waived before the first beta build ships.

---

## 1. Build Verification

| Check | Command | Pass Criteria | Status |
|-------|---------|---------------|--------|
| TypeScript compilation | `npx tsc --noEmit` | Zero errors | ⬜ |
| Lint | `npx eslint . --ext .ts,.tsx` | Zero errors, warnings reviewed | ⬜ |
| Unit tests | `npm test` (Jest) | 100% pass, no skipped P0 | ⬜ |
| E2E smoke | `npm run test:e2e:smoke` | All P0 specs green | ⬜ |
| EAS Build (iOS) | `eas build --platform ios --profile preview` | Build succeeds, installs on device | ⬜ |
| EAS Build (Android) | `eas build --platform android --profile preview` | Build succeeds, installs on device | ⬜ |
| Bundle size | Check EAS build output | < 50 MB install size | ⬜ |

---

## 2. Feature Completeness Matrix

### Phase 1: Foundation
| Feature | Status |
|---------|--------|
| Expo SDK 54 scaffold + TypeScript strict | ✅ |
| Core type definitions (10 enums, 21 interfaces) | ✅ |

### Phase 2: Core Engine
| Feature | Status |
|---------|--------|
| Game loop (delta-time, offline progress, AppState) | ✅ |
| Zustand store (6 slices + MetaSlice + selectors) | ✅ |
| Save/load (MMKV, auto-save, export/import) | ✅ |
| Tap system (combo, crits, anti-autoclicker) | ✅ |
| Idle production | ✅ |

### Phase 3: Content & UI
| Feature | Status |
|---------|--------|
| 8 biomes, 28+ Bloomlings with lore | ✅ |
| 31 upgrades with flavor text | ✅ |
| 36 achievements | ✅ |
| Navigation (4-tab dark theme layout) | ✅ |
| Garden screen (CurrencyBar, TapArea, TapFeedback, ComboMeter) | ✅ |
| Shop screen (tab-based, UpgradeCard, BuyMultiplierToggle) | ✅ |
| Collection screen (3-column grid, detail modal, zone info) | ✅ |

### Phase 4: Progression Systems
| Feature | Status |
|---------|--------|
| Evolution system (Sprout → Bloom → Elder) | ✅ |
| Garden management (slot sources, hard cap 9) | ✅ |
| Synergy system (tag + named, Elder-gated tags) | ✅ |
| Rebirth / Prestige Layer 1 (Nectar) | ✅ |
| Nectar shop + Rebirth UI | ✅ |

### Phase 5: Monetization
| Feature | Status |
|---------|--------|
| AdMob integration (react-native-google-mobile-ads) | ✅ |
| Double Offline ad touchpoint | ✅ |
| Dewdrop Garden ad touchpoint | ✅ |
| Sunbeam Boost ad touchpoint | ✅ |
| Combo Keeper ad touchpoint | ✅ |
| Lucky Sprout ad touchpoint | ✅ |
| Gate Assist ad touchpoint | ❌ Blocked — gate timer engine not built |
| Boss Smash ad touchpoint | ❌ Blocked — boss HP/damage engine not built |
| Dewdrop shop + perks | ✅ |
| Offline progress engine | ✅ |

### Phase 6: Polish & Retention
| Feature | Status |
|---------|--------|
| Achievements (36, all categories) | ✅ |
| Daily login + streaks (7-day cycle, scaling) | ✅ |
| Notifications (4 slots, permission-gated) | ✅ |
| Sound + haptics | ✅ |
| Performance pass | ✅ |

### Phase 7: Prestige Layer 2 & Endgame
| Feature | Status |
|---------|--------|
| Transcendence system (Essence) | ✅ |
| Essence shop UI | ✅ |
| Biomes 3–8 content | ✅ |
| Legendary/Mythic Bloomlings | ✅ |

**Completeness: 29/31 features shipped. 2 intentionally deferred (Gate Assist, Boss Smash).**

---

## 3. Known Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| Gate Assist ad touchpoint not built | Players cannot skip gate timers via ads | Gate timer engine not implemented; feature deferred to post-launch |
| Boss Smash ad touchpoint not built | Players cannot get boss damage boost via ads | Boss HP/damage engine not implemented; feature deferred to post-launch |
| No server component | Fully offline; no cloud saves, no leaderboards | By design for v1.0; cloud sync is a post-launch feature |
| Ad test IDs in use | `TestIds.REWARDED` — no real ad revenue | Must swap to production unit IDs before store submission (see soft-launch-plan.md) |
| `synergies` field on GameState is stale | `Record<string, Synergy>` initialized to `{}`, never written | Engine uses `stats.discoveredSynergyIds` instead; cleanup pass needed |
| `idle_garden_slots` Sunlight upgrade may overlap with `nectar_garden_expansion` | Two upgrade paths to same effect | Both work via engine; consider deprecating one before launch |

---

## 4. Device Testing Matrix

| Device | OS | Screen | Priority | Status |
|--------|----|--------|----------|--------|
| iPhone SE (3rd gen) | iOS 15+ | 4.7" / 375×667 | P0 — smallest supported | ⬜ |
| iPhone 15 | iOS 17+ | 6.1" / 393×852 | P0 — mainstream | ⬜ |
| iPad (10th gen) | iPadOS 16+ | 10.9" / 820×1180 | P1 — tablet layout | ⬜ |
| Samsung Galaxy S23 | Android 13+ | 6.1" / 360×780 | P0 — mainstream Android | ⬜ |
| Google Pixel 7 | Android 13+ | 6.3" / 412×915 | P0 — stock Android | ⬜ |
| Samsung Galaxy A14 | Android 13 | 6.6" / 384×854 | P1 — low-end Android | ⬜ |

**Test on each device:**
- [ ] Fresh install → first-time experience
- [ ] 30-minute play session → no crashes
- [ ] Background/foreground cycle → offline progress correct
- [ ] Notification delivery
- [ ] Ad loading and reward delivery
- [ ] All 6 tabs render correctly
- [ ] Safe area insets correct (notch, home indicator, nav bar)

---

## 5. Performance Benchmarks

| Metric | Target | Measurement Method | Status |
|--------|--------|--------------------|--------|
| Frame rate | 60 fps sustained during gameplay | React Native Perf Monitor / Flipper | ⬜ |
| RAM usage | < 200 MB peak | Xcode Instruments / Android Profiler | ⬜ |
| Battery drain | < 5% per hour active play | 1-hour session, note battery before/after | ⬜ |
| Cold start time | < 3 seconds to interactive | Stopwatch from tap to Garden screen | ⬜ |
| Save/load latency | < 100ms (MMKV) | Console timing in saveManager | ⬜ |
| Offline progress calc | < 500ms for 24h catch-up | Console timing in gameLoop foreground handler | ⬜ |

---

## 6. Save System Verification

| Scenario | Steps | Expected | Status |
|----------|-------|----------|--------|
| Fresh install | Install app, open | Default state, tutorial/first-time flow | ⬜ |
| Auto-save | Play 5 min, force-kill, reopen | Progress preserved | ⬜ |
| Export/Import | Settings → Export → copy → fresh install → Import | Full state restored | ⬜ |
| Save migration | Load a Phase 6 save on Phase 7+ build | `applySaveToStore` merges missing fields | ⬜ |
| Corrupted save | Manually corrupt MMKV data | App starts with fresh state, no crash | ⬜ |
| Large save | Play to Zone 150+, 28 Bloomlings, all upgrades | Save/load < 100ms, no truncation | ⬜ |

---

## 7. Ad System Verification

| Scenario | Steps | Expected | Status |
|----------|-------|----------|--------|
| Rewarded ad loads | Open Welcome Back modal | "Watch ad for 2×" button appears | ⬜ |
| Reward granted | Watch ad to completion | Earnings doubled, `totalAdsWatched++` | ⬜ |
| Ad closed early | Close ad before reward | "Earnings doubled!" NOT shown, no reward | ⬜ |
| Cooldown enforced | Watch Dewdrop ad, try again immediately | 3-minute countdown shown | ⬜ |
| Daily cap | Watch 15 Dewdrop ads in one day | Cap reached message, button disabled | ⬜ |
| No fill | Airplane mode → trigger ad | "No boost available" graceful fallback | ⬜ |
| Streak bonus | Watch ads on 3 consecutive days | Bonus Dewdrops increase per streak day | ⬜ |
| All 5 touchpoints | Trigger each: Double Offline, Dewdrop Garden, Sunbeam Boost, Combo Keeper, Lucky Sprout | Each loads, rewards correctly, preloads next | ⬜ |

---

## 8. Stability Target

| Metric | Target |
|--------|--------|
| Crash-free sessions | > 99.5% |
| ANR rate (Android) | < 0.5% |
| Fatal exceptions | 0 in beta period |
| Memory leaks | None detected in 1-hour profiling session |

---

## 9. Beta Distribution Plan

### iOS — TestFlight
- [ ] Apple Developer account active
- [ ] App ID registered in App Store Connect
- [ ] Provisioning profiles configured for distribution
- [ ] `eas build --platform ios --profile preview` succeeds
- [ ] Upload to TestFlight via `eas submit --platform ios`
- [ ] Internal testing group created (team only — Phase 1)
- [ ] External testing group created (50–100 testers — Phase 2)
- [ ] Beta App Review submitted (required for external TestFlight)
- [ ] TestFlight invite link distributed

### Android — Google Play Internal Testing
- [ ] Google Play Developer account active
- [ ] App created in Google Play Console
- [ ] Internal testing track configured
- [ ] `eas build --platform android --profile preview` succeeds
- [ ] Upload AAB to internal testing track
- [ ] Tester email list added (up to 100)
- [ ] Internal testing link distributed

---

## 10. Beta Feedback Collection

| Method | Tool | Purpose |
|--------|------|---------|
| In-app feedback | Settings screen → "Send Feedback" link | Quick bug reports + suggestions |
| External survey | Google Forms / Typeform link | Structured feedback (fun rating, difficulty, session length) |
| Crash reporting | EAS Updates crash logs / Sentry (if integrated) | Automated crash collection |
| Discord / group chat | Private beta channel | Real-time discussion, screenshot sharing |

**Survey questions (minimum):**
1. How fun is the core tap + idle loop? (1–5)
2. Did you encounter any crashes or bugs? (describe)
3. How clear is the progression system? (1–5)
4. Did ads feel intrusive? (1–5)
5. How long was your average play session?
6. Would you recommend this game to a friend? (1–5)
7. What feature do you most want added?

---

## 11. Beta Timeline

| Milestone | Duration | Dates (target) |
|-----------|----------|----------------|
| Internal beta (team only) | 1 week | TBD |
| Bug fix sprint | 3–5 days | After internal beta |
| Closed beta (external testers) | 2 weeks minimum | After bug fix sprint |
| Beta retrospective + go/no-go | 1 day | End of closed beta |

**Minimum beta duration: 2 weeks (closed beta phase).**

---

## 12. Beta Tester Targets

| Phase | Count | Source |
|-------|-------|--------|
| Internal beta | 5–10 | Team + close friends |
| Closed beta | 50–100 | Gaming communities, Reddit r/incremental_games, Discord servers, personal network |

**Recruitment channels:**
- Reddit: r/incremental_games, r/idlegames, r/AndroidGaming, r/iosgaming
- Discord: Idle game servers, indie dev servers
- Twitter/X: Indie game dev community
- Direct outreach to idle game content creators

---

## Sign-Off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Project Manager | | | ⬜ |
| QA Tester | | | ⬜ |
| Engine Developer | | | ⬜ |
| UI/UX Developer | | | ⬜ |
