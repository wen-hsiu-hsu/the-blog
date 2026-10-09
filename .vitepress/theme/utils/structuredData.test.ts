import { describe, it, expect } from 'vitest';
import { buildStructuredData } from './structuredData';

const options = {
    hostname: 'https://hsiu.soy',
    siteTitle: "Wen-Hsiu's Blog",
    siteDescription: '站台描述',
    lang: 'zh-TW',
    author: {
        name: 'Wen-Hsiu Hsu',
        avatar: '/avatar.jpg',
        sameAs: ['https://github.com/wen-hsiu-hsu'],
    },
    sections: [
        { text: 'Dev', link: '/dev/' },
        { text: 'Life', link: '/life/' },
    ],
};

const post = {
    relativePath: 'dev/web-dev-quiz/01-script-async-vs-defer.md',
    title: 'async vs defer',
    description: '文章描述',
    isPost: true,
    datePublished: '2025-01-01T08:00:00+08:00',
    dateModified: '2025-02-01T08:00:00+08:00',
    category: '程式筆記',
    tags: ['JavaScript'],
    image: 'https://hsiu.soy/og/dev/web-dev-quiz/01-script-async-vs-defer.png',
};

function nodeOf(data: ReturnType<typeof buildStructuredData>, type: string): any {
    return data['@graph'].find((node: any) => node['@type'] === type);
}

describe('buildStructuredData', () => {
    it('every page has Person and WebSite pointing at the home page', () => {
        const data = buildStructuredData(
            { ...post, relativePath: 'dev/index.md', isPost: false },
            options,
        );
        expect(data['@graph']).toHaveLength(2);
        expect(nodeOf(data, 'Person')).toMatchObject({
            '@id': 'https://hsiu.soy/#person',
            url: 'https://hsiu.soy/',
            image: 'https://hsiu.soy/avatar.jpg',
            sameAs: ['https://github.com/wen-hsiu-hsu'],
        });
        expect(nodeOf(data, 'WebSite')).toMatchObject({
            name: "Wen-Hsiu's Blog",
            url: 'https://hsiu.soy/',
            publisher: { '@id': 'https://hsiu.soy/#person' },
        });
    });

    it('post is a BlogPosting referencing the author', () => {
        const article = nodeOf(buildStructuredData(post, options), 'BlogPosting');
        expect(article).toMatchObject({
            mainEntityOfPage: {
                '@id': 'https://hsiu.soy/dev/web-dev-quiz/01-script-async-vs-defer',
            },
            headline: 'async vs defer',
            description: '文章描述',
            image: post.image,
            author: { '@id': 'https://hsiu.soy/#person' },
            publisher: { '@id': 'https://hsiu.soy/#person' },
            articleSection: '程式筆記',
            keywords: ['JavaScript'],
        });
    });

    it('omits image when no OG image was generated', () => {
        const article = nodeOf(
            buildStructuredData({ ...post, image: undefined }, options),
            'BlogPosting',
        );
        expect(article).not.toHaveProperty('image');
    });

    it('breadcrumb skips the series level: home › section › post', () => {
        const breadcrumb = nodeOf(buildStructuredData(post, options), 'BreadcrumbList');
        expect(breadcrumb.itemListElement).toEqual([
            {
                '@type': 'ListItem',
                position: 1,
                name: "Wen-Hsiu's Blog",
                item: 'https://hsiu.soy/',
            },
            { '@type': 'ListItem', position: 2, name: 'Dev', item: 'https://hsiu.soy/dev/' },
            { '@type': 'ListItem', position: 3, name: 'async vs defer' },
        ]);
    });

    it('life posts use the Life section', () => {
        const breadcrumb = nodeOf(
            buildStructuredData({ ...post, relativePath: 'life/trip.md' }, options),
            'BreadcrumbList',
        );
        expect(breadcrumb.itemListElement[1].item).toBe('https://hsiu.soy/life/');
    });

    it('no breadcrumb for a post outside any nav section', () => {
        const data = buildStructuredData({ ...post, relativePath: 'misc/post.md' }, options);
        expect(nodeOf(data, 'BreadcrumbList')).toBeUndefined();
    });
});
