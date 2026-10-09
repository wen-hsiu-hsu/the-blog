import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import type { HeadConfig, TransformContext } from 'vitepress';
import type { Post } from '../../theme/serverUtils';
import {
    isNotFoundPage,
    OG_DEFAULT_IMAGE_PATH,
    toOgImagePath,
    toPagePath,
} from '../../theme/utils/pagePath';
import { loadOgFonts, type OgFonts } from './fonts';
import {
    articleCard,
    DEFAULT_CARD_ALT,
    defaultCard,
    FIXED_TEXT,
    OG_HEIGHT,
    OG_WIDTH,
    TEMPLATE_VERSION,
    toOgCardText,
    type OgCardText,
} from './template';

// build 時替每篇文章產生 OG 圖，其他頁面共用預設圖，並回傳 og:image 相關 head 標籤。
// 在 transformHead 裡產圖（只在 build 執行），產圖失敗時該頁就不輸出 og:image，
// 不會指向不存在的檔案，也不會讓 build 失敗。

type Options = {
    posts: Post[];
    hostname: string;
    /** 頭像的本機路徑 */
    avatarPath: string;
    /** 字型與圖片快取，放在 VitePress cacheDir 底下 */
    cacheDir: string;
};

type Renderer = {
    fonts: OgFonts;
    avatarSrc: string;
    keySalt: string;
    toPng: (tree: unknown) => Promise<Buffer>;
};

// VitePress 會同時 render 很多頁；限制同時產圖的數量，避免記憶體暴增
const CONCURRENCY = 4;

function createLimit(max: number) {
    let active = 0;
    const queue: (() => void)[] = [];
    return async function limit<T>(task: () => Promise<T>): Promise<T> {
        if (active >= max) await new Promise<void>((resolve) => queue.push(resolve));
        active++;
        try {
            return await task();
        } finally {
            active--;
            queue.shift()?.();
        }
    };
}

export function createOgImageHead({ posts, hostname, avatarPath, cacheDir }: Options) {
    const cards = new Map<string, OgCardText>(
        posts.map((post) => [post.regularPath, toOgCardText(post.frontMatter)]),
    );
    const limit = createLimit(CONCURRENCY);
    let renderer: Promise<Renderer | null> | undefined;
    let defaultImage: Promise<void> | undefined;

    async function setup(): Promise<Renderer | null> {
        try {
            const allText =
                FIXED_TEXT + [...cards.values()].map(({ title, badge }) => title + badge).join('');
            const [fonts, { default: satori }, { Resvg }] = await Promise.all([
                loadOgFonts(allText, path.join(cacheDir, 'fonts')),
                import('satori'),
                import('@resvg/resvg-js'),
            ]);
            const avatar = fs.readFileSync(avatarPath);
            return {
                fonts,
                avatarSrc: `data:image/jpeg;base64,${avatar.toString('base64')}`,
                keySalt: `${TEMPLATE_VERSION}|${createHash('sha1').update(avatar).digest('hex')}`,
                async toPng(tree) {
                    const svg = await satori(tree as any, {
                        width: OG_WIDTH,
                        height: OG_HEIGHT,
                        fonts: fonts.fonts,
                    });
                    // satori 已把文字轉成 path；不載系統字型，否則每張圖多花約 280ms
                    const resvg = new Resvg(svg, { font: { loadSystemFonts: false } });
                    return resvg.render().asPng();
                },
            };
        } catch (error) {
            console.warn(`\n[og-image] ⚠ 無法準備產圖（${error}），本次 build 不輸出 og:image`);
            return null;
        }
    }

    async function writeImage(r: Renderer, tree: unknown, key: string, outFile: string) {
        const hash = createHash('sha1').update(`${r.keySalt}|${key}`).digest('hex');
        const cached = path.join(cacheDir, 'images', `${hash}.png`);
        if (!fs.existsSync(cached)) {
            const png = await limit(() => r.toPng(tree));
            fs.mkdirSync(path.dirname(cached), { recursive: true });
            fs.writeFileSync(cached, png);
        }
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
        fs.copyFileSync(cached, outFile);
    }

    return async function ogImageHead({
        pageData,
        siteConfig,
    }: TransformContext): Promise<HeadConfig[]> {
        if (isNotFoundPage(pageData.relativePath)) return [];
        renderer ??= setup();
        const r = await renderer;
        if (!r) return [];

        const card = cards.get(toPagePath(pageData.relativePath));
        const imagePath = card ? toOgImagePath(pageData.relativePath) : OG_DEFAULT_IMAGE_PATH;
        const outFile = path.join(siteConfig.outDir, imagePath);
        const options = { fontFamily: r.fonts.fontFamily, avatarSrc: r.avatarSrc };

        try {
            if (card) {
                await writeImage(
                    r,
                    articleCard(card, options),
                    `${card.title}|${card.badge}`,
                    outFile,
                );
            } else {
                defaultImage ??= writeImage(r, defaultCard(options), 'default', outFile);
                await defaultImage;
            }
        } catch (error) {
            console.warn(`\n[og-image] ⚠ ${pageData.relativePath} 產圖失敗：${error}`);
            return [];
        }

        return [
            ['meta', { property: 'og:image', content: `${hostname}${imagePath}` }],
            ['meta', { property: 'og:image:type', content: 'image/png' }],
            ['meta', { property: 'og:image:width', content: String(OG_WIDTH) }],
            ['meta', { property: 'og:image:height', content: String(OG_HEIGHT) }],
            ['meta', { property: 'og:image:alt', content: card ? card.title : DEFAULT_CARD_ALT }],
            ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
        ];
    };
}
