// TC-REB-002 — requires seeded post-Zone-40 save. Manual until seed wired.

const { byTestId, byText } = require('../../support/selectors');

describe('rebirth · execute rebirth', function () {
  this.tags = ['rebirth', 'manual', 'P1'];

  it('@manual performs rebirth when gate is cleared', function (browser) {
    browser
      .useXpath()
      .waitForElementVisible(byTestId('tap-area'), 60000)
      .click(byText('Rebirth'))
      .waitForElementVisible(byTestId('rebirth-screen'), 10000)
      .click(byTestId('rebirth-button'))
      .waitForElementVisible(byTestId('rebirth-confirm'), 5000)
      .click(byTestId('rebirth-confirm'))
      .pause(1000)
      .waitForElementVisible(byTestId('tap-area'), 10000);
  });
});
