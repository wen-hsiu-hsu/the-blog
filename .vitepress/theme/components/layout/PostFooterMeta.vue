<template>
    <div>
        <div v-if="!frontmatter.page" class="-mx-2">
            <BaseTag
                v-for="item in frontmatter.tags"
                :href="withBase(`/pages/tags.html?tag=${item}`)"
                :text="item"
                :key="item"
                font-size="text-3"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { data as readingTimeData } from './../../utils/reading-time.data.ts';
import { computed } from 'vue';
import { withBase, useRoute, useData } from 'vitepress';

const route = useRoute();
const { frontmatter, theme } = useData();
</script>
