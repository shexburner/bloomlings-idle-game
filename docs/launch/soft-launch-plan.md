# Bloomlings — Soft Launch Plan

> Owner: Project Manager
> Last updated: 2026-04-22
> Prerequisite: All items in `beta-checklist.md` must be ✅ or waived before entering Phase 1.

---

## Launch Phases Overview

```
Phase 1: Internal Beta ──→ Phase 2: Closed Beta ──→ Phase 3: Soft Launch ──→ Phase 4: Global Launch
     (1 week)                  (2 weeks)               (2 weeks)               (ongoing)
```

---

## Phase 1: Internal Beta (Team Only)

**Duration:** 1 week
**Audience:** 5–10 (team + trusted friends)
**Distribution:** TestFlight (iOS) + Google Play Internal Testing (Android)

### Entry Criteria
- [ ] EAS builds succeed on both platforms
- [ ] `tsc`, lint, Jest, and e2e smoke all pass
- [ ] App installs and launches on at least 1 iOS + 1 Android device
- [ ] Save system verified (fresh install, auto-save, export/import)
- [ ] All 5 active ad touchpoints load with test IDs

### Exit Criteria
- [ ] Zero P0 bugs open
- [ ] Crash-free rate ≥ 99% (relaxed for internal)
- [ ] All 6 tabs render and function on tested devices
- [ ] Core loop playable: tap → earn → upgrade → evolve → rebirth (Zone 40+)
- [ ] Offline progress calculates correctly after 1h+ away
- [ ] Save persists across force-kill and reinstall

### Key Metrics
| Metric | Target |
|--------|--------|
| Crashes | < 5 total across all testers |
| P0 bugs filed | 0 remaining at exit |
| P1 bugs filed | Triaged, none blocking |
| Core loop completable | 100% of testers reach Zone 40 |

---

## Phase 2: Closed Beta (External Testers)

**Duration:** 2 weeks minimum
**Audience:** 50–100 testers
**Distribution:** TestFlight External (iOS) + Google Play Internal/Closed Testing (Android)

### Entry Criteria
- [ ] Phase 1 exit criteria met
- [ ] All P0 bugs from internal beta fixed and verified
- [ ] Beta App Review approved (TestFlight external requirement)
- [ ] Feedback survey created and linked in-app
- [ ] Crash reporting active (EAS crash logs or Sentry)
- [ ] Beta tester recruitment complete (50+ confirmed)

### Exit Criteria
- [ ] Crash-free rate ≥ 99.5%
- [ ] D1 retention ≥ 30%
- [ ] Average session length ≥ 5 minutes
- [ ] No P0 bugs open
- [ ] P1 bugs triaged — none blocking launch
- [ ] Ad system verified functional on 3+ device models
- [ ] Feedback survey response rate ≥ 50% of testers
- [ ] Fun rating average ≥ 3.5/5 from survey
- [ ] No save corruption reports

### Key Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Crash-free sessions | ≥ 99.5% | Crash reporting tool |
| D1 retention | ≥ 30% | Manual tracking (beta scale) |
| D3 retention | ≥ 15% | Manual tracking |
| D7 retention | ≥ 10% | Manual tracking |
| Avg session length | ≥ 5 min | In-app timer or survey |
| Sessions per day | ≥ 2 | Survey |
| Median zone reached (2 weeks) | Zone 60+ | Save export analysis |
| Rebirth conversion | ≥ 50% of testers | Save export analysis |
| Ad engagement rate | ≥ 30% of eligible impressions | Store stats tracking |
| Survey fun rating | ≥ 3.5/5 | Survey results |

---

## Phase 3: Soft Launch (Limited Geo)

**Duration:** 2 weeks
**Markets:** New Zealand + Philippines
**Distribution:** App Store + Google Play (geo-restricted)

**Why these markets:**
- **New Zealand** — English-speaking, small market, representative of Western spending patterns, commonly used for iOS soft launches
- **Philippines** — Large mobile gaming population, high Android share, good for Android-specific testing, lower CPI for any paid UA testing

### Entry Criteria
- [ ] Phase 2 exit criteria met
- [ ] Production ad unit IDs swapped (see Ad ID Swap Checklist below)
- [ ] App Store listing complete (screenshots, description, keywords, privacy policy)
- [ ] Google Play listing complete (screenshots, description, content rating, privacy policy)
- [ ] Analytics integrated (session tracking, retention events, ad revenue)
- [ ] App Store review submitted and approved
- [ ] Google Play review submitted and approved
- [ ] Privacy policy URL live
- [ ] App rated for content (IARC for Google Play, Apple age rating)

