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
        sitemap: {
            hostname,
        },
        head: [
            [
                'link',
                {
                    rel: 'icon',
                    href: '/favicon.jpg',
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
            logo: '/avatar-pixel-2.jpg',
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
            socialLinks: [
                { icon: 'gmail', link: 'mailto:kevin.hsu.hws@gmail.com' },
                { icon: 'github', link: 'https://github.com/wen-hsiu-hsu' },
                { icon: 'threads', link: 'https://www.threads.com/@hsiu.soy' },
                { icon: 'flickr', link: 'https://www.flickr.com/photos/145658287@N06/' },
                { icon: 'rss', link: `/${rssFileName}` },
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
                avatar: '/avatar-pixel-2.jpg',
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
