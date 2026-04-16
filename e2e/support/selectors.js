// =============================================================================
// Shared selector helpers — use these in every test for consistency
// =============================================================================

/** xpath for a RN testID (works on Android via UiAutomator2 resource-id). */
const byTestId = (id) => `//*[@resource-id="${id}"]`;

/** xpath that matches an element's visible text exactly. */
const byText = (text) => `//*[@text="${text}"]`;

/** xpath for text contained within any element. */
const byTextContains = (text) => `//*[contains(@text, "${text}")]`;

module.exports = { byTestId, byText, byTextContains };
