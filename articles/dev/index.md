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
import Page from "./../../.vitepress/theme/components/page/Page.vue";
import { useData } from "vitepress";

const { theme } = useData();

const perPage = theme.value.devPage.size
const pagesTotal = theme.value.devPage.pagesTotal;
const currentPosts = theme.value.devPosts.slice(0, perPage)
</script>
<Page :posts="currentPosts" :pageCurrent="1" :pagesNum="pagesTotal" pageBase="/dev/page/" />
