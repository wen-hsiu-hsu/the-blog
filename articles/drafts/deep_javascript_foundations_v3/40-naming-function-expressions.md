---
title: '為什麼要命名函式表達式：三個不可迴避的理由'
description: '說明為什麼應該永遠使用命名函式表達式的三個理由：可靠的自我參考、可讀的 stack trace，以及程式碼自我說明。同時整理函式宣告與函式表達式的選擇建議。'
date: 2026-06-15
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 40
chapter: 'Scope & Function Expressions'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - FunctionExpression
---

# 為什麼要命名函式表達式：三個不可迴避的理由

> 本文延續[[39-function-expressions|上一篇]]對函式宣告與函式表達式的討論。上一篇建立了兩者在範疇歸屬上的差異，這篇要回答一個更實踐性的問題：為什麼 Kyle Simpson 強烈建議永遠使用命名函式表達式，而非匿名函式表達式？

## 匿名函式表達式的問題

在 jQuery 盛行的年代到現在，匿名函式表達式幾乎無所不在：

```javascript
// 匿名函式表達式（極為常見，但有問題）
arr.map(function(x) { return x * 2; });

promise.then(function() { doSomething(); });
```

這種寫法的唯一優點是打字省力。Kyle Simpson 主張，這不是一個足以成立的理由。

## 理由一：可靠的自我參考

命名函式表達式的名稱會成為函式自身範疇內的唯讀識別字，讓函式能從內部可靠地引用自己：

```javascript
// 匿名版本：若需要自我參考，只能依賴外層變數（不可靠）
var doSomething = function() {
    doSomething();   // 依賴外層 doSomething，但它可被重新賦值
};

// 命名版本：名稱在自身範疇內，唯讀且可靠
var doSomething = function doSomething() {
    doSomething();   // 引用自身範疇的唯讀識別字
};
```

需要自我參考的場景包括：遞迴呼叫、事件監聽器解除綁定（需要引用自身來 `removeEventListener`）、存取函式物件的屬性（如 `length`、`name`）。自身範疇的唯讀名稱，永遠比外層可被修改的變數更可靠。

## 理由二：可讀的錯誤堆疊追蹤

匿名函式在 stack trace 中只會顯示 `anonymous`，在大量使用的程式碼中根本無從辨識：

```javascript
// 匿名函式的 stack trace（痛苦版）
at anonymous (app.min.js:1:32712)
at anonymous (app.min.js:1:18903)
at anonymous (app.min.js:1:5421)

// 命名函式的 stack trace（有意義版）
at handleUserClick (app.min.js:1:32712)
at processFormSubmit (app.min.js:1:18903)
at validateInputs (app.min.js:1:5421)
```

有語意的名稱讓你光看 stack trace 就能推斷 bug 的來源，甚至不需要打開原始碼。這在生產環境中尤其關鍵。

特別注意：將匿名函式賦值給變數有時可以推斷出名稱，但**作為 callback 直接傳入時（如 `.map`、`.then`），名稱推斷不會發生**，只有明確命名才能確保名稱出現在 stack trace 中。

## 理由三：程式碼自我說明

```javascript
// 讀者必須閱讀函式體才能理解它在做什麼
setTimeout(function() {
    // 幾行程式碼...
}, 1000);

// 名稱本身就是說明，不需要讀完內容
setTimeout(function handleSessionTimeout() {
    // 幾行程式碼...
}, 1000);
```

Kyle Simpson 的立場：**每一個函式都有存在的目的，有目的就有名稱**。如果你想不出一個好名稱，這通常是一個訊號，這個函式太複雜了，做了太多事，應該被拆解成更小的單元，直到每個單元的名稱變得顯而易見。

無法命名的函式是更深層問題的指標，而不是一個讓你寫匿名函式的藉口。

## 當你真的想不到名稱時

Kyle Simpson 分享他自己的工作習慣：先寫出函式，暫時用 `TODO` 作為名稱占位，在提交程式碼前搜尋所有 `TODO` 並補上正式名稱。這讓你在對函式有更清晰理解後，再做命名決定。

## 函式宣告 vs 函式表達式的選擇建議

| 情境               | 建議                         |
| ------------------ | ---------------------------- |
| 超過三行程式碼     | 優先使用函式宣告             |
| 需要被多次呼叫     | 使用函式宣告（即使只有一行） |
| 一到三行的簡短邏輯 | 可以使用命名函式表達式       |
| 任何情況下         | 永遠加上名稱，不要寫匿名函式 |

## 小結

匿名函式表達式的唯一優點是少打幾個字，但代價是失去可靠的自我參考能力、損害 stack trace 的可讀性、以及迫使讀者閱讀函式體才能理解意圖。命名函式表達式解決了所有這三個問題。如果可以，更進一步使用函式宣告，名稱只需要寫一次，且不涉及變數賦值的複雜性。

## 複習

### 偏好命名函式表達式的三個主要理由是什麼？

1. 創建對函式本身可靠的自我參考
2. 提供更易於除錯的錯誤堆疊追蹤
3. 透過清楚說明函式目的，讓程式碼更具自我說明性

### 命名函式如何改善 stack trace 的除錯體驗？

當函式有名稱時，它會以有意義的名稱出現在 stack trace 中，讓開發者更容易理解錯誤的來源和上下文，而不需要閱讀整段程式碼。

### 為什麼函式的名稱對程式碼可讀性很重要？

函式名稱說明了函式存在的原因，免除了讀者閱讀函式體才能推斷目的的需要，並立即傳達函式的意圖。

### 對於難以命名的函式，建議採取什麼方式？

如果一個函式難以命名，這可能意味著函式過於複雜，應該被拆解成更小、更聚焦的單元，直到每個單元的名稱變得清楚顯而易見。

### 什麼時候應該將函式表達式轉換為函式宣告？

一般而言，如果函式超過三行程式碼，或需要被多次呼叫，就應該轉換為函式宣告。

## 小測驗

<details>
<summary>偏好命名函式表達式的第一個關鍵理由是什麼？</summary>
從函式內部創建對自身可靠的自我參考
</details>

<details>
<summary>命名函式表達式如何改善除錯？</summary>
它們提供更易讀的 stack trace
</details>

<details>
<summary>使用命名函式表達式的第三個理由是什麼？</summary>
讓程式碼更具自我說明性
</details>

<details>
<summary>什麼情況下可能偏好函式表達式而非函式宣告？</summary>
當函式少於三行程式碼時
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記