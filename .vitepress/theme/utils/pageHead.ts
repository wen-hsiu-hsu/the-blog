import type { HeadConfig } from 'vitepress';
import { isNotFoundPage, toPageUrl } from './pagePath';

// 於 config 的 transformPageData 補上每頁的 title／description 與 URL 類 head 標籤。
// 放在 frontmatter.head（而非 transformHead）是 VitePress 官方加 canonical 的做法，
// 而且 client 端換頁時會一起更新；transformHead 的輸出只存在 SSR 產出的 HTML。

type PageInfo = {
    relativePath: string;
    title: string;
    description: string;
    params?: Record<string, any> | null;
};

type Options = {
    hostname: string;
    siteDescription: string;
};

export type PageHead = {
    title: string;
    description: string;
    head: HeadConfig[];
};

export function buildPageHead(page: PageInfo, options: Options): PageHead {
    const { title, relativePath } = page;
    const description = page.description || options.siteDescription;

    if (isNotFoundPage(relativePath)) {
        return { title, description: page.description, head: [] };
    }

    const url = toPageUrl(relativePath, options.hostname);
    const head: HeadConfig[] = [
        ['link', { rel: 'canonical', href: url }],
        ['meta', { property: 'og:url', content: url }],
    ];

    // 分頁（dev/page/[page].md 等動態路由）：每頁使用自我 canonical，title／description 加頁碼避免重複
    const pageNumber = Number(page.params?.page);
    if (pageNumber > 1) {
        return {
            title: `${title} 第 ${pageNumber} 頁`,
            description: `${description}（第 ${pageNumber} 頁）`,
            head,
        };
    }

    return { title, description: page.description, head };
}
