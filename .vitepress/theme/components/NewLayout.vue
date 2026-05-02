<template>
    <Layout
        :class="{
            'section-life': isLifeSection,
            'section-dev': isDevSection,
            'section-other': isOtherSection,
        }"
    >
        <template #doc-before>
            <PostHeadMeta />
        </template>

        <template #doc-after>
            <div v-if="!frontmatter.page" class="space-y-20 pt-10">
                <PostFooterMeta />
                <PostSupports />
                <div class="space-y-10">
                    <BaseAdUnit />
                    <PostComment />
                    <PostNextPrevLinks />
                </div>
                <PostSuggestions />
            </div>
        </template>
        <template #not-found>
            <NotFoundPage />
        </template>
    </Layout>

    <PostReadingProgressIndicator v-if="!frontmatter.page" />
    <Copyright v-if="!frontmatter.home" />

    <div v-if="bgCredit" class="bg-credit" v-html="bgCredit" />
</template>

<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import Copyright from './layout/Copyright.vue';
import PostReadingProgressIndicator from './layout/PostReadingProgressIndicator.vue';
import PostNextPrevLinks from './layout/PostNextPrevLinks.vue';
import PostComment from './layout/PostComment.vue';
import PostSuggestions from './layout/PostSuggestions.vue';
import PostHeadMeta from './layout/PostHeadMeta.vue';
import PostFooterMeta from './layout/PostFooterMeta.vue';
import PostSupports from './layout/PostSupports.vue';
import NotFoundPage from './page/NotFoundPage.vue';
import BaseAdUnit from './base/BaseAdUnit.vue';
import { useRoute, useData } from 'vitepress';
import { computed } from 'vue';

const { Layout } = DefaultTheme;
const route = useRoute();
const { frontmatter } = useData();

const isLifeSection = computed(() => route.path.startsWith('/life'));
const isDevSection = computed(() => route.path.startsWith('/dev'));
const isOtherSection = computed(() => !isLifeSection.value && !isDevSection.value);

const devCredit =
    'Photo by <a href="https://unsplash.com/@fedechanw?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Federica Galli</a> on <a href="https://unsplash.com/photos/crt-monitor-turned-off-aiqKc07b5PA?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>';
const lifeCredit =
    'Photo by <a href="https://unsplash.com/@rirri01?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Rirri</a> on <a href="https://unsplash.com/photos/white-and-blue-book-on-white-table-fOyNfubusxE?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>';

const otherCredit =
    'Photo by <a href="https://unsplash.com/@aramgrg?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Aram</a> on <a href="https://unsplash.com/photos/leafless-tree-on-snow-covered-ground-2TzpDe_-j6o?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>';

const bgCredit = computed(() => {
    if (isDevSection.value) return devCredit;
    if (isLifeSection.value) return lifeCredit;
    return otherCredit;
});
</script>
