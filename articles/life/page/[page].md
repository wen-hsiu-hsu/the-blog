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
import Page from "./../../../.vitepress/theme/components/page/Page.vue";
import { useData } from "vitepress";

const { theme, params } = useData();

const perPage = theme.value.lifePage.size
const currentPage = Number(params.value.page)
const pagesTotal = theme.value.lifePage.pagesTotal;
const currentPosts = theme.value.lifePosts.slice((currentPage - 1) * perPage, currentPage * perPage)
</script>
<Page :posts="currentPosts" :pageCurrent="currentPage" :pagesNum="pagesTotal" pageBase="/life/page/" />
