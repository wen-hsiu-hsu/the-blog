<template>
    <div class="flex flex-col md:flex-row gap-16 w-full">
        <!-- Author aside -->
        <BaseSidebar width="250" class="shrink-0">
            <div class="flex flex-col items-center mt-[5vh] pb-10">
                <div class="relative group">
                    <BaseFlipCard class="size-26 rounded-full">
                        <template #front>
                            <img
                                :src="theme.author.avatar"
                                :alt="`${theme.author.name}'s Avatar Image`"
                                class="size-26 rounded-full object-cover"
                            />
                        </template>
                        <template #back>
                            <img
                                src="https://c.tenor.com/wfdSCMP3BVEAAAAC/tenor.gif"
                                :alt="`${theme.author.name}'s Avatar Image`"
                                class="size-26 rounded-full object-cover"
                            />
                        </template>
                    </BaseFlipCard>
                </div>
                <p class="text-center !mb-0 whitespace-pre !line-height-5">
                    {{ theme.author.intro }}
                </p>
                <ul class="!p-0 !list-none text-sm flex gap-2 items-center line-height-4">
                    <li class="flex items-center gap-2 !m-0">
                        <span>{{ theme.text.archive }}</span>
                        <span>{{ theme.page.postsTotal }}</span>
                    </li>
                    <li class="flex items-center !m-0 translate-y-px">
                        <BaseIcon icon="mynaui/dots-vertical" size="size-4" />
                    </li>
                    <li class="flex items-center gap-2 !m-0">
                        <span>{{ theme.text.tags }}</span
                        ><span>{{ tagsLength }}</span>
                    </li>
                </ul>
                <ul class="!p-0 !list-none text-sm flex flex-wrap gap-2 !mt-2 !mb-0">
                    <li v-for="link in theme.theSocialLinks" class="!m-0">
                        <a
                            :href="link.link"
                            class="block p-1 opacity-80"
                            target="_blank"
                            :aria-label="link.ariaLabel"
                        >
                            <template v-if="link.icon">
                                <span v-if="link.icon.svg" v-html="link.icon.svg"></span>
                                <BaseIcon v-else :icon="`${link.icon}`" size="size-4" />
                            </template>
                            <template v-else-if="link.svg">
                                <span v-html="link.svg"></span>
                            </template>
                        </a>
                    </li>
                </ul>
                <div class="mt-2">
                    <a href="https://www.buymeacoffee.com/hsiu" target="_blank">
                        <img
                            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                            alt="Buy Me A Coffee"
                            style="height: 40px !important; width: 144.7px !important"
                        />
                    </a>
                </div>
                <!-- tags -->
                <div class="!mt-4 border-t border-t-neutral-100 dark:border-t-neutral-800 !pt-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-3 flex items-center gap-1">
                            <BaseIcon icon="mynaui/tag" size="size-3" />
                            <span>{{ theme.text.tags }}</span>
                        </span>
                        <a
                            :href="withBase('/pages/tags.html')"
                            class="flex items-center gap-1 text-3 py-1 pl-2 pr-1 rounded-sm"
                        >
                            <span>{{ theme.text.readMore }}</span>
                            <BaseIcon icon="mynaui/chevron-right" />
                        </a>
                    </div>
                    <ul class="!p-0 !list-none text-sm flex flex-wrap gap-2 !mb-1">
                        <li v-for="value in Object.keys(tags).slice(0, 9)" class="!mt-0 !text-xs">
                            <BaseTag
                                :href="withBase(`/pages/tags.html?tag=${value}`)"
                                :text="value"
                                :key="value"
                                font-size="text-3"
                                margin="mr-1 mb-2"
                            />
                        </li>
                    </ul>
                </div>
                <div
                    class="!mt-4 border-t border-t-neutral-100 dark:border-t-neutral-800 !pt-4 w-full"
                >
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-3 flex items-center gap-1">
                            <BaseIcon icon="mynaui/layers-three" size="size-3" />
                            <span>{{ theme.text.category }}</span>
                        </span>
                        <a
                            :href="withBase('/pages/category.html')"
                            class="flex items-center gap-1 text-3 py-1 pl-2 pr-1 rounded-sm"
                        >
                            <span>{{ theme.text.readMore }}</span>
                            <BaseIcon icon="mynaui/chevron-right" />
                        </a>
                    </div>
                    <ul class="!p-0 !m-0 !list-none">
                        <BaseTreeview v-for="groupItem in normalizeCategories" :model="groupItem" />
                    </ul>
                </div>
            </div>
        </BaseSidebar>
        <!-- Post List -->
        <div class="grow">
            <SectionHero :section="frontmatter.section" :postsTotal="postsTotal" class="mt-7" />
            <div
                v-for="(article, index) in posts"
                :key="index"
                :class="[
                    'py-7',
                    index !== 0 && 'border-t border-t-neutral-100 dark:border-t-neutral-800',
                ]"
            >
                <ArticleRow :article="article" />
            </div>
            <div class="mt-4 flex justify-center gap-2">
                <a
                    :class="[
                        'link inline-block size-6 text-center rounded-full',
                        pageCurrent === i &&
                            '!bg-[var(--vp-c-text-1)] !text-[var(--vp-c-neutral-inverse)]',
                    ]"
                    v-for="i in pagesNum"
                    :key="i"
                    :href="
                        withBase(
                            i === 1
                                ? pageBase === '/page/'
                                    ? '/index.html'
                                    : pageBase.replace('/page/', '/')
                                : `${pageBase}${i}.html`,
                        )
                    "
                >
                    <span class="relative top-[-2px]">{{ i }}</span>
                </a>
            </div>

            <Copyright class="mt-12" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { withBase, useData } from 'vitepress';
