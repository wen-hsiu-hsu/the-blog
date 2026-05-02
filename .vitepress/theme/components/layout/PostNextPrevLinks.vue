<template>
    <div>
        <div
            class="grid grid-cols-1 md:grid-cols-2 gap-4"
            v-if="currentPostIndex !== -1 || !frontmatter.page"
        >
            <BaseButton
                v-if="hasPrev"
                class="flex flex-col items-center justify-center gap-1"
                padding="py-4 px-4"
                :href="prevPost!.regularPath"
            >
                <span class="flex items-center gap-2">
                    <BaseIcon icon="mynaui/chevron-left" />
                    <span>{{ isSeriesPost ? '上一章' : '上一篇' }}</span>
                </span>
                <span class="line-clamp-1">{{ prevPost!.frontMatter.title }}</span>
            </BaseButton>
            <p v-else class="text-center flex items-center justify-center gap-2">
                <BaseIcon icon="mynaui/confetti" size="size-6" />
                <span>{{ isSeriesPost ? '已經是第一章了' : '你已經閱讀到最後一篇文章了' }}</span>
            </p>
            <BaseButton
                v-if="hasNext"
                class="flex flex-col items-center justify-center gap-1"
                padding="py-3 px-4"
                :href="nextPost!.regularPath"
            >
                <span class="flex items-center gap-2">
                    <span>{{ isSeriesPost ? '下一章' : '下一篇' }}</span>
                    <BaseIcon icon="mynaui/chevron-right" />
                </span>
                <span class="line-clamp-1">
                    {{ nextPost!.frontMatter.title }}
                </span>
            </BaseButton>
            <p v-else class="text-center flex items-center justify-center gap-2">
                <BaseIcon icon="mynaui/confetti" size="size-6" />
                <span>{{ isSeriesPost ? '已經是最新一章了' : '你已經閱讀到最新的文章了' }}</span>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useData } from 'vitepress';

const route = useRoute();
const { frontmatter, theme } = useData();

const isSeriesPost = computed(() => !!frontmatter.value.series);

// Series navigation
const seriesPosts = computed(() => {
    const series = frontmatter.value.series;
    if (!series) return [];
    return theme.value.seriesMap?.[series] ?? [];
});

const currentSeriesIndex = computed(() =>
    seriesPosts.value.findIndex((p) => p.regularPath === route.path),
);

// Global navigation (non-series)
const currentPostIndex = computed(() => {
    if (isSeriesPost.value) return -99; // prevent showing "最後一篇" message
    return theme.value.posts.findIndex((item) => item.regularPath === route.path);
});

const hasPrev = computed(() => {
    if (isSeriesPost.value) return currentSeriesIndex.value > 0;
    return currentPostIndex.value !== theme.value.posts.length - 1;
});

const hasNext = computed(() => {
    if (isSeriesPost.value) return currentSeriesIndex.value < seriesPosts.value.length - 1;
    return currentPostIndex.value !== 0;
});

const prevPost = computed(() => {
    if (isSeriesPost.value) return seriesPosts.value[currentSeriesIndex.value - 1] ?? null;
    return theme.value.posts[currentPostIndex.value + 1] ?? null;
});

const nextPost = computed(() => {
    if (isSeriesPost.value) return seriesPosts.value[currentSeriesIndex.value + 1] ?? null;
    return theme.value.posts[currentPostIndex.value - 1] ?? null;
});
</script>
