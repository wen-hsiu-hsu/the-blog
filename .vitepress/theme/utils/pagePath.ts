// 由 srcDir 底下的相對路徑（pageData.relativePath）推導頁面路徑。
// 規則對齊 VitePress 在 cleanUrls: true 時產生的 sitemap：
//   index.md → /、dev/index.md → /dev/、dev/foo.md → /dev/foo、dev/page/2.md → /dev/page/2
export function toPagePath(relativePath: string): string {
    const path = relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '');
    return `/${path}`;
}

export function toPageUrl(relativePath: string, hostname: string): string {
    return `${hostname.replace(/\/$/, '')}${toPagePath(relativePath)}`;
}

// OG 圖路徑：文章 dev/foo.md → /og/dev/foo.png；沒有專屬圖的頁面共用預設圖
export const OG_DEFAULT_IMAGE_PATH = '/og/default.png';

export function toOgImagePath(relativePath: string): string {
    return `/og${toPagePath(relativePath)}.png`;
}

export function isNotFoundPage(relativePath: string): boolean {
    return relativePath === '404.md';
}
