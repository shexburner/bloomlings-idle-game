// TC-REB-001
// Rebirth screen shows locked state before Zone 40.

const { byTestId, byText } = require('../../support/selectors');

describe('rebirth · locked below Zone 40', function () {
  this.tags = ['rebirth', 'P0'];

  it('renders rebirth-screen-locked on a fresh save', function (browser) {
    browser
      .useXpath()
      .waitForElementVisible(byTestId('tap-area'), 60000)
      .click(byText('Rebirth'))
      .waitForElementVisible(byTestId('rebirth-screen-locked'), 10000);
  });
});
