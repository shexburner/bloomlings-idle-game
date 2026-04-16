# e2e — Nightwatch + Appium

Android UI tests for Bloomlings Idle Game. Driven by Nightwatch 3 through an Appium 3 server using the UiAutomator2 driver.

## Layout

```
e2e/
  commands/          custom Nightwatch commands (byTestId)
  support/           shared helpers (xpath selectors for testID / text)
  globals.js         timeouts + session reuse
  seeds/             late-game save payloads (captured via Settings → Export)
  tests/
    smoke/           P0 cold-launch + tap loop + tab nav
    shop/            upgrade purchase + multiplier toggle
    collection/      grid + detail modal
    rebirth/         gate + (manual) execute + nectar shop
    persistence/     save/relaunch + export/import
    offline/         Welcome Back (manual, needs backdated save)
```

## One-time setup

1. Android SDK platform-tools on PATH (`adb devices` shows your device).
2. Physical device plugged in with USB debugging approved. Default UDID is `R5CX92JPGHY`; override with `ANDROID_UDID=<id>`.
3. Debug APK installed (`com.anonymous.bloomlingsidlegame`).
4. Metro bundler running in another terminal: `npx expo start --dev-client` + `adb reverse tcp:8081 tcp:8081`.
5. Dev deps already in `package.json` (`nightwatch`, `appium`, `appium-uiautomator2-driver`). If the UiAutomator2 driver isn't installed into Appium yet:
   ```bash
   npx appium driver install uiautomator2
   ```

## Running

Two terminals:

```bash
# terminal 1 — Appium server on :4723
npm run appium

# terminal 2 — tests
npm run test:e2e:smoke     # fast P0 sweep
npm run test:e2e           # full automated suite
```

Run a single spec:

```bash
npx nightwatch --env android.device e2e/tests/shop/01-buy-tap-upgrade.test.js
```

Filter by tag:

```bash
npx nightwatch --env android.device --tag smoke
```

Specs tagged `manual` require a seeded save and are skipped by default. To run them after seeding, invoke the file directly.

## Selector convention

React Native `testID` props surface on Android as `resource-id`. Every test uses `byTestId('<id>')` which produces `//*[@resource-id="<id>"]`. IDs are kebab-case and area-scoped (`shop-tab-tap`, `upgrade-buy-tap-power`, `bloomling-card-fernley`, etc.). Add a new testID before writing a test against a new surface.

## Seeds

Capture late-game state by playing to the desired point, then Settings → Export Save, and saving the payload under `e2e/seeds/<scenario>.json`. Seed-dependent tests (Rebirth execute, Nectar shop buy, Welcome Back modal) read from `e2e/seeds/` — the seeding step itself is still manual until an adb-push helper lands.

## Debugging

- Appium logs are in the terminal running `npm run appium` — crank verbosity with `npm run appium -- --log-level debug`.
- Nightwatch writes per-failure screenshots + HTML reports to `tests_output/`.
- If a selector isn't matching, dump the page source:
  ```js
  browser.source(function (res) { console.log(res.value); });
  ```
