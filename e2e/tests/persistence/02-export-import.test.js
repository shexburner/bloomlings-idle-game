// TC-PER-002
// Export produces a non-empty save string; import echoes it back without error.

const { byTestId, byText } = require('../../support/selectors');

describe('persistence · export / import round-trip', function () {
  this.tags = ['persistence', 'P1'];

  it('exports then re-imports the current save', function (browser) {
    browser
      .useXpath()
      .waitForElementVisible(byTestId('tap-area'), 60000)
      .click(byText('Settings'))
      .waitForElementVisible(byTestId('settings-export'), 10000)
      .click(byTestId('settings-export'))
      .waitForElementVisible(byTestId('settings-export-text'), 10000)
      .getText(byTestId('settings-export-text'), function (result) {
        const payload = (result.value || '').trim();
        browser.assert.ok(payload.length > 10, 'export payload non-empty');
        browser
          .setValue(byTestId('settings-import-input'), payload)
          .click(byTestId('settings-import'))
          .pause(1000)
          .waitForElementVisible(byTestId('settings-screen'), 10000);
      });
  });
});
