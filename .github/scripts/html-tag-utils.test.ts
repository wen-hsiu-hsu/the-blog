import { describe, it, expect } from 'vitest';
import { findInvalidHtmlTags } from './html-tag-utils.js';

describe('findInvalidHtmlTags', () => {
    it('detects generics inside <summary> (backticks do not work in raw HTML)', () => {
        const md = [
            '<details>',
            '<summary>給定函式 `makeTuple<T, U>(a: T, b: U): [T, U]`，用到了幾個型別參數？</summary>',
            '兩個型別參數',
            '</details>',
        ].join('\n');
        expect(findInvalidHtmlTags(md)).toEqual([{ line: 2, tag: '<T,' }]);
    });

    it('detects generics on an answer line inside <details>', () => {
        const md = [
            '# Title',
            '',
            '<details>',
            '<summary>問題</summary>',
            '`Promise<Type>`',
            '</details>',
        ].join('\n');
        expect(findInvalidHtmlTags(md)).toEqual([{ line: 5, tag: '<Type' }]);
    });

    it('detects bare generics in a paragraph (parsed as inline HTML)', () => {
        expect(findInvalidHtmlTags('第一行\n回傳 Array<string> 型別')).toEqual([
            { line: 2, tag: '<string' },
        ]);
    });

    it('accepts escaped generics wrapped in <code>', () => {
        const md = [
            '<details>',
            '<summary>給定函式 <code>makeTuple&lt;T, U&gt;(a: T, b: U)</code>？</summary>',
            '<code>Promise&lt;Type&gt;</code>',
            '</details>',
        ].join('\n');
        expect(findInvalidHtmlTags(md)).toEqual([]);
    });

    it('ignores generics in inline code and fenced code blocks', () => {
        const md = ['回傳 `Promise<Type>`', '', '```ts', 'function f<T>(a: T): T {}', '```'].join(
            '\n',
        );
        expect(findInvalidHtmlTags(md)).toEqual([]);
    });

    it('ignores `<` followed by whitespace', () => {
        expect(findInvalidHtmlTags('<summary>`1 < 2 < 3` 的結果？</summary>')).toEqual([]);
    });

    it('accepts built-in and registered components', () => {
        const md = '<ClientOnly>\n<BaseGithubGistIframe src="x" />\n</ClientOnly>';
        expect(findInvalidHtmlTags(md)).toEqual([{ line: 2, tag: '<BaseGithubGistIframe' }]);
        expect(findInvalidHtmlTags(md, ['BaseGithubGistIframe'])).toEqual([]);
    });
});
