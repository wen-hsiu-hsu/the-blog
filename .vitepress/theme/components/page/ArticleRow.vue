<template>
    <div>
        <div class="flex items-center text-3 gap-1 mb-0.5">
            <span v-if="article.frontMatter.date" class="inline-flex items-center gap-1">
                <BaseIcon icon="mynaui/calendar" size="size-3" />
                <span>{{ article.frontMatter.date }}</span>
            </span>
            <template v-if="getReadingTime(article.regularPath)">
                <BaseIcon icon="mynaui/dots-vertical" size="size-4" class="translate-y-px" />
                <span class="inline-flex items-center gap-1">
                    <BaseIcon icon="mynaui/watch" size="size-3" />
                    <span class="inline-flex items-center">
                        {{ getReadingTime(article.regularPath) }}
                    </span>
                </span>
            </template>
        </div>
        <div class="flex items-center justify-between relative">
            <div class="text-5 line-clamp-2">
                <div class="absolute top-0 left-0 translate-x-[-100%] pr-2">
                    <BaseIcon
                        icon="mynaui/pin"
                        v-if="article.frontMatter.pin"
                        size="size-3"
                        class="!text-[var(--bt-theme-title)]"
                    />
                </div>
                <a
                    class="!text-[var(--bt-theme-title)] !font-bold hover:underline"
                    :href="withBase(article.regularPath)"
                >
                    {{ article.frontMatter.title }}
                </a>
            </div>
        </div>
        <p
            class="text-[var(--vp-c-text-2)] !m-0 !text-sm line-clamp-2 py-1"
            v-if="article.frontMatter.description"
            v-html="article.frontMatter.description"
        ></p>
        <div
            class="text-3 flex items-center flex-wrap mt-1 gap-1"
            v-if="article.frontMatter.category || article.frontMatter.tags"
        >
            <div class="flex items-center gap-1" v-if="article.frontMatter.category">
                <BaseIcon icon="mynaui/layers-three" size="size-3" class="translate-y-px" />
                <span>{{ article.frontMatter.category }}</span>
            </div>
            <template v-if="(article.frontMatter?.tags?.length ?? 0) > 0">
                <BaseIcon icon="mynaui/dots-vertical" size="size-4" class="translate-y-px" />
                <BaseTag
                    v-for="item in article.frontMatter.tags"
                    :href="withBase(`/pages/tags.html?tag=${item}`)"
                    :key="item"
                    :text="item"
                    margin="mr-2.5"
                    font-size="text-3"
                    class="inline-block opacity-30 hover:opacity-100"
                />
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { withBase } from 'vitepress';
import { PropType } from 'vue';
import { data as readingTimeData } from '../../utils/reading-time.data';
import BaseIcon from './../base/BaseIcon.vue';
import BaseTag from './../base/BaseTag.vue';

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

defineProps({
    article: {
        type: Object as PropType<Article>,
        required: true,
    },
});

function getReadingTime(path: string) {
    return (
        readingTimeData.articles.find((article) => article.path === path.replace('.html', ''))
            ?.readingTime?.labelText || ''
    );
}
</script>
