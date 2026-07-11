---
title: '效能指標的瀏覽器支援：Blink、WebKit 與 Gecko'
description: '說明 LCP、CLS、INP 等 Core Web Vitals 在 Blink、WebKit、Gecko 三大引擎的支援差異，以及 Safari 資料盲區對效能監控的實際影響。'
date: 2026-07-24
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 17
chapter: 'Capturing Performance Metrics'
tags:
  - frontendMasters
  - webPerformanceFundamentals
  - CoreWebVitals
  - BrowserCompatibility
---

# 效能指標的瀏覽器支援：Blink、WebKit 與 Gecko

> [[16-performance-observer|上一篇]]介紹了 PerformanceObserver 與 web-vitals 套件，說明如何以程式化方式收集效能資料。本篇是「量測」章節的最後一篇，討論各項效能指標在不同瀏覽器引擎上的支援狀況，以及這對實際資料收集的影響。

## 三大瀏覽器引擎

效能指標的支援是由**瀏覽器引擎**決定的，而不是瀏覽器品牌本身。目前主要有三個引擎：

| 引擎       | 代表的瀏覽器                                                                       |
| ---------- | ---------------------------------------------------------------------------------- |
| **Blink**  | Chrome、Edge、Opera、Samsung Browser、Brave、Arc                                   |
| **WebKit** | Safari、Mobile Safari，以及 iOS 上所有瀏覽器（包含 iOS 版 Chrome、iOS 版 Firefox） |
| **Gecko**  | Firefox                                                                            |

特別值得注意的是：在 iOS 上，Apple 強制所有瀏覽器必須使用 WebKit 引擎。因此 iOS 版 Chrome 或 iOS 版 Firefox 本質上都是 Safari 的外殼，不是真正的 Blink 或 Gecko 環境。

## 各指標的支援狀況

| 指標                            | Blink | WebKit     | Gecko      |
| ------------------------------- | ----- | ---------- | ---------- |
| DOMContentLoaded、load          | 支援  | 支援       | 支援       |
| TTFB                            | 支援  | 支援       | 支援       |
| FCP                             | 支援  | 支援       | 支援       |
| Performance API（mark/measure） | 支援  | 支援       | 支援       |
| LCP                             | 支援  | **不支援** | 支援       |
| CLS                             | 支援  | **不支援** | **不支援** |
| INP                             | 支援  | **不支援** | **不支援** |

Core Web Vitals（LCP、CLS、INP）是 Google 自行定義的指標，並非 Web 標準，目前只有 Blink 完整支援。WebKit 三個都不支援，Gecko 只支援 LCP。

## Safari 的資料盲區

這帶來一個現實問題：**你從 Core Web Vitals 收集到的資料，完全沒有 Safari 使用者的貢獻**。即使你的 Core Web Vitals 分數很好，Safari 上的使用者體驗可能依然很差，而你完全不知道。

講師特別點出 Safari 使用者的商業重要性：Safari 預裝在 Apple 裝置上，這些裝置的價格相對偏高，使用者傾向於消費力較強的族群。對於電商網站來說，Safari 使用者往往是高價值客群，卻是效能資料上的盲點。

## 目前的應對方式

講師坦承這個問題目前沒有好的系統性解法。能做的事情有：

- 繼續收集 Core Web Vitals（對 SEO 和大多數使用者仍然有意義）
- 定期**手動在 iPhone 上測試**，確保幾個世代前的舊款 iPhone 也能有良好體驗
- 對 TTFB 和 FCP 這兩個跨引擎都支援的指標，可以作為跨瀏覽器的共同基準

目前沒有辦法以程式化方式自動取得 Safari 的 Core Web Vitals 資料，只能靠人工測試彌補這個缺口。

## 複習

### 課程討論的三大瀏覽器引擎是什麼？

Blink、WebKit 與 Gecko

### WebKit 不支援哪些 Core Web Vitals？

LCP、CLS 與 INP

### 哪些效能指標在 WebKit 與其他瀏覽器引擎上都可以量測？

TTFB、FCP，以及 Performance API 的 mark 與 measure

### 為什麼 Safari 使用者在網頁效能方面特別重要？

他們傾向於使用較昂貴的裝置，消費力相對較高，較有可能在網站上消費

### 面對 Safari 上效能指標的限制，建議的應對方式是什麼？

定期在 iPhone 上手動測試網站，確保使用者體驗良好，因為自動化指標收集在 Safari 上受到限制

## 小測驗

<details>
<summary>在網頁效能的討論中，主要涉及哪些瀏覽器引擎？</summary>
Gecko、WebKit 與 Blink
</details>

<details>
<summary>WebKit 在 Core Web Vitals 方面有什麼顯著限制？</summary>
它不支援任何 Core Web Vitals 指標
</details>

<details>
<summary>iOS 上的 Chrome 使用的是哪個瀏覽器引擎？</summary>
WebKit
</details>

<details>
<summary>哪些效能指標可以跨 WebKit 與其他瀏覽器量測？</summary>
TTFB 與 FCP
</details>

<details>
<summary>為什麼 Safari 使用者在網頁效能方面特別重要？</summary>
他們傾向於使用高端裝置，且潛在消費力較高
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記