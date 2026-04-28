# Bloomlings — Beta Distribution Guide

> Step-by-step operational guide for distributing the Bloomlings beta to testers on iOS and Android.

## Prerequisites

### Accounts & Access
- [ ] **Apple Developer Account** ($99/year) — enrolled at [developer.apple.com](https://developer.apple.com)
- [ ] **Google Play Developer Account** ($25 one-time) — enrolled at [play.google.com/console](https://play.google.com/console)
- [ ] **Expo/EAS account** — linked to the project (`eas whoami` confirms login)

### Local Tooling
- [ ] EAS CLI installed: `npm install -g eas-cli`
- [ ] Logged in: `eas login`
- [ ] Project linked: `eas init` (already done — `app.json` has `extra.eas.projectId`)
- [ ] `eas.json` configured with `preview` and `production` build profiles

### Credentials
- [ ] iOS Distribution Certificate + Provisioning Profile (EAS manages automatically on first build)
- [ ] Android Upload Keystore (EAS generates on first build; **back up** via `eas credentials`)
- [ ] App Store Connect API key configured (optional, speeds up `eas submit`)

---

## iOS — TestFlight Distribution

### 1. Build for iOS
```bash
eas build --platform ios --profile preview
```
- Profile `preview` should use `distribution: "internal"` for ad-hoc or `distribution: "store"` for TestFlight.
- For TestFlight, use `distribution: "store"` (required by Apple).
- Wait for build to complete (~10–20 min). EAS provides a dashboard link.

### 2. Submit to App Store Connect
```bash
eas submit --platform ios --latest
```
- Or specify a build: `eas submit --platform ios --id <build-id>`
- Build appears in App Store Connect → TestFlight within 5–15 minutes.
- Apple runs automated review (usually <24h for first build, minutes for subsequent).

### 3. Create Testing Groups
In **App Store Connect → TestFlight**:
1. **Internal Testing** group — add team members (up to 100, no Apple review needed)
2. **Closed Beta** group — for external testers (up to 10,000, requires Beta App Review on first build)

### 4. Invite Testers
- **Internal**: Add by Apple ID email → testers get an email + TestFlight app notification
- **External**: Add by email or share a public invite link (if enabled)
- Testers install via the **TestFlight** app on their iOS device

### 5. Iterate
- Push new builds with `eas build` + `eas submit`
- TestFlight auto-notifies testers of new builds
- Set "What to Test" notes on each build in App Store Connect

---

## Android — Google Play Internal Testing

### 1. Build for Android
```bash
eas build --platform android --profile preview
```
- Produces an `.aab` (Android App Bundle) by default — required by Google Play.

### 2. Submit to Google Play Console
```bash
eas submit --platform android --latest
```
- Or manually upload the `.aab` in **Google Play Console → Internal testing → Create new release**.

### 3. Create Internal Testing Track
In **Google Play Console → Testing → Internal testing**:
1. Create an email list of testers (up to 100 per list)
2. Add the email list to the Internal testing track
3. **Copy the opt-in link** — testers must visit this link to join

### 4. Add Testers
- Testers must have a Google account matching the email on the list
- Share the opt-in link → they accept → app appears in Play Store (may take a few hours on first setup)
- For **Closed testing** (next phase): create a Closed track with up to 2,000 testers

### 5. Iterate
- Upload new `.aab` → roll out to Internal testing track
- Testers update via Play Store (auto-update or manual)
- Use release notes to communicate what changed

---

## Tester Recruitment Template

### Email / Message to Potential Testers

> **Subject: Help us beta test Bloomlings! 🌱**
>
> Hi [Name],
>
> We're looking for beta testers for **Bloomlings**, an idle garden game where you grow, evolve, and collect magical plant creatures.
>
> **What we need from you:**
> - Play for at least 15–20 minutes over the beta period
> - Report any bugs or crashes you encounter
> - Fill out a short feedback survey (5 min)
> - Optionally: join our Discord for real-time feedback
>
> **What you'll get:**
> - Early access before public launch
> - A "Founding Gardener" badge in the final release
> - Direct input on game balance and features
>
> **To join:**
> - **iOS**: I'll send you a TestFlight invite — reply with your Apple ID email
> - **Android**: Click this opt-in link: [LINK] (use the same Google account as your Play Store)
>
> The beta runs for [2 weeks]. Thanks for helping us make Bloomlings great!
>
> — The Bloomlings Team

---

## Feedback Collection Setup

### 1. In-App Feedback
- Settings screen includes a "Send Feedback" button → opens device email client with pre-filled subject `[Bloomlings Beta] Feedback — v{version}`
- Crash reporting via EAS Updates crash logs (automatic)

### 2. Survey
- Create a Google Form / Typeform with these sections:
  - **Device info**: model, OS version
  - **Play time**: how long did you play?
  - **First impressions**: what did you enjoy? what confused you?
  - **Bugs**: describe any issues (with screenshot upload option)
  - **Balance**: did progression feel too fast / too slow / about right?
  - **Ads**: were ad placements fair and non-intrusive?
  - **Rating**: 1–5 overall, 1–5 would-you-recommend
- Share survey link in TestFlight "What to Test" notes and Play Store release notes

### 3. Discord Channel
- Create `#bloomlings-beta` channel (private, invite-only)
- Sub-channels: `#bug-reports`, `#feedback`, `#suggestions`, `#screenshots`
- Pin the survey link and known-issues list
- Check daily during beta period

---

## Beta Timeline

```
Week 1        Week 2        Week 3        Week 4        Week 5
|-- Internal --|-- Bug Fix --|-------- Closed Beta --------|
   (1 week)    (3-5 days)         (2 weeks)
```

### Phase 1: Internal Beta (1 week)
- **Who**: Team members + close collaborators (5–10 people)
- **Goal**: Catch critical bugs, verify core loop, test save/load across devices
- **Platform**: TestFlight (Internal) + Google Play Internal Testing
- **Exit criteria**: No P0/P1 bugs, crash-free rate >99%, core loop playable to Zone 40+

### Phase 2: Bug Fix Sprint (3–5 days)
- **Goal**: Fix all P0/P1 issues found in internal beta
- **Deliverables**: Patched build pushed to both platforms
- **No new features** — stability fixes only

### Phase 3: Closed Beta (2 weeks)
- **Who**: 50–100 external testers (recruited via social, communities, friends)
- **Goal**: Validate retention, balance, ad experience, and device compatibility at scale
- **Platform**: TestFlight (External / Closed) + Google Play Closed Testing
- **Feedback**: Survey at Day 3 and Day 14; Discord open throughout
- **Exit criteria**: See go/no-go checklist below

---

## Go / No-Go Checklist: Internal → Closed Beta

All items must be YES to proceed to Closed Beta:

| # | Criterion | Target | Status |
|---|-----------|--------|--------|
| 1 | P0 bugs resolved | 0 open | ☐ |
| 2 | P1 bugs resolved | 0 open | ☐ |
| 3 | Crash-free rate | ≥ 99.5% | ☐ |
| 4 | Core loop completable | Zone 1 → 40 → Rebirth without blockers | ☐ |
| 5 | Save/load verified | Save persists across kill/restart, export/import works | ☐ |
| 6 | Offline progress works | Returns correct earnings after 1h+ away | ☐ |
| 7 | Ads load and reward | At least Double Offline + Dewdrop Garden functional | ☐ |
| 8 | Performance acceptable | 60fps on mid-range devices, <200MB RAM | ☐ |
| 9 | Both platforms tested | At least 1 iOS + 1 Android device confirmed working | ☐ |
| 10 | Feedback pipeline ready | Survey live, Discord channel open, crash reporting active | ☐ |

**Decision maker**: Project lead reviews checklist at end of internal beta week.
**If NO on any item**: Extend internal beta by up to 3 days for targeted fixes, then re-evaluate.