### Exit Criteria
- [ ] Crash-free rate ≥ 99.5%
- [ ] D1 retention ≥ 35%
- [ ] D7 retention ≥ 12%
- [ ] ARPDAU baseline established (even if low with small audience)
- [ ] No critical negative reviews (1-star with crash/data-loss complaints)
- [ ] Ad revenue confirms ads are serving and paying
- [ ] No server-side issues (N/A for v1.0 — fully offline)
- [ ] Session length ≥ 5 min average
- [ ] Store rating ≥ 4.0 (if enough ratings)

### Key Metrics
| Metric | Target | Tool |
|--------|--------|------|
| Crash-free sessions | ≥ 99.5% | Firebase Crashlytics / Sentry |
| D1 retention | ≥ 35% | Analytics |
| D3 retention | ≥ 20% | Analytics |
| D7 retention | ≥ 12% | Analytics |
| Avg session length | ≥ 5 min | Analytics |
| Sessions per user per day | ≥ 2 | Analytics |
| ARPDAU | Baseline (any positive) | AdMob dashboard |
| Ad fill rate | ≥ 80% | AdMob dashboard |
| Store rating | ≥ 4.0 | App Store Connect / Play Console |
| Uninstall rate (D7) | < 60% | Play Console (Android) |

---

## Phase 4: Global Launch

**Duration:** Ongoing
**Markets:** Worldwide

### Entry Criteria
- [ ] Phase 3 exit criteria met
- [ ] Go/no-go decision: GO
- [ ] Day-1 patch prepared (if needed from soft launch feedback)
- [ ] ASO optimized (keywords, screenshots updated based on soft launch data)
- [ ] Launch marketing prepared (Reddit posts, Discord announcements, press kit)

### Launch Day Actions
1. Remove geo restrictions (App Store + Google Play)
2. Submit update if day-1 patch is needed
3. Post launch announcements on all channels
4. Monitor crash rate hourly for first 24h
5. Monitor reviews and respond to 1-star reviews within 24h
6. Verify ad revenue is flowing

### Post-Launch Metrics (Ongoing)
| Metric | Target | Cadence |
|--------|--------|---------|
| Crash-free sessions | ≥ 99.5% | Daily |
| D1 retention | ≥ 40% | Weekly |
| D3 retention | ≥ 25% | Weekly |
| D7 retention | ≥ 15% | Weekly |
| D30 retention | ≥ 5% | Monthly |
| Avg session length | ≥ 8 min | Weekly |
| ARPDAU | Track trend | Daily |
| Ad fill rate | ≥ 85% | Daily |
| Store rating | ≥ 4.2 | Weekly |

---

## Go / No-Go Decision Framework

At each phase gate, evaluate these criteria. All must be GO to proceed.

| Criterion | GO | NO-GO |
|-----------|-----|-------|
| Crash-free rate | ≥ 99.5% | < 99% |
| P0 bugs | 0 open | Any open |
| D1 retention | ≥ phase target | < 20% |
| Save system | Zero corruption reports | Any data loss |
| Ad system | Loads and rewards correctly | Broken or no-fill > 50% |
| User sentiment | Fun rating ≥ 3.5/5 | Fun rating < 3.0/5 |
| Performance | Meets benchmark targets | Sustained < 30fps or > 300MB RAM |

**Decision authority:** Project Manager makes the call. If any single criterion is NO-GO, the launch does not proceed until resolved.

**Grey zone (between GO and NO-GO):** Project Manager may approve with conditions (e.g., "GO with hotfix commitment within 48h").

---

## Rollback Plan

### If critical issues found post-launch:

**Severity 1 — Data loss / crash loop:**
1. Immediately pull the build from both stores (unpublish or halt rollout)
2. Push an EAS Update (OTA) if the fix is JS-only
3. If native fix needed: emergency EAS Build → expedited review
4. Notify affected users via in-app banner on next launch

**Severity 2 — Major bug, no data loss:**
1. Halt staged rollout (Google Play) / do not expand TestFlight
2. Fix, test, submit hotfix build
3. Resume rollout after fix verified

**Severity 3 — Minor issues:**
1. Log in bug tracker
2. Bundle into next scheduled update
3. No rollback needed

### Rollback capabilities:
- **EAS Updates (OTA):** JS-only fixes can be pushed without store review. Reaches users on next app open.
- **Staged rollout (Google Play):** Can halt at any percentage and roll back.
- **TestFlight (iOS):** Can expire a build and push a new one. No true rollback — must submit new build.
- **App Store (iOS):** Can remove from sale. Cannot roll back to previous version — must submit new build through review.

---

