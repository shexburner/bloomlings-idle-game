# Bloomlings — Production Ad Unit IDs

> All 7 rewarded ad unit IDs must be replaced with real AdMob production IDs before launch.
> Platform-specific IDs (iOS / Android) are now wired — each touchpoint resolves via `Platform.OS`.

## Current Placeholders

These are in `src/services/adManager.ts` → `getAdUnitId()`:

| # | Touchpoint | Variable Key | iOS Placeholder | Android Placeholder |
|---|---|---|---|---|
| 1 | Double Offline Earnings | `doubleOffline` | `ca-app-pub-XXXXXXXXXXXXXXXX/1000000001` | `ca-app-pub-XXXXXXXXXXXXXXXX/2000000001` |
| 2 | Sunbeam Boost | `sunbeamBoost` | `ca-app-pub-XXXXXXXXXXXXXXXX/1000000002` | `ca-app-pub-XXXXXXXXXXXXXXXX/2000000002` |
| 3 | Dewdrop Garden | `dewdropGarden` | `ca-app-pub-XXXXXXXXXXXXXXXX/1000000003` | `ca-app-pub-XXXXXXXXXXXXXXXX/2000000003` |
| 4 | Lucky Sprout | `luckySprout` | `ca-app-pub-XXXXXXXXXXXXXXXX/1000000004` | `ca-app-pub-XXXXXXXXXXXXXXXX/2000000004` |
| 5 | Gate Assist | `gateAssist` | `ca-app-pub-XXXXXXXXXXXXXXXX/1000000005` | `ca-app-pub-XXXXXXXXXXXXXXXX/2000000005` |
| 6 | Boss Smash | `bossSmash` | `ca-app-pub-XXXXXXXXXXXXXXXX/1000000006` | `ca-app-pub-XXXXXXXXXXXXXXXX/2000000006` |
| 7 | Combo Keeper | `comboKeeper` | `ca-app-pub-XXXXXXXXXXXXXXXX/1000000007` | `ca-app-pub-XXXXXXXXXXXXXXXX/2000000007` |

## How to Replace

### 1. Create ad units in AdMob

1. Go to [AdMob Console](https://apps.admob.com/)
2. Register the Bloomlings app for **both iOS and Android**
3. For each app, create **7 Rewarded ad units** with names matching the touchpoints above
4. Copy each ad unit ID (format: `ca-app-pub-XXXXXXXXXX/YYYYYYYYYY`)

### 2. Update the code

In `src/services/adManager.ts`, find the `prodIds` object inside `getAdUnitId()` and replace each placeholder with the real iOS and Android IDs:

```typescript
const prodIds: Record<RewardedAdUnit, { ios: string; android: string }> = {
  doubleOffline: {
    ios: "ca-app-pub-REAL/ios-id",
    android: "ca-app-pub-REAL/android-id",
  },
  // ... etc
};
```

The runtime selection is already wired:

```typescript
return prodIds[unit][Platform.OS === 'ios' ? 'ios' : 'android'];
```

### 3. Also update `app.json`

Ensure the AdMob **App ID** (not unit ID) is set for both platforms in `app.json`:

```json
{
  "expo": {
    "plugins": [
      ["react-native-google-mobile-ads", {
        "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY",
        "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"
      }]
    ]
  }
}
```

### 4. Verify

- Build a **release** build (not `__DEV__`) — dev builds use `TestIds.REWARDED` automatically
- Confirm each touchpoint loads and plays a real ad on **both iOS and Android**
- Confirm rewards are delivered correctly
- Test the no-fill and close-without-reward paths

> ⚠️ **Never ship with placeholder IDs.** Ads will fail silently in production — the graceful fallback means you won't notice missing revenue unless you check.
