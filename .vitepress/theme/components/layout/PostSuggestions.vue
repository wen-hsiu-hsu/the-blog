<template>
    <div>
        <div
            class="py-20 my-20 border-t border-t-neutral-200 dark:border-t-neutral-800"
            v-if="!frontmatter.page"
        >
            <!-- Series TOC -->
            <template v-if="isSeriesPost">
                <div id="series-toc">
                    <h2 class="!mb-4 !font-bold !mt-0">
                        <span class="inline-flex items-center gap-2">
                            <BaseIcon icon="mynaui/book-open" size="size-5" />
                            系列章節
                        </span>
                    </h2>

                    <!-- Grouped by chapter -->
                    <template v-if="hasChapters">
                        <div
                            v-for="(group, groupIndex) in groupedSeriesPosts"
                            :key="group.chapter"
                            :class="[groupIndex !== 0 && 'mt-6']"
                        >
                            <p
                                class="text-sm font-semibold opacity-60 mb-2 uppercase tracking-wide"
                            >
                                {{ group.chapter }}
                            </p>
                            <ul>
                                <li
                                    v-for="(post, postIndex) in group.posts"
                                    :key="post.regularPath"
                                    :class="[
                                        postIndex !== 0 &&
                                            'mt-2 pt-2 border-t border-t-neutral-200 dark:border-t-neutral-800',
                                    ]"
                                >
                                    <a
                                        :href="post.regularPath"
                                        :class="[
                                            'flex flex-col md:flex-row justify-between w-full hover:text-[var(--vp-c-brand)] hover:underline',
                                            isCurrentPost(post.regularPath) &&
                                                'text-[var(--vp-c-brand)] font-semibold',
                                        ]"
                                    >
                                        <span class="flex items-center gap-2">
                                            <span
                                                v-if="isCurrentPost(post.regularPath)"
                                                class="inline-flex items-center shrink-0"
                                            >
                                                <BaseIcon icon="mynaui/arrow-right" size="size-4" />
                                            </span>
                                            <span
                                                v-else
                                                class="text-xs opacity-50 shrink-0 w-4 text-center"
                                            >
                                                {{ post.frontMatter.order }}
                                            </span>
                                            <span class="line-clamp-2 md:line-clamp-1">
                                                {{ post.frontMatter.title }}
                                            </span>
                                        </span>
                                        <span class="text-nowrap opacity-70 md:ml-4">
                                            {{ post.frontMatter.date }}
                                        </span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </template>

                    <!-- Flat list (no chapters) -->
                    <template v-else>
                        <ul>
                            <li
                                v-for="(post, postIndex) in seriesPosts"
                                :key="post.regularPath"
                                :class="[
                                    postIndex !== 0 &&
                                        'mt-2 pt-2 border-t border-t-neutral-200 dark:border-t-neutral-800',
                                ]"
                            >
                                <a
                                    :href="post.regularPath"
                                    :class="[
                                        'flex flex-col md:flex-row justify-between w-full hover:text-[var(--vp-c-brand)] hover:underline',
                                        isCurrentPost(post.regularPath) &&
                                            'text-[var(--vp-c-brand)] font-semibold',
                                    ]"
                                >
                                    <span class="flex items-center gap-2">
                                        <span
                                            v-if="isCurrentPost(post.regularPath)"
                                            class="inline-flex items-center shrink-0"
                                        >
                                            <BaseIcon icon="mynaui/arrow-right" size="size-4" />
                                        </span>
                                        <span
                                            v-else
                                            class="text-xs opacity-50 shrink-0 w-4 text-center"
                                        >
                                            {{ post.frontMatter.order }}
                                        </span>
                                        <span class="line-clamp-2 md:line-clamp-1">
                                            {{ post.frontMatter.title }}
                                        </span>
                                    </span>
                                    <span class="text-nowrap opacity-70 md:ml-4">
                                        {{ post.frontMatter.date }}
                                    </span>
                                </a>
                            </li>
                        </ul>
                    </template>
                </div>
            </template>

            <!-- Regular suggestions -->
            <template v-else>
                <h2 class="!mb-4 !font-bold !mt-0">{{ theme.text.suggestPost }}</h2>
                <ul class="">
                    <li
                        v-for="(post, postIndex) in suggestPosts"
                        :key="post.regularPath"
                        :class="[
                            postIndex !== 0 &&
                                'mt-2 pt-2 border-t border-t-neutral-200 dark:border-t-neutral-800',
                        ]"
                    >
                        <a
                            :href="post.regularPath"
                            class="flex flex-col md:flex-row justify-between w-full hover:text-[var(--vp-c-brand)] hover:underline"
                        >
                            <span class="line-clamp-2 md:line-clamp-1">
                                {{ post.frontMatter.title }}
                            </span>

                            <span class="text-nowrap opacity-70">{{ post.frontMatter.date }}</span>
                        </a>
                    </li>
                </ul>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useData } from 'vitepress';
import { initCategory } from './../../functions';

const route = useRoute();
const { frontmatter, theme } = useData();

const isSeriesPost = computed(() => !!frontmatter.value.series);

const seriesPosts = computed(() => {
    const series = frontmatter.value.series;
    if (!series) return [];
    return theme.value.seriesMap?.[series] ?? [];
});

const isCurrentPost = (path: string) => path === route.path;

const hasChapters = computed(() => seriesPosts.value.some((p) => p.frontMatter.chapter));

const groupedSeriesPosts = computed(() => {
    const groups: { chapter: string; minOrder: number; posts: typeof seriesPosts.value }[] = [];
    const chapterMap = new Map<string, (typeof groups)[0]>();

    for (const post of seriesPosts.value) {
        const chapter = (post.frontMatter.chapter as string | undefined) ?? '其他';
        const order = (post.frontMatter.order as number | undefined) ?? 0;
        if (!chapterMap.has(chapter)) {
            const group = { chapter, minOrder: order, posts: [post] };
            chapterMap.set(chapter, group);
            groups.push(group);
        } else {
            const group = chapterMap.get(chapter)!;
            group.posts.push(post);
            if (order < group.minOrder) group.minOrder = order;
        }
    }

    return groups.sort((a, b) => a.minOrder - b.minOrder);
});

// Regular suggestions (non-series)
const currentCategory = computed(
    () => frontmatter.value.category || theme.value.text.uncategorized,
);

const suggestPosts = computed(() => {
    const allPosts = theme.value.posts.filter((item) => item.regularPath !== route.path);

    const posts = initCategory(allPosts, theme.value.text.uncategorized);

    const currentCategoryPosts = posts[currentCategory.value] ?? [];

    const _suggestPosts = currentCategoryPosts.filter((item) => item.regularPath !== route.path);

    const suggestPostsLength = theme.value.suggestPostLength ?? 5;
    if (_suggestPosts.length > suggestPostsLength) {
        return _suggestPosts.slice(0, suggestPostsLength);
    }

    const remainingCount = suggestPostsLength - _suggestPosts.length;

    const otherCategoryPosts = allPosts.filter((post) => !currentCategoryPosts.includes(post));
    const extraPosts = otherCategoryPosts.slice(0, remainingCount);

    return [..._suggestPosts, ...extraPosts];
});
</script>
