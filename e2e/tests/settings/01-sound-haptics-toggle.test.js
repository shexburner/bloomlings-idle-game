// TC-SET-001, TC-SET-002, TC-SET-003
// Settings screen toggles for Sound Effects, Music, and Haptics are present
// and can be interacted with.

const { byTestId, byText } = require('../../support/selectors');

describe('settings · audio & feedback toggles', function () {
  this.tags = ['settings', 'P1'];

  it('Settings screen renders Audio & Feedback toggles', function (browser) {
    browser
      .useXpath()
      .waitForElementVisible(byTestId('tap-area'), 60000)
      .click(byText('Settings'))
      .waitForElementVisible(byTestId('settings-screen'), 10000)
      .waitForElementVisible(byTestId('settings-sfx-toggle'), 5000)
      .waitForElementVisible(byTestId('settings-music-toggle'), 5000)
      .waitForElementVisible(byTestId('settings-haptics-toggle'), 5000);
  });

  it('Sound Effects toggle can be turned off and on', function (browser) {
    browser
      .useXpath()
      .waitForElementVisible(byTestId('tap-area'), 60000)
      .click(byText('Settings'))
      .waitForElementVisible(byTestId('settings-sfx-toggle'), 10000)
      // Toggle off
      .click(byTestId('settings-sfx-toggle'))
      .pause(300)
      // Toggle back on
      .click(byTestId('settings-sfx-toggle'))
      .pause(300);
  });

  it('Haptics toggle can be turned off and on', function (browser) {
    browser
      .useXpath()
      .waitForElementVisible(byTestId('tap-area'), 60000)
      .click(byText('Settings'))
      .waitForElementVisible(byTestId('settings-haptics-toggle'), 10000)
      .click(byTestId('settings-haptics-toggle'))
      .pause(300)
      .click(byTestId('settings-haptics-toggle'))
      .pause(300);
  });
});
