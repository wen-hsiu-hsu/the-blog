---
title: '其他效能指標：FCP（首次內容繪製）'
description: '介紹 FCP（首次內容繪製）的定義與在效能時間軸上的位置，說明它與 TTFB、LCP 之間的連動關係，以及 Google 的 1.8 秒建議標準。'
date: 2026-07-22
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 14
chapter: 'Core Web Vitals & Others Performance Metrics'
tags:
  - frontendMasters
  - webPerformanceFundamentals
  - FCP
  - CoreWebVitals
---

# 其他效能指標：FCP（首次內容繪製）

> [[13-time-to-first-byte|上一篇]]介紹了 TTFB，說明伺服器送出第一個位元組之前會經歷的完整流程。本篇介紹另一個補充指標 FCP，它是使用者第一次「看到任何東西」的時間點，也是連結 TTFB 與 LCP 的中間節點。

## 什麼是 FCP

FCP（First Contentful Paint，首次內容繪製）是瀏覽器第一次在空白頁面上繪製出任何內容的時刻。這個「內容」可能是背景色的變化、第一行文字的出現，或任何肉眼可見的元素。

它的意義是：使用者終於知道「這個頁面有在載入」，不會一直盯著白畫面懷疑自己的點擊有沒有成功。

FCP 不是 Core Web Vital，也不直接影響 SEO 排名，但 Google 仍然提供建議值作為參考。

## 效能時間軸上的位置

把目前介紹過的所有指標放在同一條時間軸上，順序大致如下：

```
TTFB → DOMContentLoaded → FCP → LCP → load
```

> 以上為典型的順序，純客戶端渲染的網站 DOMContentLoaded 與 load 可能遠早於 FCP。

幾個固定的關係值得記下來：

- **TTFB 一定最早**：它是所有事件的起點，收到第一個位元組才能開始後續處理
- **FCP 一定在 TTFB 之後**：沒有資料就無法繪製任何東西
- **LCP 一定在 FCP 之後（或同時）**：最大元素的繪製不可能早於第一次繪製

FCP 與 LCP 同時發生的情況並不少見，尤其是頁面結構簡單的小型網站，兩者可能在幾乎相同的時間點觸發。

至於 DOMContentLoaded 與 load 的位置，則高度依賴網站架構。講師在這裡以 Developer Stickers Online 的架構為例示意，但如前面章節提到的，純客戶端渲染的網站這兩個事件可能遠早於 FCP 發生，不具代表性。

## Google 的建議標準

Google 建議 FCP 應在 **1.8 秒以內**。

這個數字的拆解方式如下：

- TTFB 建議在 800 毫秒以內
- 因此從收到第一個位元組到繪製出第一個畫面，剩下約 **1 秒**的時間
- 這 1 秒必須用來解析 HTML、決定要渲染什麼，並完成繪製

TTFB、FCP 與 LCP 三個指標是相互連動的：TTFB 拖慢了，FCP 就跟著延遲，FCP 延遲了，LCP 也必然更晚到來。

## 複習

### 什麼是首次內容繪製（FCP）？

FCP 是瀏覽器視窗第一次從白色空白切換為顯示任何內容的時刻，用來告知使用者他們的請求或點擊正在載入中，頁面即將出現。

### Google 對 FCP 的建議時間是多少？

Google 建議 FCP 應在 1.8 秒以內，其中 800 毫秒給 TTFB，剩下約 1 秒用來解析 HTML 並渲染出任何內容。

### FCP 與其他效能指標有什麼關係？

FCP 通常發生在 TTFB 與 DOMContentLoaded 之後，但在 LCP 之前，具體時序取決於網站的結構與資源載入方式。

### FCP 是 Core Web Vital 嗎？

不是。Core Web Vitals 是 LCP、INP 與 CLS，FCP 不在其中。

### FCP 具體量測什麼？

FCP 量測瀏覽器第一次在頁面上渲染任何可見內容的時刻，例如背景色的出現或文字元素的顯示，代表頁面正在載入的訊號。

## 小測驗

<details>
<summary>FCP（首次內容繪製）在效能指標中代表什麼？</summary>
瀏覽器第一次渲染出任何可見內容的時刻，例如背景變化或文字元素出現
</details>

<details>
<summary>根據 Google 的建議，FCP 的目標時間是多少？</summary>
1.8 秒以內
</details>

<details>
<summary>在效能指標的時間軸上，哪個事件通常最先發生？</summary>
首位元組時間（TTFB）
</details>

<details>
<summary>FCP 與 LCP 有什麼關係？</summary>
LCP 的發生時間一定大於或等於 FCP 的發生時間
</details>

<details>
<summary>什麼現象代表 FCP 已經發生？</summary>
瀏覽器視窗從白色空白切換為顯示任何內容
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記