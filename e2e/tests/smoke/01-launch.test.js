// TC-TAP-008, TC-CUR-001, TC-ZONE-001, TC-ZONE-002
// Cold launch smoke — app renders past splash, core garden surfaces visible.

const { byTestId } = require('../../support/selectors');

describe('smoke · cold launch', function () {
  this.tags = ['smoke', 'P0'];

  it('renders Garden tab with tap area, sunlight, and zone progress', function (browser) {
    browser
      .useXpath()
      .waitForElementVisible(byTestId('tap-area'), 60000)
      .waitForElementVisible(byTestId('currency-sunlight'), 5000)
      .waitForElementVisible(byTestId('zone-progress'), 5000)
      .waitForElementVisible(byTestId('zone-label'), 5000);
  });
});
