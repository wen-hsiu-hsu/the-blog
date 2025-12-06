---
page: true
title: 首頁
aside: false
lastUpdated: false
home: true
publish: false
---

<script setup>
import Page from "./../.vitepress/theme/components/page/Page.vue";
import { useData } from "vitepress";

const { theme } = useData();

const perPage = theme.value.page.size
const pagesTotal = theme.value.page.pagesTotal;
const currentPosts = theme.value.posts.slice(0,perPage)
</script>
<Page :posts="currentPosts" :pageCurrent="1" :pagesNum="pagesTotal" />
