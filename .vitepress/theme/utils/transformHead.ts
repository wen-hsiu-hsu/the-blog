import { HeadConfig, TransformContext } from 'vitepress';
import { format, formatISO } from 'date-fns';
import { isNotFoundPage, toPageUrl } from './pagePath';

export default async function transformHead(context: TransformContext) {
    const { pageData, siteConfig, siteData } = context;
    const head: HeadConfig[] = [];
    const themeConfig = siteConfig.userConfig.themeConfig;

    if (isNotFoundPage(pageData.relativePath)) return [];

    const isPost = !pageData.frontmatter.page;

    // pageData.title／description 已在 transformPageData 加上分頁頁碼（見 pageHead.ts）
    const title = pageData.title;
    const description = pageData.description || siteData.description;

    const datePublishedTime = new Date(pageData.frontmatter.date ?? Date.now());
    const dateLastUpdated = new Date(pageData.lastUpdated ?? Date.now());

    const publishedTime = formatISO(datePublishedTime);
    const lastUpdated = formatISO(dateLastUpdated);

    // canonical 與 og:url 由 transformPageData 輸出（見 pageHead.ts），這裡只用於結構化資料
    const siteUrl = toPageUrl(pageData.relativePath, themeConfig.website);
    const authorName = themeConfig.author.name ?? '';
    const category = pageData.frontmatter.category ?? '';
    const tags: string[] = pageData.frontmatter.tags ?? [];

    // Open Graph =================
    head.push(['meta', { property: 'og:title', content: title }]);
    head.push(['meta', { property: 'og:description', content: description }]);
    head.push(['meta', { property: 'og:site_name', content: siteData.title }]);
    head.push(['meta', { property: 'og:locale', content: 'zh_TW' }]);

    if (isPost) {
        head.push(['meta', { property: 'og:type', content: 'article' }]);
        authorName && head.push(['meta', { property: 'article:author', content: authorName }]);
        publishedTime &&
            head.push(['meta', { property: 'article:published_time', content: publishedTime }]);
        lastUpdated &&
            head.push(['meta', { property: 'article:modified_time', content: lastUpdated }]);
        category && head.push(['meta', { property: 'article:section', content: category }]);

        if (tags.length > 0) {
            tags.forEach((tag) => {
                head.push(['meta', { property: 'article:tag', content: tag }]);
            });
        }
    } else {
        head.push(['meta', { property: 'og:type', content: 'website' }]);
    }
    // Open Graph end =================

    // Structured Data =================
    if (isPost) {
        head.push([
            'script',
            { type: 'application/ld+json' },
            JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Article',
                mainEntityOfPage: {
                    '@type': 'WebPage',
                    '@id': siteUrl,
                },
                author: {
                    '@type': 'Person',
                    name: authorName,
                },
                headline: title,
                // image: 'https://',
                datePublished: format(datePublishedTime, 'yyyy-MM-dd'),
                dateModified: format(dateLastUpdated, 'yyyy-MM-dd'),
            }),
        ]);
    } else {
        head.push([
            'script',
            { type: 'application/ld+json' },
            JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                url: siteUrl,
            }),
        ]);
    }
    // TODO person
    // {
    //     "@context": "http://schema.org/",
    //     "@type": "Person",
    //     "name": "name",
    //     "image": "photo url",
    //     "url": "website url",
    //     "jobTitle": "job title"
    // }
    // Structured Data end =================

    return head;
}
