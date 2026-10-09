<template>
    <div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4" v-if="nav">
            <BaseButton
                v-if="hasPrev"
                class="flex flex-col items-center justify-center gap-1"
                padding="py-4 px-4"
                :href="prevPost!.regularPath"
            >
                <span class="flex items-center gap-2">
                    <BaseIcon icon="mynaui/chevron-left" />
                    <span>{{ isSeriesPost ? '上一章' : '上一篇' }}</span>
                </span>
                <span class="line-clamp-1">{{ prevPost!.frontMatter.title }}</span>
            </BaseButton>
            <p v-else class="text-center flex items-center justify-center gap-2">
                <BaseIcon icon="mynaui/confetti" size="size-6" />
                <span>{{ isSeriesPost ? '已經是第一章了' : '你已經閱讀到最後一篇文章了' }}</span>
            </p>
            <BaseButton
                v-if="hasNext"
                class="flex flex-col items-center justify-center gap-1"
                padding="py-3 px-4"
                :href="nextPost!.regularPath"
            >
                <span class="flex items-center gap-2">
                    <span>{{ isSeriesPost ? '下一章' : '下一篇' }}</span>
                    <BaseIcon icon="mynaui/chevron-right" />
                </span>
                <span class="line-clamp-1">
                    {{ nextPost!.frontMatter.title }}
                </span>
            </BaseButton>
            <p v-else class="text-center flex items-center justify-center gap-2">
                <BaseIcon icon="mynaui/confetti" size="size-6" />
                <span>{{ isSeriesPost ? '已經是最新一章了' : '你已經閱讀到最新的文章了' }}</span>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePostPageData } from '../../utils/usePostPageData';

const postData = usePostPageData();

const nav = computed(() => postData.value.postNav);
const isSeriesPost = computed(() => !!nav.value?.isSeries);

const prevPost = computed(() => nav.value?.prev ?? null);
const nextPost = computed(() => nav.value?.next ?? null);
const hasPrev = computed(() => !!prevPost.value);
const hasNext = computed(() => !!nextPost.value);
</script>
