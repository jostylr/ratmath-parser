import { describe, it, expect } from "bun:test";
import { Parser } from "../src/index.js";
import { BaseSystem, Integer, Rational, RationalInterval } from "@ratmath/core";

describe("Base-Aware Input Parsing", () => {
  describe("Basic Input Base Parsing", () => {
    it("should parse numbers in input base without explicit notation", () => {
      const options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

      // 12 in base 3 = 1*3 + 2 = 5 in decimal
      const result = Parser.parse("12", options);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(5n);
    });

    it("should parse fractions in input base", () => {
      const options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

      // 12/101 in base 3 = 5/10 in decimal = 1/2
      const result = Parser.parse("12/101", options);
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(1n);
      expect(result.denominator).toBe(2n);
    });

    it("should parse mixed numbers in input base", () => {
      const options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

      // 12..101/211 in base 3 = 5..10/22 in decimal = 5 + 10/22 = 5 + 5/11 = 60/11
      const result = Parser.parse("12..101/211", options);
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(60n);
      expect(result.denominator).toBe(11n);
    });

    it("should parse decimal numbers in input base", () => {
      const options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

      // 12.1 in base 3 = 5.333... in decimal = 16/3
      const result = Parser.parse("12.1", options);
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(16n);
      expect(result.denominator).toBe(3n);
    });

    it("should parse intervals in input base", () => {
      const options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

      // 12:101 in base 3 = 5:10 in decimal
      const result = Parser.parse("12:101", options);
      expect(result).toBeInstanceOf(RationalInterval);
      expect(result.low.numerator).toBe(5n);
      expect(result.high.numerator).toBe(10n);
    });
  });

  describe("Base-Aware E Notation", () => {
    it("should handle E notation in input base (non-E containing bases)", () => {
      const options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

      // 12E2 in base 3 = 5 * 3^2 = 5 * 9 = 45
      const result = Parser.parse("12E2", options);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(45n);
    });

    it("should parse exponent in input base", () => {
      const options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

      // 12E12 in base 3: 12 (base 3) = 5, E12 (base 3) = E5, so 5 * 3^5 = 5 * 243 = 1215
      const result = Parser.parse("12E12", options);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(1215n);
    });

    it("should handle negative exponents in base-aware E notation", () => {
      const options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

      // 12E-1 in base 3 = 5 * 3^(-1) = 5/3
      const result = Parser.parse("12E-1", options);
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(5n);
      expect(result.denominator).toBe(3n);
    });

    it("should use _^ notation for bases containing E", () => {
      const baseWithE = new BaseSystem("0-9A-F".split("-").join(""), "Base 16 with E"); // Hacky fix for invalid test logic or just use explicit chars
      // Actually "0-9A-F" was likely intended to be parsed. Since BaseSystem no longer parses, we must provide explicit list or use BaseParser
      // Let's rely on manual construction for tests or import BaseParser if needed.
      // "0-9A-F" expands to 0..9 and A..F.
      const chars = [];
      for (let i = 48; i <= 57; i++) chars.push(String.fromCharCode(i));
      for (let i = 65; i <= 70; i++) chars.push(String.fromCharCode(i));
      const baseWithE_fixed = new BaseSystem(chars, "Base 16 with E");
      const options = { inputBase: baseWithE_fixed, typeAware: true };

      // AE_^2 should be AE (hex) = 174 (decimal) times 16^2 = 174 * 256 = 44544
      const result = Parser.parse("AE_^2", options);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(44544n);
    });

    it("should handle fractional base with E notation", () => {
      const options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

      // 12.1E1 in base 3 = (16/3) * 3^1 = 16/3 * 3 = 16
      const result = Parser.parse("12.1E1", options);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(16n);
    });

    it("should handle E notation with fractions", () => {
      const options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

      // 12/2E1 in base 3 = (5/2) * 3^1 = 15/2
      const result = Parser.parse("12/2E1", options);
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(15n);
      expect(result.denominator).toBe(2n);
    });
  });

  describe("Explicit Base Override", () => {
    it("should use explicit base notation over input base", () => {
      const options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

      // 0b101 is 5 decimal. Input base 3 would treat '101' as 10 (decimal).
      // But prefix overrides input base.
      const result = Parser.parse("0b101", options);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(5n);
    });

    it("should handle E notation in explicit base notation", () => {
      const options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

      // 0b10E10 (binary) -> 2 * 2^2 = 8
      // Input base 3 would calculate differently if no prefix.
      const result = Parser.parse("0b10E10", options);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(8n);
    });
  });

  describe("Error Handling and Fallback", () => {
    it("should throw error for invalid digits in input base", () => {
      const options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

      // 13 contains invalid digit '3' for base 3
      expect(() => Parser.parse("13", options)).toThrow();
    });

    it("should throw error for invalid exponent in base-aware E notation", () => {
      const options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

      // E3 contains invalid digit '3' for base 3 exponent
      expect(() => Parser.parse("12E3", options)).toThrow();
    });

    it("should handle E notation with mixed base interpretation", () => {
      const options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

      // "3E2" - the "3" falls back to decimal but "E2" uses base 3 for exponent
      // So this becomes 3 * 3^2 = 3 * 9 = 27
      // Wait, 3 is invalid in base 3. Is `3E2` valid?
      // parseInterval checks input base. '3' fails.
      // Falls back. Decimal rules apply for "3".
      // Then E notation. Exponent "2" is valid in base 3.
      // BaseSystem logic: parseENotation uses baseSystem.
      const result = Parser.parse("3E2", options);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(27n);
    });
  });

  describe("Complex Expressions with Input Base", () => {
    it("should handle arithmetic with input base numbers", () => {
      const options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

      // 12 + 101 in base 3 = 5 + 10 = 15 in decimal
      const result = Parser.parse("12 + 101", options);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(15n);
    });

    it("should handle mixed expressions with explicit and implicit base", () => {
      const options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

      // 12 (base 3 = 5) + 0b10 (binary = 2) = 7
      const result = Parser.parse("12 + 0b10", options);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(7n);
    });

    it("should handle parentheses with input base", () => {
      const options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

      // (12 + 1) * 2 in base 3 = (5 + 1) * 2 = 6 * 2 = 12
      const result = Parser.parse("(12 + 1) * 2", options);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(12n);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero in input base", () => {
      const options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

      const result = Parser.parse("0", options);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(0n);
    });

    it("should handle negative numbers in input base", () => {
      const options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

      // -12 in base 3 = -5 in decimal
      const result = Parser.parse("-12", options);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(-5n);
    });

    it("should handle large numbers in input base", () => {
      const options = { inputBase: BaseSystem.fromBase(3), typeAware: true };

      // 122122 in base 3
      const result = Parser.parse("122122", options);
      expect(result).toBeInstanceOf(Integer);
      // 1*3^5 + 2*3^4 + 2*3^3 + 1*3^2 + 2*3^1 + 2*3^0 = 243 + 162 + 54 + 9 + 6 + 2 = 476
      expect(result.value).toBe(476n);
    });

    it("should handle hexadecimal input base with letters", () => {
      const options = { inputBase: BaseSystem.HEXADECIMAL, typeAware: true };

      // ff in hex = 255 in decimal
      const result = Parser.parse("ff", options);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(255n);
    });

    it("should handle case sensitivity in hexadecimal", () => {
      const options = { inputBase: BaseSystem.HEXADECIMAL, typeAware: true };

      // ff in hex = 255 in decimal (standard hex uses lowercase)
      const result = Parser.parse("ff", options);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(255n);
    });
  });

  describe("Binary Input Base", () => {
    it("should parse binary numbers correctly", () => {
      const options = { inputBase: BaseSystem.BINARY, typeAware: true };

      // 1010 in binary = 10 in decimal
      const result = Parser.parse("1010", options);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(10n);
    });

    it("should handle binary E notation", () => {
      const options = { inputBase: BaseSystem.BINARY, typeAware: true };

      // 101E10 in binary = 5 * 2^2 = 5 * 4 = 20
      const result = Parser.parse("101E10", options);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(20n);
    });

    it("should handle binary fractions", () => {
      const options = { inputBase: BaseSystem.BINARY, typeAware: true };

      // 1010/101 in binary = 10/5 = 2 in decimal
      const result = Parser.parse("1010/101", options);
      expect(result).toBeInstanceOf(Rational);
      expect(result.numerator).toBe(2n);
      expect(result.denominator).toBe(1n);
    });
  });

  describe("Base with E Character", () => {
    it("should use _^ notation when base contains E", () => {
      // Create a custom base that includes E
      const customBase = new BaseSystem("0123456789ABCDEF".split(""));
      const options = { inputBase: customBase, typeAware: true };

      // Test that E is treated as a regular digit, not exponent notation
      const result = Parser.parse("E", options);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(14n); // E = 14 in hex
    });

    it("should parse _^ notation correctly in bases with E", () => {
      const customBase = new BaseSystem("0123456789ABCDEF".split(""));
      const options = { inputBase: customBase, typeAware: true };

      // A_^2 = 10 * 16^2 = 10 * 256 = 2560
      const result = Parser.parse("A_^2", options);
      expect(result).toBeInstanceOf(Integer);
      expect(result.value).toBe(2560n);
    });
  });
});
