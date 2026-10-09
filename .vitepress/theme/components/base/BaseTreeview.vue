<template>
    <li>
        <div v-if="isFolder" class="cursor-pointer" @click="toggle">
            <span class="flex items-center font-medium">
                <BaseIcon
                    :icon="isOpen ? 'mynaui/chevron-down' : 'mynaui/chevron-right'"
                    size="size-3.5"
                    class="mr-1.5"
                />
                {{ model.text }}
                <span
                    class="ml-1.5 !text-xs text-neutral-500 dark:text-neutral-400"
                    v-if="model.items"
                >
                    ({{ count ?? model.items.length }})
                </span>
            </span>
        </div>
        <a
            v-else
            :href="model.link"
            class="py-1 flex items-start hover:text-[var(--bt-theme-title)] gap-1 ml-1"
        >
            <BaseIcon
                v-if="model.rel === 'pinned'"
                icon="mynaui/pin"
                size="size-3"
                class="!text-[var(--bt-theme-title)] mt-1.5"
            />
            <span class="flex-1 line-clamp-2 text-sm">{{ model.text }}</span>
        </a>
        <ul
            v-if="isFolder && isOpen"
            class="!list-none !pl-3 border-l border-l-neutral-100 dark:border-l-neutral-800 !ml-1 !mt-1 !mb-1"
        >
            <li v-if="loading" class="py-1 ml-1 text-sm text-neutral-500 dark:text-neutral-400">
                {{ theme.text.loading }}
            </li>
            <BaseTreeview class="item" v-for="item in model.items" :model="item" :key="item.text" />
        </ul>
    </li>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useData } from 'vitepress';
import type { DefaultTheme } from 'vitepress/theme';

const props = defineProps<{
    model: DefaultTheme.SidebarItem;
    // 子項目延後載入時：count 顯示總數，loading 時展開後顯示載入中
    count?: number;
    loading?: boolean;
}>();

const emit = defineEmits<{ open: [] }>();

const { theme } = useData();
const isOpen = ref(false);
const isFolder = computed(() => {
    return Array.isArray(props.model.items) && (props.model.items.length > 0 || props.count);
});

function toggle() {
    isOpen.value = !isOpen.value;
    if (isOpen.value) emit('open');
}
</script>
