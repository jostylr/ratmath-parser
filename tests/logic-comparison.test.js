/**
 * Tests for comparison and logic operators
 */

import { describe, it, expect } from "bun:test";
import { Parser } from "../index.js";
import { Integer } from "@ratmath/core";

describe("Comparison Operators", () => {
    describe("Less Than (<)", () => {
        it("returns 1 when left is less than right", () => {
            const result = Parser.parse("3 < 5");
            expect(result).toBeInstanceOf(Integer);
            expect(result.value).toBe(1n);
        });

        it("returns 0 when left is not less than right", () => {
            const result = Parser.parse("5 < 3");
            expect(result).toBeInstanceOf(Integer);
            expect(result.value).toBe(0n);
        });

        it("returns 0 when equal", () => {
            const result = Parser.parse("5 < 5");
            expect(result).toBeInstanceOf(Integer);
            expect(result.value).toBe(0n);
        });

        it("works with rationals", () => {
            const result = Parser.parse("1/3 < 1/2");
            expect(result.value).toBe(1n);
        });
    });

    describe("Greater Than (>)", () => {
        it("returns 1 when left is greater than right", () => {
            const result = Parser.parse("5 > 3");
            expect(result).toBeInstanceOf(Integer);
            expect(result.value).toBe(1n);
        });

        it("returns 0 when left is not greater than right", () => {
            const result = Parser.parse("3 > 5");
            expect(result).toBeInstanceOf(Integer);
            expect(result.value).toBe(0n);
        });
    });

    describe("Less Than or Equal (<=)", () => {
        it("returns 1 when left is less than right", () => {
            const result = Parser.parse("3 <= 5");
            expect(result.value).toBe(1n);
        });

        it("returns 1 when equal", () => {
            const result = Parser.parse("5 <= 5");
            expect(result.value).toBe(1n);
        });

        it("returns 0 when left is greater", () => {
            const result = Parser.parse("6 <= 5");
            expect(result.value).toBe(0n);
        });
    });

    describe("Greater Than or Equal (>=)", () => {
        it("returns 1 when left is greater than right", () => {
            const result = Parser.parse("5 >= 3");
            expect(result.value).toBe(1n);
        });

        it("returns 1 when equal", () => {
            const result = Parser.parse("5 >= 5");
            expect(result.value).toBe(1n);
        });

        it("returns 0 when left is less", () => {
            const result = Parser.parse("4 >= 5");
            expect(result.value).toBe(0n);
        });
    });

    describe("Equality (==)", () => {
        it("returns 1 when equal integers", () => {
            const result = Parser.parse("5 == 5");
            expect(result.value).toBe(1n);
        });

        it("returns 0 when not equal", () => {
            const result = Parser.parse("5 == 6");
            expect(result.value).toBe(0n);
        });

        it("works with rationals", () => {
            const result = Parser.parse("1/2 == 2/4");
            expect(result.value).toBe(1n);
        });
    });

    describe("Inequality (!=)", () => {
        it("returns 1 when not equal", () => {
            const result = Parser.parse("5 != 6");
            expect(result.value).toBe(1n);
        });

        it("returns 0 when equal", () => {
            const result = Parser.parse("5 != 5");
            expect(result.value).toBe(0n);
        });
    });

    describe("Comparison with arithmetic", () => {
        it("evaluates arithmetic before comparison", () => {
            const result = Parser.parse("2 + 3 < 10");
            expect(result.value).toBe(1n); // 5 < 10
        });

        it("evaluates both sides before comparison", () => {
            const result = Parser.parse("2 * 3 > 1 + 4");
            expect(result.value).toBe(1n); // 6 > 5
        });
    });
});

describe("Logical Operators", () => {
    describe("Logical AND (&&)", () => {
        it("returns 1 when both sides are truthy", () => {
            const result = Parser.parse("1 && 1");
            expect(result.value).toBe(1n);
        });

        it("returns 0 when left side is falsy", () => {
            const result = Parser.parse("0 && 1");
            expect(result.value).toBe(0n);
        });

        it("returns 0 when right side is falsy", () => {
            const result = Parser.parse("1 && 0");
            expect(result.value).toBe(0n);
        });

        it("returns 0 when both sides are falsy", () => {
            const result = Parser.parse("0 && 0");
            expect(result.value).toBe(0n);
        });

        it("chains multiple ANDs", () => {
            const result = Parser.parse("1 && 1 && 1");
            expect(result.value).toBe(1n);
        });

        it("short-circuits on first false", () => {
            const result = Parser.parse("0 && 1 && 1");
            expect(result.value).toBe(0n);
        });
    });

    describe("Logical OR (||)", () => {
        it("returns 1 when both sides are truthy", () => {
            const result = Parser.parse("1 || 1");
            expect(result.value).toBe(1n);
        });

        it("returns 1 when left side is truthy", () => {
            const result = Parser.parse("1 || 0");
            expect(result.value).toBe(1n);
        });

        it("returns 1 when right side is truthy", () => {
            const result = Parser.parse("0 || 1");
            expect(result.value).toBe(1n);
        });

        it("returns 0 when both sides are falsy", () => {
            const result = Parser.parse("0 || 0");
            expect(result.value).toBe(0n);
        });

        it("chains multiple ORs", () => {
            const result = Parser.parse("0 || 0 || 1");
            expect(result.value).toBe(1n);
        });
    });

    describe("Precedence", () => {
        it("AND has higher precedence than OR", () => {
            // 1 || 0 && 0 should be 1 || (0 && 0) = 1 || 0 = 1
            const result = Parser.parse("1 || 0 && 0");
            expect(result.value).toBe(1n);
        });

        it("comparison has higher precedence than AND", () => {
            // 3 > 2 && 5 > 4 should be (3 > 2) && (5 > 4) = 1 && 1 = 1
            const result = Parser.parse("3 > 2 && 5 > 4");
            expect(result.value).toBe(1n);
        });

        it("comparison has higher precedence than OR", () => {
            // 3 < 2 || 5 > 4 should be (3 < 2) || (5 > 4) = 0 || 1 = 1
            const result = Parser.parse("3 < 2 || 5 > 4");
            expect(result.value).toBe(1n);
        });

        it("arithmetic has higher precedence than comparison", () => {
            // 2 + 3 > 4 should be (2 + 3) > 4 = 5 > 4 = 1
            const result = Parser.parse("2 + 3 > 4");
            expect(result.value).toBe(1n);
        });
    });

    describe("Complex expressions", () => {
        it("handles complex boolean expressions", () => {
            // (5 > 3) && (2 < 4) || (1 == 0)
            // = 1 && 1 || 0 = 1 || 0 = 1
            const result = Parser.parse("5 > 3 && 2 < 4 || 1 == 0");
            expect(result.value).toBe(1n);
        });

        it("handles negative comparisons", () => {
            const result = Parser.parse("-5 < 0");
            expect(result.value).toBe(1n);
        });

        it("handles rational comparisons with AND", () => {
            const result = Parser.parse("1/2 < 1 && 1/3 < 1/2");
            expect(result.value).toBe(1n);
        });
    });
});
