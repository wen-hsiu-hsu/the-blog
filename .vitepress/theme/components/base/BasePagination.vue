<template>
    <div class="mt-4 flex justify-center items-center gap-2">
        <template v-for="(pageData, index) in paginationLinks" :key="`${index}-${pageData.text}`">
            <a
                v-if="pageData.href"
                :class="[
                    paginationLinkBaseClass,
                    pageData.active &&
                        '!bg-[var(--vp-c-text-1)] !text-[var(--vp-c-neutral-inverse)]',
                ]"
                :href="pageData.href"
            >
                {{ pageData.text }}
            </a>
            <span v-else :class="[paginationLinkBaseClass]">{{ pageData.text }}</span>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { withBase } from 'vitepress';
import { getPaginationLink } from '../../utils/pagination';
import { PropType, computed } from 'vue';

const props = defineProps({
    pageCurrent: {
        type: Number as PropType<number>,
        required: true,
    },
    pagesNum: {
        type: Number as PropType<number>,
        required: true,
    },
    pageBase: {
        type: String as PropType<string>,
        default: '/page/',
    },
    visibleRange: {
        type: Number as PropType<number>,
        default: 3,
    },
});

const paginationLinkBaseClass = 'link size-6 text-center rounded-full justify-center items-center';

const paginationLinks = computed(() => {
    const minPage = Math.max(props.pageCurrent - props.visibleRange, 1);
    const maxPage = Math.min(props.pageCurrent + props.visibleRange, props.pagesNum);

    const pages = range(minPage, maxPage).map((page) => {
        return {
            text: page,
            href: withBase(getPaginationLink(page, props.pageBase)),
            active: page === props.pageCurrent,
        };
    });

    return [
        ...(pages[0].text == 1
            ? []
            : [
                  {
                      text: 1,
                      href: withBase(getPaginationLink(1, props.pageBase)),
                      active: false,
                  },
                  {
                      text: '...',
                      href: '',
                      active: false,
                  },
              ]),
        ...pages,
        ...(pages[pages.length - 1].text == props.pagesNum
            ? []
            : [
                  {
                      text: '...',
                      href: '',
                      active: false,
                  },
                  {
                      text: props.pagesNum,
                      href: withBase(getPaginationLink(props.pagesNum, props.pageBase)),
                      active: false,
                  },
              ]),
    ];
});

function range(start: number, end: number): number[] {
    const result = [];
    for (let i = start; i <= end; i++) {
        result.push(i);
    }
    return result;
}
</script>
