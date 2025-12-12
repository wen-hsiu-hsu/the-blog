import { defineConfig } from 'vitepress';
import { getPosts } from './theme/serverUtils';
import GLOBAL_CONFIG from './global-config';
import UnoCSS from 'unocss/vite';
import { RSSOptions, RssPlugin } from 'vitepress-plugin-rss';
import transformHead from './theme/utils/transformHead';

const hostname = 'https://hsiu.soy';
const title = "Wen-Hsiu's Blog";
const description =
    '前端工程師的個人部落格，主要撰寫技術、生活分享與個人筆記的文章。程式碼之外，還有生活的藝術';
const lang = 'zh-TW';
const rssFileName = 'feed.rss';

const rssOptions: RSSOptions = {
    title,
    baseUrl: hostname,
    copyright: 'Copyright (c) 2025-present, Wen-Hsiu Hsu',
    description,
    language: lang,
    author: {
        name: 'Wen-Hsiu Hsu',
        email: 'kevin.hsu.hws@gmail.com',
        link: 'https://resume.hsiu.soy',
    },
    icon: false,
    filename: rssFileName,
};

// https://vitepress.dev/reference/site-config
export default async () => {
    const { posts, postsTotal, pagesTotal, pageSize } = await getPosts();

    return defineConfig({
        title,
        titleTemplate: '網頁前端 | 生活紀錄 | 攝影',
        description,
        lang,
        cleanUrls: true,
        base: '/',
        cacheDir: './node_modules/vitepress_cache',
        srcDir: `./${GLOBAL_CONFIG.srcDirName}`,
        lastUpdated: true,
        appearance: false,
        sitemap: {
            hostname,
        },
        head: [
            [
                'link',
                {
                    rel: 'icon',
                    href: '/favicon.ico',
                },
            ],
            [
                'meta',
                {
                    name: 'google-adsense-account',
                    content: 'ca-pub-4332272244289506',
                },
            ],

            [
                'script',
                { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-SN2Z3XCX1H' },
            ],
            [
                'script',
                {},
                `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', 'G-SN2Z3XCX1H');
            `,
            ],
            [
                // Cloudflare Web Analytics
                'script',
                {
                    defer: '',
                    src: 'https://static.cloudflareinsights.com/beacon.min.js',
                    'data-cf-beacon': '{"token": "55fb86a8e230474783b10f836dd44f7b"}',
                },
            ],
        ],
        themeConfig: {
            siteTitle: '持續！修鍊之路',
            lastUpdated: {
                text: '最後更新時間',
                formatOptions: {
                    dateStyle: 'full',
                    timeStyle: 'short',
                },
            },
            posts,
            page: {
                size: pageSize,
                postsTotal,
                pagesTotal,
            },
            website: 'https://hsiu.soy', //copyright link
            logo: '/avatar-pixel-v2-mini.jpg',
            comment: {
                repo: 'wen-hsiu-hsu/the-blog',
                issueTerm: 'pathname',
            },
            nav: [{ text: '關於我', link: '/pages/about' }],
            search: {
                provider: 'local',
            },
            outline: {
                label: '文章摘要',
            },
            theSocialLinks: [
                {
                    icon: {
                        svg: '<svg class="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m22 7l-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect width="20" height="16" x="2" y="4" rx="2"/></g></svg>',
                        // lucide:mail
                    },
                    link: 'mailto:kevin.hsu.hws@gmail.com',
                },
                {
                    icon: {
                        svg: '<svg class="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M10.07 20.503a1 1 0 0 0-1.18-.983c-1.31.24-2.963.276-3.402-.958a5.7 5.7 0 0 0-1.837-2.415a1 1 0 0 1-.167-.11a1 1 0 0 0-.93-.645h-.005a1 1 0 0 0-1 .995c-.004.815.81 1.338 1.141 1.514a4.4 4.4 0 0 1 .924 1.36c.365 1.023 1.423 2.576 4.466 2.376l.003.098l.004.268a1 1 0 0 0 2 0l-.005-.318c-.005-.19-.012-.464-.012-1.182M20.737 5.377q.049-.187.09-.42a6.3 6.3 0 0 0-.408-3.293a1 1 0 0 0-.615-.58c-.356-.12-1.67-.357-4.184 1.25a13.9 13.9 0 0 0-6.354 0C6.762.75 5.455.966 5.102 1.079a1 1 0 0 0-.631.584a6.3 6.3 0 0 0-.404 3.357q.037.191.079.354a6.27 6.27 0 0 0-1.256 3.83a8 8 0 0 0 .043.921c.334 4.603 3.334 5.984 5.424 6.459a5 5 0 0 0-.118.4a1 1 0 0 0 1.942.479a1.7 1.7 0 0 1 .468-.878a1 1 0 0 0-.546-1.745c-3.454-.395-4.954-1.802-5.18-4.899a7 7 0 0 1-.033-.738a4.26 4.26 0 0 1 .92-2.713a3 3 0 0 1 .195-.231a1 1 0 0 0 .188-1.025a3.4 3.4 0 0 1-.155-.555a4.1 4.1 0 0 1 .079-1.616a7.5 7.5 0 0 1 2.415 1.18a1 1 0 0 0 .827.133a11.8 11.8 0 0 1 6.173.001a1 1 0 0 0 .83-.138a7.6 7.6 0 0 1 2.406-1.19a4 4 0 0 1 .087 1.578a3.2 3.2 0 0 1-.169.607a1 1 0 0 0 .188 1.025c.078.087.155.18.224.268A4.12 4.12 0 0 1 20 9.203a7 7 0 0 1-.038.777c-.22 3.056-1.725 4.464-5.195 4.86a1 1 0 0 0-.546 1.746a1.63 1.63 0 0 1 .466.908a3 3 0 0 1 .093.82v2.333c-.01.648-.01 1.133-.01 1.356a1 1 0 1 0 2 0c0-.217 0-.692.01-1.34v-2.35a5 5 0 0 0-.155-1.311a4 4 0 0 0-.116-.416a6.51 6.51 0 0 0 5.445-6.424A9 9 0 0 0 22 9.203a6.13 6.13 0 0 0-1.263-3.826"/></svg>',
                        // uil:github-alt
                    },
                    link: 'https://github.com/wen-hsiu-hsu',
                },
                {
                    icon: {
                        svg: '<svg class="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098c1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015c-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164c1.43 1.783 3.631 2.698 6.54 2.717c2.623-.02 4.358-.631 5.8-2.045c1.647-1.613 1.618-3.593 1.09-4.798c-.31-.71-.873-1.3-1.634-1.75c-.192 1.352-.622 2.446-1.284 3.272c-.886 1.102-2.14 1.704-3.73 1.79c-1.202.065-2.361-.218-3.259-.801c-1.063-.689-1.685-1.74-1.752-2.964c-.065-1.19.408-2.285 1.33-3.082c.88-.76 2.119-1.207 3.583-1.291a14 14 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757c-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32l-1.757-1.18c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388q.163.07.321.142c1.49.7 2.58 1.761 3.154 3.07c.797 1.82.871 4.79-1.548 7.158c-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69q-.362 0-.739.021c-1.836.103-2.98.946-2.916 2.143c.067 1.256 1.452 1.839 2.784 1.767c1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221"/></svg>',
                        // simple-icons/threads
                    },
                    link: 'https://www.threads.com/@hsiu.soy',
                },
                {
                    icon: {
                        svg: '<svg class="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m6.233 5.834l.445-2.226A2 2 0 0 1 8.64 2h6.72a2 2 0 0 1 1.962 1.608l.445 2.226a1.88 1.88 0 0 0 1.387 1.454A3.76 3.76 0 0 1 22 10.934V18a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-7.066a3.76 3.76 0 0 1 2.846-3.646a1.88 1.88 0 0 0 1.387-1.454"/><circle cx="12" cy="14" r="4"/><path d="M11 6h2"/></g></svg>',
                        //akar-icons:camera
                    },
                    link: 'https://photography.hsiu.soy/',
                },
                {
                    icon: {
                        svg: '<svg class="size-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" fill-rule="evenodd" d="M2 2.75A.75.75 0 0 1 2.75 2C8.963 2 14 7.037 14 13.25a.75.75 0 0 1-1.5 0A9.75 9.75 0 0 0 2.75 3.5A.75.75 0 0 1 2 2.75m0 4.5a.75.75 0 0 1 .75-.75a6.75 6.75 0 0 1 6.75 6.75a.75.75 0 0 1-1.5 0C8 10.35 5.65 8 2.75 8A.75.75 0 0 1 2 7.25M3.5 11a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3" clip-rule="evenodd"/></svg>',
                        // heroicons:rss-16-solid
                    },
                    link: `/${rssFileName}`,
                },
            ],
            darkModeSwitchLabel: '切換模式',

            // 文章頁的推薦文章數量上限
            suggestPostLength: 5,

            // 閱讀時間
            readingTime: {
                charsPerMinute: 250,
                minuteFormat: 'mm 分鐘閱讀',
            },

            // customize text
            author: {
                name: 'Wen-Hsiu Hsu',
                intro: '程式碼之外，還有生活的藝術\n前端工程師 / 攝影 / 生活紀錄',
                avatar: '/avatar-pixel-v2-mini.jpg',
            },
            text: {
                suggestPost: '更多文章',
                archive: '文章',
                tags: '標籤',
                readMore: '查看更多',
                uncategorized: '未分類',
                category: '分類',
            },
            copyrightFrom: '2025',
        } as any,
        srcExclude: ['README.md'],
        ignoreDeadLinks: [`/${rssFileName}`],
        vite: {
            plugins: [UnoCSS(), RssPlugin(rssOptions)],
        },
        transformHead,
    });
};
