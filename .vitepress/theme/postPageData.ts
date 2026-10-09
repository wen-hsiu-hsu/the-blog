import { initCategory, initTags } from './functions';
import { calcPagesTotal, type Post, type SeriesMap } from './serverUtils';

// 依頁面類型計算該頁需要的文章資料，於 config 的 transformPageData 注入 pageData。
// 文章列表不放進 themeConfig，避免每頁 HTML 都內嵌整份清單（見 docs/seo-diagnosis.md）。

// 只用來顯示連結（上下篇、推薦、側欄分類樹）
export type PostLink = {
    regularPath: string;
    frontMatter: {
        title: string;
        date: string;
        pin?: number;
    };
};

export type PostSummary = {
    regularPath: string;
    frontMatter: {
        title: string;
        date: string;
        pin?: number;
        category?: string;
        tags?: string[];
        series?: string;
        order?: number;
        chapter?: string;
    };
};

export type PostListItem = PostSummary & {
    frontMatter: PostSummary['frontMatter'] & { description?: string };
};

export type PostNav = {
    isSeries: boolean;
    prev: PostLink | null;
    next: PostLink | null;
};

export type ListSidebar = {
    postsTotal: number;
    tagsTotal: number;
    topTags: string[];
    // 只帶篇數；各分類的文章連結由 utils/sidebarCategories.data.ts 在第一次展開時載入
    categoryCounts: Record<string, number>;
};

export type CategoryLinks = Record<string, PostLink[]>;

export type ListMeta = {
    postsTotal: number;
    pagesTotal: number;
    pageCurrent: number;
};

export type PostPageData = {
    postNav?: PostNav;
    seriesPosts?: PostSummary[];
    suggestPosts?: PostLink[];
    listPosts?: PostListItem[];
    listMeta?: ListMeta;
    listSidebar?: ListSidebar;
    allPosts?: PostSummary[];
};

type BuildOptions = {
    posts: Post[];
    seriesMap: SeriesMap;
    pageSize: number;
    uncategorizedLabel: string;
    suggestPostLength: number;
};

type PageInfo = {
    relativePath: string;
    frontmatter: Record<string, any>;
    params?: Record<string, any>;
};

const LINK_KEYS = ['title', 'date', 'pin'] as const;
const SUMMARY_KEYS = [...LINK_KEYS, 'category', 'tags', 'series', 'order', 'chapter'] as const;

const SIDEBAR_TOP_TAGS = 9;

function pickFrontMatter(post: Post, keys: readonly string[]) {
    const frontMatter: Record<string, unknown> = {};
    for (const key of keys) {
        if (post.frontMatter[key] !== undefined) frontMatter[key] = post.frontMatter[key];
    }
    return { regularPath: post.regularPath, frontMatter };
}

export function toLink(post: Post): PostLink {
    return pickFrontMatter(post, LINK_KEYS) as PostLink;
}

export function toSummary(post: Post): PostSummary {
    return pickFrontMatter(post, SUMMARY_KEYS) as PostSummary;
}

export function toListItem(post: Post): PostListItem {
    const summary = toSummary(post);
    const { description } = post.frontMatter;
    return description === undefined
        ? summary
        : { ...summary, frontMatter: { ...summary.frontMatter, description } };
}

/**
 * 上一篇／下一篇。系列文章依 order 在系列內前後移動；
 * 一般文章依 posts 排序（新到舊），prev 是較舊的一篇、next 是較新的一篇。
 */
export function buildPostNav(posts: Post[], seriesMap: SeriesMap, path: string): PostNav | null {
    const post = posts.find((p) => p.regularPath === path);
    if (!post) return null;

    const series = post.frontMatter.series;
    if (series) {
        const seriesPosts = seriesMap[series] ?? [];
        const index = seriesPosts.findIndex((p) => p.regularPath === path);
        return {
            isSeries: true,
            prev: index > 0 ? toLink(seriesPosts[index - 1]) : null,
            next: index < seriesPosts.length - 1 ? toLink(seriesPosts[index + 1]) : null,
        };
    }

    const index = posts.indexOf(post);
    return {
        isSeries: false,
        prev: posts[index + 1] ? toLink(posts[index + 1]) : null,
        next: posts[index - 1] ? toLink(posts[index - 1]) : null,
    };
}

