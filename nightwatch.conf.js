// =============================================================================
// Nightwatch configuration — Bloomlings e2e (Appium / UiAutomator2 on Android)
// =============================================================================
// Run against the already-installed debug or release APK on a connected
// device. Appium server must be running on http://127.0.0.1:4723 — start it
// with `npm run appium` in a separate terminal.
// =============================================================================

module.exports = {
  src_folders: ['e2e/tests'],
  page_objects_path: ['e2e/page-objects'],
  custom_commands_path: ['e2e/commands'],
  custom_assertions_path: ['e2e/assertions'],

  globals_path: 'e2e/globals.js',

  test_settings: {
    default: {
      disable_error_log: false,
      launch_url: '',
      selenium: {
        start_process: false,
        host: '127.0.0.1',
        port: 4723,
        use_appium: true,
      },
      webdriver: {
        start_process: false,
        host: '127.0.0.1',
        port: 4723,
        default_path_prefix: '',
      },
      desiredCapabilities: {
        browserName: '',
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:appPackage': 'com.anonymous.bloomlingsidlegame',
        'appium:appActivity': '.MainActivity',
        'appium:noReset': true,
        'appium:fullReset': false,
        'appium:autoGrantPermissions': true,
        'appium:newCommandTimeout': 120,
        'appium:adbExecTimeout': 60000,
      },
    },

    // Target a specific device when multiple are connected.
    'android.device': {
      extends: 'default',
      desiredCapabilities: {
        'appium:udid': process.env.ANDROID_UDID || 'R5CX92JPGHY',
      },
    },

    // Smoke profile — same config, meant to be paired with --group smoke.
    smoke: {
      extends: 'android.device',
    },
  },
};
