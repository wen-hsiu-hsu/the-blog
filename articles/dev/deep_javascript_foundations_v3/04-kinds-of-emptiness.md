---
title: '三種「空」：undefined、undeclared 與 uninitialized'
description: '釐清 JavaScript 中三種容易混淆的「空」狀態：undeclared（從未宣告）、undefined（已宣告但無值）、uninitialized（TDZ，存在但禁止存取）。說明三者的本質差異，以及 typeof 運算子在處理未宣告識別字時的特殊行為。'
date: 2026-05-27
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 4
chapter: 'Types'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - TDZ
    - Undefined
---

# 三種「空」：undefined、undeclared 與 uninitialized

> 本文延續對 JavaScript 型別系統的討論。前幾篇談到 `typeof` 對未宣告的識別字會回傳 `"undefined"` 而非拋出錯誤，這個行為背後其實隱藏了一個重要的概念混淆問題：`undefined` 和 `undeclared` 在 JavaScript 中是完全不同的兩件事。

在英文裡，"undefined" 和 "undeclared" 讀起來幾乎像同義詞，這是開發者產生混淆的根本原因。但在 JavaScript 中，它們描述的是性質截然不同的兩種狀態，不能互換。

## 三種「空」的狀態

JavaScript 的變數存在三種不同的「沒有值」狀態：

### 1. `undeclared`（未宣告）

變數從未在任何可存取的範疇（scope）中被建立過。

```js
typeof doesntExist; // "undefined"（歷史設計的遺憾）
```

這裡有一個歷史包袱：`typeof` 對未宣告的識別字回傳 `"undefined"` 而非 `"undeclared"`，Kyle Simpson 認為這是一個不應當發生的設計決策，正確行為應該回傳字串 `"undeclared"` 才能清楚區分兩者。

`typeof` 是 JavaScript 中唯一能夠在不拋出錯誤的情況下引用一個根本不存在的識別字的運算子。

### 2. `undefined`（已宣告，當前無值）

變數確實存在，但目前沒有持有任何值。

```js
var v;
typeof v; // "undefined"
```

這裡強調「當前」：一個變數可以先有值，之後被設回 `undefined`，再之後又被賦予新值。`undefined` 描述的是某個時間點的狀態，而非永久特性。

### 3. `uninitialized` / TDZ（已存在，但禁止存取）

ES6 引入區塊範疇變數（`let`、`const`）時，帶來了第三種狀態：變數已經存在於範疇中，但尚未被初始化，處於所謂的**暫時性死區（Temporal Dead Zone，TDZ）**。

```js
// 試圖在宣告前存取 let 變數
console.log(x); // ReferenceError: Cannot access 'x' before initialization
let x = 10;
```

處於 TDZ 的變數是完全禁止碰觸的，任何形式的存取都會拋出 TDZ 錯誤。與 `undefined` 的關鍵差異在於：`undefined` 是合法的空值狀態，TDZ 是非法的存取狀態。關於 TDZ 的來源與運作細節，會在後續討論範疇的章節深入展開。

## 三種狀態的對比

| 狀態                   | 變數是否存在   | 是否可存取             | `typeof` 回傳             |
| ---------------------- | -------------- | ---------------------- | ------------------------- |
| `undeclared`           | 否             | 否（但 `typeof` 例外） | `"undefined"`（歷史 bug） |
| `undefined`            | 是             | 是                     | `"undefined"`             |
| `uninitialized`（TDZ） | 是（在範疇中） | 否                     | 拋出 TDZ 錯誤             |

## 複習

### JavaScript 中 'undefined' 和 'undeclared' 有什麼差異？

'undefined' 代表變數存在但當前沒有值；'undeclared' 代表該變數從未在任何可存取的範疇中被建立過。

### typeof 運算子在 JavaScript 中有什麼獨特的性質？

它是唯一能夠在不拋出錯誤的情況下引用不存在的識別字的運算子。

### 什麼是暫時性死區（Temporal Dead Zone，TDZ）？

一種區塊範疇變數尚未被初始化的狀態，在此狀態下嘗試存取該變數會拋出錯誤。

### JavaScript 變數的「空」狀態共有幾種？

三種：uninitialized（TDZ，未初始化）、undefined（變數存在但無值）、undeclared（變數從未被建立）。

### 嘗試存取處於暫時性死區的變數會發生什麼？

會得到 TDZ 錯誤，該變數在此狀態下完全不能以任何方式被存取。

## 小測驗

<details>
<summary>'undefined' 和 'undeclared' 在 JavaScript 中有什麼差異？</summary>
undefined 代表變數存在但當前沒有值；undeclared 代表該變數從未在任何可存取的範疇中被建立過
</details>

<details>
<summary>什麼是暫時性死區（TDZ）？</summary>
一種區塊範疇變數尚未被初始化、無法被存取的狀態
</details>

<details>
<summary>JavaScript 變數的「空」概念共有幾種？</summary>
三種：uninitialized（未初始化）、undefined（無值）、undeclared（未宣告）
</details>

<details>
<summary>嘗試存取處於暫時性死區的變數會發生什麼？</summary>
會得到 TDZ 錯誤，無法存取該變數
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
