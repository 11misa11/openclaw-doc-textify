import { describe, expect, it } from 'vitest';
import { normalizeText } from '../../src/core/normalize.js';
describe('normalizeText', () => {
    it('compresses excessive blank lines', () => {
        const input = 'a\n\n\n\n b';
        expect(normalizeText(input)).toBe('a\n\n b');
    });
});
