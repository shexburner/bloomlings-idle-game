// =============================================================================
// Custom command: byTestId(testID)
// =============================================================================
// React Native `testID` props are surfaced on Android (UiAutomator2) as
// `resource-id`. This helper returns the xpath selector so tests read as:
//
//   browser.waitForElementVisible(byTestId('tap-area'));
//
// Use with Nightwatch's element-handling APIs (waitForElementVisible,
// click, getText, etc.).
// =============================================================================

exports.command = function byTestId(testID) {
  // Return the selector object; caller uses it with Nightwatch element APIs.
  // We return a string so it works with both .waitForElementVisible and .click.
  return `//*[@resource-id="${testID}"]`;
};

// Also exported as a plain function for direct use in test bodies where a
// method on the browser object isn't ergonomic.
exports.selector = (testID) => `//*[@resource-id="${testID}"]`;
