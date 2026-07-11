---
title: '以程式碼收集效能指標：Performance API 概覽'
description: '介紹瀏覽器內建的 Performance API，說明 performance.now()、performance.timeOrigin、performance.getEntries() 的用途與差異，作為自訂效能收集的基礎工具。'
date: 2026-07-23
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 15
chapter: 'Capturing Performance Metrics'
tags:
  - frontendMasters
  - webPerformanceFundamentals
  - PerformanceAPI
  - WebAPI
---

# 以程式碼收集效能指標：Performance API 概覽

> 效能指標不只能在 DevTools 中觀察，也可以透過瀏覽器內建的 API 以程式化方式收集。本篇介紹 Performance API 的核心方法。

## 兩個主要 API

瀏覽器提供兩個 API 讓開發者以程式化方式收集效能資料：

- **Performance API**：提供時間戳記與資源載入的詳細計時資料
- **PerformanceObserver API**：以觀察者模式訂閱效能事件，非同步接收資料

講師說明，大多數情況下開發者會使用現成的工具來收集這些資料，而不是自己建立效能記錄系統。但若需要自行建置，以下是主要的 API 用法。

## performance.now()

`performance.now()` 回傳一個**高精度時間戳記**，代表從頁面開始到現在經過了多少時間，單位是微秒（microseconds）級別的小數毫秒。

相較之下，`Date.now()` 的實際精度依瀏覽器實作而異，對於需要量測細部操作（例如某個函式花了幾百微秒）的情境，`performance.now()` 更為精確。

```javascript
performance.now(); // 例如：1807.4321
```

這個數值是相對時間，不是絕對時間戳記。

## performance.timeOrigin

`performance.timeOrigin` 提供頁面導航開始的**絕對時間戳記**，格式類似 `Date.now()`，但精度更高。

若需要一個兼具絕對時間與高精度的時間點，可以將兩者相加：

```javascript
performance.timeOrigin + performance.now();
```

## performance.getEntries()

`performance.getEntries()` 回傳頁面所有效能計時記錄的清單，內容等同於 Chrome DevTools 的 Network 面板資訊，但以程式化方式提供，可以進一步處理。

回傳的資料包含：

- 初始導航事件的詳細計時（`PerformanceNavigationTiming`）：TCP 連線起始時間、完成時間、DOMContentLoaded 觸發時間、所有 JavaScript callback 完成時間等
- 每個資源的載入計時：圖片、JavaScript、CSS、fetch 請求各自花了多少時間
- DNS 查詢時間、SSL 時間、TCP handshake 時間
- 任何自訂的效能事件標記

## 複習

### performance.now() 與 Date.now() 的主要差異是什麼？

performance.now() 提供微秒精度的高精度時間戳記，量測的是從頁面開始到現在的經過時間；Date.now() 通常只提供到毫秒或秒的精度。

### 如何使用 Performance API 取得頁面的初始時間戳記？

透過 performance.timeOrigin，它提供一個高精度的時間戳記，代表頁面初始化或導航開始的時間點。

### 使用 performance.getEntries() 可以取得哪些資訊？

它回傳頁面的詳細計時資訊，包含網路事件如 DNS 時間、SSL 時間、TCP handshake 時間、資源下載時間，以及自訂效能事件。

### 瀏覽器中用來收集效能指標的兩個主要 API 是什麼？

Performance API 與 PerformanceObserver API。

### PerformanceNavigationTiming 提供哪些具體的效能資訊？

它提供初始導航事件的詳細計時資訊，包含 TCP 連線開始與完成時間、DOMContentLoaded 觸發時間，以及相關 JavaScript callback 完成的時間。

## 小測驗

<details>
<summary>performance.now() 方法的主要用途是什麼？</summary>
提供相對於頁面開始的高精度時間戳記
</details>

<details>
<summary>performance.getEntries() 可以提供關於網頁的哪些資訊？</summary>
DNS 時間與 SSL 連線細節
</details>

<details>
<summary>performance.timeOrigin 與效能量測有什麼關係？</summary>
它提供頁面導航開始的高精度時間戳記
</details>

<details>
<summary>performance.now() 與 Date.now() 有什麼不同？</summary>
performance.now() 提供微秒精度
</details>

<details>
<summary>開發者可以使用 Performance API 做什麼？</summary>
收集自訂效能指標與詳細的計時資訊
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記