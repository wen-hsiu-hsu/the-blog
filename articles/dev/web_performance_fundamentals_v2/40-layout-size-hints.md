---
title: '改善 CLS：版面尺寸提示'
description: '說明 CLS 問題的兩個來源（lazy load 圖片與非同步橫幅），以及透過指定 height/width 屬性與絕對定位，將 CLS 從 2.56 降至接近 0 的做法。'
date: 2026-08-04
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 40
chapter: 'Improving CLS & INP'
tags:
    - frontendMasters
    - webPerformanceFundamentals
    - CLS
    - CoreWebVitals
---

# 改善 CLS：版面尺寸提示

## CLS 問題的兩個來源

範例網站在優化後的 CLS 分數達到 2.56，遠超過 Google 的 0.1 門檻。問題主要來自兩個地方：

**Lazy load 圖片插入造成的位移**：網站 header 中的 logo 圖片與商品格線中的產品圖都設為 lazy load。這些圖片一開始不存在，等到瀏覽器有空才開始下載。當圖片下載完成後插入頁面，周邊元素被迫移動，觸發 layout shift。

**非同步渲染的促銷橫幅**：promo banner 是透過 JavaScript 在頁面載入後動態插入的。它出現的時候，把下方所有內容往下推，影響了幾乎整個 viewport，產生巨大的 CLS 分數。

## 核心策略：告訴瀏覽器元素有多大

改善 CLS 只有一個核心方向：**在元素實際出現之前，預先讓瀏覽器知道它的尺寸**，讓瀏覽器提前保留空間，元素出現時不需要重新排列。

## 修復一：為圖片指定 height 與 width

對所有可能造成 layout shift 的圖片，加上 `height` 和 `width` 屬性：

```html
<img src="logo.png" width="500" height="500" loading="lazy" alt="..." />
```

幾個重要細節：

- **不要加 `px`**：`width="500"` 是正確的，`width="500px"` 在某些瀏覽器中會出問題
- **填實際圖片尺寸，不是顯示尺寸**：瀏覽器拿到這兩個數字後，計算的是寬高比（aspect ratio），再根據實際的 CSS 顯示大小決定保留多大的空間。因此填原始圖片的真實像素尺寸即可
- **重點在比例，不在數字**：瀏覽器只需要知道這張圖片是正方形、橫向還是直向，以及大致的寬高比

講師在示範中對 header logo（500×500）和商品格線圖片（1024×1024）都加上了對應的尺寸屬性。

## 修復二：調整非同步內容的定位方式

對於促銷橫幅這類動態插入的元素，有兩種處理方式：

**方案 A：預留空間**：直接設定元素的固定高度（例如 260px），讓頁面一開始就保留這塊空間。元素載入時不需要推動其他內容，CLS 為零。但缺點是頁面頂部一直有一塊空白，對吸引使用者注意力的效果較差。

**方案 B：絕對定位疊加**：將橫幅設為 `position: absolute`，讓它疊在現有內容上方，而不是插入文件流中。當它出現時，下方的內容完全不受影響，不會被推動，因此不產生 layout shift。

講師選擇方案 B，認為對電商網站來說，促銷橫幅應該搶眼，出現在畫面上方吸引注意力，而不是讓整個頁面靜靜保留一塊空白。

## 最終結果

完成這些修改後，CLS 從 2.56 降至接近 **0**。講師也補充，如果要做得更徹底，應該對頁面上所有圖片都加上 height 和 width，因為你無法預測使用者在頁面的哪個位置、什麼時候會觸發那些 lazy load 圖片的載入。

改善 CLS 的邏輯非常集中，就是一件事：**提前告訴瀏覽器空間要保留多大，或讓元素不影響文件流**。做到這一點，CLS 問題基本就消失了。

## 複習

### 什麼是 CLS，它量測什麼？

CLS（累積版面位移）量測頁面元素在載入過程中的移動程度，反映頁面內容載入時是否流暢且可預期

### 改善 CLS 的主要策略是什麼？

透過指定圖片與元素的高度和寬度來提供版面尺寸提示，讓瀏覽器在內容實際出現之前就預先保留對應的空間

### 為什麼正確指定圖片尺寸很重要？

正確的圖片尺寸能讓瀏覽器預先保留適當的空間，防止圖片載入時發生版面位移，並幫助維持正確的寬高比

### 開發者在指定圖片尺寸時常犯什麼錯誤？

在尺寸數值後面加上 px，這可能導致某些瀏覽器出問題。正確做法是只填入代表圖片實際寬度或高度的數字

### 處理延遲渲染內容的版面位移，有哪兩種策略？

1. 預先設定元素的固定高度，提前保留空間
2. 將元素設為絕對定位，讓它疊加在現有內容上方，不影響周邊元素的排列

## 小測驗

<details>
<summary>CLS（累積版面位移）在網頁效能中量測什麼？</summary>
頁面元素在載入時是否以流暢且可預期的方式出現
</details>

<details>
<summary>開發者如何防止圖片載入時發生版面位移？</summary>
為圖片指定 height 與 width 屬性
</details>

<details>
<summary>處理延遲渲染內容以減少版面位移，推薦的做法是什麼？</summary>
將內容設為絕對定位，疊加在現有元素上方
</details>

<details>
<summary>指定圖片尺寸時，正確的語法是什麼？</summary>
使用原始圖片的數字尺寸，不加 px
</details>

<details>
<summary>改善 CLS 的主要目標是什麼？</summary>
提供版面尺寸提示，防止元素意外移動
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記
