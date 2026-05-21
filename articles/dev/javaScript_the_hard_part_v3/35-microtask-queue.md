---
title: Microtask Queue：Promise 回呼的優先執行機制
description: 說明 JavaScript 非同步系統中存在兩個佇列：Callback Queue 與 Microtask Queue。透過同時混用 `setTimeout` 與 `fetch` 的程式碼，逐步追蹤執行時間軸，說明 Event Loop 為何永遠優先清空 Microtask Queue，以及這個規則如何決定最終的輸出順序。
date: 2026-05-17
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 35
chapter: 'Asynchronous JavaScript & the event loop'
tags:
    - JavaScript
    - MicrotaskQueue
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# Microtask Queue：Promise 回呼的優先執行機制

延續[[35-microtask-queue|上一節]]的程式碼，當全域程式碼執行完畢後，系統中同時存在兩個等待執行的函式：

- `printHello`：由 `setTimeout(printHello, 0)` 在 0ms 時放入 Callback Queue
- `display`：由 `fetch` 的 Promise 在 270ms 資料回來後觸發

若兩者都在同一個 Callback Queue 中，`printHello` 先入列，理應先執行。但實際結果是 `display` 先執行。這說明 Promise 的回呼根本不在 Callback Queue 裡。

## 完整執行時間軸

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

| 時間點 | 事件                                                                                                                         |
| ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| 0ms    | `setTimeout` 啟動 0ms 計時器，立刻完成，`printHello` 進入 **Callback Queue**                                                 |
| 1ms    | `fetch` 發出 GET 網路請求；`futureData` Promise 物件建立，`[[Result]]` 為 `undefined`                                        |
| 1ms    | `.then(display)` 將 `display` 登記至 `futureData.[[FulfillReactions]]`                                                       |
| 2ms    | `blockFor300ms()` 進入 Call Stack，阻塞 JavaScript 主執行緒整整 300ms                                                        |
| 270ms  | 網路請求完成，`futureData.[[Result]]` 更新為 `"cute puppy"`，`display` 進入 **Microtask Queue**                              |
| 302ms  | `blockFor300ms` 結束，從 Call Stack 彈出                                                                                     |
| 302ms  | 全域程式碼繼續，`console.log("Me first!")` 執行，輸出 `Me first!`                                                            |
| 303ms  | 全域程式碼執行完畢，Event Loop 優先檢查 **Microtask Queue**，取出 `display`，以 `"cute puppy"` 為引數執行，輸出 `cute puppy` |
| 304ms  | Microtask Queue 清空，Event Loop 轉向 **Callback Queue**，取出 `printHello` 執行，輸出 `Hello`                               |

## 最終輸出順序

```
Me first!
cute puppy
Hello
```

## 兩個 Queue 的差異

JavaScript 的非同步系統實際上存在**兩個隊列**，而非一個：

| 特性                | Callback Queue（Task Queue）             | Microtask Queue                        |
| ------------------- | ---------------------------------------- | -------------------------------------- |
| 存放來源            | `setTimeout`、`setInterval` 等計時器回呼 | Promise 的 `.then()` 所登記的函式      |
| Event Loop 優先順序 | **次要**，Microtask Queue 清空後才檢查   | **優先**，全域程式碼結束後第一個被檢查 |

## Event Loop 的完整檢查規則

Event Loop 在每次決定是否執行下一個任務時，遵循以下順序：

1. Call Stack 是否清空？全域程式碼是否執行完畢？
2. **優先**檢查 Microtask Queue，若有函式則取出並執行，且必須將 Microtask Queue **完全清空**後才進行下一步
3. 再檢查 Callback Queue，若有函式則取出一個並執行

這個優先順序確保了 Promise 的回呼永遠比 `setTimeout` 的回呼更早獲得執行機會（在相同的全域程式碼結束後的情況下）。

## 複習

### JavaScript 中用於非同步操作的兩種 Queue 分別是什麼？

Callback Queue（又稱 Task Queue）和 Microtask Queue。

### 透過 Promise 物件（`.then()`）所登記的延遲函式，會被放入哪個 Queue？

附加到 Promise 物件的函式會被放入 Microtask Queue，永遠不會進入 Callback Queue。

### 當 Event Loop 檢查哪些函式準備好可以執行時，它優先檢查哪個 Queue？

Event Loop 永遠優先檢查 Microtask Queue，其優先權高於 Callback Queue。

### 當 Promise 的回應資料回來、`[[Result]]` 屬性被更新時，會發生什麼事？

當回應資料回來後，Promise 的 `[[Result]]` 屬性會被更新為該資料，所有透過 `.then()` 登記的函式會自動被排入 Microtask Queue 等待執行。

## 小測驗

<details>
<summary>當 Promise 的 `[[Result]]` 被更新為解析後的資料時，會發生什麼事？</summary>
透過 `.then()` 附加的函式會被排入 Microtask Queue，並以該資料作為引數自動被呼叫執行
</details>

<details>
<summary>Event Loop 在決定將哪個函式加入 Call Stack 時，優先檢查哪個 Queue？</summary>
永遠優先檢查 Microtask Queue
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
