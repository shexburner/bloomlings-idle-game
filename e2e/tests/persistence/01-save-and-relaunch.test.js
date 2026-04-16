// TC-PER-001
// Earned Sunlight survives an app restart (via Save → terminate → relaunch).

const { byTestId, byText } = require('../../support/selectors');

describe('persistence · save and relaunch', function () {
  this.tags = ['persistence', 'P0'];

  it('preserves Sunlight across app restart', function (browser) {
    browser.useXpath().waitForElementVisible(byTestId('tap-area'), 60000);

    for (let i = 0; i < 20; i += 1) {
      browser.click(byTestId('tap-area'));
    }

    browser
      .click(byText('Settings'))
      .waitForElementVisible(byTestId('settings-save'), 10000)
      .click(byTestId('settings-save'))
      .pause(1000)
      .getText(byTestId('currency-sunlight'), function (before) {
        browser.perform(function () {
          const done = this.async();
          browser.appium.terminateApp('com.anonymous.bloomlingsidlegame', () => {
            browser.appium.activateApp('com.anonymous.bloomlingsidlegame', () => done());
          });
        });
        browser
          .useXpath()
          .waitForElementVisible(byTestId('tap-area'), 30000)
          .getText(byTestId('currency-sunlight'), function (after) {
            browser.assert.equal(
              after.value.trim(),
              before.value.trim(),
              'sunlight survives restart'
            );
          });
      });
  });
});
