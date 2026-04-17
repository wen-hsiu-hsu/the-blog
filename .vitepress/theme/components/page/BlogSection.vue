<script setup lang="ts">
import { computed } from 'vue';
import { useData } from 'vitepress';
import Page from './Page.vue';

const { theme, params, frontmatter } = useData();

const section = computed(() => frontmatter.value.section as string | undefined);

const currentPage = computed(() => {
    const p = params.value?.page;
    return p ? Number(p) : 1;
});

const posts = computed(() => {
    if (section.value === 'dev') return theme.value.devPosts;
    if (section.value === 'life') return theme.value.lifePosts;
    return theme.value.posts;
});

const pageConfig = computed(() => {
    if (section.value === 'dev') return theme.value.devPage;
    if (section.value === 'life') return theme.value.lifePage;
    return theme.value.page;
});

const perPage = computed(() => pageConfig.value.size);
const pagesTotal = computed(() => pageConfig.value.pagesTotal);

const currentPosts = computed(() => {
    const start = (currentPage.value - 1) * perPage.value;
    return posts.value.slice(start, start + perPage.value);
});

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
