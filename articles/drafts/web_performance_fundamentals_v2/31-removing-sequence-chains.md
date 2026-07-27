---
title: '改善 FCP：移除依賴鏈'
description: '說明 CSS 與字型的 render blocking 特性，以及 import 語句如何形成序列依賴鏈，並透過 bundler 在建置時合併資源來改善 FCP。'
date: 2026-07-31
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 31
chapter: 'Improving First Contentful Paint'
tags:
  - frontendMasters
  - webPerformanceFundamentals
  - FCP
  - WaterfallChart
---

# 改善 FCP：移除依賴鏈

## FCP 的現況

在完成 TTFB 的四項改善後，FCP 目前約為 871 毫秒，已經優於 Google 建議的 1.8 秒。但講師認為還有進步空間。

改善 FCP 有三個主要策略：移除序列依賴鏈、預載關鍵資源、延遲載入非關鍵資源。本篇先說明第一個。

## CSS 與字型是 Render Blocking 資源

CSS 和字型在下載完成之前會阻止瀏覽器繪製畫面。這是刻意的設計：如果瀏覽器先繪製再等 CSS，使用者會先看到沒有樣式的內容然後突然改變，更令人不安。

因此，FCP 必須等到所有 render blocking 的 CSS 與字型都下載完成才能觸發。

## 依賴鏈的問題

瀑布圖中有時會看到這樣的模式：一個 CSS 檔案下載完後，才發現裡面有 `@import` 指向另一個 CSS 檔案，於是開始下載第二個，第二個下載完又發現第三個。資源一個接著一個依序載入，而不是並行。

這就是**依賴鏈（dependency chain）**，由 CSS 或 JavaScript 的 import 語句在執行時動態產生。

JavaScript 也有相同的問題，例如：

- ES module 的 `import` 語句
- 舊式的動態腳本注入（在程式執行時建立 `<script>` 元素並插入頁面）

在範例網站中，`style.css` 引入了 `base.css`，`base.css` 又引入了 `colors.css`、`typography.css` 和 `normalize.css`，`typography.css` 再指向 Google Fonts 的外部字型。整個鏈條都完成後，FCP 才能發生。

## 解法：用 Bundler 在建置時合併

解決方式是在**建置階段**預先追蹤並合併這些依賴，讓瀏覽器收到的是一個已經合併好的單一檔案，不需要在執行時動態追蹤。

常見的 bundler 包含 Webpack、Rollup、Vite，講師在範例中使用了 Vite 底層也有使用的 Lightning CSS 來處理 CSS。

合併後，`style.css` 和所有它依賴的 CSS 被打包成一個 `styles.bundle.css`，並在 HTML 中直接引用這個 bundle。這樣瀏覽器就能一次載入所有 CSS，不需要等待序列下載。

示範結果：移除依賴鏈後，CSS bundle 與 Google Fonts 的 CSS 可以同時並行下載，不再有序列等待。不過字型本身（從 `fonts.gstatic.com` 載入的實際字型檔）還是要等 CSS 下載完才能知道需要去取得，這個問題留給下一節的 preload 策略處理。

## 複習

### CSS 與字型在頁面渲染中扮演什麼角色？

CSS 與字型是 render blocking 資源，在完全下載完成之前會阻止頁面渲染，以避免內容在載入過程中突然跳動位移

### CSS 與 JavaScript 檔案中的 import 語句會造成什麼問題？

import 語句會建立依賴鏈，迫使資源依序逐一載入，拖慢頁面渲染速度與 FCP

### 消除 web 資源依賴鏈的推薦做法是什麼？

使用 Webpack、Rollup 或 Vite 等 bundler，在建置時預先合併依賴，避免在執行時才動態解析

### import 語句如何影響頁面載入時的效能？

import 語句讓一個檔案指向另一個檔案，迫使瀏覽器依序下載資源，而非並行處理

### 序列資源載入對 FCP 有什麼影響？

序列載入會延遲 FCP，因為每個被依賴的資源都必須先下載並解析完成，頁面才能開始渲染

## 小測驗

<details>
<summary>CSS 與字型在網頁渲染中被定義為什麼？</summary>
Render blocking 資源
</details>

<details>
<summary>瀏覽器為什麼在載入 CSS 與字型時會阻止渲染？</summary>
為了避免頁面內容在載入過程中突然位移
</details>

<details>
<summary>開發者可以使用什麼技術來消除 web 資源的依賴鏈？</summary>
使用 bundler
</details>

<details>
<summary>什麼造成了 web 資源的依賴鏈？</summary>
CSS 中的 import 語句
</details>

<details>
<summary>打包 web 資源的主要目的是什麼？</summary>
消除執行時期的依賴解析
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記