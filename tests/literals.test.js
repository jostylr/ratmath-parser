
import { describe, it, expect } from 'bun:test';
import { Parser } from '../src/index.js';

describe('Parser Literals', () => {

    it('should parse simple string literals', () => {
        const result = Parser.parse('"Hello World"');
        expect(result).toBe("Hello World");
    });

    it('should parse empty string', () => {
        const result = Parser.parse('""');
        expect(result).toBe("");
    });

    it('should handle escape sequences', () => {
        expect(Parser.parse('"He said \\"Hi\\""')).toBe('He said "Hi"');
        expect(Parser.parse('"Backslash \\\\"')).toBe('Backslash \\');
    });

    it('should parse list literals', () => {
        const result = Parser.parse('[1, 2, 3]');
        expect(result.type).toBe('sequence');
        expect(result.values.length).toBe(3);
        expect(result.values[0].toString()).toBe('1');
    });

    it('should parse nested lists', () => {
        const result = Parser.parse('[1, [2, 3], 4]');
        expect(result.type).toBe('sequence');
        expect(result.values[1].type).toBe('sequence');
        expect(result.values[1].values.length).toBe(2);
    });

    it('should parse lists with expressions', () => {
        // [1+1, 3*2]
        const result = Parser.parse('[1+1, 3*2]');
        expect(result.values[0].toString()).toBe('2');
        expect(result.values[1].toString()).toBe('6');
    });

    it('should parse empty list', () => {
        const result = Parser.parse('[]');
        expect(result.type).toBe('sequence');
        expect(result.values.length).toBe(0);
    });

    it('should handle strings in lists', () => {
        const result = Parser.parse('["a", "b"]');
        expect(result.values[0]).toBe('a');
        expect(result.values[1]).toBe('b');
    });

    it('should throw on unterminated string', () => {
        expect(() => Parser.parse('"Hello')).toThrow("Unterminated string literal");
    });

    it('should throw on unterminated list', () => {
        expect(() => Parser.parse('[1, 2')).toThrow("Unterminated list literal");
    });

});
