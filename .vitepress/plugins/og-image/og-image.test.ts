import { describe, it, expect } from 'vitest';
import { chunkChars } from './fonts';
import { stripEmoji, toOgCardText } from './template';
import { OG_DEFAULT_IMAGE_PATH, toOgImagePath } from '../../theme/utils/pagePath';

describe('toOgImagePath', () => {
    it('mirrors the page path under /og', () => {
        expect(toOgImagePath('dev/series/01-intro.md')).toBe('/og/dev/series/01-intro.png');
    });

    it('default image lives under /og too', () => {
        expect(OG_DEFAULT_IMAGE_PATH).toBe('/og/default.png');
    });
});

describe('stripEmoji', () => {
    it('removes emoji and collapses spaces', () => {
        expect(stripEmoji('🚀 部署 ✨ 筆記 👨‍💻')).toBe('部署 筆記');
    });

    it('keeps CJK punctuation and backticks', () => {
        expect(stripEmoji('`Object.prototype`：原型鏈的頂端')).toBe(
            '`Object.prototype`：原型鏈的頂端',
        );
    });
});

describe('toOgCardText', () => {
    it('prefers seriesTitle over category for the badge', () => {
        expect(toOgCardText({ title: 'A', seriesTitle: 'Series', category: 'Cat' }).badge).toBe(
            'Series',
        );
    });

    it('falls back to category, then empty', () => {
        expect(toOgCardText({ title: 'A', category: 'Cat' }).badge).toBe('Cat');
        expect(toOgCardText({ title: 'A' }).badge).toBe('');
    });
});

describe('chunkChars', () => {
    it('dedupes, drops whitespace and sorts so chunks are stable', () => {
        expect(chunkChars('ba a\nc', 2)).toEqual(['ab', 'c']);
        expect(chunkChars('c a b', 2)).toEqual(chunkChars('b c a', 2));
    });

    it('splits by code point, not UTF-16 unit', () => {
        expect(chunkChars('𠮷野家', 2)).toEqual(['家野', '𠮷']);
    });
});
