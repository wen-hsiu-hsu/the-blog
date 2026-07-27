---
title: '效能測試工具：Chrome Performance'
description: '介紹 Chrome Performance 面板的操作方式，說明如何使用瀑布圖與火焰圖定位載入瓶頸，以及 render blocking 資源與資源請求阻塞的識別方法。'
date: 2026-07-26
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 21
chapter: 'Testing & Tools'
tags:
  - frontendMasters
  - webPerformanceFundamentals
  - DevTools
  - WaterfallChart
  - FlameChart
---

# 效能測試工具：Chrome Performance 

## Performance 面板的整體結構

從 Lighthouse 報告點擊「View Trace」，或直接在 DevTools 切換到 Performance 分頁，就會進入這個介面。

第一印象可能很壓迫：大量資料擠在一個畫面上，從 0 到數十秒的完整時間軸、密密麻麻的色塊。講師建議先釐清你想回答的問題，再有方向地縮放到對應的時間區段，而不是試圖一次讀懂所有東西。

## 縮放與導航

時間軸左右兩側有可拖曳的控制點，可以框選特定時間範圍放大檢視。也可以直接在時間軸上拖曳選取範圍。

若把焦點移到圖表區域，可以用 **WASD** 鍵導航，就像第一人稱射擊遊戲一樣：A/D 左右移動，W/S 放大縮小。這是在大量效能資料中快速定位的實用技巧。

## 在瀑布圖中找出問題

講師以課程範例網站的載入過程為例，整個載入時間長達 45 秒，LCP 在測試期間甚至還沒觸發。

縮放到 FCP 發生的時間點附近，可以看到瀑布圖呈現幾個值得注意的現象：

**圖片請求被阻塞（Blocking）**：有一個圖片請求的起始線一路延伸回去，代表它在 queue 中等待了 3.3 秒才開始下載，完全沒有進行任何傳輸。

**Render blocking 資源（紅色角標）**：CSS 檔案旁邊出現小紅三角標記，代表這些資源是 render blocking，瀏覽器必須先完成這些資源的下載與解析才能繪製畫面。三個 CSS 檔案同時下載，旁邊還有字型也在開始載入。

## 瀑布圖與火焰圖的時間尺度差異

瀑布圖呈現的是**網路請求層次**的時間，以數十到數百毫秒為單位，適合觀察資源下載的順序與時長。

火焰圖呈現的是**CPU 執行層次**的時間，需要縮放到更細的尺度才能看出細節。講師示範縮放到某個 CSS 檔案剛完成下載的時刻，火焰圖才逐漸顯現出具體的任務堆疊：

- 解析樣式表（Parse Stylesheet）
- 遇到 JavaScript，進入 Evaluate Script 與 Compile
- 編譯導致渲染短暫停頓
- 繼續解析 HTML，又遇到更多 JavaScript，再次執行

這些細節讓你能追蹤到「是哪一段操作造成了渲染延遲」，是 Lighthouse 這類高層次工具看不到的東西。

## Network 面板

Network 面板提供比 Performance 面板頂部的瀑布更簡化的網路請求視圖，列出所有資源請求及其對應的瀑布條，但沒有 CPU 層次的細節。適合快速掌握哪些資源最大、最慢，不需要深入到執行細節時使用。

## 複習

### 瀑布圖與火焰圖在網頁效能分析中的主要用途是什麼？

提供頁面載入效能的全面視圖，在不同細緻程度下呈現網路請求、資源載入、CSS 解析、JavaScript 執行與渲染過程的詳細時序。

### Performance 面板瀑布圖中的紅色角標代表什麼？

Render blocking 資源，即阻止畫面繪製的高優先級項目，通常是 CSS 檔案。

### 如何在 Performance 面板中導航與縮放？

使用時間軸上的控制把手、拖曳選取範圍、上下捲動，或使用 WASD 按鍵，就像在玩第一人稱射擊遊戲一樣。

### 火焰圖與瀑布圖通常呈現哪些不同的時間尺度？

瀑布圖通常以毫秒為單位（10-100ms）呈現網路請求，火焰圖則可以縮放到非常小的處理時間範圍，顯示任務執行的詳細細節。

### 深入 Performance 面板可以分析哪些效能面向？

網路請求、資源載入時間、CSS 解析、JavaScript 執行、腳本編譯、HTML 解析，以及頁面載入過程中任務的執行順序。

## 小測驗

<details>
<summary>Performance 面板中用來分析頁面載入的兩個主要圖表是什麼？</summary>
瀑布圖與火焰圖
</details>

<details>
<summary>Performance 面板瀑布圖中的紅色角標代表什麼？</summary>
Render blocking 資源
</details>

<details>
<summary>網路請求的典型時間範圍是多少？</summary>
數毫秒，通常在 10 至 100 毫秒之間
</details>

<details>
<summary>如何在 Performance 面板中導航與縮放？</summary>
使用 WASD 按鍵與捲動
</details>

<details>
<summary>根據課程內容，大多數網頁效能問題通常由什麼造成？</summary>
Layout、HTML、圖片與資源載入順序
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記