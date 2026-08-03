---
title: '改善 TTFB：伺服器容量、地理位置與 CDN'
description: '說明如何透過調整伺服器回應時間、縮短網路距離與部署 CDN，將 TTFB 從 1.775 秒降至 0.02 秒，以及四項改善策略的綜合效果。'
date: 2026-07-30
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 30
chapter: 'Improving Time to First Byte'
tags:
    - frontendMasters
    - webPerformanceFundamentals
    - HTTP
    - NetworkPanel
---

# 改善 TTFB：伺服器容量、地理位置與 CDN

## 調整伺服器容量

講師在範例網站中加入了一個人工延遲：伺服器每次回應都強制等待 1 秒，模擬真實系統在執行資料庫查詢或 API 呼叫時可能遇到的狀況。

調整之前，瀑布圖中幾乎所有請求都超過 1 秒。把延遲從 1,000 毫秒改為 50 毫秒後，TTFB 降至 0.21 秒，同時 FCP 也進入良好範圍。這個改動不涉及任何前端程式碼，只是讓伺服器更快回應。

講師以 Request Metrics 自家的 web server 為例，平均回應時間約 30 毫秒。對於多數應用程式，50 毫秒是一個合理的參考目標。

## 網路距離與速度上限

範例網站的伺服器在阿姆斯特丹，而講師位於明尼亞波利斯。根據 Wonder Network 的數據，這兩地之間的網路延遲是 117 毫秒，這代表無論做任何優化，每一次請求都至少要付出 117 毫秒的時間代價，這是由物理距離決定的速度上限。

如果使用者在澳洲，情況更糟：到美國伺服器的延遲約 700 毫秒，這也是為什麼許多美國網站在澳洲顯得特別慢。

## CDN：把內容搬到使用者附近

解決網路距離問題的方式是 CDN（Content Delivery Network，內容交付網路）。CDN 在全球各地部署邊緣節點，把內容的副本存放在離使用者最近的位置。

第一次請求時，CDN 邊緣節點沒有快取，仍需要回到原始伺服器取得內容，這次請求一樣慢。但之後的請求就可以直接從邊緣節點回應，不再需要跨越大西洋。

講師使用 BunnyCDN 進行示範：

- 第一次請求：308 毫秒（快取未命中，必須回到阿姆斯特丹）
- 第二次請求：63 毫秒（從美國境內的邊緣節點直接回應）

Response header 中 CDN 的欄位會明確說明這次是 cache miss 還是 cache hit，也會顯示邊緣節點的位置。

## 四項改善的綜合效果

把壓縮、HTTP/3、伺服器容量調整與 CDN 全部啟用後，在相同的 Coffee Shop WiFi 節流與 6 倍 CPU 節流條件下重新測試，TTFB 降至 **0.02 秒**，LCP 與 FCP 也同時進入綠色範圍，而這些改動完全沒有更動任何 HTML、JavaScript 或圖片。

講師特別點出這件事：許多效能改善不需要改程式碼，只需要調整架構與部署方式。

## 複習

### 改善 TTFB 的四個關鍵策略是什麼？

1. 使用 Gzip 與 Brotli 壓縮回應內容
2. 採用更有效率、溝通次數更少的網路協議
3. 適當調整伺服器容量
4. 透過 CDN 將主機端點移至更靠近使用者的位置

### 網路延遲如何影響不同地區的網站效能？

網路延遲取決於伺服器與使用者之間的距離。跨越大洋或大陸會帶來可觀的延遲，例如明尼亞波利斯到阿姆斯特丹約 117 毫秒，澳洲到美國伺服器甚至可達 700 毫秒。

### 什麼是 CDN，它如何改善效能？

CDN 將網站內容分散部署在全球多個區域伺服器上。第一次請求時，CDN 會向原始伺服器取得內容，但後續請求可以直接從最近的邊緣節點回應，大幅降低網路延遲。

### 資料從主機傳輸到使用者的過程中，會經過哪些網路節點？

資料會先通過主機所在的區域網路與資料中心，進入主幹網路後跨越洲際線路，再進入使用者附近的區域網路，最後透過「最後一哩」抵達使用者裝置。

### 伺服器容量為什麼對網站效能很重要？

適當的伺服器容量確保伺服器能快速處理請求，縮短回應時間。容量不足的伺服器會造成人工延遲，而配置合理的伺服器則能顯著改善 TTFB 與整體頁面載入效能。

## 小測驗

<details>
<summary>使用 CDN 的主要目的是什麼？</summary>
將網站內容分散部署在更靠近使用者的多個區域伺服器上
</details>

<details>
<summary>影響 TTFB 的關鍵因素有哪些？</summary>
伺服器容量、網路距離、協議效率與資料壓縮
</details>

<details>
<summary>伺服器的地理位置為什麼對網頁效能很重要？</summary>
伺服器與使用者之間的網路節點愈多，延遲愈高
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記
