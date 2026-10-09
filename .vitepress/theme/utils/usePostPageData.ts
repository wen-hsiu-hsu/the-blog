import { computed } from 'vue';
import { useData } from 'vitepress';
import type { PostPageData } from '../postPageData';

// 讀取 config.mts transformPageData 注入 pageData 的文章資料
export function usePostPageData() {
    const { page } = useData();
    return computed(() => page.value as typeof page.value & PostPageData);
}
