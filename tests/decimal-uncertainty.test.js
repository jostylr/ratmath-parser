import { describe, expect, it, test } from "bun:test";
import { Parser } from "../src/index.js";
import { Rational, RationalInterval, BaseSystem } from "@ratmath/core";

describe("Decimal Uncertainty Parsing", () => {
  describe("range notation", () => {
    it("parses basic range notation 1.23[56:67]", () => {
      const result = Parser.parse("1.23[56:67]");

      expect(result.low.equals(new Rational("1.2356"))).toBe(true);
      expect(result.high.equals(new Rational("1.2367"))).toBe(true);
    });

    it("parses range notation with different digit counts", () => {
      const result = Parser.parse("78.3[15:24]");

      expect(result.low.equals(new Rational("78.315"))).toBe(true);
      expect(result.high.equals(new Rational("78.324"))).toBe(true);
    });

    it("handles negative base numbers", () => {
      const result = Parser.parse("-1.23[56:67]");

      expect(result.low.equals(new Rational("-1.2367"))).toBe(true);
      expect(result.high.equals(new Rational("-1.2356"))).toBe(true);
    });

    it("handles integer base numbers", () => {
      const result = Parser.parse("42[15:25]");

      expect(result.low.equals(new Rational("4215"))).toBe(true);
      expect(result.high.equals(new Rational("4225"))).toBe(true);
    });

    it("supports colon as separator 1.23[56:67]", () => {
      const result = Parser.parse("1.23[56:67]");
      expect(result.low.equals(new Rational("1.2356"))).toBe(true);
      expect(result.high.equals(new Rational("1.2367"))).toBe(true);
    });
  });

  describe("relative notation", () => {
    it("parses basic relative notation 1.23[+5:-6]", () => {
      const result = Parser.parse("1.23[+5:-6]");

      // 1.23 + 5 × 0.01 = 1.28, 1.23 - 6 × 0.01 = 1.17
      expect(result.low.equals(new Rational("1.17"))).toBe(true);
      expect(result.high.equals(new Rational("1.28"))).toBe(true);
    });

    it("handles order independence of + and -", () => {
      const result1 = Parser.parse("1.23[+0.5:-0.6]");
      const result2 = Parser.parse("1.23[-0.6:+0.5]");

      expect(result1.low.equals(result2.low)).toBe(true);
      expect(result1.high.equals(result2.high)).toBe(true);
    });

    it("parses example 78.3[+15: -0.6]", () => {
      const result = Parser.parse("78.3[+15: -0.6]");

      // 78.3 + 15 × 0.1 = 79.8, 78.3 - 0.6 × 0.1 = 78.24
      expect(result.low.equals(new Rational("78.24"))).toBe(true);
      expect(result.high.equals(new Rational("79.8"))).toBe(true);
    });

    it("supports colon as separator in relative notation 1.23[+5:-6]", () => {
      const result = Parser.parse("1.23[+5:-6]");
      expect(result.low.equals(new Rational("1.17"))).toBe(true);
      expect(result.high.equals(new Rational("1.28"))).toBe(true);
    });

    it("handles decimal offsets", () => {
      const result = Parser.parse("1.5[+0.25:-0.15]");

      // 1.5 + 0.25 × 0.1 = 1.525, 1.5 - 0.15 × 0.1 = 1.485
      expect(result.low.equals(new Rational("1.485"))).toBe(true);
      expect(result.high.equals(new Rational("1.525"))).toBe(true);
    });

    it("demonstrates equivalent integer vs decimal offset notation", () => {
      const result1 = Parser.parse("1.5[+25:-15]");
      const result2 = Parser.parse("1.5[+0.25:-0.15]");

      // Integer offsets are measured in tenths: 1.5 - 1.5 to 1.5 + 2.5
      expect(result1.low.equals(new Rational("0"))).toBe(true);
      expect(result1.high.equals(new Rational("4"))).toBe(true);

      // Decimal offsets use the same tenths unit.
      expect(result2.low.equals(new Rational("1.485"))).toBe(true);
      expect(result2.high.equals(new Rational("1.525"))).toBe(true);

      // They should be different results
      expect(result1.equals(result2)).toBe(false);
    });

    it("handles negative base with relative notation", () => {
      const result = Parser.parse("-2.5[+0.1:-0.2]");

      // -2.5 + 0.1 × 0.1 = -2.49, -2.5 - 0.2 × 0.1 = -2.52
      expect(result.low.equals(new Rational("-2.52"))).toBe(true);
      expect(result.high.equals(new Rational("-2.49"))).toBe(true);
    });

    it("parses symmetric notation with +-", () => {
      const result = Parser.parse("1.3[+-1]");

      // 1.3 ± 1 × 0.1 = 1.2:1.4
      expect(result.low.equals(new Rational("1.2"))).toBe(true);
      expect(result.high.equals(new Rational("1.4"))).toBe(true);
    });

    it("parses symmetric notation with -+", () => {
      const result = Parser.parse("1.3[-+1]");

      // 1.3 ± 1 × 0.1 = 1.2:1.4
      expect(result.low.equals(new Rational("1.2"))).toBe(true);
      expect(result.high.equals(new Rational("1.4"))).toBe(true);
    });

    it("treats +- and -+ as equivalent", () => {
      const result1 = Parser.parse("1.3[+-1]");
      const result2 = Parser.parse("1.3[-+1]");

      expect(result1.equals(result2)).toBe(true);
    });

    it("handles decimal offsets in symmetric notation", () => {
      const result = Parser.parse("2.5[+-0.25]");

      // 2.5 ± 0.25 × 0.1 = 2.475:2.525
      expect(result.low.equals(new Rational("2.475"))).toBe(true);
      expect(result.high.equals(new Rational("2.525"))).toBe(true);
    });

    it("handles symmetric notation with different base precisions", () => {
      const result1 = Parser.parse("1.23[+-5]");
      const result2 = Parser.parse("78[+-10]");

      // 1.23 ± 5 × 0.01 = 1.18:1.28
      expect(result1.low.equals(new Rational("1.18"))).toBe(true);
      expect(result1.high.equals(new Rational("1.28"))).toBe(true);

      // 78 ± 10 = 68:88 (integer base applies offset directly)
      expect(result2.low.equals(new Rational("68"))).toBe(true);
      expect(result2.high.equals(new Rational("88"))).toBe(true);
    });
  });

  describe("error handling", () => {
    it("rejects comma separators", () => {
      expect(() => Parser.parse("1.23[56,67]")).toThrow("requires ':'");
      expect(() => Parser.parse("1.23[+5,-6]")).toThrow("requires ':'");
      expect(() => Parser.parse("0.[#3,#6]")).toThrow("requires ':'");
    });

    it("throws error for missing brackets", () => {
      expect(() => Parser.parse("1.23")).not.toThrow();
      expect(() => Parser.parse("1.23[56,67")).toThrow();
    });

    it("throws error for invalid range format", () => {
      // Note: 1.23[56] is now valid base notation (base 56), so use base > 62 which is invalid
      expect(() => Parser.parse("1.23[65]")).toThrow();
      expect(() => Parser.parse("1.23[56:67:89]")).toThrow();
    });

    it("handles single-value relative notation", () => {
      const result = Parser.parse("1.23[+5]");
      // [+5, 0] -> 1.28, 1.23
      expect(result.low.equals(new Rational("1.23"))).toBe(true);
      expect(result.high.equals(new Rational("1.28"))).toBe(true);
    });

    it("throws error for invalid relative signs", () => {
      expect(() => Parser.parse("1.23[+5:+6]")).toThrow();
      expect(() => Parser.parse("1.23[-5:-6]")).toThrow();
    });

    it("throws error for non-numeric range values", () => {
      expect(() => Parser.parse("1.23[5a:67]")).toThrow();
      expect(() => Parser.parse("1.23[56:6.7]")).toThrow();
    });

    it("throws error for invalid offset values", () => {
      expect(() => Parser.parse("1.23[+5a:-6]")).toThrow();
      expect(() => Parser.parse("1.23[+:-6]")).toThrow(
        "Offset must be a valid number",
      );
    });

    it("throws error for invalid symmetric notation", () => {
      expect(() => Parser.parse("1.23[+-]")).toThrow(
        "Symmetric notation must have a valid number after +- or -+",
      );
      expect(() => Parser.parse("1.23[-+a]")).toThrow();
      expect(() => Parser.parse("1.23[+-5.a]")).toThrow();
    });
  });

  describe("arithmetic with uncertainty intervals", () => {
    it("performs addition with uncertainty intervals", () => {
      const result = Parser.parse("1.23[+0.5:-0.3] + 2.45[+0.2:-0.1]");

      // [1.227, 1.235] + [2.449, 2.452] = [3.676, 3.687]
      expect(result.low.equals(new Rational("3.676"))).toBe(true);
      expect(result.high.equals(new Rational("3.687"))).toBe(true);
    });

    it("performs multiplication with uncertainty intervals", () => {
      const result = Parser.parse("2[+0.1:-0.1] * 3[+0.2:-0.2]");

      // [1.9, 2.1] * [2.8, 3.2] = [5.32, 6.72] (integer bases apply offsets directly)
      expect(result.low.equals(new Rational("133/25"))).toBe(true);
      expect(result.high.equals(new Rational("168/25"))).toBe(true);
    });
  });
});

