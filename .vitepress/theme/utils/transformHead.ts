import { HeadConfig, TransformContext } from 'vitepress';
import { formatISO } from 'date-fns';
import { isNotFoundPage } from './pagePath';
import { buildStructuredData } from './structuredData';

// image：og-image 產圖成功時的圖片網址，放進 BlogPosting.image
export default async function transformHead(
    context: TransformContext,
    options: { image?: string } = {},
) {
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
    head.push([
        'script',
        { type: 'application/ld+json' },
        // < 轉成 \u003c，避免內容裡的 </script> 提前結束標籤
        JSON.stringify(
            buildStructuredData(
                {
                    relativePath: pageData.relativePath,
                    title,
                    description,
                    isPost,
                    datePublished: publishedTime,
                    dateModified: lastUpdated,
                    category,
                    tags,
                    image: options.image,
                },
                {
                    hostname: themeConfig.website,
                    siteTitle: siteData.title,
                    siteDescription: siteData.description,
                    lang: siteData.lang,
                    author: themeConfig.author,
                    sections: themeConfig.nav.filter(({ link }) => link.startsWith('/')),
                },
            ),
        ).replace(/</g, '\\u003c'),
    ]);
    // Structured Data end =================

    return head;
}
