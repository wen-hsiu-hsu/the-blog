import { globby } from 'globby';
import matter from 'gray-matter';
import fs from 'fs-extra';
import GLOBAL_CONFIG from './../global-config';

const pageSize = 10; // 每頁顯示的文章數量

async function getPosts() {
    const paths = await globby([GLOBAL_CONFIG.srcDirName + '/posts/**.md']);
    const postsTotal = paths.length;

    const posts = await Promise.all(
        paths.map(async (item) => {
            const content = await fs.readFile(item, 'utf-8');
            const { data } = matter(content);
            data.date = _convertDate(data.date);
            return {
                frontMatter: data,
                regularPath: `/${item
                    .replace('.md', '') // 如果 config.cleanUrls 為 true 則要去掉 .md，若為 false 則要改成 .html
                    .replace(`${GLOBAL_CONFIG.srcDirName}/`, '')}`,
            };
        }),
    );
    posts.sort(_compareDate as any);
    posts.sort(_comparePin as any);

    const pagesTotal =
        postsTotal % pageSize === 0 ? postsTotal / pageSize : Math.floor(postsTotal / pageSize) + 1;

    return {
        posts,
        postsTotal,
        pagesTotal,
        pageSize,
    };
}

function _convertDate(date = new Date().toString()) {
    const json_date = new Date(date).toJSON();
    return json_date.split('T')[0];
}

function _compareDate(
    obj1: { frontMatter: { date: number } },
    obj2: { frontMatter: { date: number } },
) {
    return obj1.frontMatter.date < obj2.frontMatter.date ? 1 : -1;
}

function _comparePin(
    obj1: { frontMatter: { pin: number } },
    obj2: { frontMatter: { pin: number } },
) {
    const pin1 = obj1.frontMatter?.pin ?? 0;
    const pin2 = obj2.frontMatter?.pin ?? 0;
    if (pin1 === pin2) return 0;
    return pin1 < pin2 ? 1 : -1;
}

export { getPosts };
