import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { extractReadableContent } from '../../src/core/extract.js';
import { cleanArticleHtml } from '../../src/core/clean.js';
import { htmlToMarkdown } from '../../src/core/normalize.js';
describe('textify pipeline', () => {
    it('extracts readable content and removes noisy elements', () => {
        const fixturePath = path.join(process.cwd(), 'test', 'fixtures', 'sample.html');
        const html = readFileSync(fixturePath, 'utf8');
        const extracted = extractReadableContent(html);
        const cleaned = cleanArticleHtml(extracted.html);
        const markdown = htmlToMarkdown(cleaned);
        expect(extracted.title).toContain('Sample Doc');
        expect(markdown).toContain('# Hello');
        expect(markdown).toContain("console.log('hi')");
        expect(markdown).not.toContain('menu');
        expect(markdown).not.toContain('footer');
    });
});
