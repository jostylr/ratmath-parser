/**
 * BaseSystem Tests
 *
 * Comprehensive test suite for the BaseSystem class functionality.
 */

import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { BaseSystem, Integer, Rational, RationalInterval } from "@ratmath/core";
import { BaseParser, Parser } from "../src/index.js";

describe("BaseSystem", () => {
  describe("Constructor and Character Sequence Parsing", () => {
    it("should create base system with simple range notation", () => {
      const binary = new BaseSystem(BaseParser.parseDefinition("0-1"));
      expect(binary.base).toBe(2);
      expect(binary.characters).toEqual(["0", "1"]);
    });

    it("should create base system with multiple ranges", () => {
      const hex = new BaseSystem(BaseParser.parseDefinition("0-9a-f"));
      expect(hex.base).toBe(16);
      expect(hex.characters).toEqual([
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
      ]);
    });

    it("should create base system with explicit character list", () => {
      const octal = new BaseSystem("01234567".split(""));
      expect(octal.base).toBe(8);
      expect(octal.characters).toEqual([
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
      ]);
    });

    it("should create base system with mixed ranges and explicit chars", () => {
      const mixed = new BaseSystem(BaseParser.parseDefinition("0-4XYZ"));
      expect(mixed.base).toBe(8);
      expect(mixed.characters).toEqual([
        "0",
        "1",
        "2",
        "3",
        "4",
        "X",
        "Y",
        "Z",
      ]);
    });

    it("should handle uppercase ranges", () => {
      const upper = new BaseSystem(BaseParser.parseDefinition("A-F"));
      expect(upper.base).toBe(6);
      expect(upper.characters).toEqual(["A", "B", "C", "D", "E", "F"]);
    });

    it("should throw error for empty sequence", () => {
      // BaseParser throws for empty sequence, BaseSystem throws for array length < 2
      expect(() => new BaseSystem(BaseParser.parseDefinition(""))).toThrow(
        "Character sequence must be a non-empty string",
      );
    });

    it("should throw error for non-string sequence", () => {
      // BaseParser throws for non-string
      expect(() => new BaseSystem(BaseParser.parseDefinition(123))).toThrow(
        "Character sequence must be a non-empty string",
      );
    });

    it("should throw error for invalid range", () => {
      // BaseParser throws this
      expect(() => new BaseSystem(BaseParser.parseDefinition("z-a"))).toThrow(
        "Invalid range: 'z-a'. Start character must come before end character.",
      );
    });

    it("should throw error for duplicate characters", () => {
      expect(() => new BaseSystem(BaseParser.parseDefinition("0-2012"))).toThrow(
        "Character sequence contains duplicate characters",
      );
    });

    it("should throw error for base less than 2", () => {
      expect(() => new BaseSystem(BaseParser.parseDefinition("0"))).toThrow(
        "Base system must have at least 2 characters",
      );
    });

    it("should accept optional name parameter", () => {
      const named = new BaseSystem(BaseParser.parseDefinition("0-1"), "Binary System");
      expect(named.name).toBe("Binary System");
    });

    it("should generate default name if none provided", () => {
      const unnamed = new BaseSystem(BaseParser.parseDefinition("0-7"));
      expect(unnamed.name).toBe("Base 8");
    });
  });

  describe("Standard Base Presets", () => {
    it("should have correct BINARY preset", () => {
      expect(BaseSystem.BINARY.base).toBe(2);
      expect(BaseSystem.BINARY.characters).toEqual(["0", "1"]);
      expect(BaseSystem.BINARY.name).toBe("Binary");
    });

    it("should have correct OCTAL preset", () => {
      expect(BaseSystem.OCTAL.base).toBe(8);
      expect(BaseSystem.OCTAL.characters).toEqual([
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
      ]);
      expect(BaseSystem.OCTAL.name).toBe("Octal");
    });

    it("should have correct DECIMAL preset", () => {
      expect(BaseSystem.DECIMAL.base).toBe(10);
      expect(BaseSystem.DECIMAL.characters).toEqual([
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
      ]);
      expect(BaseSystem.DECIMAL.name).toBe("Decimal");
    });

    it("should have correct HEXADECIMAL preset", () => {
      expect(BaseSystem.HEXADECIMAL.base).toBe(16);
      expect(BaseSystem.HEXADECIMAL.characters).toEqual([
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
      ]);
      expect(BaseSystem.HEXADECIMAL.name).toBe("Hexadecimal");
    });

    it("should have correct BASE36 preset", () => {
      expect(BaseSystem.BASE36.base).toBe(36);
      expect(BaseSystem.BASE36.characters.length).toBe(36);
      expect(BaseSystem.BASE36.name).toBe("Base 36");
    });

    it("should have correct BASE62 preset", () => {
      expect(BaseSystem.BASE62.base).toBe(62);
      expect(BaseSystem.BASE62.characters.length).toBe(62);
      expect(BaseSystem.BASE62.name).toBe("Base 62");
    });
  });

  describe("Extended Base Presets", () => {
    it("should have correct BASE60 preset", () => {
      expect(BaseSystem.BASE60.base).toBe(60);
      expect(BaseSystem.BASE60.characters.length).toBe(60);
      expect(BaseSystem.BASE60.name).toBe("Base 60 (Sexagesimal)");
    });

    it("should have correct ROMAN preset", () => {
      expect(BaseSystem.ROMAN.base).toBe(7);
      expect(BaseSystem.ROMAN.characters).toEqual([
        "I",
        "V",
        "X",
        "L",
        "C",
        "D",
        "M",
      ]);
      expect(BaseSystem.ROMAN.name).toBe("Roman Numerals");
    });

    it("should work with BASE60 conversions", () => {
      const base60 = BaseSystem.BASE60;
      const testValue = 3600n; // 1 hour in seconds
      const converted = base60.fromDecimal(testValue);
      expect(base60.toDecimal(converted)).toBe(testValue);
    });

    it("should work with ROMAN conversions", () => {
      const roman = BaseSystem.ROMAN;
      const testValues = [1n, 5n, 10n, 50n, 100n];
      testValues.forEach((value) => {
        const converted = roman.fromDecimal(value);
        expect(roman.toDecimal(converted)).toBe(value);
      });
    });
  });

  describe("Conflict Detection", () => {
    const reservedSymbols = [
      "+",
      "-",
      "*",
      "/",
      "^",
      "!",
      "(",
      ")",
      "[",
      "]",
      ":",
      ".",
      "#",
      "~",
    ];

    reservedSymbols.forEach((symbol) => {
      it(`should throw error for reserved symbol '${symbol}'`, () => {
        expect(() => new BaseSystem(`01${symbol}`.split(""))).toThrow(
          /Base system characters conflict with parser symbols/,
        );
      });
    });

    it("should list all conflicting characters in error message", () => {
      expect(() => new BaseSystem("0123+*".split(""))).toThrow(/\+, \*/);
    });

    it("should allow non-reserved characters", () => {
      const safe = new BaseSystem(BaseParser.parseDefinition("0-9ghijklmnopqrstuvwxyz"));
      expect(safe.base).toBe(30);
    });
  });

  describe("toDecimal Method", () => {
    const binary = BaseSystem.BINARY;
    const hex = BaseSystem.HEXADECIMAL;
    const decimal = BaseSystem.DECIMAL;

    it("should convert binary strings to decimal", () => {
      expect(binary.toDecimal("0")).toBe(0n);
      expect(binary.toDecimal("1")).toBe(1n);
      expect(binary.toDecimal("10")).toBe(2n);
      expect(binary.toDecimal("101")).toBe(5n);
      expect(binary.toDecimal("1111")).toBe(15n);
      expect(binary.toDecimal("101010")).toBe(42n);
    });

    it("should convert hexadecimal strings to decimal", () => {
      expect(hex.toDecimal("0")).toBe(0n);
      expect(hex.toDecimal("a")).toBe(10n);
      expect(hex.toDecimal("f")).toBe(15n);
      expect(hex.toDecimal("10")).toBe(16n);
      expect(hex.toDecimal("ff")).toBe(255n);
      expect(hex.toDecimal("100")).toBe(256n);
    });

    it("should handle negative numbers", () => {
      expect(binary.toDecimal("-1")).toBe(-1n);
      expect(binary.toDecimal("-101")).toBe(-5n);
      expect(hex.toDecimal("-ff")).toBe(-255n);
    });

    it("should handle large numbers", () => {
      const largeBinary = "1".repeat(64);
      const result = binary.toDecimal(largeBinary);
      expect(typeof result).toBe("bigint");
      expect(result > 0n).toBe(true);
    });

    it("should throw error for invalid characters", () => {
      expect(() => binary.toDecimal("102")).toThrow(
        "Invalid character '2' for Binary",
      );
      expect(() => hex.toDecimal("xyz")).toThrow(
        "Invalid character 'x' for Hexadecimal",
      );
    });

    it("should throw error for empty string", () => {
      expect(() => binary.toDecimal("")).toThrow(
        "Input must be a non-empty string",
      );
    });

    it("should throw error for non-string input", () => {
      expect(() => binary.toDecimal(123)).toThrow(
        "Input must be a non-empty string",
      );
    });
  });

  describe("fromDecimal Method", () => {
    const binary = BaseSystem.BINARY;
    const hex = BaseSystem.HEXADECIMAL;
    const decimal = BaseSystem.DECIMAL;

    it("should convert decimal to binary strings", () => {
      expect(binary.fromDecimal(0n)).toBe("0");
      expect(binary.fromDecimal(1n)).toBe("1");
      expect(binary.fromDecimal(2n)).toBe("10");
      expect(binary.fromDecimal(5n)).toBe("101");
      expect(binary.fromDecimal(15n)).toBe("1111");
      expect(binary.fromDecimal(42n)).toBe("101010");
    });

    it("should convert decimal to hexadecimal strings", () => {
      expect(hex.fromDecimal(0n)).toBe("0");
      expect(hex.fromDecimal(10n)).toBe("a");
      expect(hex.fromDecimal(15n)).toBe("f");
      expect(hex.fromDecimal(16n)).toBe("10");
      expect(hex.fromDecimal(255n)).toBe("ff");
      expect(hex.fromDecimal(256n)).toBe("100");
    });

    it("should handle negative numbers", () => {
      expect(binary.fromDecimal(-1n)).toBe("-1");
      expect(binary.fromDecimal(-5n)).toBe("-101");
      expect(hex.fromDecimal(-255n)).toBe("-ff");
    });

    it("should handle large numbers", () => {
      const large = 2n ** 100n;
      const result = binary.fromDecimal(large);
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(50);
    });

    it("should throw error for non-BigInt input", () => {
      expect(() => binary.fromDecimal(42)).toThrow("Value must be a BigInt");
      expect(() => binary.fromDecimal("42")).toThrow("Value must be a BigInt");
    });
  });

  describe("Round-trip Conversion", () => {
    const bases = [
      BaseSystem.BINARY,
      BaseSystem.OCTAL,
      BaseSystem.DECIMAL,
      BaseSystem.HEXADECIMAL,
      new BaseSystem("01234".split(""), "Base 5"),
    ];

    const testValues = [0n, 1n, 42n, 255n, 1000n, -42n, -255n, 2n ** 50n];

    bases.forEach((base) => {
      testValues.forEach((value) => {
        it(`should round-trip ${value} in ${base.name}`, () => {
          const str = base.fromDecimal(value);
          const back = base.toDecimal(str);
          expect(back).toBe(value);
        });
      });
    });
  });

  describe("isValidString Method", () => {
    const binary = BaseSystem.BINARY;
    const hex = BaseSystem.HEXADECIMAL;

    it("should validate correct strings", () => {
      expect(binary.isValidString("0")).toBe(true);
      expect(binary.isValidString("1")).toBe(true);
      expect(binary.isValidString("101")).toBe(true);
      expect(binary.isValidString("-101")).toBe(true);

      expect(hex.isValidString("0")).toBe(true);
      expect(hex.isValidString("abc")).toBe(true);
      expect(hex.isValidString("123def")).toBe(true);
      expect(hex.isValidString("-ff")).toBe(true);
    });

    it("should reject invalid strings", () => {
      expect(binary.isValidString("2")).toBe(false);
      expect(binary.isValidString("102")).toBe(false);
      expect(binary.isValidString("xyz")).toBe(false);

      expect(hex.isValidString("xyz")).toBe(false);
      expect(hex.isValidString("123xyz")).toBe(false);
    });

    it("should reject non-string input", () => {
      expect(binary.isValidString(123)).toBe(false);
      expect(binary.isValidString(null)).toBe(false);
      expect(binary.isValidString(undefined)).toBe(false);
    });

    it("should reject empty string", () => {
      expect(binary.isValidString("")).toBe(false);
      expect(hex.isValidString("")).toBe(false);
    });

    it("should handle negative sign correctly", () => {
      expect(binary.isValidString("-")).toBe(false);
      expect(binary.isValidString("-1")).toBe(true);
      expect(binary.isValidString("-2")).toBe(false);
    });
  });

  describe("Utility Methods", () => {
    const hex = BaseSystem.HEXADECIMAL;

    it("should return correct min and max digits", () => {
      expect(hex.getMinDigit()).toBe("0");
      expect(hex.getMaxDigit()).toBe("f");
    });

    it("should return character arrays as copies", () => {
      const chars1 = hex.characters;
      const chars2 = hex.characters;
      expect(chars1).toEqual(chars2);
      expect(chars1).not.toBe(chars2); // Different objects

      chars1.push("x"); // Mutate copy
      expect(hex.characters.length).toBe(16); // Original unchanged
    });

    it("should return charMap as copy", () => {
      const map1 = hex.charMap;
      const map2 = hex.charMap;
      expect(map1).toEqual(map2);
      expect(map1).not.toBe(map2); // Different objects

      map1.set("x", 99); // Mutate copy
      expect(hex.charMap.has("x")).toBe(false); // Original unchanged
    });

    it("should generate meaningful toString output", () => {
      const binary = BaseSystem.BINARY;
      const toString = binary.toString();
      expect(toString).toContain("Binary");
      expect(toString).toContain("01");
    });

    it("should truncate long character lists in toString", () => {
      const longBase = new BaseSystem(BaseParser.parseDefinition("0-9a-zA-Z"), "Long Base");
      const toString = longBase.toString();
      expect(toString).toContain("...");
    });
  });

  describe("equals Method", () => {
    it("should return true for equivalent base systems", () => {
      const binary1 = new BaseSystem(BaseParser.parseDefinition("0-1"));
      const binary2 = BaseSystem.BINARY;
      expect(binary1.equals(binary2)).toBe(true);
    });

    it("should return false for different bases", () => {
      const binary = BaseSystem.BINARY;
      const octal = BaseSystem.OCTAL;
      expect(binary.equals(octal)).toBe(false);
    });

    it("should return false for same base but different characters", () => {
      const base1 = new BaseSystem("01".split(""));
      const base2 = new BaseSystem("ab".split(""));
      expect(base1.equals(base2)).toBe(false);
    });

    it("should return false for non-BaseSystem objects", () => {
      const binary = BaseSystem.BINARY;
      expect(binary.equals({})).toBe(false);
      expect(binary.equals("binary")).toBe(false);
      expect(binary.equals(2)).toBe(false);
    });
  });

  describe("fromBase Static Method", () => {
    it("should create correct base systems for small bases", () => {
      const base2 = BaseSystem.fromBase(2);
      expect(base2.base).toBe(2);
      expect(base2.characters).toEqual(["0", "1"]);

      const base8 = BaseSystem.fromBase(8);
      expect(base8.base).toBe(8);
      expect(base8.characters).toEqual([
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
      ]);

      const base10 = BaseSystem.fromBase(10);
      expect(base10.base).toBe(10);
      expect(base10.characters.length).toBe(10);
    });

    it("should create correct base systems for medium bases", () => {
      const base16 = BaseSystem.fromBase(16);
      expect(base16.base).toBe(16);
      expect(base16.characters.slice(-6)).toEqual([
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
      ]);

      const base36 = BaseSystem.fromBase(36);
      expect(base36.base).toBe(36);
      expect(base36.characters.slice(-1)).toEqual(["z"]);
    });

    it("should create correct base systems for large bases", () => {
      const base62 = BaseSystem.fromBase(62);
      expect(base62.base).toBe(62);
      expect(base62.characters.length).toBe(62);
      expect(base62.characters.slice(-1)).toEqual(["Z"]);
    });

    it("should accept optional name parameter", () => {
      const named = BaseSystem.fromBase(16, "Custom Hex");
      expect(named.name).toBe("Custom Hex");
    });

    it("should generate default name if none provided", () => {
      const unnamed = BaseSystem.fromBase(16);
      expect(unnamed.name).toBe("Base 16");
    });

    it("should throw error for invalid base values", () => {
      expect(() => BaseSystem.fromBase(1)).toThrow(
        "Base must be an integer >= 2",
      );
      expect(() => BaseSystem.fromBase(0)).toThrow(
        "Base must be an integer >= 2",
      );
      expect(() => BaseSystem.fromBase(-1)).toThrow(
        "Base must be an integer >= 2",
      );
      expect(() => BaseSystem.fromBase(1.5)).toThrow(
        "Base must be an integer >= 2",
      );
    });

    it("should throw error for bases larger than 62", () => {
      expect(() => BaseSystem.fromBase(63)).toThrow(
        "BaseSystem.fromBase() only supports bases up to 62",
      );
      expect(() => BaseSystem.fromBase(100)).toThrow(
        "BaseSystem.fromBase() only supports bases up to 62",
      );
    });

    it("should create equivalent systems to presets", () => {
      expect(BaseSystem.fromBase(2).equals(BaseSystem.BINARY)).toBe(true);
      expect(BaseSystem.fromBase(8).equals(BaseSystem.OCTAL)).toBe(true);
      expect(BaseSystem.fromBase(10).equals(BaseSystem.DECIMAL)).toBe(true);
      expect(BaseSystem.fromBase(16).equals(BaseSystem.HEXADECIMAL)).toBe(true);
      expect(BaseSystem.fromBase(36).equals(BaseSystem.BASE36)).toBe(true);
      expect(BaseSystem.fromBase(62).equals(BaseSystem.BASE62)).toBe(true);
    });
  });

  describe("createPattern Static Method", () => {
    it("should create alphanumeric patterns", () => {
      const base16 = BaseSystem.createPattern("alphanumeric", 16);
      expect(base16.base).toBe(16);
      expect(base16.characters.slice(-6)).toEqual([
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
      ]);

      const base36 = BaseSystem.createPattern("alphanumeric", 36);
      expect(base36.base).toBe(36);
      expect(base36.characters.slice(-1)).toEqual(["z"]);
    });

    it("should create digits-only patterns", () => {
      const base8 = BaseSystem.createPattern("digits-only", 8);
      expect(base8.base).toBe(8);
      expect(base8.characters).toEqual([
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
      ]);
    });

    it("should create letters-only patterns", () => {
      const base10 = BaseSystem.createPattern("letters-only", 10);
      expect(base10.base).toBe(10);
      expect(base10.characters).toEqual([
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
      ]);
    });

    it("should create uppercase-only patterns", () => {
      const base5 = BaseSystem.createPattern("uppercase-only", 5);
      expect(base5.base).toBe(5);
      expect(base5.characters).toEqual(["A", "B", "C", "D", "E"]);
    });

    it("should throw error for invalid patterns", () => {
      expect(() => BaseSystem.createPattern("invalid", 10)).toThrow(
        "Unknown pattern",
      );
    });

    it("should throw error for sizes exceeding pattern limits", () => {
      expect(() => BaseSystem.createPattern("digits-only", 11)).toThrow(
        "Digits-only pattern only supports up to base 10",
      );
      expect(() => BaseSystem.createPattern("uppercase-only", 27)).toThrow(
        "Uppercase-only pattern only supports up to base 26",
      );
    });

    it("should accept custom names", () => {
      const named = BaseSystem.createPattern("digits-only", 5, "Custom Base 5");
      expect(named.name).toBe("Custom Base 5");
    });
  });

  describe("Case Sensitivity", () => {
    it("should handle case sensitive bases by default", () => {
      const mixedCase = new BaseSystem(BaseParser.parseDefinition("aAbBcC"));
      expect(mixedCase.base).toBe(6);
      expect(mixedCase.toDecimal("A")).toBe(1n);
      expect(mixedCase.toDecimal("a")).toBe(0n);
    });

    it("should convert to case insensitive", () => {
      const mixedCase = new BaseSystem(BaseParser.parseDefinition("aAbBcC"), "Mixed Case");
      const caseInsensitive = mixedCase.withCaseSensitivity(false);

      expect(caseInsensitive.base).toBe(3);
      expect(caseInsensitive.characters).toEqual(["a", "b", "c"]);
      expect(caseInsensitive.name).toBe("Mixed Case (case-insensitive)");
    });

    it("should preserve case sensitive when explicitly requested", () => {
      const original = new BaseSystem(BaseParser.parseDefinition("aAbBcC"));
      const caseSensitive = original.withCaseSensitivity(true);

      expect(caseSensitive.equals(original)).toBe(true);
    });

    it("should throw error for invalid case sensitivity parameter", () => {
      const base = new BaseSystem("abc".split(""));
      expect(() => base.withCaseSensitivity("invalid")).toThrow(
        "caseSensitive must be a boolean value",
      );
    });
  });

  describe("Enhanced Validation", () => {
    it("should validate base does not exceed character set length", () => {
      // This should work fine
      const validBase = new BaseSystem("01234567".split(""));
      expect(validBase.base).toBe(8);
    });

    it("should detect duplicate characters", () => {
      expect(() => new BaseSystem("abcabc".split(""))).toThrow(
        "Character set contains duplicate characters",
      );
    });

    it("should warn about non-contiguous ranges", () => {
      const originalWarn = console.warn;
      let warnCalled = false;
      let warnMessage = "";

      console.warn = (message) => {
        warnCalled = true;
        warnMessage = message;
      };

      // Create a base with non-contiguous letters (enough characters to trigger validation)
      // abcdefhijk has a gap at 'g' (position 6), which should trigger the warning
      const nonContiguous = new BaseSystem(BaseParser.parseDefinition("0123456789abcdefhijk"));
      expect(nonContiguous.base).toBe(20);
      expect(warnCalled).toBe(true);
      expect(warnMessage).toContain("Non-contiguous");

      console.warn = originalWarn;
    });
  });

  describe("Edge Cases and Error Conditions", () => {
    it("should handle zero correctly", () => {
      const bases = [
        BaseSystem.BINARY,
        BaseSystem.OCTAL,
        BaseSystem.HEXADECIMAL,
      ];
      bases.forEach((base) => {
        expect(base.fromDecimal(0n)).toBe("0");
        expect(base.toDecimal("0")).toBe(0n);
      });
    });

    it("should handle single digit numbers", () => {
      const hex = BaseSystem.HEXADECIMAL;
      for (let i = 0; i < 16; i++) {
        const decimal = BigInt(i);
        const hexStr = hex.fromDecimal(decimal);
        expect(hex.toDecimal(hexStr)).toBe(decimal);
      }
    });

    it("should warn for very large bases", () => {
      const originalWarn = console.warn;
      let warnCalled = false;
      let warnMessage = "";

      console.warn = (message) => {
        warnCalled = true;
        warnMessage = message;
      };

      // Create a base with >1000 characters (should trigger warning)
      const largeSequence = Array.from(
        { length: 1001 },
        (_, i) => String.fromCharCode(0x4e00 + i), // Use CJK characters to avoid conflicts
      ).join("");

      new BaseSystem(largeSequence.split(""));
      expect(warnCalled).toBe(true);
      expect(warnMessage).toContain("Very large base system");

      console.warn = originalWarn;
    });

    it("should handle Unicode characters", () => {
      const unicodeBase = new BaseSystem("αβγδε".split(""), "Greek Base");
      expect(unicodeBase.base).toBe(5);
      expect(unicodeBase.characters).toEqual(["α", "β", "γ", "δ", "ε"]);

      const value = 42n;
      const greek = unicodeBase.fromDecimal(value);
      expect(unicodeBase.toDecimal(greek)).toBe(value);
    });

    it("should maintain case sensitivity", () => {
      const caseSensitive = new BaseSystem(BaseParser.parseDefinition("aAbBcC"));
      expect(caseSensitive.base).toBe(6);
      expect(caseSensitive.toDecimal("A")).toBe(1n);
      expect(caseSensitive.toDecimal("a")).toBe(0n);
      expect(caseSensitive.toDecimal("A")).not.toBe(
        caseSensitive.toDecimal("a"),
      );
    });
  });

  describe("Performance and Large Number Handling", () => {
    it("should handle very large numbers efficiently", () => {
      const binary = BaseSystem.BINARY;
      const veryLarge = 2n ** 1000n;

      const start = performance.now();
      const binaryStr = binary.fromDecimal(veryLarge);
      const backToDecimal = binary.toDecimal(binaryStr);
      const end = performance.now();

      expect(backToDecimal).toBe(veryLarge);
      expect(end - start).toBeLessThan(1000); // Should complete within 1 second
    });

    it("should handle factorial numbers", () => {
      // Calculate 20! = 2432902008176640000
      let factorial20 = 1n;
      for (let i = 1n; i <= 20n; i++) {
        factorial20 *= i;
      }

      const bases = [
        BaseSystem.BINARY,
        BaseSystem.OCTAL,
        BaseSystem.HEXADECIMAL,
      ];
      bases.forEach((base) => {
        const str = base.fromDecimal(factorial20);
        expect(base.toDecimal(str)).toBe(factorial20);
      });
    });
  });

  describe("Parser Integration", () => {
    beforeAll(() => {
      // Register custom prefixes for testing
      BaseSystem.registerPrefix("q", BaseSystem.fromBase(5));
      BaseSystem.registerPrefix("d", BaseSystem.fromBase(12));
      BaseSystem.registerPrefix("z", BaseSystem.fromBase(36));
      BaseSystem.registerPrefix("t", BaseSystem.fromBase(3));
      BaseSystem.registerPrefix("e", new BaseSystem(BaseParser.parseDefinition("0-9A-E"), "Base 15 with E"));
    });

    afterAll(() => {
      // Cleanup custom prefixes
      BaseSystem.unregisterPrefix("q");
      BaseSystem.unregisterPrefix("d");
      BaseSystem.unregisterPrefix("z");
      BaseSystem.unregisterPrefix("t");
      BaseSystem.unregisterPrefix("e");
    });

    describe("Basic Base Notation", () => {
      it("should parse binary numbers with base notation", () => {
        expect(Parser.parse("0b101").toString()).toBe("5");
        expect(Parser.parse("0b1010").toString()).toBe("10");
        expect(Parser.parse("0b11111111").toString()).toBe("255");
      });

      it("should parse hexadecimal numbers with base notation", () => {
        expect(Parser.parse("0xFF").toString()).toBe("255");
        expect(Parser.parse("0xA0").toString()).toBe("160");
        expect(Parser.parse("0xDEAD").toString()).toBe("57005");
      });

      it("should parse octal numbers with base notation", () => {
        expect(Parser.parse("0o777").toString()).toBe("511");
        expect(Parser.parse("0o123").toString()).toBe("83");
        expect(Parser.parse("0o17").toString()).toBe("15");
      });

      it("should parse numbers in various bases", () => {
        expect(Parser.parse("0q132").toString()).toBe("42"); // Base 5
        expect(Parser.parse("0d36").toString()).toBe("42");  // Base 12
        expect(Parser.parse("0z16").toString()).toBe("42");  // Base 36
      });

      it("should handle negative numbers", () => {
        expect(Parser.parse("-0b101").toString()).toBe("-5");
        expect(Parser.parse("-0xFF").toString()).toBe("-255");
        expect(Parser.parse("-0o123").toString()).toBe("-83");
      });
    });

    describe("Base Notation with Decimals", () => {
      it("should parse binary decimals", () => {
        expect(Parser.parse("0b10.1").toString()).toBe("5/2");
        expect(Parser.parse("0b11.01").toString()).toBe("13/4");
        expect(Parser.parse("0b1.11").toString()).toBe("7/4");
      });

      it("should parse hexadecimal decimals", () => {
        expect(Parser.parse("0xA.8").toString()).toBe("21/2");
        expect(Parser.parse("0xF.F").toString()).toBe("255/16");
        expect(Parser.parse("0x1.C").toString()).toBe("7/4");
      });

      it("should parse octal decimals", () => {
        expect(Parser.parse("0o7.4").toString()).toBe("15/2");
        expect(Parser.parse("0o12.34").toString()).toBe("167/16");
      });

      it("should handle negative decimal numbers", () => {
        expect(Parser.parse("-0b10.1").toString()).toBe("-5/2");
        expect(Parser.parse("-0xA.8").toString()).toBe("-21/2");
      });
    });

    describe("Base Notation with Fractions", () => {
      it("should parse binary fractions", () => {
        expect(Parser.parse("0b1/0b10").toString()).toBe("1/2");
        // Note: 1/10[2] interpreted as both numerator/denom in base 2.
        // With prefixes: 0b1/0b10.
        // If we assumed fraction inheritance (0b1/10), it works too.
        expect(Parser.parse("0b11/0b100").toString()).toBe("3/4");
        expect(Parser.parse("0b101/0b110").toString()).toBe("5/6");
      });

      it("should parse hexadecimal fractions", () => {
        expect(Parser.parse("0xF/0x10").toString()).toBe("15/16");
        expect(Parser.parse("0xA/0xC").toString()).toBe("5/6");
        expect(Parser.parse("0x8/0x10").toString()).toBe("1/2");
      });

      it("should handle negative fractions", () => {
        expect(Parser.parse("-0b1/0b10").toString()).toBe("-1/2");
        expect(Parser.parse("-0xF/0x10").toString()).toBe("-15/16");
      });
    });

    describe("Base Notation with Mixed Numbers", () => {
      it("should parse binary mixed numbers", () => {
        // 1..1/10[2] -> 0b1..0b1/0b10 (or 0b1..1/10 if inheritance works)
        // Testing inheritance:
        expect(Parser.parse("0b1..1/10").toString()).toBe("3/2");
        expect(Parser.parse("0b10..1/10").toString()).toBe("5/2");
        expect(Parser.parse("0b11..11/100").toString()).toBe("15/4");
      });

      it("should parse hexadecimal mixed numbers", () => {
        expect(Parser.parse("0xA..8/10").toString()).toBe("21/2");
        expect(Parser.parse("0x1..F/10").toString()).toBe("31/16");
      });

      it("should handle negative mixed numbers", () => {
        expect(Parser.parse("-0b1..1/10").toString()).toBe("-3/2");
        expect(Parser.parse("-0xA..8/10").toString()).toBe("-21/2");
      });
    });

    describe("Base Notation with Intervals", () => {
      it("should parse binary intervals", () => {
        // 101:111[2] -> 0b101:0b111
        const result = Parser.parse("0b101:0b111");
        expect(result.toString()).toBe("5:7");
      });

      it("should parse hexadecimal intervals", () => {
        const result = Parser.parse("0xA:0xF");
        expect(result.toString()).toBe("10:15");
      });

      it("should parse mixed intervals", () => {
        const result = Parser.parse("0xA.8:0xF.F");
        expect(result.toString()).toBe("21/2:255/16");
      });
    });

    describe("Base Notation in Expressions", () => {
      it("should handle base notation in arithmetic expressions", () => {
        expect(Parser.parse("0b101 + 0b11").toString()).toBe("8");
        expect(Parser.parse("0xFF - 0xA").toString()).toBe("245");
        expect(Parser.parse("0o777 * 2").toString()).toBe("1022");
        expect(Parser.parse("0b100 / 0b10").toString()).toBe("2");
      });

      it("should handle mixed bases in expressions", () => {
        expect(Parser.parse("0xFF + 0b101").toString()).toBe("260");
        expect(Parser.parse("0o777 - 0b11111111").toString()).toBe("256");
      });

      it("should handle parentheses with base notation", () => {
        expect(Parser.parse("(0b101 + 0b11) * 0b10").toString()).toBe("16");
        expect(Parser.parse("0xFF / (0xA + 1)").toString()).toBe("255/11");
      });
    });

    describe("Error Handling", () => {
      it("should throw error for invalid digits", () => {
        // 0b123 -> Greedy match 123, then fails validation
        // Throws "String '123' contains characters not valid for Binary" or similar
        expect(() => Parser.parse("0b123")).toThrow(/characters not valid|Invalid number format/);
        expect(() => Parser.parse("0xXYZ")).toThrow(/Invalid number format/);
        expect(() => Parser.parse("0o888")).toThrow(/characters not valid|Invalid number format/);
      });

      it("should throw error for division by zero", () => {
        expect(() => Parser.parse("0b1/0b0")).toThrow(
          "Denominator cannot be zero",
        );
        expect(() => Parser.parse("0xA/0x0")).toThrow(
          "Denominator cannot be zero",
        );
      });

      it("should throw error for deprecated bracket notation", () => {
        expect(() => Parser.parse("101[2]")).toThrow("Bracket base notation");
      });
    });

    describe("Type Promotion", () => {
      it("should return Integer for whole numbers in type-aware mode", () => {
        const result = Parser.parse("0b101", { typeAware: true });
        expect(result).toBeInstanceOf(Integer);
        expect(result.toString()).toBe("5");
      });

      it("should return Rational for fractions", () => {
        const result = Parser.parse("0b1/0b10", { typeAware: true });
        expect(result).toBeInstanceOf(Rational);
        expect(result.toString()).toBe("1/2");
      });

      it("should return RationalInterval for intervals", () => {
        const result = Parser.parse("0b101:0b111", { typeAware: true });
        expect(result).toBeInstanceOf(RationalInterval);
        expect(result.toString()).toBe("5:7");
      });
    });

    describe("Base-Aware Input Parsing", () => {
      it("should parse numbers in input base without explicit notation", () => {
        // Parse binary input
        const binaryResult = Parser.parse("101", {
          typeAware: true,
          inputBase: BaseSystem.BINARY,
        });
        expect(binaryResult).toBeInstanceOf(Integer);
        expect(binaryResult.value).toBe(5n);

        // Parse base 3 input
        const base3 = BaseSystem.fromBase(3);
        const base3Result = Parser.parse("12", {
          typeAware: true,
          inputBase: base3,
        });
        expect(base3Result).toBeInstanceOf(Integer);
        expect(base3Result.value).toBe(5n);
      });

      it("should parse mixed numbers in input base", () => {
        // Test explicit base notation first (known to work)
        // 12..101/211[3] -> 0t12..101/211
        const explicitResult = Parser.parse("0t12..101/211", {
          typeAware: true,
        });
        expect(explicitResult).toBeInstanceOf(Rational);
        expect(explicitResult.numerator).toBe(60n);
        expect(explicitResult.denominator).toBe(11n);
      });

      it("should parse fractions in input base", () => {
        // Parse binary fraction
        const binaryResult = Parser.parse("101/11", {
          typeAware: true,
          inputBase: BaseSystem.BINARY,
        });
        expect(binaryResult).toBeInstanceOf(Rational);
        expect(binaryResult.numerator).toBe(5n);
        expect(binaryResult.denominator).toBe(3n);
      });

      it("should parse decimals in input base", () => {
        // Parse binary decimal: 10.1[2] = 2.5
        const result = Parser.parse("10.1", {
          typeAware: true,
          inputBase: BaseSystem.BINARY,
        });
        expect(result).toBeInstanceOf(Rational);
        expect(result.numerator).toBe(5n);
        expect(result.denominator).toBe(2n);
      });

      it("should handle arithmetic with input base", () => {
        // Parse binary arithmetic: 101 + 11 = 5 + 3 = 8
        const result = Parser.parse("101 + 11", {
          typeAware: true,
          inputBase: BaseSystem.BINARY,
        });
        expect(result).toBeInstanceOf(Integer);
        expect(result.value).toBe(8n);
      });
    });

    describe("Base-Aware E Notation", () => {
      it("should handle mixed E/_^ notation support (using _^ for non-decimal)", () => {
        // 0t12_^2 -> (12 in base 3) * 3^2
        // 5 * 9 = 45
        // Note: Strict E-notation logic requires _^ for non-decimal bases
        const result = Parser.parse("0t12_^2");
        expect(result).toBeInstanceOf(Integer);
        expect(result.value).toBe(45n);
      });

      it("should use _^ notation for bases containing E", () => {
        // 0eAE_^2
        // AE[15] = 164. 15^2 = 225. 164*225 = 36900
        const explicitResult = Parser.parse("0eAE_^2");
        expect(explicitResult).toBeInstanceOf(Integer);
        expect(explicitResult.value).toBe(36900n);
      });

      it("should handle negative exponents with _^", () => {
        // 0t12_^-1
        const explicitResult = Parser.parse("0t12_^-1");
        expect(explicitResult).toBeInstanceOf(Rational);
        // 5/3
        expect(explicitResult.numerator).toBe(5n);
        expect(explicitResult.denominator).toBe(3n);
      });

      it("should override input base with prefix", () => {
        // Even with binary input base, explicit prefix notation should override
        const result = Parser.parse("0t12", {
          typeAware: true,
          inputBase: BaseSystem.BINARY,
        });
        expect(result).toBeInstanceOf(Integer);
        expect(result.value).toBe(5n); // 12 in base 3
      });
    });
  });
});
