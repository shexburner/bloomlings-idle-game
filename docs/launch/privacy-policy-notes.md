# Bloomlings — Privacy Policy Notes

> These notes are for drafting the full privacy policy. The final policy must be reviewed by legal counsel before publication.

## Data Collection Summary

| Category | Collected? | Details |
|---|---|---|
| Personal information | No | No accounts, no sign-up, no names or emails |
| Usage/analytics data | No | No analytics SDK integrated (placeholder for future) |
| Device identifiers | Yes* | Via Google AdMob SDK only, for ad personalization |
| Location data | No | Not accessed |
| Photos/media | No | Not accessed |
| Contacts | No | Not accessed |
| Financial data | No | No in-app purchases at launch |

*Device identifiers are collected by the AdMob SDK, not by the Bloomlings app directly.

## Local Storage

- **Engine**: MMKV (react-native-mmkv)
- **What's stored**: Game save data (progress, currencies, Bloomling collection, settings)
- **Where**: On-device only. Never transmitted to any server.
- **No cloud sync**: Save data does not leave the device. No accounts, no server-side storage.
- **Export/import**: Players can manually export/import save files (local file operations only).

## Third-Party SDKs

### Google AdMob (`react-native-google-mobile-ads`)
- **Purpose**: Serving voluntary rewarded video ads
- **Data collected by AdMob**:
  - Device advertising identifier (IDFA on iOS, GAID on Android)
  - IP address (for geo-targeting)
  - Device info (model, OS version)
  - Ad interaction data (impressions, clicks)
- **Ad personalization**: Enabled by default, subject to user consent (see GDPR section)
- **AdMob privacy policy**: https://policies.google.com/privacy

### Expo Notifications (`expo-notifications`)
- **Purpose**: Local notifications only (e.g., "Your Bloomlings miss you!")
- **No push notification server**: Notifications are scheduled locally on-device
- **No data transmitted**: No tokens sent to any server

## COPPA Compliance (Children's Privacy)

- **Content rating**: E for Everyone / PEGI 3
- **Mixed audience app**: The game appeals to all ages but is not specifically directed at children under 13
- **AdMob child-directed treatment**:
  - Must configure `tagForChildDirectedTreatment` in AdMob settings
  - When enabled: no personalized ads, no remarketing, restricted ad categories
  - Decision needed: whether to tag the app as child-directed (limits ad revenue but simplifies compliance)
- **No PII collected**: The app itself collects zero personal information from any user
- **Parental gate**: Not currently implemented. Consider adding if app is tagged as child-directed.

### Recommendation
Tag the app as **mixed audience** (not child-directed) in AdMob. Implement age-gating for ad consent if required by platform review. This preserves ad personalization for adult users while remaining compliant.

## GDPR Compliance (EU Users)

### Consent Requirements
- **AdMob consent**: Must implement Google's User Messaging Platform (UMP) SDK or Consent Management Platform (CMP) for EU users
- **Consent flow**: Show consent dialog on first launch for EU users before loading any ads
- **Options to present**:
  1. Consent to personalized ads
  2. Consent to non-personalized ads only
  3. No consent (no ads shown)

### Implementation Notes
- Use `react-native-google-mobile-ads` built-in consent APIs (`AdsConsent`)
- Store consent status locally (MMKV)
- Re-request consent if status is unknown or expired
- Respect `doNotSell` for CCPA (California) users

### Data Processing
- **Bloomlings app**: Does not process any personal data. Acts as data controller only for AdMob integration.
- **Google AdMob**: Acts as data processor for ad serving. Subject to Google's data processing terms.
- **Right to erasure**: No app-side data to erase. AdMob data erasure handled through Google's processes. Local save data can be deleted by uninstalling the app.

## Apple App Tracking Transparency (ATT)

- **Required**: Yes, because AdMob accesses IDFA
- **ATT prompt**: Must show before any ad loads on iOS 14.5+
- **If user denies**: Serve non-personalized ads only (AdMob handles this automatically when IDFA is unavailable)
- **Privacy Nutrition Label** (App Store Connect):
  - Data linked to user: None (by the app)
  - Data used to track user: Advertising identifier (via AdMob)
  - Data not linked to user: Diagnostics (if crash reporting added later)

## Google Play Data Safety

- **Data shared with third parties**: Device identifiers and ad interaction data (via AdMob, for advertising)
- **Data collected**: Device identifiers (via AdMob)
- **Security practices**: Data encrypted in transit (AdMob handles this)
- **Data deletion**: Not applicable (no server-side data)

## Future Considerations

- [ ] Analytics SDK (e.g., Firebase Analytics) — will require privacy policy update
- [ ] Cloud save / account system — will require significant privacy policy revision
- [ ] In-app purchases — may require additional disclosures
- [ ] Crash reporting (e.g., Sentry, Crashlytics) — will collect device/crash data
