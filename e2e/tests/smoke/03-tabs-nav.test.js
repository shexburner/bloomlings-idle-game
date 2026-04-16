// TC-NAV-001
// Navigating between bottom tabs renders each main screen.

const { byTestId, byText } = require('../../support/selectors');

describe('smoke · tab navigation', function () {
  this.tags = ['smoke', 'P0'];

  it('navigates Garden → Shop → Collection → Settings', function (browser) {
    browser
      .useXpath()
      .waitForElementVisible(byTestId('tap-area'), 60000)
      .click(byText('Shop'))
      .waitForElementVisible(byTestId('shop-screen'), 10000)
      .click(byText('Collection'))
      .waitForElementVisible(byTestId('collection-grid'), 10000)
      .click(byText('Settings'))
      .waitForElementVisible(byTestId('settings-screen'), 10000)
      .click(byText('Garden'))
      .waitForElementVisible(byTestId('tap-area'), 10000);
  });
});