describe("RationalInterval Export Methods", () => {
  describe("compactedDecimalInterval", () => {
    it("converts simple intervals to compacted notation", () => {
      const interval = new RationalInterval(
        new Rational("1.2356"),
        new Rational("1.2367"),
      );
      expect(interval.compactedDecimalInterval()).toBe("1.23[56:67]");
    });

    it("handles intervals with no common prefix", () => {
      const interval = new RationalInterval(
        new Rational("1.5"),
        new Rational("2.7"),
      );
      expect(interval.compactedDecimalInterval()).toBe("1.5:2.7");
    });

    it("handles intervals with different decimal lengths", () => {
      const interval = new RationalInterval(
        new Rational("1.23"),
        new Rational("1.2456"),
      );
      expect(interval.compactedDecimalInterval()).toBe("1.23:1.2456");
    });

    it("handles negative intervals", () => {
      const interval = new RationalInterval(
        new Rational("-1.2367"),
        new Rational("-1.2356"),
      );
      expect(interval.compactedDecimalInterval()).toBe("-1.23[67:56]");
    });
  });

  describe("relativeMidDecimalInterval", () => {
    it("expresses offsets in units of the last visible decimal place", () => {
      const interval = new RationalInterval(
        new Rational("1.2"),
        new Rational("1.3"),
      );
      const result = interval.relativeMidDecimalInterval();

      expect(result).toBe("1.25[+-5]");
      expect(Parser.parse(result).equals(interval)).toBe(true);
    });

    it("converts intervals to symmetric notation", () => {
      const interval = new RationalInterval(
        new Rational("1.224"),
        new Rational("1.235"),
      );
      const result = interval.relativeMidDecimalInterval();

      // Midpoint: 1.2295, relative offset: ±55 in ten-thousandths
      expect(result).toBe("1.2295[+-55]");
    });

    it("handles large relative offsets", () => {
      const interval = new RationalInterval(
        new Rational("77.7"),
        new Rational("93.3"),
      );
      const result = interval.relativeMidDecimalInterval();

      // Midpoint: 85.5, relative offset: ±78 in tenths
      expect(result).toBe("85.5[+-78]");
    });

    it("handles small intervals", () => {
      const interval = new RationalInterval(
        new Rational("1.35"),
        new Rational("1.75"),
      );
      const result = interval.relativeMidDecimalInterval();

      // Midpoint: 1.55, relative offset: ±20 in hundredths
      expect(result).toBe("1.55[+-20]");
    });
  });

  describe("relativeDecimalInterval", () => {
    it("uses shortest precise decimal within interval", () => {
      const interval = new RationalInterval(
        new Rational("1.224"),
        new Rational("1.235"),
      );
      const result = interval.relativeDecimalInterval();

      // Should find 1.23 as the shortest precise decimal in [1.224, 1.235]
      // and create offsets in units of its last visible decimal place
      expect(result).toBe("1.23[+0.5:-0.6]");
    });

    it("handles intervals where shortest decimal is closer to one bound", () => {
      const interval = new RationalInterval(
        new Rational("1.22"),
        new Rational("1.24"),
      );
      const result = interval.relativeDecimalInterval();

      // Should find 1.23 as the shortest precise decimal in [1.22, 1.24]
      expect(result).toBe("1.23[+-1]");
    });

    it("finds shortest decimal closest to midpoint when multiple options exist", () => {
      const interval = new RationalInterval(
        new Rational("1.225"),
        new Rational("1.275"),
      );
      const result = interval.relativeDecimalInterval();

      // Both 1.23, 1.24, 1.25, 1.26, 1.27 are valid 2-decimal places
      // Midpoint is 1.25, so 1.25 should be chosen
      expect(result).toBe("1.25[+-2.5]");
    });
  });
});

