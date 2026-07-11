---
title: '以程式碼收集效能指標：PerformanceObserver 與 web-vitals 套件'
description: '說明 PerformanceObserver 的設計原理與基本用法，介紹 buffered 屬性的重要性，以及 Google 的 web-vitals 套件如何簡化 Core Web Vitals 的收集流程。'
date: 2026-07-23
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 16
chapter: 'Capturing Performance Metrics'
tags:
  - frontendMasters
  - webPerformanceFundamentals
  - PerformanceAPI
  - WebAPI
---

# 以程式碼收集效能指標：PerformanceObserver 與 web-vitals 套件

> [[15-performance-api|上一篇]]介紹了 Performance API 的核心方法，包含 `performance.now()`、`performance.timeOrigin` 與 `performance.getEntries()`。本篇說明為何直接查詢 Performance API 會有問題，以及 PerformanceObserver 如何解決這個問題。

## 觀察者效應（Observer Effect）

直接在瀏覽器忙碌時呼叫 Performance API 進行記錄，本身就會消耗資源，進而影響你試圖量測的那個效能數字。這在科學上稱為「觀察者效應」：量測行為本身改變了量測結果。

PerformanceObserver 的設計就是為了解決這個問題。它讓瀏覽器在**空閒時**才把效能資料傳給你，不干擾瀏覽器正在進行的任務。

## PerformanceObserver 的基本用法

以監聽 layout shift 為例：

```javascript
const performanceObserver = new PerformanceObserver((list, observer) => {
  list.getEntries().forEach((entry) => {
    console.log(`Layout shifted by ${entry.value}`);
  })
});

performanceObserver.observe({ type: "layout-shift", buffered: true });
```

每種效能事件類型（layout-shift、largest-contentful-paint、longtask 等）需要各自建立一個 observer。回呼函式收到的 `entry` 物件包含該事件的詳細計時資料，具體屬性依事件類型而異，需自行實驗確認。

講師在課堂上示範後，從回傳的 layout shift entry 中可以看到：哪些 DOM 元素發生了位移、位移的 `value` 數值，以及位移發生的時間點（例如從頁面開始起算的 4.278 秒）。

### buffered: true 的重要性

`buffered: true` 讓你在**建立 observer 之前已發生的事件**也能被取得。這在建置效能監控工具時特別重要：你可能希望監控腳本在頁面末尾才載入，但仍需要收集整個頁面生命週期中發生的所有事件。若沒有 `buffered: true`，在 observer 建立之前發生的事件就永遠拿不到。

## web-vitals 套件

如果你只關心 Core Web Vitals，Google 提供了一個開源套件 `web-vitals`，封裝了所有收集細節：

```javascript
import { onLCP, onCLS, onINP } from "web-vitals";

onLCP(console.log);
onCLS(console.log);
onINP(console.log);
```

這個套件處理了許多繁瑣的細節，例如：把所有 layout shift 的分數加總計算 CLS、判斷何時應該回報最終數值、處理頁面被切到背景分頁時的特殊情況等。

講師指出，99% 的情況下你不需要直接操作這些底層 API，而是使用某種效能監控或報告工具，那些工具會替你處理這一切。但了解底層機制的存在，在需要自行診斷頁面時會很有用。

## performance.timeOrigin 的起點

課堂上有學員詢問 `performance.timeOrigin` 對應到瀑布圖的哪個位置。講師說明：它對應到瀑布圖最左端的起點，也就是使用者發起導航的那一刻（例如在網址列按下 Enter，或點擊搜尋結果連結）。所有其他計時數值都是相對於這個起點的毫秒數。若需要將相對時間轉換成絕對時間戳記，將指標值加上 `performance.timeOrigin` 即可。

## 複習

### 在網頁效能 API 的脈絡中，觀察者效應是什麼？

觀察者效應指的是量測行為本身會拖慢或改變效能結果的現象。

### PerformanceObserver 讓你能做什麼？

PerformanceObserver 讓你在瀏覽器空閒時取得頁面效能資訊，不干擾瀏覽器當前的任務，並且可以取得在 observer 建立之前發生的效能資料。

### 建立 PerformanceObserver 時，buffered: true 屬性有什麼作用？

buffered: true 讓 PerformanceObserver 能夠取得在 observer 建立之前已發生的效能事件，實現回溯式的效能分析。

### PerformanceObserver 可以追蹤哪些類型的效能事件？

可以追蹤各種類型的事件，例如 Core Web Vitals、資源請求、導航事件與版面位移。

### web-vitals.js 套件有什麼用途？

web-vitals.js 套件封裝了追蹤 LCP、CLS 與 INP 等網頁效能指標的複雜細節，讓你能更方便地訂閱與處理這些效能事件。

## 小測驗

<details>
<summary>在 Performance API 的脈絡中，觀察者效應是什麼？</summary>
一個科學術語，指量測行為本身改變了量測結果
</details>

<details>
<summary>PerformanceObserver 讓開發者能做什麼？</summary>
在瀏覽器空閒時取得效能資訊
</details>

<details>
<summary>PerformanceObserver 中 buffered 屬性的重要性是什麼？</summary>
允許取得在開始觀察之前已發生的事件資訊
</details>

<details>
<summary>使用 web-vitals 套件可以觀察哪些 Core Web Vitals？</summary>
LCP、CLS 與 INP
</details>

<details>
<summary>在瀏覽器效能量測中，time origin 發生在什麼時候？</summary>
使用者輸入網址或點擊連結發起導航的那一刻
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記