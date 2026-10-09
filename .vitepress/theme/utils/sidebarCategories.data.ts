import { defineLoader, type SiteConfig } from 'vitepress';
import { buildCategoryLinks, type CategoryLinks } from '../postPageData';
import GLOBAL_CONFIG from '../../global-config';
import { getPosts } from '../serverUtils';

// 列表頁側欄分類樹的文章連結。只能用動態 import()（Page.vue 第一次展開時），
// 靜態 import 會把資料打包進 theme chunk，每頁都得下載。
declare const data: CategoryLinks;
export { data };

export default defineLoader({
    // 以 . 開頭才會相對本檔解析；其他寫法會以專案根目錄為準，比對不到文章
    watch: [
        `../../../${GLOBAL_CONFIG.srcDirName}/dev/**/*.md`,
        `../../../${GLOBAL_CONFIG.srcDirName}/life/**/*.md`,
    ],
    async load() {
        const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG;
        const { posts } = await getPosts();
        return buildCategoryLinks(posts, config.userConfig.themeConfig.text.uncategorized);
    },
});