/**
 * 推薦文章：先取同分類，不足 limit 篇再用其他文章依序補滿。
 */
export function buildSuggestions(
    posts: Post[],
    path: string,
    category: string | undefined,
    uncategorizedLabel: string,
    limit: number,
): PostLink[] {
    const others = posts.filter((p) => p.regularPath !== path);
    const sameCategory = initCategory(others, uncategorizedLabel)[category || uncategorizedLabel];

    const result = (sameCategory ?? []).slice(0, limit);
    if (result.length < limit) {
        const rest = others.filter((p) => !result.includes(p));
        result.push(...rest.slice(0, limit - result.length));
    }
    return result.map(toLink);
}

export function buildListSidebar(posts: Post[], uncategorizedLabel: string): ListSidebar {
    const tagNames = Object.keys(initTags(posts));
    const categories = initCategory(posts, uncategorizedLabel);
    return {
        postsTotal: posts.length,
        tagsTotal: tagNames.length,
        topTags: tagNames.slice(0, SIDEBAR_TOP_TAGS),
        categoryCounts: Object.fromEntries(
            Object.entries(categories).map(([name, list]) => [name, list.length]),
        ),
    };
}

/**
 * 側欄分類樹各分類的文章連結。全部文章約 15 KB（brotli），放進每個列表頁的 page chunk
 * 會連 prefetch 一起重複下載，所以改由 data loader 產生、Page.vue 第一次展開時動態 import。
 */
export function buildCategoryLinks(posts: Post[], uncategorizedLabel: string): CategoryLinks {
    const categories = initCategory(posts, uncategorizedLabel);
    return Object.fromEntries(
        Object.entries(categories).map(([name, list]) => [name, list.map(toLink)]),
    );
}

/**
 * 依頁面類型回傳要合併進 pageData 的欄位：
 * - 文章頁（在 posts 清單內）：postNav、seriesPosts 或 suggestPosts
 * - 列表頁（frontmatter.home，使用 <BlogSection />）：listPosts、listMeta、listSidebar
 * - pages/ 底下的彙整頁（archives、tags、category）：allPosts
 */
export function buildPostPageData(page: PageInfo, options: BuildOptions): PostPageData {
    const { posts, seriesMap, pageSize, uncategorizedLabel, suggestPostLength } = options;
    const path = `/${page.relativePath.replace(/\.md$/, '')}`;

    const post = posts.find((p) => p.regularPath === path);
    if (post) {
        const series = post.frontMatter.series;
        return {
            postNav: buildPostNav(posts, seriesMap, path) ?? undefined,
            ...(series
                ? { seriesPosts: (seriesMap[series] ?? []).map(toSummary) }
                : {
                      suggestPosts: buildSuggestions(
                          posts,
                          path,
                          post.frontMatter.category,
                          uncategorizedLabel,
                          suggestPostLength,
                      ),
                  }),
        };
    }

    if (page.frontmatter.home) {
        const section = page.frontmatter.section;
        const sectionPosts = section
            ? posts.filter((p) => p.frontMatter.section === section)
            : posts;
        const pageCurrent = page.params?.page ? Number(page.params.page) : 1;
        const start = (pageCurrent - 1) * pageSize;
        return {
            listPosts: sectionPosts.slice(start, start + pageSize).map(toListItem),
            listMeta: {
                postsTotal: sectionPosts.length,
                pagesTotal: calcPagesTotal(sectionPosts.length, pageSize),
                pageCurrent,
            },
            listSidebar: buildListSidebar(posts, uncategorizedLabel),
        };
    }

    if (page.relativePath.startsWith('pages/')) {
        return { allPosts: posts.map(toSummary) };
    }

    return {};
}
