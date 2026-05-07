---
title: ES5 Callback 模式的侷限，與 ES6 Promises 的登場
description: 整理 ES5 callback 模式的三個侷限：無法在 JavaScript 內追蹤背景工作狀態、回應資料僅存在於 callback 內部、流程不直觀。並介紹 ES6 的 `fetch` 作為雙管齊下的幻象函式，如何同時發起背景工作並立即回傳 Promise 物件，解決上述問題。
date: 2026-05-15
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 31
chapter: 'Asynchronous JavaScript & the event loop'
tags:
    - JavaScript
    - Promise
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# ES5 Callback 模式的侷限，與 ES6 Promises 的登場

## 「Callback」名稱的由來

在先前的高階函式章節中，callback 指的是「被傳入另一個函式作為參數的函式」。在非同步的脈絡下，這個名稱有了更直觀的意義：函式被傳出到瀏覽器背景執行，工作完成後再被**呼叫回（called back）** JavaScript 環境執行。

## ES5 Callback 模式的優缺點

在 ES6 之前，與瀏覽器外部世界互動的標準做法，就是將 callback function 傳入幻象函式（如 `setTimeout`、`XMLHttpRequest`），由幻象函式在背景啟動工作，工作完成後將 callback 放入 Callback Queue，再由 Event Loop 在全域程式碼跑完後送上 Call Stack 執行。

**優點**

- 底層邏輯一旦理解，執行順序完全透明且可預測
- 能夠確信：所有全域程式碼必定會先完整執行，非同步回呼才會運行

**缺點**

- **無法在 JavaScript 內追蹤背景工作狀態**：大量背景任務可能同時進行，但在 JavaScript 這一側沒有任何正式的方式知道它們的進度或結果
- **回應資料僅存在於 callback 函式內部**：若背景任務是向伺服器請求資料，該資料只會出現在完成時執行的 callback 函式的區域範圍內，無法直接供外部使用，巢狀的非同步操作會導致所謂的 **Callback Hell**
- **直覺上令人困惑**：`setTimeout(printHello, 0)` 看起來像是立刻呼叫 `printHello`，實際上它被送出到瀏覽器、繞了一圈、等 Event Loop 放行後才執行，流程不直觀

## ES6 的新方案：Promises 雙管齊下的幻象函式

ES6 引入了 **Promise**，並隨之帶來了新的標準化網路請求介面 `fetch`，取代了舊有的 `XMLHttpRequest`（XHR）。

`fetch` 是一個**雙管齊下的幻象函式（Two-pronged Facade Function）**，它同時做兩件事：

```javascript
const futureData = fetch('https://tiktok.com/api/will/1');
// 1：在瀏覽器背景發起網路請求
// 2：立刻在 JavaScript 中回傳一個特殊物件（Promise），存入 futureData
```

Promise 物件的引入解決了 ES5 模式的兩個核心問題：

1. **可在 JavaScript 內追蹤背景工作**：Promise 物件立即存在於記憶體中，代表一筆「正在進行的非同步工作」的紀錄
2. **提供更可讀的方式處理回傳資料**：透過 Promise 提供的介面，可以用更線性的語法描述「拿到資料後要做什麼」，而不必將所有後續邏輯全部塞入 callback 內部

值得注意的是，雖然 `fetch` 與 Promises 讓程式碼在表面上看起來更線性、更直觀，但其底層的執行機制與 ES5 的 callback 模式在本質上高度相似，同樣依賴 Event Loop 與佇列機制，只是多了一些關鍵的新規則，這些細節將在後續文章中說明。

## 複習

### 在 ES6 之前，在 JavaScript 內部與 Web Browser 互動的標準做法是什麼？

將 callback function 傳入幻象函式（如 setTimeout）。幻象函式會在背景啟動工作，當背景工作完成後，再執行 callback。

### 以 callback 為基礎的非同步處理方式有哪兩個主要問題？

第一，在 JavaScript 內部沒有正式的方式追蹤正在進行的背景工作；第二，背景任務的回應資料只存在於完成時執行的 callback function 內部，這可能導致 Callback Hell。

### Callback Queue 中的 callback function 實際上何時會在 JavaScript 中執行？

只有當 Event Loop 確認 Call Stack 清空且所有全域程式碼執行完畢後，callback function 才會被執行。

### 雙管齊下的幻象函式（如 fetch）所做的兩件事分別是什麼？

第一件事：在 Web Browser 中啟動背景工作（例如發起網路請求）；
第二件事：立刻在 JavaScript 中回傳一個特殊物件（Promise），作為未來資料的佔位符。

### 在 ES6 及之後的版本中，哪個幻象函式取代了 XHR，成為存取網路的標準做法？

fetch

## 小測驗

<details>
<summary>在 ES6 之前，在 JavaScript 內部與外部世界互動的標準做法是什麼？</summary>
使用傳入幻象函式的 callback function
</details>

<details>
<summary>在處理網路請求時，callback function 的主要問題是什麼？</summary>
回應資料只存在於 callback function 內部
</details>

<details>
<summary>為什麼 callback 模式有時被認為令人困惑？</summary>
因為被傳入的函式看起來像是立刻執行，但實際上會在很久之後才運行
</details>

<details>
<summary>在現代 JavaScript 中，哪個方式取代了 XHR（XMLHttpRequest）用於存取網路？</summary>
Fetch
</details>

<details>
<summary>fetch 函式在 JavaScript 中會立刻回傳什麼？</summary>
一個作為佔位符 (placeholder) 的 Promise 物件
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
