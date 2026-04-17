// TC-AD-001, TC-AD-002
// Lucky Sprout modal — dismiss path. Requires a save with luckySproutPending=true
// injected via MMKV seed. @manual because the scheduler fires after 10–15 min of
// foreground play and cannot be reliably triggered in an automated run.

const { byTestId } = require('../../support/selectors');

describe('ads · lucky sprout modal', function () {
  this.tags = ['ads', 'manual', 'P1'];

  it('@manual modal visible when luckySproutPending is true (seeded save)', function (browser) {
    // Requires a save seed with luckySproutPending: true injected before launch.
    browser
      .useXpath()
      .waitForElementVisible(byTestId('lucky-sprout-modal'), 15000);
  });

  it('@manual dismiss button clears the modal', function (browser) {
    browser
      .useXpath()
      .waitForElementVisible(byTestId('lucky-sprout-modal'), 15000)
      .click(byTestId('lucky-sprout-dismiss'))
      .waitForElementNotPresent(byTestId('lucky-sprout-modal'), 10000);
  });
});
