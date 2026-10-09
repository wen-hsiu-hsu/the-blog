<template>
    <div v-for="yearList in data">
        <div class="pt-7 pb-2.5 font-bold text-[var(--bt-theme-title)] text-5.5">
            {{ yearList[0].frontMatter.date.split('-')[0] }}
        </div>
        <a
            :href="withBase(article.regularPath)"
            v-for="(article, index) in yearList"
            :key="index"
            class="py-1 pt-1 md:pt-1 pb-1 md:pb-[25px] flex justify-between items-center hover:underline"
        >
            <div class="text-[var(--vp-c-text-1)] hover:text-[var(--vp-c-brand)] line-clamp-1">
                <div
                    class="inline-block mr-1 md:mr-2.5 mb-1 size-1 rounded-full bg-[var(--li-dot-color)]"
                ></div>
                {{ article.frontMatter.title }}
            </div>
            <div class="text-[var(--date-color)]">{{ article.frontMatter.date.slice(5) }}</div>
        </a>
    </div>
</template>

<script lang="ts" setup>
import { withBase } from 'vitepress';
import { computed } from 'vue';
import { useYearSort } from '../../functions';
import { usePostPageData } from '../../utils/usePostPageData';

const postData = usePostPageData();
const data = computed(() => useYearSort(postData.value.allPosts ?? []));
</script>
