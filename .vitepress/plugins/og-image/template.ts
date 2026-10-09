// OG 圖的版面（satori 的元素樹），對齊設計稿 https://claude.ai/artifact/Dpao2gXrrt9L9JBsiCc3sz
// 改動版面時要調高 TEMPLATE_VERSION，讓快取的舊圖失效。

export const TEMPLATE_VERSION = 1;
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export type OgCardText = {
    title: string;
    badge: string;
};

type SatoriNode = {
    type: string;
    props: { style?: Record<string, unknown>; children?: unknown; [key: string]: unknown };
};

/** 標題裡的 emoji 不畫（字型沒有 emoji 字形），移除後收合多餘空白 */
export function stripEmoji(text: string): string {
    return text
        .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

/** 文章卡的文字：badge 用系列名，沒有系列時用分類 */
export function toOgCardText(frontMatter: Record<string, any>): OgCardText {
    return {
        title: stripEmoji(String(frontMatter.title ?? '')),
        badge: String(frontMatter.seriesTitle || frontMatter.category || ''),
    };
}

const SITE_NAME = "Wen-Hsiu's Blog";
const AUTHOR_NAME = 'Wen-Hsiu Hsu';
const DOMAIN = 'hsiu.soy';
const TAGLINE = '前端工程師的技術筆記與生活紀錄';
// 全形「…」會被 satori 0.33.5 量錯寬度而被切掉，改用三個半形句點
const ELLIPSIS = '...';

/** 版面上固定出現的字，字型子集必須包含 */
export const FIXED_TEXT = [SITE_NAME, AUTHOR_NAME, DOMAIN, TAGLINE, ELLIPSIS].join('');

const h = (type: string, style: Record<string, unknown>, children?: unknown): SatoriNode => ({
    type,
    props: { style, children },
});

function frame(fontFamily: string, children: SatoriNode[]): SatoriNode {
    return h(
        'div',
        {
            width: OG_WIDTH,
            height: OG_HEIGHT,
            display: 'flex',
            flexDirection: 'column',
            background: '#f6f8f4',
            borderTop: '12px solid #3da552',
            padding: '64px 80px 56px',
            fontFamily,
            color: '#1d2a22',
        },
        children,
    );
}

function footer(avatarSrc: string, name: string): SatoriNode[] {
    return [
        h('div', { height: 2, background: '#dfe5dc', marginBottom: 28 }),
        h('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, [
            h('div', { display: 'flex', alignItems: 'center', gap: 20 }, [
                {
                    type: 'img',
                    props: {
                        src: avatarSrc,
                        width: 80,
                        height: 80,
                        style: { borderRadius: 40, objectFit: 'cover' },
                    },
                },
                h('div', { fontSize: 32, fontWeight: 500 }, name),
            ]),
            h('div', { fontSize: 30, fontWeight: 500, color: '#2e7d3f' }, DOMAIN),
        ]),
    ];
}

export function articleCard(
    { title, badge }: OgCardText,
    options: { fontFamily: string; avatarSrc: string },
): SatoriNode {
    return frame(options.fontFamily, [
        h(
            'div',
            { display: 'flex' },
            badge
                ? [
                      h(
                          'div',
                          {
                              fontSize: 26,
                              fontWeight: 500,
                              color: '#ffffff',
                              background: '#2e7d3f',
                              borderRadius: 999,
                              padding: '8px 24px',
                          },
                          badge,
                      ),
                  ]
                : [],
        ),
        h('div', { flexGrow: 1, display: 'flex', alignItems: 'center' }, [
            h(
                'div',
                {
                    fontSize: 64,
                    fontWeight: 800,
                    lineHeight: 1.3,
                    display: 'block',
                    lineClamp: `3 "${ELLIPSIS}"`,
                    overflow: 'hidden',
                },
                title,
            ),
        ]),
        ...footer(options.avatarSrc, SITE_NAME),
    ]);
}

export function defaultCard(options: { fontFamily: string; avatarSrc: string }): SatoriNode {
    return frame(options.fontFamily, [
        h(
            'div',
            {
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 24,
            },
            [
                h('div', { fontSize: 88, fontWeight: 800, lineHeight: 1.2 }, SITE_NAME),
                h('div', { fontSize: 40, fontWeight: 500, color: '#4a5a50' }, TAGLINE),
            ],
        ),
        ...footer(options.avatarSrc, AUTHOR_NAME),
    ]);
}

export const DEFAULT_CARD_ALT = `${SITE_NAME}：${TAGLINE}`;
