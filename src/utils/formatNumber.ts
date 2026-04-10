// =============================================================================
// Number Formatting Utility
// =============================================================================
// Formats large numbers with abbreviated suffixes (K, M, B, T, etc.)
// Used throughout the UI for currency and stat displays.
// =============================================================================

/** Suffix tiers for number abbreviation. */
const SUFFIXES: readonly string[] = [
  "",
  "K",
  "M",
  "B",
  "T",
  "Qa",
  "Qi",
  "Sx",
  "Sp",
  "Oc",
  "No",
  "Dc",
];

/**
 * Format a number with abbreviated suffixes.
 *
 * Examples:
 *   formatNumber(0)         => "0"
 *   formatNumber(999)       => "999"
 *   formatNumber(1000)      => "1.00K"
 *   formatNumber(1234)      => "1.23K"
 *   formatNumber(1234567)   => "1.23M"
 *   formatNumber(4560000000) => "4.56B"
 *
 * @param n - The number to format.
 * @param decimals - Number of decimal places (default 2).
 * @returns The formatted string.
 */
export function formatNumber(n: number, decimals: number = 2): string {
  if (n < 0) {
    return "-" + formatNumber(-n, decimals);
  }

  if (n < 1000) {
    // For small numbers, show as integer if whole, otherwise with limited decimals
    if (Number.isInteger(n)) {
      return n.toString();
    }
    return n.toFixed(decimals);
  }

  let tier = 0;
  let scaled = n;

  while (scaled >= 1000 && tier < SUFFIXES.length - 1) {
    scaled /= 1000;
    tier++;
  }

  const suffix = SUFFIXES[tier];
  if (suffix === undefined) {
    return n.toExponential(decimals);
  }

  return scaled.toFixed(decimals) + suffix;
}

/**
 * Format a rate (per second) value.
 *
 * Examples:
 *   formatRate(0.5)   => "0.50/s"
 *   formatRate(1234)  => "1.23K/s"
 *
 * @param rate - The rate value (per second).
 * @returns The formatted rate string.
 */
export function formatRate(rate: number): string {
  return formatNumber(rate) + "/s";
}
