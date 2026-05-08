---
title: Promise 的運作機制：物件持久性、記憶體參照
description: 說明 `fetch` 建立的 Promise 物件如何跨越 JavaScript 引擎與瀏覽器兩個環境：瀏覽器的網路請求持有指向 Promise 物件的記憶體參照，背景工作完成時透過這個參照直接更新 `[[Result]]`。同時說明 Promise 物件為何不會在局部執行環境退出後消失，以及為何 Promise 回呼使用的不是 Callback Queue，而是優先權更高的 Microtask Queue。
date: 2026-05-16
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 33
chapter: 'Asynchronous JavaScript & the event loop'
tags:
    - JavaScript
    - Promise
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# Promise 的運作機制：物件持久性、記憶體參照

> 延續上一篇文章 [[32-promises-and-the-fetch-api]] 做簡單的回顧與觀念釐清

## 回顧：fetch 完成後發生了什麼

當 `fetch` 的背景網路請求完成，回傳資料會自動填入 Promise 物件的 `[[Result]]` 屬性，並同時觸發 `[[FulfillReactions]]` 陣列中透過 `.then()` 登記的所有函式，JavaScript 自動將 `[[Result]]` 的值作為引數傳入，不需要開發者手動傳遞。

## Promise 物件如何跨越兩個世界

`fetch` 是一個雙管齊下的幻象函式，它同時建立了兩件事，且這兩件事之間存在**緊密的連結**：

- **JavaScript 這一側**：一個 Promise 物件存入全域記憶體
- **瀏覽器這一側**：一個網路請求在背景執行

瀏覽器的網路請求並不會複製 Promise 物件，而是持有一個**指向該物件在 JavaScript 記憶體中位置的參照（reference）**。當網路請求完成時，瀏覽器透過這個參照直接更新 Promise 物件的 `[[Result]]` 屬性。這是 JavaScript 執行環境（JavaScript engine）與瀏覽器環境（web browser）之間的實作細節，正是這個機制讓「背景工作完成後自動更新 JavaScript 物件」成為可能。

## 為什麼 Promise 物件不會消失？

JavaScript 中所有物件都儲存在記憶體的 **Heap** 中，變數名稱只是指向 Heap 中物件位置的參照。即使一個 Promise 物件是在某個函式的局部執行環境中建立，當該函式執行完畢、局部執行環境關閉後，只要仍有其他東西持有指向該物件的參照，物件就不會被回收。

在 Promise 的情境下，**瀏覽器的網路請求持有對該 Promise 物件的參照**，因此即使建立它的執行環境已經退出，Promise 物件依然存活，直到背景工作完成並完成更新為止。

## 不是所有幻象函式都回傳 Promise

值得注意的是，並非所有幻象函式都設計成回傳 Promise。例如 `setTimeout` 在呼叫後雖然也啟動了瀏覽器背景工作（計時器），但它並不回傳 Promise 物件，只回傳一個計時器的 ID。只有明確設計為「回傳 Promise」的 Web Browser API（如 `fetch`）才會產生 Promise 物件。

## 下一個問題：Promise 的回呼用哪個 Queue？

至此我們已知道：`fetch` 的背景工作完成後，登記在 `[[FulfillReactions]]` 中的函式需要被執行。那麼，這些函式是透過先前介紹的 Callback Queue（Task Queue）回到 JavaScript 嗎？

以下這段程式碼將會揭示答案：

```javascript
function display(data) {
    console.log(data);
}
function printHello() {
    console.log('Hello');
}
function blockFor300ms() {
    /* 在 JS 執行緒中阻塞 300ms */
}

setTimeout(printHello, 0);

const futureData = fetch('https://tiktok.com/will');
futureData.then(display);

blockFor300ms();
console.log('Me first!');
```

這段程式碼同時混用了 `setTimeout`（使用 Callback Queue）和 `fetch`（使用 Promise）。若兩者共用同一個 Queue，`printHello` 應比 `display` 更早被執行，因為它的計時器在 0ms 就完成了。但實際結果並非如此。這說明 Promise 的回呼使用的是一個與 Callback Queue 不同的機制，即**Microtask Queue**，其優先權高於 Callback Queue，這將在後續文章詳細說明。

## 複習

### 呼叫 `fetch` 時，它會建立哪兩件事？

`fetch` 建立兩件事：第一，在 JavaScript 中建立一個 Promise 物件作為資料的佔位符；第二，在瀏覽器背景啟動一個網路請求來取得資料。

### 為什麼 Promise 物件在建立它的局部執行環境已退出後，仍然能夠持續存在？

Promise 物件能夠持續存在，是因為 JavaScript 中的物件儲存在 Heap 中，並以參考的方式被引用。即使局部執行環境退出並失去了名稱參照，瀏覽器仍然持有指向該 Promise 物件的參照，使其在記憶體中保持存活。

### 瀏覽器的背景工作是如何更新 JavaScript 記憶體中 Promise 物件的 `[[Result]]` 屬性的？

瀏覽器的網路請求持有一個指向 Promise 物件在 JavaScript 記憶體中位置的參照。當背景工作完成時，瀏覽器透過這個參照直接更新 Promise 物件的 `[[Result]]` 屬性。

### 透過 `.then()` 登記的函式被自動觸發時，如何接收到回傳的資料？

該函式被自動呼叫，並將回傳的資料作為引數（參數）傳入。JavaScript 會自動將 Promise 的 `[[Result]]` 屬性中的資料作為輸入插入該函式，開發者不需要明確地手動傳遞。

## 小測驗

<details>
<summary>呼叫 fetch 時，它會建立哪兩件事？</summary>
在 JavaScript 中建立一個 Promise 物件，以及在瀏覽器中發起一個網路請求
</details>

<details>
<summary>在 Promise 的脈絡中，`.then()` 方法的作用是什麼？</summary>
將函式附加到 Promise 完成時要執行的 `[[FulfillReactions]]` 陣列中
</details>

<details>
<summary>Web Browser API 如何與 fetch 建立的 Promise 物件保持連結？</summary>
它持有一個指向 Promise 物件在 JavaScript 記憶體中位置的參照
</details>

<details>
<summary>為什麼 Promise 物件在局部執行環境中被建立後，仍然可以持續存在？</summary>
因為瀏覽器在 Heap 中持有對它們的參照
</details>

<details>
<summary>`setTimeout` 會回傳 Promise 物件嗎？</summary>
不會，setTimeout 不回傳 Promise
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