## Day-1 Patch Expectations

Based on soft launch data, expect to address:

| Category | Likelihood | Examples |
|----------|------------|---------|
| Balance tweaks | High | Sunlight rates, upgrade costs, Nectar thresholds |
| UI/UX fixes | High | Safe area issues on new devices, text overflow, tap target sizes |
| Crash fixes | Medium | Edge cases in save migration, ad SDK errors |
| Performance | Medium | Memory spikes on low-end Android, animation jank |
| Localization | Low | Not in v1.0 scope |

**Process:** Collect soft launch feedback → triage → fix → EAS Update (JS) or new build (native) → verify → resume rollout.

---

## Post-Launch Monitoring

### Daily (first 2 weeks):
- Crash-free rate
- D1 retention
- Ad revenue / ARPDAU
- Store reviews (respond to negatives)
- Session count and length

### Weekly (ongoing):
- D3, D7 retention
- Median zone reached
- Rebirth/Transcendence conversion rates
- Ad engagement rate per touchpoint
- Uninstall rate

### Monthly:
- D30 retention
- Revenue trend
- Feature usage breakdown
- Update planning based on metrics

---

## Production Ad Unit ID Swap Checklist

> Currently using `TestIds.REWARDED` from `react-native-google-mobile-ads`. Must swap before any store submission.

### Pre-swap:
- [ ] Create AdMob app in AdMob console (iOS + Android)
- [ ] Create 5 rewarded ad units (one per active touchpoint):
  - [ ] `doubleOffline`
  - [ ] `dewdropGarden`
  - [ ] `sunbeamBoost`
  - [ ] `comboKeeper`
  - [ ] `luckySprout`
- [ ] Record all ad unit IDs (format: `ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY`)

### Swap:
- [ ] Update `src/services/adManager.ts` — replace `TestIds.REWARDED` with per-unit production IDs
- [ ] Use platform-specific IDs (`Platform.select({ ios: '...', android: '...' })`)
- [ ] Update `app.json` with production AdMob app ID (`react-native-google-mobile-ads` → `android_app_id` / `ios_app_id`)
- [ ] Verify no `TestIds` references remain: `grep -r "TestIds" src/`

### Post-swap verification:
- [ ] Build with production IDs
- [ ] Verify ads load on a real device (not simulator — real ads don't serve on emulators)
- [ ] Verify reward callback fires correctly
- [ ] Verify ad unit IDs match AdMob console (no typos)
- [ ] Confirm AdMob app-ads.txt is accessible (if using a website)

---

## App Store Submission Timeline

### Apple App Store (iOS)
| Step | Duration | Notes |
|------|----------|-------|
| App Store Connect setup | 1 day | App ID, screenshots, description, privacy |
| Build upload via EAS | ~30 min | `eas submit --platform ios` |
| App Review | 24–48 hours | Typical; can be longer for first submission |
| Rejection response (if needed) | +24–48 hours per round | Common reasons: missing privacy policy, ad disclosure, screenshot issues |
| Release | Immediate or scheduled | Can hold for coordinated launch |

### Google Play Store (Android)
| Step | Duration | Notes |
|------|----------|-------|
| Play Console setup | 1 day | Listing, content rating, privacy policy, data safety |
| AAB upload | ~15 min | `eas submit --platform android` |
| Review | Few hours to 1 day | Usually faster than Apple; first app may take longer |
| Staged rollout | Configurable | Start at 10%, increase to 25% → 50% → 100% |
| Full availability | After rollout complete | Can accelerate if metrics are good |

### Coordinated Timeline (both platforms)
| Day | Action |
|-----|--------|
| D-7 | Finalize all store assets, screenshots, descriptions |
| D-5 | Submit iOS build to App Review |
| D-3 | Submit Android build to Google Play review |
| D-1 | Both approved → schedule release for D-day |
| D-0 | Release on both platforms simultaneously |
| D+1 | Monitor metrics, respond to reviews, hotfix if needed |

**Tip:** Submit iOS first — Apple review takes longer. Submit Android 2 days later so both approvals land around the same time.

---

## Appendix: Phase Summary

| Phase | Audience | Duration | Key Gate |
|-------|----------|----------|----------|
| 1. Internal Beta | 5–10 team | 1 week | Zero P0 bugs |
| 2. Closed Beta | 50–100 testers | 2 weeks | 99.5% crash-free, D1 ≥ 30% |
| 3. Soft Launch | NZ + PH markets | 2 weeks | D1 ≥ 35%, ads serving, rating ≥ 4.0 |
| 4. Global Launch | Worldwide | Ongoing | Go/no-go approved |
