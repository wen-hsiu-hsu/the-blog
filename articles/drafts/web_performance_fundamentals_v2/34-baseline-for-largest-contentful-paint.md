---
title: '改善 LCP：問題分析與三個策略'
description: '說明 LCP 的三個組成部分（資源延遲、資源時長、渲染延遲），並介紹後續改善的三個策略方向。'
date: 2026-08-01
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 34
chapter: 'Improving Largest Contentful Paint'
tags:
  - frontendMasters
  - webPerformanceFundamentals
  - LCP
  - CoreWebVitals
---

# 改善 LCP：問題分析與三個策略

## LCP 的三個組成部分

LCP 的時間可以拆解成三段：

**資源延遲（Resource Delay）**：從頁面開始到瀏覽器能夠開始下載 LCP 資源之間的等待時間。這段時間受到 TTFB 和 FCP 的影響，前幾篇的優化工作主要就是在縮短這段延遲。

**資源時長（Resource Duration）**：實際下載 LCP 資源所需的時間。這是本篇接下來要重點處理的部分。

**渲染延遲（Render Delay）**：資源已下載完成，但因為過多的 JavaScript 阻塞主執行緒，導致瀏覽器無法即時繪製畫面。講師說明這在絕大多數情況下不是主要問題，只有使用大量 JavaScript 的網站才需要特別關注。

## LCP 通常是圖片

十次有九次，LCP 元素是一張圖片。偶爾是影片，極少數情況是文字元素。因此，改善圖片的載入效率是改善 LCP 最直接有效的方法。

## 改善 LCP 的三個策略

**1. 延遲載入（Lazy Loading）**：對不在初始 viewport 內的圖片使用 lazy loading，讓瀏覽器把頻寬優先留給真正需要的資源。

**2. 積極載入（Eager Loading）**：針對 LCP 元素本身，確保瀏覽器盡快開始下載它，不要讓它被其他資源排擠。

**3. 圖片優化（Image Optimization）**：縮減 LCP 圖片的檔案大小與格式，讓下載本身更快完成。

後續幾篇將依序介紹這三個策略的具體做法。在開始之前，講師也提醒：先確認你的 LCP 是否真的需要改善。如果你的 CrUX 或 RUM 資料顯示 LCP 已在 2.5 秒以內，可能不需要特別處理，把時間留給其他更差的指標。

## 複習

### LCP（最大內容繪製）的三個主要組成部分是什麼？

資源延遲（resource delay）、資源時長（resource duration）與渲染延遲（render delay）

### LCP 元素通常是哪種類型的資源？

圖片或影片，十次有九次是圖片

### 良好 LCP 效能的建議門檻是多少？

低於 2.5 秒

### 改善 LCP 的三個主要策略是什麼？

延遲載入（lazy loading）、積極載入（eager loading）與圖片優化（image optimization）

### 什麼通常會造成 LCP 的渲染延遲？

大量的 JavaScript 阻塞主執行緒，導致無法及時觸發渲染事件

## 小測驗

<details>
<summary>LCP（最大內容繪製）主要量測什麼？</summary>
網頁上最重要的視覺元素載入所需的時間
</details>

<details>
<summary>哪種資源最常成為 LCP 元素？</summary>
圖片
</details>

<details>
<summary>LCP 可以拆解成哪三個部分？</summary>
資源延遲、資源時長與渲染延遲
</details>

<details>
<summary>什麼樣的 LCP 數值算是良好？</summary>
低於 2.5 秒
</details>

<details>
<summary>哪些技術有助於改善 LCP？</summary>
延遲載入、積極載入與圖片優化
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記