---
title: ES6 Promises 與 fetch
description: 說明 `fetch` 作為雙管齊下的幻象函式的運作方式：呼叫當下同時在瀏覽器背景發出 HTTP 請求，並立刻在 JavaScript 中回傳 Promise 物件。介紹 Promise 的 `[[Result]]` 與 `[[FulfillReactions]]` 兩個隱藏屬性，以及 `.then()` 的作用，並逐步追蹤從發出請求到資料回傳的完整執行流程。
date: 2026-05-16
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 32
chapter: 'Asynchronous JavaScript & the event loop'
tags:
    - JavaScript
    - Promise
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# ES6 Promises 與 fetch

## fetch

`fetch` 是 ES6 引入的內建幻象函式，用來透過瀏覽器的網路功能向外部伺服器發送 HTTP 請求。它之所以被稱為「雙管齊下的幻象函式」，是因為呼叫它的瞬間會同時產生兩個效果：

```javascript
function display(data) {
    console.log(data);
}

const futureData = fetch('https://tiktok.com/will');
// [[Result]]

futureData.then(display); // [[FulfillReactions]]

console.log('Me first!');
```

| 事件   | 發生位置          | 內容                                             |
| ------ | ----------------- | ------------------------------------------------ |
| 事件一 | 瀏覽器背景        | 啟動網路功能，向 TikTok 伺服器發出 HTTP GET 請求 |
| 事件二 | JavaScript 記憶體 | 立刻回傳一個 **Promise 物件**，存入 `futureData` |

`fetch` 預設使用 GET 方式取得資料。若要向伺服器傳送資料（如新增留言），則需傳入第二個參數並將方法設為 POST。

## Promise 物件的結構

Promise 是 JavaScript 內建的特殊物件，在呼叫 `fetch` 時立即建立並回傳。它有兩個關鍵的隱藏屬性：

**`[[Result]]`**

- 初始值為 `undefined`
- 當背景的網路請求完成後，回傳的資料會自動填入此屬性

**`[[FulfillReactions]]`**

- 初始值為空陣列 `[]`
- 用來存放「當資料回來時要執行的函式」

這兩個屬性無法直接存取（因為是隱藏屬性），必須透過 Promise 提供的方法操作。

### `.then()`：將函式登記到 `[[FulfillReactions]]`

`.then()` 是 Promise 物件上提供的方法，用來將一個函式推入 `[[FulfillReactions]]` 陣列：

```javascript
futureData.then(display);
// 等同於將 display 函式推入 futureData 的 [[FulfillReactions]] 陣列
```

登記後，當 `[[Result]]` 被填入資料的瞬間，JavaScript 會自動取出 `[[FulfillReactions]]` 陣列中的所有函式並執行，且**自動將 `[[Result]]` 的資料作為引數傳入**。

### 逐步追蹤執行流程

> 時間只是假設的，方便用來分辨前後順序

#### 0ms：宣告函式、執行 fetch

`display` 的函式定義存入記憶體。`futureData` 初始值為 `undefined`（尚未完成右側求值）。

`fetch` 被呼叫，同時：

- 瀏覽器背景啟動網路請求，向 TikTok 發出 HTTP 訊息
- JavaScript 立刻取得一個 Promise 物件，存入 `futureData`，此時 `[[Result]]` 為 `undefined`，`[[FulfillReactions]]` 為 `[]`

#### 0ms：執行 `.then(display)`

`display` 函式被推入 `futureData.[[FulfillReactions]]` 陣列。

#### 1ms：執行 `console.log("Me first!")`

JavaScript 主執行緒同步繼續，輸出：

```
Me first!
```

#### 270ms：網路請求完成

TikTok 伺服器回應，資料（例如字串 `"cute puppy"`）被填入 `futureData.[[Result]]`。此時 JavaScript 自動觸發 `[[FulfillReactions]]` 中的 `display` 函式，並將 `"cute puppy"` 作為引數傳入，輸出：

```
cute puppy
```

## Promise 與舊式 Callback 的差異

| 用途         | ES5 Callback 模式            | ES6 Promise 模式                       |
| ------------ | ---------------------------- | -------------------------------------- |
| 背景工作追蹤 | 無法在 JavaScript 內追蹤     | Promise 物件立刻存在於記憶體，可追蹤   |
| 資料存取範圍 | 只存在 callback 函式內部     | 透過 `[[Result]]` 屬性集中管理         |
| 程式碼可讀性 | 巢狀結構易陷入 Callback Hell | `.then()` 鏈式語法較為線性             |
| 底層執行機制 | Callback Queue + Event Loop  | 相同機制，加上額外規則（後續文章說明） |

## 複習

### 在 JavaScript 中呼叫 fetch 時，它同時做的兩件事是什麼？

fetch 在瀏覽器背景啟動工作（具體來說是使用網路功能發出 HTTP 請求），同時立刻在 JavaScript 中回傳一個 Promise 物件，作為背景工作回傳資料的佔位符。

### fetch 回傳的 Promise 物件上有哪兩個關鍵屬性？

Promise 物件有一個 `[[Result]]` 屬性（初始值為 undefined，最終會存放背景工作回傳的資料）和一個 `[[FulfillReactions]]` 屬性（初始值為空陣列，用來存放資料回來時要執行的函式）。

### 當 Promise 物件的 `[[Result]]` 屬性被填入回傳資料時，會自動發生什麼事？

當 `[[Result]]` 屬性被填入資料時，JavaScript 會自動觸發 `[[FulfillReactions]]` 陣列中所有函式的執行，並將 `[[Result]]` 的資料作為引數自動傳入這些函式。

## 小測驗

<details>
<summary>fetch 被呼叫時，會立刻回傳什麼到 JavaScript 中？</summary>
一個 Promise 物件
</details>

<details>
<summary>fetch 建立的 Promise 物件上有哪兩個主要屬性？</summary>
`[[Result]]` 和 `[[FulfillReactions]]`
</details>

<details>
<summary>要將函式新增到 Promise 物件的 `[[FulfillReactions]]` 陣列，應使用哪個方法？</summary>
.then()
</details>

<details>
<summary>當 Promise 物件的 `[[Result]]` 屬性被填入資料時，會發生什麼事？</summary>
`[[FulfillReactions]]` 陣列中的函式會被自動觸發，並接收該資料作為引數
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
