<template>
    <div class="mt-4 -mx-2">
        <div class="flex flex-wrap">
            <BaseTag
                v-for="(_, key) in data"
                @click="toggleTag(String(key))"
                :text="key"
                :key="key"
                :sup="data[key].length"
                font-size="text-3 md:text-4"
                :class="[selectTag === key && '!bg-[var(--vp-c-bg)] font-bold pointer-events-none']"
            />
        </div>
    </div>
    <div class="pt-7 pb-2.5 text-lg text-[var(--bt-theme-title)] font-bold">{{ selectTag }}</div>
    <a
        :href="withBase(article.regularPath)"
        v-for="(article, index) in selectTag ? data[selectTag] : []"
        :key="index"
        class="pb-1 mb-1 md:pb-2 md:mb-2 flex justify-between items-center text-[var(--vp-c-text-1)] hover:text-[var(--vp-c-brand)] border-b border-b-[var(--vp-c-gray-soft)] hover:underline"
    >
        <span class="block line-clamp-1">
            <span
                class="inline-block mr-1 md:mr-2.5 mb-1 size-1 rounded-full bg-[var(--li-dot-color)]"
            ></span>
            {{ article.frontMatter.title }}
        </span>
        <span class="!text-3 !md:text-base text-nowrap">{{ article.frontMatter.date }}</span>
    </a>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import { withBase } from 'vitepress';
import { initTags } from '../../functions';
import { usePostPageData } from '../../utils/usePostPageData';

let url = location.href.split('?')[1];
let params = new URLSearchParams(url);
const postData = usePostPageData();
const data = computed(() => initTags(postData.value.allPosts ?? []));
let selectTag = ref(params.get('tag') ? params.get('tag') : '');
const toggleTag = (tag: string) => {
    selectTag.value = tag;
};
// choose the first key
const defaultDisplayTag = Object.keys(data.value)[0];
if (defaultDisplayTag) {
    toggleTag(defaultDisplayTag);
}
</script>
