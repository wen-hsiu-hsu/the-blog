---
title: 'Core Web Vitals 與 LCP（最大內容繪製）'
description: '介紹 Google Core Web Vitals 的三項指標概覽，並深入說明 LCP（最大內容繪製）的計算方式、entropy 門檻、動態候選邏輯與 Google 評分標準。'
date: 2026-07-19
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 7
chapter: 'Core Web Vitals & Others Performance Metrics'
tags:
  - frontendMasters
  - webPerformanceFundamentals
  - CoreWebVitals
  - LCP
  - ImageOptimization
---

# Core Web Vitals 與 LCP（最大內容繪製）

> [[06-the-promblem-with-legacy-metrics|上一篇]]說明了 DOMContentLoaded 與 load 事件在客戶端渲染普及後為何失去意義，並提到 Google 因此需要新的效能衡量標準。本篇正式進入 Core Web Vitals，並深入介紹其中第一個指標：LCP。

## Core Web Vitals 是什麼

Core Web Vitals 是 Google 推出的一組效能指標，設計目標是以使用者感知為基準，客觀地衡量網站效能，不受框架或技術選擇影響。它們同時也是 Google 搜尋排名的直接因素。

三個指標分別量測：

| 指標 | 全名                      | 量測的面向                 |
| ---- | ------------------------- | -------------------------- |
| LCP  | Largest Contentful Paint  | 頁面視覺上載入完成的速度   |
| CLS  | Cumulative Layout Shift   | 載入過程的視覺穩定性       |
| INP  | Interaction to Next Paint | 使用者與頁面互動的回應速度 |

本篇聚焦於 LCP。

## LCP：最大內容繪製

LCP 量測的是「頁面上最大的可見元素」完成繪製所需的時間。講師特別強調，這裡用「最大」而非「最重要」，是因為「重要性」無法被客觀定義，且容易被開發者操控。改用像素面積來判斷，是一種開發者難以作弊的客觀標準。

### 哪些元素會被納入計算

LCP 只考慮以下幾種類型的元素：

- 圖片（`<img>`）
- 影片（`<video>`）
- CSS background image
- 包含文字內容的 DOM 元素

### 排除規則

並非所有符合類型的元素都會被納入，以下情況會被排除：

- opacity 為 0 的元素（透明元素不計）
- 尺寸等於整個 viewport 的元素（被視為背景）
- entropy 低於 0.05 的圖片（視覺資訊量不足）

## Entropy（資訊熵）是什麼

Entropy 衡量一張圖片的視覺資料密度，計算方式是：

```
entropy = 圖片未壓縮大小（bytes）/ 渲染像素數
```

講師以課程範例的 hero image 說明：

- 原始 hero image：未壓縮約 3,900 萬位元，渲染尺寸 2800×1200（約 330 萬像素），entropy 約 9.39，符合 LCP 資格
- 模糊佔位圖：未壓縮僅 17 bytes，尺寸 200×88，entropy 約 0.001，**不符合 LCP 資格**

這代表一個常見的效能優化手法（先顯示模糊佔位圖，再用 JS 替換成真實圖片）雖然可以改善使用者感受，但**不會改善 LCP 分數**，因為模糊圖的 entropy 太低，Google 不認定它是有意義的內容。

### 用 JavaScript 計算頁面圖片的 entropy

```javascript
console.table(
  [...document.images].map((img) => {
    const entry = performance.getEntriesByName(img.currentSrc)[0];
    const bytes = (entry?.encodedBodySize * 8);
    const pixels = (img.width * img.height);
    return { src: img.currentSrc, bytes, pixels, entropy: (bytes / pixels) };
  })
)
```

這段程式碼可以列出頁面上所有圖片的 entropy 值。

## LCP 是動態決定的

頁面載入過程中，LCP 的候選元素可能隨時間改變。以範例網站為例，如果 hero 圖片載入緩慢，目前最大的元素可能是某個文字區塊（例如 662×112 像素）；一旦 hero 圖片（1740×640，共約 110 萬像素）載入完成，LCP 就切換到那張圖片。

講師也提到，設計上的決策會影響 LCP 的目標。如果在頁面頂部放置一個佔 80% viewport 的橫幅，那個橫幅就會成為 LCP 元素。因此，「希望使用者最先看到的重要內容」應該同時是「你讓它盡可能快速載入的元素」。

## LCP 何時停止計算

LCP 在使用者第一次與頁面產生互動後停止計算。互動包含點擊、鍵盤輸入等主動操作，但**不包含滑鼠懸停（hover）**。

邏輯是：使用者開始互動，代表他們認為頁面已經夠完整可以操作，LCP 的量測目的就已達成。若在大量使用者樣本中，部分使用者在頁面完全載入前就點擊，可能使 LCP 數字偏低，但在大樣本下通常影響不大。

## Google 的評分標準

| 評分     | LCP 時間    |
| -------- | ----------- |
| 良好     | 2.5 秒以內  |
| 需要改善 | 2.5 至 4 秒 |
| 差       | 超過 4 秒   |

2.5 秒的門檻來自前面提到的人機互動研究：超過 2 秒，使用者就會感到等待的中斷感。超過這個門檻會直接影響 Google 搜尋排名，但確切的演算法懲罰細節不公開。

## 複習

### Google Core Web Vitals 量測哪三件事？

1. 網站對使用者來說視覺上載入的速度
2. 載入過程的流暢程度
3. 使用者能多快與網站互動

### 計算 LCP（最大內容繪製）時，哪些元素會被納入考量？

圖片、影片、CSS 背景圖片，以及包含文字的 DOM 元素。同時有以下限制：opacity 不能為 0、尺寸不能覆蓋整個頁面，且必須達到最低 entropy 門檻。

### 在 LCP 的脈絡中，image entropy 是什麼？

Entropy 以每個可見像素的位元數來計算，用來判斷一張圖片是否具有足夠的視覺資訊量，以決定它是否能被計入 LCP。

### LCP 的計算何時停止？

在使用者第一次與頁面產生互動（例如點擊、鍵盤輸入）後停止，這代表使用者認為頁面已可互動。

### Google 對於良好 LCP 分數的目標時間是多少？

2.5 秒以內，超過此門檻的網站可能在搜尋排名上受到懲罰。

## 小測驗

<details>
<summary>LCP（最大內容繪製）主要量測什麼？</summary>
頁面上像素面積最大的可見元素完成繪製所需的時間
</details>

<details>
<summary>計算 LCP 時，哪些類型的元素會被納入考量？</summary>
圖片、影片、CSS 背景圖片，以及包含文字的 DOM 元素
</details>

<details>
<summary>圖片要符合 LCP 元素資格，entropy 門檻是多少？</summary>
每個可見像素超過 0.05 位元
</details>

<details>
<summary>Google 對於良好 LCP 分數的目標時間是多少？</summary>
2.5 秒以內
</details>

<details>
<summary>在頁面載入過程中，LCP 計算何時停止？</summary>
使用者第一次互動（例如點擊）之後
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記