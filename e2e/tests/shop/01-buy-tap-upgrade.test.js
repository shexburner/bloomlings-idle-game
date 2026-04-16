// TC-SHOP-001, TC-SHOP-003
// Earn Sunlight, open Shop, buy the Tap Power upgrade (cheapest tap upgrade).

const { byTestId, byText } = require('../../support/selectors');

describe('shop · buy tap upgrade', function () {
  this.tags = ['shop', 'P0'];

  it('purchases tap_power and increments its level', function (browser) {
    browser.useXpath().waitForElementVisible(byTestId('tap-area'), 60000);

    // Earn enough Sunlight to cover the 10-Sunlight base cost.
    for (let i = 0; i < 30; i += 1) {
      browser.click(byTestId('tap-area'));
    }

    browser
      .click(byText('Shop'))
      .waitForElementVisible(byTestId('shop-screen'), 10000)
      .click(byTestId('shop-tab-tap'))
      .waitForElementVisible(byTestId('upgrade-card-tap-power'), 10000)
      .getText(byTestId('upgrade-level-tap-power'), function (before) {
        browser.assert.ok(before.value !== undefined, 'initial level readable');
        browser
          .click(byTestId('upgrade-buy-tap-power'))
          .pause(500)
          .getText(byTestId('upgrade-level-tap-power'), function (after) {
            browser.assert.notEqual(
              after.value.trim(),
              before.value.trim(),
              'tap_power level incremented after buy'
            );
          });
      });
  });
});
