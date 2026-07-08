---
title: '傳統效能指標：DOMContentLoaded 與 Load 事件'
description: '介紹兩個瀏覽器內建的傳統效能時間點：DOMContentLoaded 與 load 事件的定義、差異與使用方式。'
date: 2026-07-18
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 5
chapter: 'Importance of Web Performance'
tags:
  - frontendMasters
  - webPerformanceFundamentals
  - DOMContentLoaded
  - EventListener
---

# 傳統效能指標：DOMContentLoaded 與 Load 事件

> [[04-waterfall-charts|上一篇]]介紹了瀑布圖的結構與色彩代碼，作為閱讀效能資料的基礎工具。本篇開始進入「量測」主題的第一部分：傳統效能指標（legacy metrics）。講師特別說明，「傳統」不代表這些指標即將消失，而是指它們是過去用來衡量效能的主要手段，如今雖已不是核心指標，但仍值得理解。

## DOMContentLoaded

**定義：** HTML 文件已完整下載並解析完成，且文件中所有的 JavaScript 都已執行完畢。

此時頁面的 DOM 結構已完整建立，所有元素都可以被存取與操作。但要注意，圖片與其他媒體資源不一定已載入完成，DOMContentLoaded 不等待它們。

在瀑布圖中，DOMContentLoaded 發生在 JavaScript 執行完畢的當下，此時圖片可能仍在載入中。

**使用時機：** 適合用來確認頁面的 DOM 結構已就緒，可以開始操作元素。

```javascript
window.addEventListener("DOMContentLoaded", (evt) => {
  console.log(`DOMContentLoaded at ${evt.timeStamp} ms`);
});
```

事件物件上的 `timeStamp` 屬性會回傳該事件發生的毫秒數，例如某個頁面可能會回傳 1807 毫秒。

## Load 事件

**定義：** HTML 文件以及所有**已知資源**（包含圖片、樣式表等）都已下載並渲染完成。

這裡「已知」兩個字很重要。透過 JavaScript 動態新增的資源（例如動態插入的圖片或內容），如果是在 load 事件觸發之前加入的，load 事件會等待它們；如果是在 load 事件之後才加入的，就不在等待範圍內。此外，明確標記為 lazy loading 的資源也不在等待範圍內。

在瀑布圖中，load 事件出現在最後一張圖片載入完成的位置。

**視覺提示：** load 事件觸發時，瀏覽器的載入指示器（例如分頁上的旋轉圖示或視窗角落的進度提示）會停止，這是瀏覽器向使用者表示「頁面已完成」的訊號。不過實際上頁面是否真的「完成」，不一定與此同步。

**使用時機：** 適合用來作為頁面初始化結束後的啟動點，確保所有資源都已就緒再執行後續任務。

```javascript
window.addEventListener("load", (evt) => {
  console.log(`Load at ${evt.timeStamp} ms`);
});
```

## 複習

### DOMContentLoaded 事件是什麼，它代表什麼意義？

DOMContentLoaded 表示 HTML 文件已完整下載並解析完成，且其中所有 JavaScript 都已執行。頁面的 DOM 結構已就緒，但圖片等資源不一定已載入完成。

### 如何在 JavaScript 中監聽 DOMContentLoaded 事件？

```javascript
window.addEventListener('DOMContentLoaded', (event) => {
    console.log(event.timestamp);
});
```

### load 事件是什麼，它與 DOMContentLoaded 有何不同？

load 事件發生在 HTML 與所有已知資源（例如圖片）都下載並渲染完成之後。與 DOMContentLoaded 不同，它會等待所有資源完成載入。

### load 事件觸發時，瀏覽器在視覺上通常會有什麼變化？

瀏覽器的載入旋轉圖示或角落的載入指示器會停止，向使用者表示所有已知資源都已載入完成。

### 如何在 JavaScript 中監聽 load 事件？

```javascript
window.addEventListener('load', (event) => {
    console.log(event.timestamp);
});
```

## 小測驗

<details>
<summary>DOMContentLoaded 事件代表什麼？</summary>
HTML 已解析完成且 JavaScript 已執行，但圖片不一定已載入
</details>

<details>
<summary>如何在 JavaScript 中監聽 DOMContentLoaded 事件？</summary>
window.addEventListener('DOMContentLoaded', handler)
</details>

<details>
<summary>load 事件在網頁效能中的具體定義是什麼？</summary>
HTML 與所有已知資源都已下載並渲染完成
</details>

<details>
<summary>load 事件觸發時瀏覽器會發生什麼事？</summary>
瀏覽器的載入旋轉圖示停止
</details>

<details>
<summary>load 事件在動態新增資源方面有什麼重要特性？</summary>
如果資源是在 load 事件觸發前新增的，load 事件會等待它們
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記