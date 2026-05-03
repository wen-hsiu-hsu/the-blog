import { globby } from 'globby';
import path from 'path';

/** 建立已發布文章的 slug set（排除 drafts/） */
export async function buildPublishedSlugs(articlesDir) {
    const files = await globby('**/*.md', {
        cwd: articlesDir,
        ignore: ['drafts/**', '**/index.md', 'page/**'],
    });
    return new Set(files.map((f) => path.basename(f, '.md')));
}

/** 建立草稿的 slug set */
export async function buildDraftSlugs(draftsDir) {
    const files = await globby('**/*.md', { cwd: draftsDir });
    return new Set(files.map((f) => path.basename(f, '.md')));
}

/**
 * 從內容中提取所有 wikilink slug。
 * 先移除 inline code（backtick）內容，避免誤判 `[[Scope]]` 等程式碼文字。
 */
export function extractWikilinks(content) {
    const stripped = content.replace(/`[^`]*`/g, '``');
    const regex = /(?<!!)\[\[([^\]|#]+?)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g;
    const slugs = [];
    for (const match of stripped.matchAll(regex)) {
        const rawSlug = match[1].trim();
        const slug = rawSlug.includes('/') ? rawSlug.split('/').pop() : rawSlug;
        if (slug) slugs.push(slug);
    }
    return slugs;
}
