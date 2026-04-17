// TC-AD-003, TC-AD-004
// SunbeamBoostButton — FAB visibility gating by allTimeHighestZone.

const { byTestId } = require('../../support/selectors');

describe('ads · sunbeam boost button', function () {
  this.tags = ['ads', 'P1'];

  it('FAB is absent on a fresh save (Zone 1, below Zone-15 gate)', function (browser) {
    // Fresh launch — allTimeHighestZone starts at 1, FAB must not be visible.
    browser
      .useXpath()
      .waitForElementVisible(byTestId('tap-area'), 30000)
      .waitForElementNotPresent(byTestId('sunbeam-boost-button'), 5000);
  });

  it('@manual FAB is visible once allTimeHighestZone reaches 15 (seeded save)', function (browser) {
    // Requires a save seed with allTimeHighestZone >= 15.
    browser
      .useXpath()
      .waitForElementVisible(byTestId('sunbeam-boost-button'), 15000);
  });
});
