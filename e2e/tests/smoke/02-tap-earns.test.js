// TC-TAP-001, TC-TAP-002
// Tapping tap-area awards Sunlight.

const { byTestId } = require('../../support/selectors');

describe('smoke · tap earns sunlight', function () {
  this.tags = ['smoke', 'P0'];

  it('increases currency-sunlight after 10 taps', function (browser) {
    browser
      .useXpath()
      .waitForElementVisible(byTestId('tap-area'), 60000)
      .getText(byTestId('currency-sunlight'), function (before) {
        browser.assert.ok(before.value !== undefined, 'initial sunlight readable');
      });

    for (let i = 0; i < 10; i += 1) {
      browser.click(byTestId('tap-area'));
    }

    browser.getText(byTestId('currency-sunlight'), function (after) {
      browser.assert.notEqual(after.value.trim(), '0', 'sunlight incremented past 0');
    });
  });
});
