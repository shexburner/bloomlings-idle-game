// TC-OFF-001 — requires a backdated save to force offline time skip. Manual.

const { byTestId } = require('../../support/selectors');

describe('offline · welcome back modal', function () {
  this.tags = ['offline', 'manual', 'P1'];

  it('@manual shows Welcome Back modal after simulated time skip', function (browser) {
    browser
      .useXpath()
      .waitForElementVisible(byTestId('welcome-back-modal'), 15000)
      .click(byTestId('welcome-back-collect'))
      .waitForElementNotPresent(byTestId('welcome-back-modal'), 10000);
  });
});
