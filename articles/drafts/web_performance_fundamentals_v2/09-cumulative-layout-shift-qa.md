---
title: 'CLS 的邊界情況：哪些元素計入、viewport 範圍與 iframe 的處理'
description: '補充說明 CLS 計算的邊界情況，包含哪些元素計入影響範圍、viewport 與捲動的關係、75th percentile 的收集方式，以及 Canvas、Skeleton、iframe 的處理邏輯。'
date: 2026-07-20
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 9
chapter: 'Core Web Vitals & Others Performance Metrics'
tags:
  - frontendMasters
  - webPerformanceFundamentals
  - CLS
  - CoreWebVitals
---

# CLS 的邊界情況：哪些元素計入、viewport 範圍與 iframe 的處理

> [[08-cumulative-layout-shift|上一篇]]介紹了 CLS 的基本定義與分數計算公式（影響比例 × 距離比例）。本篇延續這個主題，說明哪些元素會被納入計算、哪些不會，以及 CLS 分數在現實中如何被收集與彙整。

## 哪些元素算進「影響範圍」

以課程範例來說，頁面頂端有一個固定的 header，下方有一個促銷橫幅在載入時插入。重新載入頁面後，header 的位置完全沒有改變，只有橫幅本身以及它下方被推動的所有內容發生了移動。

**CLS 只計算實際移動的元素**，沒有移動的 header 不算在影響範圍內，這就是為什麼計算時把 header 排除在外。

## CLS 與 viewport 的關係

CLS 的計算範圍是使用者當前可見的 viewport，而不是整個頁面。這帶出幾個重要的隱含意義：

- 如果使用者在頁面還在載入時向下捲動，而這時 viewport 範圍內有元素發生位移，這就是一次新的 layout shift，會被計入 CLS。
- 你無法預測使用者的 viewport 在哪裡，因此講師建議盡量讓 viewport 以外的區域也避免發生位移。

## CLS 不是一個固定的數字

這是一個容易被誤解的地方。講師明確指出，CLS（以及 LCP）都不是你去跑一次報告就能得到的單一確定數字。每個使用者造訪時的裝置、網路狀況、互動行為都不同，每次造訪會產生一個獨立的分數。

Google 實際用於搜尋排名的是所有分數的 **75th percentile（第 75 百分位數）**，也就是說，在所有收集到的分數中，75% 的使用者得到的分數要比這個數字更好。統計學相關的細節課程後段會進一步說明。

## 伺服器端渲染能解決 CLS 嗎

不一定。客戶端渲染確實是 layout shift 的常見來源（非同步渲染的內容容易在不確定的時機插入頁面），但即使使用伺服器端渲染，只要有圖片在載入時沒有預先指定尺寸，瀏覽器就需要在圖片載入完成後才能知道它的大小，並在插入時推動周邊內容，同樣造成 layout shift。

## 各種元素的邊界情況

### Canvas

CLS 只看 DOM 元素的尺寸與位置，不會看 Canvas 內部的繪製內容。如果一個 Canvas 元素本身是固定的 200×200 像素，Canvas 裡面的動畫或變化不影響 CLS。但如果 Canvas 在建立時沒有在 layout 中預留空間，插入後同樣會推動周邊元素，觸發 layout shift。

### Skeleton / Placeholder

Skeleton（佔位框架）是防止 layout shift 的正確做法：先在 layout 中保留目標元素的位置與尺寸，等內容載入完成後替換進去，周邊內容不需要移動，就不會產生分數。**Layout shift 的根本原因就是沒有預留空間，直接把新元素塞進去，導致周邊內容被迫重新排列。**

### iframe

iframe 本身如果在插入時尺寸未預先指定（例如 lazy load 後尺寸才確定），會觸發 layout shift。但 iframe 內部的內容如果發生位移，不會「冒泡」到外層頁面，不計入外層的 CLS。

## 複習

### 什麼決定了一個 DOM 元素是否計入 CLS 分數？

CLS 以 DOM 元素的大小與位置為基準。如果元素在沒有預留空間的情況下改變了尺寸或位置，就會計入版面位移分數。沒有移動、或已預先保留空間的元素則不影響 CLS。

### Google 如何計算一個網站的整體 CLS 分數？

Google 使用從不同使用者、裝置與網路環境收集到的所有 CLS 分數的第 75 百分位數。這不是一個單一的確定數字，而是來自無數次使用者造訪與互動的大量分數彙整結果。

### 開發者如何防止版面位移？

開發者可以透過以下方式防止版面位移：
1. 為動態載入的內容使用 skeleton 或 placeholder 預留空間
2. 為圖片與 iframe 指定初始尺寸
3. 確保使用者開始互動前，相關內容已載入完成
4. 盡量減少非同步渲染頁面元素

### 哪些頁面變化不影響 CLS 分數？

Canvas 內部的繪製變化不影響 CLS。如果 iframe 的外部尺寸維持不變，iframe 內部的版面位移也不計入。載入過程中完全未移動的元素（例如範例中的 header）同樣不計入影響範圍。

### 版面位移與使用者 viewport 和互動有什麼關係？

版面位移只在使用者當前可見的 viewport 範圍內計算。如果使用者在頁面仍在載入時捲動，且 viewport 內有元素發生位移，就會產生新的 CLS 分數，進而影響整體效能指標。

## 小測驗

<details>
<summary>什麼決定了一個 DOM 元素是否計入 CLS 的計算？</summary>
該 DOM 元素在頁面載入過程中是否移動或改變尺寸
</details>

<details>
<summary>Google 如何計算 CLS 等指標的整體效能分數？</summary>
使用來自多次使用者體驗的收集分數中的第 75 百分位數
</details>

<details>
<summary>載入動態內容時，如何防止版面位移？</summary>
使用 skeleton 或 placeholder 預留目標空間
</details>

<details>
<summary>CLS 如何處理 Canvas 元素內部的變化？</summary>
CLS 只考量 Canvas 元素本身的整體尺寸，不追蹤其內部變化
</details>

<details>
<summary>什麼情況會觸發版面位移？</summary>
在沒有預留空間的情況下插入新元素，導致周邊元素被迫重新排列
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記