<template>
    <div
        :class="[
            'flex flex-col px-0 gap-1 border-b border-b-neutral-100 dark:border-b-neutral-800 pb-2',
        ]"
    >
        <div class="flex items-center gap-3">
            <!-- <BaseIcon :icon="config.icon" size="size-4" :class="accentText" /> -->
            <h1 class="!my-0 !py-0 !text-3xl font-bold leading-tight">{{ config.title }}</h1>
        </div>
        <div class="flex items-center gap-3">
            <p class="!m-0 !p-0 text-neutral-500 dark:text-neutral-400">
                {{ config.subtitle }}
            </p>
            <span class="text-sm text-neutral-400 dark:text-neutral-500 shrink-0 ml-auto"
                >{{ postsTotal }} 篇</span
            >
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import BaseIcon from '../base/BaseIcon.vue';

const props = defineProps<{
    section?: string;
    postsTotal: number;
}>();

const sectionMap: Record<
    string,
    { title: string; subtitle: string; icon: string; accent: string }
> = {
    dev: {
        title: 'Dev：前端技術與學習筆記',
        subtitle: '技術分享、踩坑紀錄和筆記，不定期更新',
        icon: 'mynaui/terminal',
        accent: 'blue',
    },
    life: {
        title: 'Life：生活日常、旅遊隨筆',
        subtitle: '很少更新，讓我發發牢騷的地方',
        icon: 'mynaui/leaf',
        accent: 'life',
    },
};

const defaultConfig = {
    title: 'Wen-Hsiu 的部落格',
    subtitle: '學習筆記或日常生活記錄，這裡混合 Dev 和 Life 的最新內容',
    icon: 'mynaui/home',
    accent: 'neutral',
};

const config = computed(() => sectionMap[props.section ?? ''] ?? defaultConfig);

const accentText = computed(() => ({
    'text-blue-500': config.value.accent === 'blue',
    'text-[var(--home-life-color)]': config.value.accent === 'life',
    'text-neutral-500': config.value.accent === 'neutral',
}));
</script>
