// TC-NECT-001 — manual until seeded save with Nectar is available.

const { byTestId, byText } = require('../../support/selectors');

describe('rebirth · nectar shop buy', function () {
  this.tags = ['rebirth', 'manual', 'P1'];

  it('@manual purchases a Nectar upgrade', function (browser) {
    browser
      .useXpath()
      .waitForElementVisible(byTestId('tap-area'), 60000)
      .click(byText('Rebirth'))
      .waitForElementVisible(byTestId('rebirth-screen'), 10000)
      .click(byTestId('rebirth-tab-shop'))
      .waitForElementVisible(byTestId('nectar-shop'), 10000);
  });
});
