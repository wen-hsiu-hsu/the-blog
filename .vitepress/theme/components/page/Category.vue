<template>
    <div v-for="(posts, key) in data">
        <div class="pt-7 pb-2.5 font-bold text-[var(--bt-theme-title)] text-5.5">
            {{ key }}
        </div>
        <a
            :href="withBase(article.regularPath)"
            v-for="(article, index) in posts"
            :key="index"
            class="pb-1 mb-1 md:pb-2 md:mb-2 flex justify-between items-center text-[var(--vp-c-text-1)] hover:text-[var(--vp-c-brand)] border-b border-b-[var(--vp-c-gray-soft)] hover:underline"
        >
            <div class="text-[var(--vp-c-text-1)] hover:text-[var(--vp-c-brand)] line-clamp-1">
                <div
                    class="inline-block mr-1 md:mr-2.5 mb-1 size-1 rounded-full bg-[var(--li-dot-color)]"
                ></div>
                {{ article.frontMatter.title }}
            </div>
            <div class="text-[var(--date-color)]">{{ article.frontMatter.date }}</div>
        </a>
    </div>
</template>
<script lang="ts" setup>
import { useData, withBase } from 'vitepress';
import { computed } from 'vue';
import { initCategory } from '../../functions';
import { usePostPageData } from '../../utils/usePostPageData';

const { theme } = useData();
const postData = usePostPageData();
const data = computed(() =>
    initCategory(postData.value.allPosts ?? [], theme.value.text.uncategorized),
);
</script>
