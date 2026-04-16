// TC-COL-001
// Collection grid renders and shows the discovered-count header.

const { byTestId, byText } = require('../../support/selectors');

describe('collection · view bloomlings', function () {
  this.tags = ['collection', 'P0'];

  it('renders collection grid with discovered count', function (browser) {
    browser
      .useXpath()
      .waitForElementVisible(byTestId('tap-area'), 60000)
      .click(byText('Collection'))
      .waitForElementVisible(byTestId('collection-grid'), 10000)
      .waitForElementVisible(byTestId('collection-discovered-count'), 5000);
  });
});