describe("Exact Decimal Intervals", () => {
  it("treats 1.23:1.34 as exact decimals", () => {
    const result1 = Parser.parse("1.23:1.34");
    const result2 = Parser.parse("1.23#0:1.34#0");

    expect(result1.low.equals(result2.low)).toBe(true);
    expect(result1.high.equals(result2.high)).toBe(true);
  });

  it("handles mixed exact and repeating decimals", () => {
    const result = Parser.parse("1.5:0.#3");

    expect(result.low.equals(new Rational("1/3"))).toBe(true);
    expect(result.high.equals(new Rational("3/2"))).toBe(true);
  });

  it("exports exact intervals with repeating decimal notation", () => {
    const interval = new RationalInterval(
      new Rational("1.23"),
      new Rational("1.34"),
    );
    const result = interval.toRepeatingDecimal();

    expect(result).toBe("1.23#0:1.34#0");
  });

  describe("base support", () => {
    it("parses uncertainty notation in other bases (Hex)", () => {
      const result = Parser.parse("1.a[b:c]", {
        inputBase: BaseSystem.HEXADECIMAL,
      });
      // 1.ab (Hex) = 427/256, 1.ac (Hex) = 428/256
      expect(result.low.equals(new Rational(427n, 256n))).toBe(true);
      expect(result.high.equals(new Rational(428n, 256n))).toBe(true);
    });
  });
});
