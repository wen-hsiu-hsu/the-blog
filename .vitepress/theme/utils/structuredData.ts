import { toPagePath, toPageUrl } from './pagePath';

// 每頁輸出一段 JSON-LD @graph：Person（作者）與 WebSite 每頁都有，文章再加 BlogPosting 與 BreadcrumbList。
// 節點之間用 @id 互相參照，作者資料只寫一份。

export type Author = {
    name: string;
    avatar?: string;
    sameAs?: string[];
};

export type NavSection = {
    text: string;
    link: string;
};

type PageInfo = {
    relativePath: string;
    title: string;
    description: string;
    isPost: boolean;
    datePublished: string;
    dateModified: string;
    category?: string;
    tags?: string[];
    // og-image 產圖成功時的圖片網址；沒有就不輸出 image
    image?: string;
};

type Options = {
    hostname: string;
    siteTitle: string;
    siteDescription: string;
    lang: string;
    author: Author;
    // 麵包屑的中間層，取自 nav 裡的站內連結（/dev/、/life/）
    sections: NavSection[];
};

export function buildStructuredData(page: PageInfo, options: Options) {
    const homeUrl = toPageUrl('index.md', options.hostname);
    const personId = `${homeUrl}#person`;
    const websiteId = `${homeUrl}#website`;

    const person = {
        '@type': 'Person',
        '@id': personId,
        name: options.author.name,
        url: homeUrl,
        ...(options.author.avatar && { image: new URL(options.author.avatar, homeUrl).href }),
        ...(options.author.sameAs?.length && { sameAs: options.author.sameAs }),
    };

    const website = {
        '@type': 'WebSite',
        '@id': websiteId,
        name: options.siteTitle,
        description: options.siteDescription,
        url: homeUrl,
        inLanguage: options.lang,
        publisher: { '@id': personId },
    };

    const graph: object[] = [person, website];

    if (page.isPost) {
        const pageUrl = toPageUrl(page.relativePath, options.hostname);
        graph.push({
            '@type': 'BlogPosting',
            '@id': `${pageUrl}#article`,
            mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
            headline: page.title,
            description: page.description,
            ...(page.image && { image: page.image }),
            datePublished: page.datePublished,
            dateModified: page.dateModified,
            author: { '@id': personId },
            publisher: { '@id': personId },
            isPartOf: { '@id': websiteId },
            inLanguage: options.lang,
            ...(page.category && { articleSection: page.category }),
            ...(page.tags?.length && { keywords: page.tags }),
        });

        const breadcrumb = buildBreadcrumb(page, options, homeUrl);
        breadcrumb && graph.push(breadcrumb);
    }

    return { '@context': 'https://schema.org', '@graph': graph };
}

// 首頁 › Dev › 文章。系列沒有自己的頁面（/dev/<系列>/ 是 404），
// 而 Google 要求最後一層以外都要有可索引的 item，所以不放系列這層。
function buildBreadcrumb(page: PageInfo, options: Options, homeUrl: string) {
    const pagePath = toPagePath(page.relativePath);
    const section = options.sections.find(({ link }) => link !== '/' && pagePath.startsWith(link));
    if (!section) return null;

    const items = [
        { name: options.siteTitle, item: homeUrl },
        { name: section.text, item: new URL(section.link, homeUrl).href },
        { name: page.title },
    ];

    return {
        '@type': 'BreadcrumbList',
        itemListElement: items.map((entry, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            ...entry,
        })),
    };
}
