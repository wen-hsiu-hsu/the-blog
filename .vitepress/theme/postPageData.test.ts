import { describe, it, expect } from 'vitest';
import {
    buildCategoryLinks,
    buildListSidebar,
    buildPostNav,
    buildPostPageData,
    buildSuggestions,
    toLink,
    toListItem,
    toSummary,
} from './postPageData';
import type { Post, SeriesMap } from './serverUtils';

const UNCATEGORIZED = '未分類';

function post(regularPath: string, frontMatter: Record<string, any>): Post {
    return { regularPath, frontMatter: { title: regularPath, ...frontMatter } };
}

// 已依新到舊排序，與 getPosts() 的輸出一致
const posts: Post[] = [
    post('/dev/e', { date: '2025-05-01', section: 'dev', category: 'A', tags: ['x', 'y'] }),
    post('/life/d', { date: '2025-04-01', section: 'life', category: 'B', tags: ['x'] }),
    post('/dev/s2', { date: '2025-03-01', section: 'dev', category: 'S', series: 's', order: 2 }),
    post('/dev/s1', { date: '2025-02-01', section: 'dev', category: 'S', series: 's', order: 1 }),
    post('/dev/a', { date: '2025-01-01', section: 'dev', category: 'A', description: '<b>hi</b>' }),
];

const seriesMap: SeriesMap = { s: [posts[3], posts[2]] };

const options = {
    posts,
    seriesMap,
    pageSize: 2,
    uncategorizedLabel: UNCATEGORIZED,
    suggestPostLength: 2,
};

describe('toSummary / toListItem', () => {
    it('keeps only summary fields', () => {
        const summary = toSummary(posts[4]);
        expect(summary.regularPath).toBe('/dev/a');
        expect(summary.frontMatter).toEqual({ title: '/dev/a', date: '2025-01-01', category: 'A' });
    });

    it('link keeps only title, date and pin', () => {
        expect(toLink(posts[0]).frontMatter).toEqual({ title: '/dev/e', date: '2025-05-01' });
    });

    it('list item adds description', () => {
        expect(toListItem(posts[4]).frontMatter.description).toBe('<b>hi</b>');
        expect(toListItem(posts[0]).frontMatter).not.toHaveProperty('description');
    });
});

describe('buildPostNav', () => {
    it('regular post: prev is older, next is newer', () => {
        const nav = buildPostNav(posts, seriesMap, '/life/d')!;
        expect(nav.isSeries).toBe(false);
        expect(nav.prev?.regularPath).toBe('/dev/s2');
        expect(nav.next?.regularPath).toBe('/dev/e');
    });

    it('newest and oldest posts have no next / prev', () => {
        expect(buildPostNav(posts, seriesMap, '/dev/e')!.next).toBeNull();
        expect(buildPostNav(posts, seriesMap, '/dev/a')!.prev).toBeNull();
    });

    it('series post navigates by order within the series', () => {
        const first = buildPostNav(posts, seriesMap, '/dev/s1')!;
        expect(first.isSeries).toBe(true);
        expect(first.prev).toBeNull();
        expect(first.next?.regularPath).toBe('/dev/s2');

        const last = buildPostNav(posts, seriesMap, '/dev/s2')!;
        expect(last.prev?.regularPath).toBe('/dev/s1');
        expect(last.next).toBeNull();
    });

    it('unknown path → null', () => {
        expect(buildPostNav(posts, seriesMap, '/dev/missing')).toBeNull();
    });
});

describe('buildSuggestions', () => {
    it('same category first, excluding current post', () => {
        const result = buildSuggestions(posts, '/dev/a', 'A', UNCATEGORIZED, 1);
        expect(result.map((p) => p.regularPath)).toEqual(['/dev/e']);
    });

    it('fills with other posts in order when category is short', () => {
        const result = buildSuggestions(posts, '/dev/a', 'A', UNCATEGORIZED, 3);
        expect(result.map((p) => p.regularPath)).toEqual(['/dev/e', '/life/d', '/dev/s2']);
    });

    it('missing category falls back to uncategorized label', () => {
        const result = buildSuggestions(posts, '/dev/x', undefined, UNCATEGORIZED, 2);
        expect(result.map((p) => p.regularPath)).toEqual(['/dev/e', '/life/d']);
    });
});

describe('buildListSidebar', () => {
    it('counts posts and tags, groups categories', () => {
        const sidebar = buildListSidebar(posts, UNCATEGORIZED);
        expect(sidebar.postsTotal).toBe(5);
        expect(sidebar.tagsTotal).toBe(2);
        expect(sidebar.topTags).toEqual(['x', 'y']);
        expect(sidebar.categoryCounts).toEqual({ A: 2, B: 1, S: 2 });
        expect(Object.keys(sidebar.categoryCounts)).toEqual(['A', 'B', 'S']);
    });
});

describe('buildCategoryLinks', () => {
    it('groups slim post links by category, in the same order as categoryCounts', () => {
        const links = buildCategoryLinks(posts, UNCATEGORIZED);
        expect(Object.keys(links)).toEqual(['A', 'B', 'S']);
        expect(links.A.map((p) => p.regularPath)).toEqual(['/dev/e', '/dev/a']);
        expect(links.A[0].frontMatter).not.toHaveProperty('tags');
    });
});

describe('buildPostPageData', () => {
    it('regular article page gets postNav and suggestPosts', () => {
        const data = buildPostPageData({ relativePath: 'dev/a.md', frontmatter: {} }, options);
        expect(data.postNav?.isSeries).toBe(false);
        expect(data.suggestPosts).toHaveLength(2);
        expect(data.seriesPosts).toBeUndefined();
    });

    it('series article page gets seriesPosts instead of suggestPosts', () => {
        const data = buildPostPageData({ relativePath: 'dev/s1.md', frontmatter: {} }, options);
        expect(data.seriesPosts?.map((p) => p.regularPath)).toEqual(['/dev/s1', '/dev/s2']);
        expect(data.suggestPosts).toBeUndefined();
    });

    it('home page 1 lists first page of all posts', () => {
        const data = buildPostPageData(
            { relativePath: 'index.md', frontmatter: { home: true } },
            options,
        );
        expect(data.listPosts?.map((p) => p.regularPath)).toEqual(['/dev/e', '/life/d']);
        expect(data.listMeta).toEqual({ postsTotal: 5, pagesTotal: 3, pageCurrent: 1 });
        expect(data.listSidebar?.postsTotal).toBe(5);
    });

    it('section pagination page lists that page of the section', () => {
        const data = buildPostPageData(
            {
                relativePath: 'dev/page/2.md',
                frontmatter: { home: true, section: 'dev' },
                params: { page: 2 },
            },
            options,
        );
        expect(data.listPosts?.map((p) => p.regularPath)).toEqual(['/dev/s1', '/dev/a']);
        expect(data.listMeta).toEqual({ postsTotal: 4, pagesTotal: 2, pageCurrent: 2 });
        // 側欄統計永遠是全站
        expect(data.listSidebar?.postsTotal).toBe(5);
    });

    it('pages/ aggregate pages get allPosts summaries', () => {
        const data = buildPostPageData(
            { relativePath: 'pages/tags.md', frontmatter: { page: true } },
            options,
        );
        expect(data.allPosts).toHaveLength(5);
        expect(data.allPosts?.[4].frontMatter).not.toHaveProperty('description');
    });

    it('other pages get nothing', () => {
        expect(
            buildPostPageData({ relativePath: 'drafts/x.md', frontmatter: {} }, options),
        ).toEqual({});
    });
});
