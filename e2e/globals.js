// =============================================================================
// Nightwatch globals — defaults shared across all Bloomlings e2e tests
// =============================================================================

module.exports = {
  // 3 min per test — Metro-loaded debug APK can take 60s+ to surface the Garden.
  asyncHookTimeout: 180000,

  waitForConditionTimeout: 60000,
  waitForConditionPollInterval: 250,

  // Keep session alive between tests in the same file; reset between files
  // only if the test body calls browser.resetApp().
  reuseBrowserSession: true,

  before(done) {
    done();
  },

  beforeEach(browser, done) {
    done();
  },

  afterEach(browser, done) {
    done();
  },

  after(done) {
    done();
  },
};
