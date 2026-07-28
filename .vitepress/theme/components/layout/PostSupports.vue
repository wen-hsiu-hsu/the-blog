<template>
    <div>
        <div class="flex gap-8" v-if="!frontmatter.page">
            <img :src="theme.author.avatar" class="size-15 rounded-full" />
            <a href="https://www.buymeacoffee.com/hsiu" target="_blank">
                <img
                    src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                    alt="Buy Me A Coffee"
                    loading="lazy"
                    style="height: 60px !important; width: 217px !important"
                />
            </a>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useData } from 'vitepress';

const { theme, frontmatter } = useData();
</script>
