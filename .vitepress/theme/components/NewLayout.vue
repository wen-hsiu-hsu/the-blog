<template>
    <Layout :class="{ 'section-life': isLifeSection }">
        <template #doc-before>
            <PostMeta />
        </template>

        <template #doc-after>
            <div v-if="!frontmatter.page" class="space-y-20 pt-10">
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
</template>

<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import Copyright from './layout/Copyright.vue';
import PostReadingProgressIndicator from './layout/PostReadingProgressIndicator.vue';
import PostNextPrevLinks from './layout/PostNextPrevLinks.vue';
import PostComment from './layout/PostComment.vue';
import PostSuggestions from './layout/PostSuggestions.vue';
import PostMeta from './layout/PostMeta.vue';
import PostSupports from './layout/PostSupports.vue';
import NotFoundPage from './page/NotFoundPage.vue';
import BaseAdUnit from './base/BaseAdUnit.vue';
import { useRoute, useData } from 'vitepress';
import { computed, watchEffect } from 'vue';

const { Layout } = DefaultTheme;
const route = useRoute();
const { frontmatter, theme, isDark } = useData();

const isLifeSection = computed(() => route.path.startsWith('/life'));

watchEffect(() => {
    isDark.value = !isLifeSection.value;
});
</script>
