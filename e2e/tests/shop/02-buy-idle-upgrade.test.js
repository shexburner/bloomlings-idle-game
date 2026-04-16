// TC-SHOP-002, TC-SHOP-004
// Open Shop's Idle tab and buy Photosynthesis (idle_production, 25 Sunlight).

const { byTestId, byText } = require('../../support/selectors');

describe('shop · buy idle upgrade', function () {
  this.tags = ['shop', 'P0'];

  it('purchases idle_production and increments its level', function (browser) {
    browser.useXpath().waitForElementVisible(byTestId('tap-area'), 60000);

    // Earn enough Sunlight to cover the 25 base cost (plus crit variance).
    for (let i = 0; i < 50; i += 1) {
      browser.click(byTestId('tap-area'));
    }

    browser
      .click(byText('Shop'))
      .waitForElementVisible(byTestId('shop-screen'), 10000)
      .click(byTestId('shop-tab-idle'))
      .waitForElementVisible(byTestId('upgrade-card-idle-production'), 10000)
      .getText(byTestId('upgrade-level-idle-production'), function (before) {
        browser
          .click(byTestId('upgrade-buy-idle-production'))
          .pause(500)
          .getText(byTestId('upgrade-level-idle-production'), function (after) {
            browser.assert.notEqual(
              after.value.trim(),
              before.value.trim(),
              'idle_production level incremented after buy'
            );
          });
      });
  });
});
