---
title: 'JavaScript 入口點與 script 載入策略'
description: '說明如何建立 JavaScript 入口點、組織現代專案的檔案結構，以及 script 標籤預設、defer、async 三種載入行為的差異與適用情境。'
date: 2026-07-03
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 8
chapter: 'The DOM'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - Performance
  - ESModule
---

# JavaScript 入口點與 script 載入策略

> 前幾篇建立了 DOM 操作的基礎觀念，也透過 DevTools 實際探索了 Coffee Masters 專案的 DOM 結構。這篇開始正式加入 JavaScript，從建立入口點檔案、思考檔案組織方式，到理解 `<script>` 標籤的載入行為。

## 建立入口點：app.js

專案目前沒有任何 JavaScript 檔案，第一步是建立一個入口點。這個入口點是整個應用程式唯一需要在 HTML 中用 `<script>` 引入的 JavaScript 檔案，通常命名為 `app.js`，直接放在專案根目錄。

```html
<script src="app.js" defer></script>
```

其他的 JavaScript 檔案不會再額外用 `<script>` 標籤引入，而是透過 ES 模組系統從 `app.js` 連結進來。

## 現代 JavaScript 的檔案組織方式

過去沒有 ES 模組時，每個需要使用的 JavaScript 檔案都要加一個獨立的 `<script>` 標籤，這也是 JavaScript bundling 工具出現的原因之一。今天有了 ES 模組，可以用 `import` 和 `export` 在多個檔案之間共享程式碼，不再需要一堆 `<script>` 標籤。

檔案組織上，講師建議不再沿用傳統的 `scripts/` 資料夾結構，而是依照功能類型來組織，例如 `components/` 和 `services/`，這和現代框架的慣例比較接近。`scripts/` 資料夾的命名方式更接近舊時代的思維，現代專案通常不這樣做。

這門課使用的是 ES2017 以後的 JavaScript 特性，包含 ES 模組、async/await 和 class 宣告語法。這些特性在現代瀏覽器中都有良好支援（IE9 除外，但這門課不考慮這個）。

## script 標籤的載入行為與效能

加入 `<script>` 標籤時，有一個重要的效能細節需要理解。

### 預設行為（不加任何屬性）

瀏覽器在解析 HTML 的過程中，一旦遇到 `<script>` 標籤，會立即停止解析 HTML，先下載並執行 JavaScript 檔案，完成後才繼續解析剩下的 HTML。

這就是為什麼過去有一個常見建議：把 `<script>` 標籤放在 `</body>` 前面，目的是讓瀏覽器先渲染完 HTML 再執行 JavaScript，避免使用者看到一片空白。但這個做法現在已經過時了，有更好的方式。

### defer

`defer` 是一個布林屬性，加上它之後：

- 瀏覽器繼續解析 HTML，同時在背景下載 JavaScript 檔案
- 等到整份 HTML 解析完成後，才執行 JavaScript

這是大多數情況下的建議選擇，不確定要用哪個就用 `defer`。

```html
<script src="app.js" defer></script>
```

### async

`async` 同樣會在背景下載檔案，但下載完成後會立刻暫停 HTML 解析並執行 JavaScript，不等 HTML 全部解析完。

這個行為適合那些需要儘早執行、且與頁面內容無關的小型腳本，例如分析（analytics）或追蹤類的程式碼。

### 三種模式比較

| 模式    | 下載方式     | 執行時機            | 是否暫停 HTML 解析 |
| ------- | ------------ | ------------------- | ------------------ |
| 預設    | 同步（阻塞） | 立即執行            | 是                 |
| `async` | 平行下載     | 下載完成後立即執行  | 是（執行時）       |
| `defer` | 平行下載     | HTML 解析完成後執行 | 否                 |

> 兩者並存時 `async` 優先，`defer` 會被忽略，因此選一個使用即可。

## 複習

### script 標籤中 defer 屬性的用途是什麼？

defer 屬性讓瀏覽器在繼續解析 HTML 的同時，於背景下載 JavaScript 檔案，並等到整份 HTML 解析完成後才執行腳本，避免 HTML 解析被中斷。

### async 與 defer 這兩個 script 載入屬性的主要差異是什麼？

使用 async 時，腳本在背景下載，但下載完成後會立即暫停 HTML 解析並執行；使用 defer 時，腳本同樣在背景下載，但會等到整份 HTML 解析完成後才執行。

### 現代 JavaScript（ES2017 以後）的主要特性有哪些？

現代 JavaScript 包含 ECMAScript 模組、async/await、class 宣告語法，並與大多數現代瀏覽器相容。

### 現代 Web 開發中，組織 JavaScript 檔案的建議方式是什麼？

使用一個入口點檔案（例如 app.js），並將其他檔案依照 components 和 services 等功能類型分資料夾組織，而不是沿用傳統的 scripts 資料夾結構。

### JavaScript bundling 最初解決了什麼問題？

JavaScript bundling 最初解決了每個檔案都需要單獨一個 script 標籤的問題，同時透過將多個 JavaScript 檔案合併為一個，提升了載入效能。

## 小測驗

<details>
<summary>在 script 標籤中使用 defer 屬性的目的是什麼？</summary>
讓瀏覽器在背景下載 JavaScript 檔案，不中斷 HTML 解析，並在 HTML 解析完成後才執行腳本
</details>

<details>
<summary>哪些特性屬於「現代 JavaScript」的範疇？</summary>
ECMAScript 模組、async/await 以及 class 宣告語法
</details>

<details>
<summary>現代 Web 開發中組織 JavaScript 檔案的建議方式是什麼？</summary>
依照 components 和 services 等功能類型建立資料夾，而不是使用通用的 scripts 資料夾
</details>

<details>
<summary>defer 與 async 這兩個 script 載入屬性的主要差異是什麼？</summary>
defer 在整份 HTML 解析完成後才執行腳本；async 在腳本下載完成後立即執行
</details>

<details>
<summary>async 載入方式最適合哪種情境？</summary>
適合需要儘早執行的小型腳本，例如分析（analytics）類的程式碼
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記