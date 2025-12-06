---
page: true
title: 首頁
aside: false
lastUpdated: false
home: true
publish: false
---

<script setup>
import Page from "./../../.vitepress/theme/components/page/Page.vue";
import { useData } from "vitepress";

const { theme, params } = useData();

const perPage = theme.value.page.size
const currentPage = Number(params.value.page)
const pagesTotal = theme.value.page.pagesTotal;
const currentPosts = theme.value.posts.slice((currentPage - 1) * perPage - 1,(currentPage) * perPage - 1)
</script>
<Page :posts="currentPosts" :pageCurrent="currentPage" :pagesNum="pagesTotal" />
