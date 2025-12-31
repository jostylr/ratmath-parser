/**
 * BaseParser.js
 *
 * Handles parsing of base system definitions, including range notation.
 */

export class BaseParser {
    /**
     * Parses character sequence with range notation for Base System definitions.
     *
     * Supports formats like:
     * - "0-9" → ["0","1","2","3","4","5","6","7","8","9"]
     * - "a-z" → ["a","b","c",...,"z"]
     * - "0-9a-f" → ["0","1",...,"9","a","b",...,"f"]
     * - "01234567" → ["0","1","2","3","4","5","6","7"]
     *
     * @param {string} sequence - The character sequence string
     * @returns {string[]} Array of characters in order
     * @throws {Error} If the sequence format is invalid
     */
    static parseDefinition(sequence) {
        if (typeof sequence !== "string" || sequence.length === 0) {
            throw new Error("Character sequence must be a non-empty string");
        }

        const characters = [];
        let i = 0;

        while (i < sequence.length) {
            // Check for range notation (char-char)
            if (i + 2 < sequence.length && sequence[i + 1] === "-") {
                const startChar = sequence[i];
                const endChar = sequence[i + 2];

                // Validate range
                const startCode = startChar.charCodeAt(0);
                const endCode = endChar.charCodeAt(0);

                if (startCode > endCode) {
                    throw new Error(
                        `Invalid range: '${startChar}-${endChar}'. Start character must come before end character.`
                    );
                }

                // Add all characters in range
                for (let code = startCode; code <= endCode; code++) {
                    characters.push(String.fromCharCode(code));
                }

                i += 3; // Skip past the range
            } else {
                // Single character
                characters.push(sequence[i]);
                i++;
            }
        }

        // Validate no duplicates
        const uniqueChars = new Set(characters);
        if (uniqueChars.size !== characters.length) {
            throw new Error("Character sequence contains duplicate characters");
        }

        if (characters.length < 2) {
            throw new Error("Base system must have at least 2 characters");
        }

        return characters;
    }
}
