import { describe, it, expect } from 'vitest';
import { buildPageHead } from './pageHead';
import { toPagePath, toPageUrl } from './pagePath';

const options = { hostname: 'https://hsiu.soy', siteDescription: '站台描述' };

describe('toPagePath', () => {
    it('root index.md returns /', () => {
        expect(toPagePath('index.md')).toBe('/');
    });

    it('section index.md keeps trailing slash like the sitemap', () => {
        expect(toPagePath('dev/index.md')).toBe('/dev/');
    });

    it('article drops .md (cleanUrls)', () => {
        expect(toPagePath('dev/series/01-intro.md')).toBe('/dev/series/01-intro');
    });

    it('does not treat a file ending with index.md as index', () => {
        expect(toPagePath('dev/reindex.md')).toBe('/dev/reindex');
    });

    it('resolved dynamic route', () => {
        expect(toPagePath('dev/page/2.md')).toBe('/dev/page/2');
    });
});

describe('toPageUrl', () => {
    it('joins hostname without double slash', () => {
        expect(toPageUrl('index.md', 'https://hsiu.soy/')).toBe('https://hsiu.soy/');
    });
});

describe('buildPageHead', () => {
    it('emits canonical and og:url with the same URL', () => {
        const { head } = buildPageHead(
            { relativePath: 'dev/index.md', title: 'Dev', description: '' },
            options,
        );
        expect(head).toEqual([
            ['link', { rel: 'canonical', href: 'https://hsiu.soy/dev/' }],
            ['meta', { property: 'og:url', content: 'https://hsiu.soy/dev/' }],
        ]);
    });

    it('keeps title and description on non-paginated pages', () => {
        const result = buildPageHead(
            { relativePath: 'dev/foo.md', title: '文章', description: '' },
            options,
        );
        expect(result.title).toBe('文章');
        expect(result.description).toBe('');
    });

    it('paginated page uses self canonical and adds page number', () => {
        const result = buildPageHead(
            {
                relativePath: 'dev/page/3.md',
                title: 'Dev',
                description: '前端筆記',
                params: { page: 3 },
            },
            options,
        );
        expect(result.title).toBe('Dev 第 3 頁');
        expect(result.description).toBe('前端筆記（第 3 頁）');
        expect(result.head[0]).toEqual([
            'link',
            { rel: 'canonical', href: 'https://hsiu.soy/dev/page/3' },
        ]);
    });

    it('paginated page falls back to site description', () => {
        const result = buildPageHead(
            { relativePath: 'page/2.md', title: '最新文章', description: '', params: { page: 2 } },
            options,
        );
        expect(result.description).toBe('站台描述（第 2 頁）');
    });

    it('404 has no URL tags', () => {
        const result = buildPageHead(
            { relativePath: '404.md', title: '404', description: '' },
            options,
        );
        expect(result.head).toEqual([]);
    });
});
