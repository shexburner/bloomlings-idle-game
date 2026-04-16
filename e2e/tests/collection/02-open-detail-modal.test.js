// TC-COL-002
// Tapping a Bloomling card opens the detail modal; close dismisses it.

const { byTestId, byText } = require('../../support/selectors');

describe('collection · open detail modal', function () {
  this.tags = ['collection', 'P1'];

  it('opens and closes the detail modal for Fernley', function (browser) {
    browser
      .useXpath()
      .waitForElementVisible(byTestId('tap-area'), 60000)
      .click(byText('Collection'))
      .waitForElementVisible(byTestId('collection-grid'), 10000)
      .click(byTestId('bloomling-card-fernley'))
      .waitForElementVisible(byTestId('bloomling-detail'), 10000)
      .click(byTestId('bloomling-detail-close'))
      .waitForElementNotPresent(byTestId('bloomling-detail'), 10000);
  });
});
