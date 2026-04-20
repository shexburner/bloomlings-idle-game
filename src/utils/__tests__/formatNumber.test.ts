import { formatNumber, formatRate } from "../formatNumber";

describe("formatNumber", () => {
  it("returns '0' for 0", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("returns integer as-is for values < 1000", () => {
    expect(formatNumber(1)).toBe("1");
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(42)).toBe("42");
  });

  it("formats a decimal small number with 2 decimals by default", () => {
    expect(formatNumber(3.14)).toBe("3.14");
    expect(formatNumber(0.5)).toBe("0.50");
  });

  it("respects custom decimals for small numbers", () => {
    expect(formatNumber(1.5, 0)).toBe("2");
    expect(formatNumber(1.5, 1)).toBe("1.5");
  });

  it("formats 1000 as '1.00K'", () => {
    expect(formatNumber(1000)).toBe("1.00K");
  });

  it("formats 1234 as '1.23K'", () => {
    expect(formatNumber(1234)).toBe("1.23K");
  });

  it("formats 999999 correctly as K", () => {
    expect(formatNumber(999999)).toBe("1000.00K");
  });

  it("formats 1000000 as '1.00M'", () => {
    expect(formatNumber(1_000_000)).toBe("1.00M");
  });

  it("formats 1234567 as '1.23M'", () => {
    expect(formatNumber(1_234_567)).toBe("1.23M");
  });

  it("formats 1e9 as '1.00B'", () => {
    expect(formatNumber(1_000_000_000)).toBe("1.00B");
  });

  it("formats 4560000000 as '4.56B'", () => {
    expect(formatNumber(4_560_000_000)).toBe("4.56B");
  });

  it("formats 1e12 as '1.00T'", () => {
    expect(formatNumber(1e12)).toBe("1.00T");
  });

  it("handles negative numbers by prepending '-'", () => {
    expect(formatNumber(-1000)).toBe("-1.00K");
    expect(formatNumber(-5)).toBe("-5");
  });

  it("formats 0 decimals correctly for large numbers", () => {
    expect(formatNumber(1500, 0)).toBe("2K");
  });
});

describe("formatRate", () => {
  it("appends /s to a formatted number", () => {
    expect(formatRate(0)).toBe("0/s");
    expect(formatRate(1000)).toBe("1.00K/s");
    expect(formatRate(0.5)).toBe("0.50/s");
  });

  it("uses formatNumber internally", () => {
    expect(formatRate(1_234_567)).toBe("1.23M/s");
  });
});
