import { describe, it, expect } from 'vitest';
import { extractWikilinks } from './wikilink-utils.js';

describe('extractWikilinks', () => {
    it('detects normal wikilinks', () => {
        expect(extractWikilinks('See [[my-article]] for details.')).toEqual(['my-article']);
    });

    it('does NOT detect wikilinks inside inline code', () => {
        expect(extractWikilinks('JavaScript uses `[[Scope]]` internally.')).toEqual([]);
    });

    it('does NOT detect image embeds (![[...]])', () => {
        expect(extractWikilinks('![[some-image.png]]')).toEqual([]);
    });

    it('handles wikilinks with aliases', () => {
        expect(extractWikilinks('[[my-article|Custom Text]]')).toEqual(['my-article']);
    });

    it('handles wikilinks with headings', () => {
        expect(extractWikilinks('[[my-article#section]]')).toEqual(['my-article']);
    });

    it('handles path wikilinks (takes last segment)', () => {
        expect(extractWikilinks('[[series/my-article]]')).toEqual(['my-article']);
    });

    it('detects multiple wikilinks', () => {
        expect(extractWikilinks('[[foo]] and [[bar]]')).toEqual(['foo', 'bar']);
    });

    it('ignores wikilinks inside backtick code alongside real ones', () => {
        expect(extractWikilinks('`[[Scope]]` but also [[real-link]]')).toEqual(['real-link']);
    });

    it('returns empty array when no wikilinks', () => {
        expect(extractWikilinks('No links here.')).toEqual([]);
    });
});
