---
title: Promise 錯誤處理、AbortSignal 與非同步 JavaScript 總結
description: 說明 Promise 的錯誤處理機制：透過 `[[RejectReactions]]` 與 `.catch()` 統一管理失敗情境。並介紹 2022 年新增的 `AbortSignal.timeout()`，示範如何為 `fetch` 加上超時自動中止的能力。最後整理 Microtask Queue、Callback Queue 與 Event Loop 的完整執行規則。
date: 2026-05-18
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 36
chapter: 'Asynchronous JavaScript & the event loop'
tags:
    - JavaScript
    - Promise
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# Promise 錯誤處理、AbortSignal 與非同步 JavaScript 總結

## Promise 的優缺點

**缺點**

大多數開發者不了解 Promise 在底層的實際運作方式，常誤以為傳入 `.then()` 的函式會立刻執行。這種誤解導致除錯困難，也是技術面試常見的失分點。

**優點**

- 程式碼具備**擬同步（pseudo-synchronous）風格**，讀起來比巢狀 callback 更線性、易懂
- 提供結構化的錯誤處理機制，透過 `[[RejectReactions]]` 與 `.catch()` 統一管理失敗情境

## 錯誤處理：`[[RejectReactions]]` 與 `.catch()`

Promise 物件除了 `[[FulfillReactions]]` 之外，還有另一個隱藏陣列 `[[RejectReactions]]`，專門存放「背景工作失敗時要執行的函式」。

使用 `.catch()` 將函式登記到此陣列：

```javascript
futureData.then(display); // 登記到 [[FulfillReactions]]
futureData.catch(handleError); // 登記到 [[RejectReactions]]
```

當背景工作回傳的是錯誤而非資料時，`[[Result]]` 會被填入錯誤內容，JavaScript 跳過 `[[FulfillReactions]]`，改為自動觸發 `[[RejectReactions]]` 中的函式。

## 延伸功能：AbortSignal 與 fetch 的超時控制

`fetch` 預設會一直等待伺服器回應，沒有內建的超時機制。2017 年引入了 AbortController 讓開發者可以手動中斷請求；2022 年 WHATWG 進一步新增了 `AbortSignal.timeout()`，讓計時器能自動觸發中斷。

```javascript
const signal = AbortSignal.timeout(200); // WHATWG 2022

const futureData = fetch('tiktok.com/will', { signal: signal });
futureData.then(display);
futureData.catch(display);
```

`AbortSignal.timeout(200)` 同樣是雙管齊下的操作：

| 執行端        | 結果                                                                        |
| ------------- | --------------------------------------------------------------------------- |
| JavaScript 端 | 建立一個 signal 物件，含兩個可見屬性：`aborted: false`、`reason: undefined` |
| 瀏覽器端      | 啟動一個 200ms 的背景計時器                                                 |

signal 物件被傳入 `fetch` 的第二個參數後，瀏覽器的網路請求便與該計時器建立連結：若計時器在網路請求完成之前到期，瀏覽器會直接中止網路請求，並將一個 TimeoutError 填入 Promise 的 `[[Result]]`，同時將 signal 物件的 `aborted` 更新為 `true`、`reason` 更新為該錯誤。此時 `[[FulfillReactions]]` 不會被觸發，改為觸發 `[[RejectReactions]]`。

以本例而言，網路請求在 270ms 完成，但超時設定為 200ms，因此請求會在 200ms 時被中止，最終收到錯誤而非 `"cute puppy"`。

## 非同步執行規則總整理

| 規則                     | 說明                                                                     |
| ------------------------ | ------------------------------------------------------------------------ |
| 背景工作完成後的回呼去向 | Promise 的回呼進 Microtask Queue；`setTimeout` 等的回呼進 Callback Queue |
| 執行條件                 | Call Stack 清空且所有全域程式碼執行完畢                                  |
| Queue 優先順序           | Event Loop 永遠優先清空 Microtask Queue，才轉向 Callback Queue           |

---

## 非同步 JavaScript 存在的意義

Promises、Web APIs、Callback Queue、Microtask Queue 與 Event Loop 共同支撐了以下能力：

**Non-blocking（非阻塞）**：不需要在單執行緒中等待耗時工作，後續程式碼可以繼續執行。

**不可預測的完成時機**：我們無法預知網路請求何時回傳，因此讓 JavaScript 在完成時自動執行回呼函式，而不是手動計算時機。開發者只需將函式定義傳入（不加括號），JavaScript 會在適當時機自動加上括號執行，並自動插入回傳資料作為引數。

**現代網頁應用的基礎**：非同步 JavaScript 是現代網頁的骨幹，讓我們能夠建構快速、流暢、不阻塞的應用程式。

## 複習

### `AbortSignal.timeout()` 回傳的物件上有哪兩個關鍵屬性？它們的初始值分別是什麼？

兩個屬性分別是 `aborted` 和 `reason`。初始時，`aborted` 為 `false`，`reason` 為 `undefined`。

### 在搭配 fetch 使用 `AbortSignal.timeout()` 時，如果超時計時器在網路請求完成前到期，會發生什麼事？

網路請求會被中止，並回傳一個錯誤（TimeoutError）取代原本的回應。此錯誤會被填入 Promise 的 `[[Result]]` 屬性，進而觸發 `[[RejectReactions]]` 陣列中的函式，而非 `[[FulfillReactions]]` 中的函式。

## 小測驗

<details>
<summary>當 Promise 收到錯誤而非成功資料時，會發生什麼事？</summary>
`[[RejectReactions]]` 陣列中的函式會被執行
</details>

<details>
<summary>`AbortSignal.timeout()` 功能的用途是什麼？</summary>
在計時器於背景任務完成前到期時，自動取消背景工作
</details>

<details>
<summary>`AbortSignal.timeout()` 回傳的物件包含哪些屬性？</summary>
aborted 和 reason
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
