// TC-SHOP-005
// Buy-multiplier toggle cycles through x1 → x10 → x25 → x100 → Max.

const { byTestId, byText } = require('../../support/selectors');

describe('shop · buy multiplier toggle', function () {
  this.tags = ['shop', 'P1'];

  it('toggles through each multiplier option', function (browser) {
    browser
      .useXpath()
      .waitForElementVisible(byTestId('tap-area'), 60000)
      .click(byText('Shop'))
      .waitForElementVisible(byTestId('shop-screen'), 10000)
      .waitForElementVisible(byTestId('buy-multiplier-toggle'), 10000);

    const labels = ['x10', 'x25', 'x100', 'Max', 'x1'];
    labels.forEach((label) => {
      browser
        .click(byTestId('buy-multiplier-toggle'))
        .pause(200)
        .waitForElementVisible(byTestId(`multiplier-${label.toLowerCase()}`), 5000);
    });
  });
});
