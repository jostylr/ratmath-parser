import { describe, it, expect } from "bun:test";
import { Parser } from "../src/index.js";
import { BaseSystem, Rational, Integer } from "@ratmath/core";

describe("Prefix Notation Parsing", () => {
    it("parses standard hex prefix 0x", () => {
        const result = Parser.parse("0x10");
        expect(result).toBeInstanceOf(Integer);
        expect(result.toString()).toBe("16");
    });

    it("parses standard binary prefix 0b", () => {
        const result = Parser.parse("0b10");
        expect(result).toBeInstanceOf(Integer);
        expect(result.toString()).toBe("2");
    });

    it("parses standard octal prefix 0o", () => {
        const result = Parser.parse("0o10");
        expect(result).toBeInstanceOf(Integer);
        expect(result.toString()).toBe("8");
    });

    it("parses hex fraction with inheritance (0xA/10)", () => {
        // 0xA = 10 (dec), 10 (hex) = 16 (dec). Result = 10/16 = 5/8
        const result = Parser.parse("0xA/10");
        expect(result).toBeInstanceOf(Rational);
        // rational.toDecimal() might return a number or string depending on implementation
        // safely convert to number for comparison or string
        expect(result.toDecimal().toString()).toBe("0.625");
    });

    it("parses fraction with mixed bases (0xA/0b10)", () => {
        // 0xA = 10 (dec), 0b10 = 2 (dec). Result = 10/2 = 5
        const result = Parser.parse("0xA/0b10");
        // Result might be Rational(5, 1) or Integer(5)
        // Check value regardless of type
        expect(result.toString()).toBe("5");
    });

    it("parses hex interval (0xA:0xF)", () => {
        const result = Parser.parse("0xA:0xF");
        expect(result.low.toString()).toBe("10");
        expect(result.high.toString()).toBe("15");
    });

    it("throws error for deprecated bracket notation", () => {
        expect(() => {
            Parser.parse("10[16]");
        }).toThrow("Bracket base notation");
    });

    it("supports custom registered prefixes", () => {
        // Register base 5 as 'q'
        const base5 = new BaseSystem("01234", "Base 5");
        BaseSystem.registerPrefix("q", base5);

        try {
            // 0q10 (base 5) -> 5
            const result = Parser.parse("0q10");
            expect(result.toString()).toBe("5");
        } finally {
            BaseSystem.unregisterPrefix("q");
        }
    });

    it("parses negative numbers with prefixes", () => {
        expect(Parser.parse("-0x10").toString()).toBe("-16");
        expect(Parser.parse("-0b101").toString()).toBe("-5");
    });
});
