<template>
    <div>
        <div v-if="!frontmatter.page">
            <div class="text-3 pt-5 flex gap-2 items-end mb-1">
                <p v-if="!frontmatter.page" class="text-3">
                    {{ frontmatter.date?.substring(0, 10) }}
                </p>
                <p v-if="currentPageReadingTime" class="text-3">/ {{ currentPageReadingTime }}</p>
                <p v-if="frontmatter.category" class="text-3">/ {{ frontmatter.category }}</p>
            </div>

            <div v-if="currentSeries" class="mb-1">
                <a
                    href="#series-toc"
                    class="inline-flex items-center gap-1.5 text-md py-1 font-italic hover:underline hover:opacity-80 transition-opacity"
                >
                    {{ seriesTitle }}
                    <template v-if="currentChapter">
                        <span class="opacity-60">·</span>
                        {{ currentChapter }}
                        <span class="opacity-60">·</span>
                        <span>第 {{ frontmatter.order }} 節 / 共 {{ seriesTotalChapters }} 節</span>
                    </template>
                    <template v-else>
                        <span class="opacity-60">·</span>
                        <span>第 {{ frontmatter.order }} 章 / 共 {{ seriesTotalChapters }} 章</span>
                    </template>
                    <BaseIcon icon="mynaui/chevron-down" size="size-3.5" class="opacity-50" />
                </a>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { data as readingTimeData } from '../../utils/reading-time.data.ts';
import { computed } from 'vue';
import { withBase, useRoute, useData } from 'vitepress';

const route = useRoute();
const { frontmatter, theme } = useData();

const currentPageReadingTime = computed(() => {
    return (
        readingTimeData.articles.find((article) => article.path === route.path)?.readingTime
            ?.labelText || ''
    );
});

const currentSeries = computed(() => frontmatter.value.series as string | undefined);

const seriesPosts = computed(() => {
    if (!currentSeries.value) return [];
    return theme.value.seriesMap?.[currentSeries.value] ?? [];
});

const seriesTotalChapters = computed(() => seriesPosts.value.length);

const seriesTitle = computed(() => {
    if (!currentSeries.value) return '';
    return (
        frontmatter.value.seriesTitle ??
        seriesPosts.value[0]?.frontMatter.category ??
        currentSeries.value
    );
});

const currentChapter = computed(() => frontmatter.value.chapter as string | undefined);
</script>
