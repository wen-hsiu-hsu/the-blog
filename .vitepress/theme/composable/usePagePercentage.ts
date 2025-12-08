import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useWindowSize, useWindowScroll, useElementBounding } from '@vueuse/core';

export default function usePagePercentage() {
    const { height: windowHeight } = useWindowSize();
    const { y: windowScrollY } = useWindowScroll();

    const contentHeight = ref(0);
    const contentOffsetTop = ref(0);

    function updateContentRelated() {
        const elContent = document.querySelector('.vp-doc') || null;
        if (elContent === null) {
            contentHeight.value = 0;
            contentOffsetTop.value = 0;
            return;
        }
        const rect = elContent.getBoundingClientRect();
        contentHeight.value = rect.height;
        contentOffsetTop.value = rect.top + windowScrollY.value;
    }

    onMounted(() => {
        updateContentRelated();
        window.addEventListener('scroll', updateContentRelated);
        window.addEventListener('resize', updateContentRelated);
    });

    onUnmounted(() => {
        window.removeEventListener('scroll', updateContentRelated);
        window.removeEventListener('resize', updateContentRelated);
    });

    const percentage = computed(() => {
        return Math.min(
            Math.round(
                (windowScrollY.value /
                    (contentHeight.value + contentOffsetTop.value - windowHeight.value)) *
                    100,
            ),
            100,
        );
        return 0;
    });

    const hasDone = computed(() => percentage.value === 100);

    return { percentage, hasDone };
}
