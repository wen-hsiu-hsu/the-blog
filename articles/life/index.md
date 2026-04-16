---
page: true
title: Life
aside: false
lastUpdated: false
home: true
publish: false
section: life
---

<script setup>
import Page from "./../../.vitepress/theme/components/page/Page.vue";
import { useData } from "vitepress";

const { theme } = useData();

const perPage = theme.value.lifePage.size
const pagesTotal = theme.value.lifePage.pagesTotal;
const currentPosts = theme.value.lifePosts.slice(0, perPage)
</script>
<Page :posts="currentPosts" :pageCurrent="1" :pagesNum="pagesTotal" pageBase="/life/page/" />
