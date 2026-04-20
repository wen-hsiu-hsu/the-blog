import { globby } from 'globby';
import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';
import type MarkdownIt from 'markdown-it';

export type WikilinkEntry = { url: string; title: string };
export type WikilinkMap = Map<string, WikilinkEntry>;
export type BrokenWikilink = { slug: string; file: string };

/** Build 前掃描所有已發布文章（排除 drafts），建立 slug → { url, title } 對照表 */
export async function buildWikilinkMap(srcDir: string): Promise<WikilinkMap> {
    const files = await globby('**/*.md', {
        cwd: srcDir,
        ignore: ['drafts/**', 'page/**', '**/index.md'],
    });

    const map: WikilinkMap = new Map();

    for (const file of files) {
        const slug = path.basename(file, '.md');
        const raw = fs.readFileSync(path.join(srcDir, file), 'utf-8');
        const { data } = matter(raw);
        const url = '/' + file.replace(/\.md$/, '');
        const title = (data.title as string | undefined) ?? slug;
        map.set(slug, { url, title });
    }

    return map;
}

/**
 * 將 heading text 轉換為 VitePress anchor slug
 * VitePress 使用 markdown-it-anchor 的 default slugify（lowercase + 非 alnum 轉 `-`）
 */
export function slugifyAnchor(heading: string): string {
    return heading
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\p{L}\p{N}-]/gu, '');
}

/** markdown-it plugin */
export function obsidianWikilinks(wikilinkMap: WikilinkMap, brokenList?: BrokenWikilink[]) {
    return (md: MarkdownIt) => {
        md.inline.ruler.push('wikilink', (state, silent) => {
            const start = state.pos;
            const max = state.posMax;

            // 跳過 embed ![[...]]
            if (start > 0 && state.src.charCodeAt(start - 1) === 0x21) return false;

            if (state.src.charCodeAt(start) !== 0x5b || state.src.charCodeAt(start + 1) !== 0x5b)
                return false;

            let pos = start + 2;
            while (pos < max - 1) {
                if (state.src.charCodeAt(pos) === 0x5d && state.src.charCodeAt(pos + 1) === 0x5d)
                    break;
                pos++;
            }
            if (pos >= max - 1) return false;

            const content = state.src.slice(start + 2, pos);

            // 解析 [[slug#anchor|display]] 或 [[slug|display]]
            const pipeIdx = content.indexOf('|');
            const targetPart = (pipeIdx !== -1 ? content.slice(0, pipeIdx) : content).trim();
            const customText = pipeIdx !== -1 ? content.slice(pipeIdx + 1).trim() : null;

            // 分離 slug 與 anchor（#heading 或 #^blockid）
            const hashIdx = targetPart.indexOf('#');
            const rawSlug = hashIdx !== -1 ? targetPart.slice(0, hashIdx) : targetPart;
            const rawAnchor = hashIdx !== -1 ? targetPart.slice(hashIdx + 1) : null;

            // 支援 [[Folder/slug]] → 取最後一段
            const slug = rawSlug.includes('/') ? rawSlug.split('/').pop()! : rawSlug;

            if (!slug) return false;

            if (!silent) {
                const entry = wikilinkMap.get(slug);

                let href = '#';
                if (entry) {
                    href = entry.url;
                    if (rawAnchor) {
                        if (rawAnchor.startsWith('^')) {
                            // Block reference：降級，連結到頁面，不加 anchor
                            console.warn(
                                `[wikilink] block reference not supported: [[${targetPart}]] → linking to page only`,
                            );
                        } else {
                            href += '#' + slugifyAnchor(rawAnchor);
                        }
                    }
                } else {
                    console.warn(`[wikilink] ⚠ broken: [[${slug}]]`);
                    brokenList?.push({
                        slug,
                        file: (state.env as { relativePath?: string })?.relativePath ?? 'unknown',
                    });
                }

                const displayText = customText ?? entry?.title ?? slug;

                const tokenOpen = state.push('link_open', 'a', 1);
                tokenOpen.attrs = [
                    ['href', href],
                    ...(entry ? [] : [['data-wikilink-broken', ''] as [string, string]]),
                ];
                const tokenText = state.push('text', '', 0);
                tokenText.content = displayText;
                state.push('link_close', 'a', -1);
            }

            state.pos = pos + 2;
            return true;
        });
    };
}
