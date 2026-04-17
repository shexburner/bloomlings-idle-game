// TC-AD-005, TC-AD-006
// ComboKeeperButton — pill visibility gated on combo >= 50 and cooldown clear.

const { byTestId } = require('../../support/selectors');

describe('ads · combo keeper button', function () {
  this.tags = ['ads', 'P1'];

  it('pill is absent on fresh launch (combo is 0)', function (browser) {
    // Fresh launch — combo starts at 0, pill must not be visible.
    browser
      .useXpath()
      .waitForElementVisible(byTestId('tap-area'), 30000)
      .waitForElementNotPresent(byTestId('combo-keeper-button'), 5000);
  });

  it('@manual pill appears when combo reaches 50 (rapid tap or seeded save)', function (browser) {
    // Requires either 50+ quick taps or a seeded save with combo.count >= 50.
    // After the combo-keeper ad is watched the button disappears (combo frozen).
    browser
      .useXpath()
      .waitForElementVisible(byTestId('combo-meter'), 30000)
      .waitForElementVisible(byTestId('combo-keeper-button'), 10000);
  });
});
