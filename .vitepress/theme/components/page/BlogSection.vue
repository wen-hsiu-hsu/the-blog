<script setup lang="ts">
import { computed } from 'vue';
import { useData } from 'vitepress';
import Page from './Page.vue';
import { usePostPageData } from '../../utils/usePostPageData';

const { frontmatter } = useData();
const postData = usePostPageData();

const section = computed(() => frontmatter.value.section as string | undefined);

const currentPosts = computed(() => postData.value.listPosts ?? []);
const currentPage = computed(() => postData.value.listMeta?.pageCurrent ?? 1);
const pagesTotal = computed(() => postData.value.listMeta?.pagesTotal ?? 0);

const pageBase = computed(() => {
    if (section.value === 'dev') return '/dev/page/';
    if (section.value === 'life') return '/life/page/';
    return '/page/';
});
</script>

<template>
    <Page
        :posts="currentPosts"
        :pageCurrent="currentPage"
        :pagesNum="pagesTotal"
        :pageBase="pageBase"
    />
</template>