import { PropType, computed } from 'vue';
import { initTags, initCategory } from '../../functions';
import BaseSidebar from './../base/BaseSidebar.vue';
import BaseTreeview from './../base/BaseTreeview.vue';
import BaseFlipCard from './../base/BaseFlipCard.vue';
import Copyright from './../layout/Copyright.vue';
import ArticleRow from './ArticleRow.vue';
import SectionHero from './SectionHero.vue';
import type { DefaultTheme } from 'vitepress/theme';

interface Article {
    regularPath: string;
    frontMatter: {
        title: string;
        description?: string;
        date: string;
        tags?: string[];
        category?: string;
        pin?: number;
    };
}
const props = defineProps({
    posts: {
        type: Array as PropType<Article[]>,
        required: true,
    },
    pageCurrent: {
        type: Number as PropType<number>,
        required: true,
    },
    pagesNum: {
        type: Number as PropType<number>,
        required: true,
    },
    pageBase: {
        type: String as PropType<string>,
        default: '/page/',
    },
});

const { theme, frontmatter } = useData();

const postsTotal = computed(() => {
    const s = frontmatter.value.section;
    if (s === 'dev') return theme.value.devPage?.postsTotal ?? 0;
    if (s === 'life') return theme.value.lifePage?.postsTotal ?? 0;
    return theme.value.page.postsTotal;
});
const tags = computed(() => initTags(theme.value.posts));
const tagsLength = computed(() => Object.keys(tags.value).length);
const categories = computed(() => initCategory(theme.value.posts, theme.value.text.uncategorized));

const normalizeCategories = computed(() => {
    const _categories = categories.value;
    const result: DefaultTheme.SidebarItem[] = [];

    // 遍歷所有分類
    for (const [categoryName, articles] of Object.entries(_categories)) {
        // 為每個分類創建一個側邊欄項目
        const categoryItem: DefaultTheme.SidebarItem = {
            text: categoryName,
            collapsed: false,
            items: [],
        };

        // 將分類下的每篇文章加入為子項目
        if (Array.isArray(articles)) {
            articles.forEach((article) => {
                categoryItem.items?.push({
                    text: article.frontMatter.title,
                    link: withBase(article.regularPath),
                    // 如果文章有 pin 屬性，可以添加到 rel 屬性中
                    rel: article.frontMatter.pin ? 'pinned' : undefined,
                    // 可以添加更多屬性如文章描述等
                    docFooterText: article.frontMatter.date,
                });
            });

            // 按照 pin 屬性和日期排序文章（置頂的在前面）
            categoryItem.items?.sort((a, b) => {
                const aIsPinned = a.rel === 'pinned';
                const bIsPinned = b.rel === 'pinned';

                if (aIsPinned && !bIsPinned) return -1;
                if (!aIsPinned && bIsPinned) return 1;

                // 如果同為置頂或非置頂，則按日期排序（新的在前面）
                const aDate = a.docFooterText || '';
                const bDate = b.docFooterText || '';
                return bDate.localeCompare(aDate);
            });
        }

        // 只有當分類下有文章時才添加到結果中
        if (categoryItem.items && categoryItem.items.length > 0) {
            result.push(categoryItem);
        }
    }

    // 按照分類名稱排序
    const uncategorizedLabel = theme.value.text.uncategorized;
    result.sort((a, b) => {
        const aText = a.text || '';
        const bText = b.text || '';
        // 如果 a 是未分類，應該排在後面
        if (aText === uncategorizedLabel) return 1;
        // 如果 b 是未分類，應該排在後面
        if (bText === uncategorizedLabel) return -1;
        // 其他情況按正常字母順序
        return aText.localeCompare(bText);
    });

    return result;
});
</script>
