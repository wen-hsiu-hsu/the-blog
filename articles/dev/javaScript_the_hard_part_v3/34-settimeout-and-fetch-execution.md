---
title: 當 Callback Queue 遇上 Promise：執行順序追蹤
description: 逐步追蹤同時包含 `setTimeout` 與 `fetch` 的程式碼執行流程，說明 Callback Queue 與 Promise 回呼機制如何在同一段程式碼中並行運作，並以此引出一個關鍵問題：當兩者同時就緒，究竟誰先執行？
date: 2026-05-17
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 34
chapter: 'Asynchronous JavaScript & the event loop'
tags:
    - JavaScript
    - Promise
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# 當 Callback Queue 遇上 Promise：執行順序追蹤

我們來整個重新檢視[[33-deferred-promise-functionality|前一篇]]最後的範例程式碼，首先再次檢視目前我們所知道的完整系統組成。

**JavaScript 引擎**

- Thread of Execution（單執行緒、同步）
- Memory（全域記憶體）
- Call Stack

**瀏覽器環境（Web Browser APIs）**

- 計時器（Timers）
- 網路請求（Network）
- DOM、Console 等其他功能

**橋樑機制**

- Callback Queue：存放來自瀏覽器背景工作完成後待執行的函式
- Event Loop：持續檢查 Call Stack 是否清空、全域程式碼是否完成、Callback Queue 是否有待執行項目

## 程式碼逐步執行追蹤

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

### 步驟一：宣告三個函式

`display`、`printHello`、`blockFor300ms` 的函式定義依序存入全域記憶體。函式主體在被呼叫之前完全不會被執行或評估。

### 步驟二：呼叫 setTimeout（0ms）

`setTimeout` 是幻象函式，在瀏覽器端啟動一個 0ms 計時器，附帶 `printHello` 的參照作為完成時的回呼。

0ms 計時器幾乎立刻完成，`printHello` **進入 Callback Queue** 等待：

```
Callback Queue: [ printHello ]
```

此時雖然全域程式碼尚未跑完，Event Loop 不允許 `printHello` 上 Call Stack。

### 步驟三：呼叫 fetch（約 1ms）

`fetch` 是雙管齊下的幻象函式，同時做兩件事：

**第一件事（瀏覽器端）**：啟動網路功能，向 `https://tiktok.com/will` 發出預設的 **HTTP GET 請求**，傳遞的資訊包含網域（domain）與路徑（route）。此時工作尚未完成。

**第二件事（JavaScript 端）**：立刻在記憶體中建立一個 Promise 物件，存入 `futureData`：

```javascript
futureData = {
    [[Result]]: undefined,
    [[FulfillReactions]]: [],
};
```

瀏覽器的網路請求持有指向這個 Promise 物件的參照，工作完成後會透過此參照更新 `[[Result]]`。

### 步驟四：呼叫 futureData.then(display)

`.then()` 方法將 `display` 函式推入 `futureData.[[FulfillReactions]]`：

```
futureData = {
  [[Result]]: undefined,
  [[FulfillReactions]]: [ display ]
}
```

`display` 此刻並未執行，只是被登記為「資料回來時要執行的函式」。

### 步驟五：呼叫 blockFor300ms

`blockFor300ms` 被加入 Call Stack，在 JavaScript 主執行緒中同步阻塞整整 300ms。

在這期間：

- `printHello` 在 Callback Queue 中等待
- 網路請求在瀏覽器背景繼續處理
- Event Loop 持續檢查，但 Call Stack 不為空，所以什麼都不能執行

### 步驟六：console.log("Me first!")（約 301ms）

`blockFor300ms` 結束後，全域程式碼繼續執行，輸出：

```
Me first!
```

### 系統目前的狀態

全域程式碼執行完畢，Call Stack 清空。此時：

- Callback Queue 中有：`printHello`（來自 setTimeout，0ms 就已就緒）
- 網路請求可能已完成（假設在 300ms 內回應），`display` 已準備就緒

**`printHello` 和 `display` 誰先執行？**

若兩者都使用 Callback Queue，`printHello` 因為更早入列應先執行。但實際上，Promise 的回呼並不走 Callback Queue，而是走一個優先權更高的獨立機制，即 **Microtask Queue**。這將在下一節中完整解釋。

## 複習

### 在 JavaScript 中呼叫 `fetch` 時，會產生哪兩個主要結果？

fetch 有兩管：第一，在 Web Browser 功能中啟動背景工作（具體為一個網路請求）；第二，立刻在 JavaScript 記憶體中回傳一個 Promise 物件，作為最終資料的佔位符。

### 當 `setTimeout` 以 0 毫秒的計時器被呼叫時，計時器完成後 callback function 會去哪裡？

callback function 會進入 Callback Queue。即使計時器在 0ms 就立刻完成，函式仍必須在 Callback Queue 中等待，才能被加入 Call Stack 執行。

### `fetch` 預設隱含發送哪種 HTTP 請求？傳給網路請求功能的資訊是什麼？

fetch 預設隱含發送 GET 請求。傳遞的資訊包含網域（domain）和要請求資源的路徑（route/path）。

## 小測驗

<details>
<summary>在 JavaScript 中呼叫 fetch 時，會產生哪兩個主要結果？</summary>
在 JavaScript 記憶體中建立一個 Promise 物件，以及在瀏覽器中發起一個網路請求
</details>

<details>
<summary>當 setTimeout 建立的計時器完成後，其 callback function 會去哪裡？</summary>
進入 Callback Queue
</details>

<details>
<summary>fetch 預設自動發送哪種 HTTP 請求？</summary>
GET
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
