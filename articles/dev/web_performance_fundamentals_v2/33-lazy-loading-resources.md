---
title: '改善 FCP：延遲載入非關鍵 JavaScript'
description: '說明 JavaScript 的解析阻塞特性，比較 async 與 defer 的差異，並透過為非關鍵 script 加上 defer 屬性，將 FCP 從 871ms 改善至 624ms。'
date: 2026-08-01
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 33
chapter: 'Improving First Contentful Paint'
tags:
  - frontendMasters
  - webPerformanceFundamentals
  - FCP
  - JavaScript
---

# 改善 FCP：延遲載入非關鍵 JavaScript

## JavaScript 的解析阻塞特性

瀏覽器在解析 HTML 時，只要遇到 `<script>` 標籤，就會立刻開始下載它。一旦下載完成，瀏覽器會**立即停下手邊所有事情**，執行這段 JavaScript，包含：

- 停止解析後續的 HTML
- 停止任何新的渲染工作
- 阻塞主執行緒

這就是 JavaScript 被稱為「解析阻塞（parser blocking）」的原因。在火焰圖中，你會看到 script 下載完成後，主執行緒進入 evaluate、compile、execute 的流程，在這段時間內頁面完全無法繼續進行任何其他工作。

## async 與 defer 的差異

為了解決解析阻塞問題，HTML 提供了兩個屬性：

**`async`**：告訴瀏覽器在有空的時候開始下載這個 script，但下載一完成就立刻執行，不等任何其他事情。這樣做的問題是製造了一個競賽（race condition）：如果 script 比 CSS 更快下載完，一樣會阻塞渲染；只有 CSS 先完成時才能避免問題，結果是否改善取決於運氣。

**`defer`**：告訴瀏覽器在有空的時候開始下載，但**絕對不會在 DOMContentLoaded 之前執行**。瀏覽器會等到所有 HTML 都解析完、即將觸發 DOMContentLoaded 之前，才統一執行所有被 defer 的 script。這樣無論 script 多快下載完，都不會阻塞渲染。

**結論：大多數情況應該使用 `defer`，`async` 只在少數特殊情境才適合。**

## 使用 defer 的幾個細節

**執行順序的保證**：如果有多個被 defer 的 script，它們的執行順序會依照在 HTML 文件中被發現的順序進行，而不是依照下載完成的順序。這讓有相依關係的 script 可以放心使用 defer。

**`type="module"` 永遠是 defer**：使用現代模組語法的 script（`<script type="module">`）預設就是 deferred，不需要另外加 `defer`，也無法取消這個行為。

**放在 `<head>` 還是 `</body>` 之前？** 講師的答案是：現在這個差別已經不太重要了。以前沒有 `defer` 時，開發者會把 script 放在 `</body>` 前來避免阻塞，但現在只要加上 `defer`，放在 `<head>` 裡讓瀏覽器提早發現並開始下載，反而更好。

**defer 的 script 裡仍然可以監聽 DOMContentLoaded**：因為 defer script 的執行時機是「在 DOMContentLoaded 觸發之前」，所以在 script 內部仍然可以用 `addEventListener('DOMContentLoaded', ...)` 來等待 DOM 準備好，這個模式完全可以繼續使用。

## FCP 改善的三個策略小結

1. **移除序列鏈**：讓資源盡可能並行載入，避免因為依賴關係造成等待
2. **預載關鍵路徑資源**（preload）：讓 FCP 必需的資源提早開始取得
3. **延遲非關鍵 JavaScript**（defer）：讓不影響首次繪製的 script 不阻塞渲染

目標是讓 FCP 的路徑盡可能短，只包含絕對必要的資源。

## 複習

### JavaScript 在瀏覽器解析過程中的主要問題是什麼？

JavaScript 具有解析阻塞的特性。當瀏覽器遇到 script 標籤時，會立即下載並執行該腳本，停止 HTML 解析、渲染與主執行緒上的所有工作。

### async 與 defer 這兩個 script 屬性有什麼差異？

async 會在瀏覽器有空時開始下載腳本，但下載完成後立刻執行，可能造成競賽條件。defer 會下載腳本，但等到 DOMContentLoaded 觸發之前才執行，並維持多個 script 的執行順序。

### 當 script 標籤加上 type="module" 時會發生什麼事？

type="module" 的 script 預設永遠是 deferred，不需要另外加 defer，也無法取消這個行為。

### script 標籤應該放在 HTML 文件的哪個位置？

使用 defer 後，script 標籤的位置變得比較不重要。放在 head 或 body 結束標籤之前都可以，使用 defer 可以讓瀏覽器自行決定何時開始下載並管理執行時機。

### 多個 defer script 如何維持執行順序？

defer script 會依照它們在文件中被發現的順序執行，即使下載完成的順序不同。第一個被發現的 script 會第一個執行，其餘依此類推。

## 小測驗

<details>
<summary>在 script 標籤上加入 defer 屬性會有什麼效果？</summary>
延遲腳本的執行，直到 DOMContentLoaded 觸發之前才執行
</details>

<details>
<summary>為什麼 JavaScript 被認為具有解析阻塞的特性？</summary>
遇到 script 時會停止解析後續內容與渲染工作
</details>

<details>
<summary>async 與 defer 這兩個 script 屬性的關鍵差異是什麼？</summary>
async 下載完成後立刻執行，defer 則等到 DOMContentLoaded 之前才執行
</details>

<details>
<summary>使用 type="module" 屬性的 script 標籤會有什麼效果？</summary>
該 script 會自動被 defer，永遠延遲執行
</details>

<details>
<summary>同時有多個 defer script 時，它們的執行行為是什麼？</summary>
它們會維持在文件中被發現的原始順序來執行
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記