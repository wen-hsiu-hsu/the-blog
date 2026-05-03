---
title: Closure 的實際應用：once、memoize、Iterator 與 Module Pattern
description: 說明 Closure 如何成為 JavaScript 進階功能的實作基礎，涵蓋 once、memoize、Iterator、Generator、Module Pattern 與非同步 Callback 的設計原理。
date: 2026-05-06
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 17
chapter: Closure
tags:
    - JavaScript
    - Closure
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# Closure 的實際應用：once、memoize、Iterator 與 Module Pattern

Closure 賦予函式兩種記憶體：每次執行時建立的暫時本地記憶體，以及跨越多次呼叫持續存在的私有背包。這個組合不只是理論上的優雅，它是以下所有進階 JavaScript 功能的實作基礎。

## Helper Functions：`once` 與 `memoize`

**`once`——限制函式只能執行一次**

某些情境下，我們希望一個函式只被執行一次，例如遊戲中的「勝利」邏輯，不能因為使用者連續觸發而重複執行。`once` 的實作原理是在背包中維護一個狀態（例如 `hasBeenRun: false`），每次呼叫時先檢查這個值，若已執行過則直接拒絕。

```javascript
// 概念示意
function once(fn) {
    let hasBeenRun = false; // 儲存在背包中
    return function (...args) {
        if (!hasBeenRun) {
            hasBeenRun = true;
            return fn(...args);
        }
    };
}
```

**`memoize`——快取運算結果**

計算第 120 萬個質數是一個極度耗時的運算。`memoize` 的原理是在背包中維護一張「輸入值 → 結果」的對應表，每次呼叫前先查表，若已有快取則直接回傳，避免重複運算。

## Iterators 與 Generators

**Iterators（迭代器）**

迭代器是一種函式，每次呼叫時回傳陣列的下一個元素，而非用 `for` 迴圈一口氣遍歷整個陣列。問題是：函式本身沒有記憶，它怎麼知道上次讀到第幾個位置？

答案是：把**當前位置的索引**存在背包中。每次呼叫函式，從背包取出索引、回傳對應元素、將索引加一後存回背包。整個流程完全依賴 closure。

**Generators（生成器）**

Generators 更進一步：它們可以在函式執行到一半時「暫停」，等待非同步工作（例如 API 呼叫）完成後再繼續。要恢復一個暫停中的函式，需要保留兩樣東西：

- 當前的本地記憶體狀態
- 程式碼執行的當前位置

這兩者都儲存在 closure 中，使得「暫停後繼續」成為可能。

## Module Pattern

在大型程式庫中，不同開發者可能都想使用 `result`、`counter` 這類常見的變數名稱。如果全部放在全域，必然產生衝突。

兩個看似可行但都有缺陷的方案：

| 方案                 | 問題                         |
| -------------------- | ---------------------------- |
| 放在全域             | 污染全域命名空間，容易被覆蓋 |
| 放在函式的本地記憶體 | 函式執行完畢後資料消失       |

Module Pattern 的解法是：用一個外層函式建立私有的持久狀態，回傳一組可以操作這份狀態的函式。這份狀態活在背包裡：對外不可見，但對被回傳的函式永遠可存取。

## 非同步 JavaScript：Callbacks 與 Promises

JavaScript 的非同步機制（向伺服器取得資料、API 呼叫）的核心問題是：

> 當資料回來時，我要執行某個 callback 函式。但那個函式需要的資料，不只是從伺服器拿回來的，還有我在發出請求之前就已經準備好的其他資料。那些資料在 callback 被執行時還存在嗎？

Closure 的答案是：存在，因為 callback 函式在被**定義**的當下，就已經透過 `[[scope]]` 把周圍的資料鎖進背包了。無論它什麼時候被呼叫，那份資料始終在它的背包裡等著。

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
