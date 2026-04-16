---
page: true
title: Dev
aside: false
lastUpdated: false
home: true
publish: false
section: dev
---

<script setup>
import Page from "./../../../.vitepress/theme/components/page/Page.vue";
import { useData } from "vitepress";

const { theme, params } = useData();

const perPage = theme.value.devPage.size
const currentPage = Number(params.value.page)
const pagesTotal = theme.value.devPage.pagesTotal;
const currentPosts = theme.value.devPosts.slice((currentPage - 1) * perPage, currentPage * perPage)
</script>
<Page :posts="currentPosts" :pageCurrent="currentPage" :pagesNum="pagesTotal" pageBase="/dev/page/" />
