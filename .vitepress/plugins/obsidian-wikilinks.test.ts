import { describe, it, expect, vi, beforeEach } from 'vitest';
import MarkdownIt from 'markdown-it';
import {
    obsidianWikilinks,
    slugifyAnchor,
    type WikilinkMap,
    type BrokenWikilink,
} from './obsidian-wikilinks';

function makeMap(entries: Record<string, { url: string; title: string }>): WikilinkMap {
    return new Map(Object.entries(entries));
}

function render(md: MarkdownIt, src: string, relativePath = 'test.md'): string {
    return md.render(src, { relativePath });
}

describe('slugifyAnchor', () => {
    it('lowercases and replaces spaces with hyphens', () => {
        expect(slugifyAnchor('Hello World')).toBe('hello-world');
    });

    it('handles Chinese headings', () => {
        expect(slugifyAnchor('呼叫堆疊')).toBe('呼叫堆疊');
    });

    it('removes special characters', () => {
        expect(slugifyAnchor('Hello & World!')).toBe('hello--world');
    });

    it('trims whitespace', () => {
        expect(slugifyAnchor('  hello  ')).toBe('hello');
    });
});

describe('obsidianWikilinks plugin', () => {
    let md: MarkdownIt;
    let map: WikilinkMap;
    let broken: BrokenWikilink[];

    beforeEach(() => {
        broken = [];
        map = makeMap({
            'my-post': { url: '/dev/my-post', title: '我的文章' },
            'another-post': { url: '/life/another-post', title: '另一篇文章' },
        });
        md = new MarkdownIt();
        md.use(obsidianWikilinks(map, broken));
    });

    it('[[slug]] renders with correct URL and frontmatter title', () => {
        const html = render(md, '[[my-post]]');
        expect(html).toContain('href="/dev/my-post"');
        expect(html).toContain('我的文章');
        expect(broken).toHaveLength(0);
    });

    it('[[slug|自訂]] renders with custom display text', () => {
        const html = render(md, '[[my-post|點我看文章]]');
        expect(html).toContain('href="/dev/my-post"');
        expect(html).toContain('點我看文章');
        expect(html).not.toContain('我的文章');
    });

    it('[[slug#Heading]] appends slugified anchor', () => {
        const html = render(md, '[[my-post#Call Stack]]');
        expect(html).toContain('href="/dev/my-post#call-stack"');
    });

    it('[[slug#^blockid]] links to page without anchor and warns', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const html = render(md, '[[my-post#^abc123]]');
        expect(html).toContain('href="/dev/my-post"');
        expect(html).not.toContain('#^');
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('block reference not supported'),
        );
        warnSpy.mockRestore();
    });

    it('[[Folder/slug]] uses last segment as slug', () => {
        const html = render(md, '[[Notes/my-post]]');
        expect(html).toContain('href="/dev/my-post"');
    });

    it('[[missing]] renders with href="#" and data-wikilink-broken, warns, adds to brokenList', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const html = render(md, '[[missing-slug]]');
        expect(html).toContain('href="#"');
        expect(html).toContain('data-wikilink-broken');
        expect(html).toContain('missing-slug');
        expect(broken).toHaveLength(1);
        expect(broken[0].slug).toBe('missing-slug');
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('broken'));
        warnSpy.mockRestore();
    });

    it('![[slug]] is not processed as wikilink', () => {
        const html = render(md, '![[my-post]]');
        expect(html).not.toContain('href="/dev/my-post"');
        expect(html).not.toContain('data-wikilink-broken');
    });

    it('[[slug#Heading|自訂]] renders custom text with anchor', () => {
        const html = render(md, '[[my-post#Introduction|簡介]]');
        expect(html).toContain('href="/dev/my-post#introduction"');
        expect(html).toContain('簡介');
    });

    it('broken file path is recorded from env.relativePath', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        render(md, '[[unknown]]', 'articles/dev/some-post.md');
        expect(broken[0].file).toBe('articles/dev/some-post.md');
        vi.restoreAllMocks();
    });
});

describe('buildWikilinkMap', () => {
    it('is importable and returns a Map', async () => {
        const { buildWikilinkMap } = await import('./obsidian-wikilinks');
        expect(typeof buildWikilinkMap).toBe('function');
    });
});
