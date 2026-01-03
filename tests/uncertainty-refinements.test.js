import { describe, expect, it } from "bun:test";
import { Parser } from "../src/index.js";
import { Rational, BaseSystem } from "@ratmath/core";

describe("Uncertainty Refinements", () => {
    describe("generalized E replacement (_^)", () => {
        it("supports _^ relative", () => {
            // 1.2[+3]_^1 should be 1.2:1.23 * 10 = 12:12.3 
            const result = Parser.parse("1.2[+3]_^1");
            expect(result.low.equals(new Rational("12"))).toBe(true);
            expect(result.high.equals(new Rational("12.3"))).toBe(true);
        });

        it("supports _^ absolute", () => {
            // 1.2[1:3]_^1 should be 1.21:1.23 * 10 = 12.1:12.3 
            const result = Parser.parse("1.2[1:3]_^1");
            expect(result.low.equals(new Rational("12.1"))).toBe(true);
            expect(result.high.equals(new Rational("12.3"))).toBe(true);
        });

        it("supports _^ in hex base relative", () => {
            // Hex base 1.a (1.625)
            // 1.a[+b]_^1 becomes 1.a:1.ab * 0x10 = 1a:1a.b (26:26.6875)
            const result = Parser.parse("1.a[+b]_^1", { inputBase: BaseSystem.HEXADECIMAL });
            expect(result.low.equals(new Rational("26"))).toBe(true);
            expect(result.high.equals(new Rational(427n, 16n))).toBe(true);
        });

        it("supports _^ in hex base absolute", () => {
            // Hex base 1.a (1.625)
            // 1.a[3:b]_^c becomes 1.a3:1.ab * 0x10^c = (base 10) 460695372038144:469491465060352
            const result = Parser.parse("1.a[3:b]_^c", { inputBase: BaseSystem.HEXADECIMAL });
            expect(result.low.equals(new Rational(460695372038144n))).toBe(true);
            expect(result.high.equals(new Rational(469491465060352n))).toBe(true);
        });

        it("supports _^ in relative notation (internal)", () => {
            // 1.2[+3_^2] -> relative offset is 300, scaled by 10^-2 is 3.
            // 1.2 + 3 = 4.2.
            const resultDec = Parser.parse("1.2[+3_^2]");
            expect(resultDec.high.equals(new Rational("4.2"))).toBe(true);

            // Hex base 1.a (1.625). offset b_^c = 11*16^12. 
            // Scaled by 16^-2 = 12,094,627,905,536.
            // 1.a*16^0 scaled? No, base value is 1.625.
            // 1.625 + 12094627905536 = 12094627905537.625
            const result = Parser.parse("1.a[+b_^c]", { inputBase: BaseSystem.HEXADECIMAL });
            // high = 1.625 + 11*16^12 / 256
            const expectedHigh = new Rational(13n, 8n).add(new Rational(11n * (16n ** 12n), 256n));
            expect(result.high.equals(expectedHigh)).toBe(true);
        });

    });

    describe("in bases with e and E those values should work in the notation", () => {
        it("checking e and E work in HEX", () => {
            const resultCheck = Parser.parse("1.eE[e:E]", { inputBase: BaseSystem.HEXADECIMAL });
            const resultTarget = Parser.parse("1.eee:1.eee", { inputBase: BaseSystem.HEXADECIMAL });

            const lowCheck = resultCheck.low || resultCheck;
            const highCheck = resultCheck.high || resultCheck;
            const lowTarget = resultTarget.low || resultTarget;
            const highTarget = resultTarget.high || resultTarget;

            expect(lowCheck.equals(lowTarget)).toBe(true);
            expect(highCheck.equals(highTarget)).toBe(true);
        });
    });

    describe("case sensitivity in digit appending", () => {
        it("accepts capital letters in hex digit appending", () => {
            // 1.a[A:B] in hex
            const result = Parser.parse("1.a[A:B]", { inputBase: BaseSystem.HEXADECIMAL });
            // 1.aa = 1 + 10/16 + 10/256 = (256 + 160 + 10)/256 = 426/256
            // 1.ab = 1 + 10/16 + 11/256 = (256 + 160 + 11)/256 = 427/256
            expect(result.low.equals(new Rational(426n, 256n))).toBe(true);
            expect(result.high.equals(new Rational(427n, 256n))).toBe(true);
        });
    });

    describe("reject E notation with uncertainty", () => {
        it("rejects E notation inside center value for digit appending", () => {
            // There should be a test for that and it is failing; it is under "rejects E notation inside center value"
            expect(() => Parser.parse("1.23E2[56,67]")).toThrow();
        });

        it("rejects E notation for relative notation", () => {
            // 1.2E4[+4:-5] should also throw an error as it is confusing.
            expect(() => Parser.parse("1.2E4[+4:-5]")).toThrow();
        });

        it("rejects _^ notation with uncertainty", () => {
            expect(() => Parser.parse("1.2_^4[+4:-5]")).toThrow();
        });
    });
});
