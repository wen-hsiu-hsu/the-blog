<template>
    <div :style="{ width: sidebarWidth }" class="relative" ref="refSidebarContainer">
        <div
            :class="[sideBarClass]"
            :style="{
                width: sidebarWidth,
                left: mdAndLarger ? `${sidebarX}px` : 'auto',
                top: mdAndLarger ? `${sidebarY + windowY}px` : 'auto',
            }"
        >
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    useElementBounding,
    useWindowScroll,
    breakpointsTailwind,
    useBreakpoints,
    watchThrottled,
} from '@vueuse/core';
import { ref, computed, nextTick } from 'vue';
const props = defineProps({
    width: {
        type: [String, Number],
        default: 250,
    },
});

const breakpoints = useBreakpoints(breakpointsTailwind, { ssrWidth: 768 });

const mdAndLarger = breakpoints.greaterOrEqual('md'); // sm and larger

const sidebarWidth = computed(() => {
    const width = Number(props.width);
    return mdAndLarger.value ? `${width}px` : '100%';
});

const refSidebarContainer = ref(null);
const { y: sidebarY, x: sidebarX } = useElementBounding(refSidebarContainer);
const { y: windowY } = useWindowScroll();

const sideBarClass = ref('');
watchThrottled(
    mdAndLarger,
    async () => {
        await nextTick();
        sideBarClass.value = mdAndLarger.value ? 'custom-sidebar' : '';
    },
    { throttle: 100, immediate: true },
);
</script>

<style scoped>
.custom-sidebar {
    position: fixed;
    bottom: 0;
    z-index: 30;
    background-color: transparent;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
}
</style>
