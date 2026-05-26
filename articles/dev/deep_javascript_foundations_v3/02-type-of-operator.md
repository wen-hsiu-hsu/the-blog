---
title: '`typeof` 運算子：辨識值的型別'
description: '介紹 typeof 運算子的核心特性：永遠回傳字串、回傳值是有限的可預測集合。並整理三個常見的特殊案例——typeof null 的歷史 bug、函式與陣列的差異處理，以及對未宣告識別字的安全行為。'
date: 2026-05-26
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 2
chapter: 'Types'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - TypeOf
    - Undefined
---

# `typeof` 運算子：辨識值的型別

> 本文延續上一篇對 JavaScript 型別系統的介紹。既然我們知道型別屬於值本身而非變數，下一個問題自然是：在執行期，我們怎麼知道某個變數當前持有的是哪種型別的值？`typeof` 就是第一個也是最常用的工具。

## `typeof` 問的是值，不是變數

使用 `typeof v` 時，問的不是「`v` 這個變數是什麼型別」，而是「`v` 當前持有的值是什麼型別」。這個區分在動態定型語言中至關重要，因為同一個變數在不同時間點可以持有不同型別的值。

```javascript
var v;
typeof v; // "undefined"

v = '1';
typeof v; // "string"

v = 2;
typeof v; // "number"

v = true;
typeof v; // "boolean"

v = {};
typeof v; // "object"

v = Symbol();
typeof v; // "symbol"
```

## `typeof` 的兩個保證

`typeof` 運算子有兩個非常重要的特性：

**保證一：永遠回傳字串。** 無論傳入什麼值，`typeof` 的回傳值一定是字串。這意味著以下寫法是常見的錯誤：

```javascript
// 錯誤：typeof 不可能回傳非字串的 undefined
if (typeof v === undefined) { ... }

// 正確：必須比對字串 "undefined"
if (typeof v === "undefined") { ... }
```

**保證二：回傳值是有限的已知集合。** `typeof` 可能回傳的字串是可預測的，不會出現空字串或其他意外值。這讓型別判斷的行為可以被完整理解與預測。

## 各型別的 `typeof` 回傳值

| 值             | `typeof` 回傳 | 說明                         |
| -------------- | ------------- | ---------------------------- |
| 未賦值的變數   | `"undefined"` | 預設初始狀態                 |
| `"hello"`      | `"string"`    |                              |
| `42`           | `"number"`    |                              |
| `true`         | `"boolean"`   |                              |
| `{}`           | `"object"`    |                              |
| `Symbol()`     | `"symbol"`    |                              |
| `function(){}` | `"function"`  | 雖非頂層型別，仍有專屬回傳值 |
| `null`         | `"object"`    | 歷史 bug                     |
| `[1,2,3]`      | `"object"`    | 陣列是 object 子型別         |
| 未宣告的識別字 | `"undefined"` | 特殊安全行為，見下方說明     |

## 三個值得特別注意的案例

### `null` 回傳 `"object"`（歷史 bug）

```js
var v = null;
typeof v; // "object"  OOPS!
```

這是 JavaScript 最著名的歷史 bug 之一，正確行為應回傳 `"null"`，但因為修正會破壞大量既有程式碼，規格書至今保留了這個行為。實務上，當 `typeof` 回傳 `"object"` 時，需額外確認值不是 `null`：

```js
if (v !== null && typeof v === 'object') {
    // 確定是真正的物件
}
```

### 函式回傳 `"function"`，陣列卻回傳 `"object"`

```js
v = function () {};
typeof v; // "function"  （有專屬回傳值）

v = [1, 2, 3];
typeof v; // "object"   （無法區分陣列與一般物件）
```

函式雖然不是頂層型別，`typeof` 仍給了它專屬的回傳字串，使用起來方便。陣列則沒有同樣的待遇，只拿到 `"object"`。需要確認是否為陣列時，要改用語言提供的輔助工具：

```js
Array.isArray([1, 2, 3]); // true
```

### 對未宣告的識別字使用 `typeof` 不會拋出錯誤

```js
typeof doesntExist; // "undefined"
```

在一般情況下存取未宣告的變數會拋出 `ReferenceError`，但 `typeof` 是唯一的例外，它對未宣告的識別字也安全地回傳 `"undefined"`。這個行為在某些環境偵測的情境下（例如判斷某個全域變數是否存在）相當有用。

## `undefined` 的正確理解

`undefined` 不代表「這個變數從來沒有值」，正確的理解是**「這個變數當前沒有持有任何值」**。

一個變數可以先有值，後來被設回 `undefined`；也可以從未被賦值而停留在 `undefined`。這兩種情況在 `typeof` 的角度看起來完全相同，都是 `"undefined"`。

```js
var x = 42;
x = undefined; // 主動取消值，但 x 仍然存在
typeof x; // "undefined"
```

## 小結

`typeof` 是判斷值型別的首要工具，其核心特性是：永遠回傳字串，且回傳值是有限的可預測集合。掌握它的行為，包括 `null` 的 bug、函式與陣列的差異處理，以及對未宣告識別字的安全性，是在 JavaScript 中做可靠型別判斷的基礎。需要更細緻的子型別判斷時，再搭配 `Array.isArray` 等輔助方法使用。

## 複習

### `typeof` 運算子永遠回傳什麼？

typeof 永遠回傳一個字串，代表當前值的型別，例如 'undefined'、'string'、'number'、'object' 等。

### `typeof null` 在 JavaScript 中有什麼異常之處？

typeof null 回傳的是 'object' 而非 'null'，這被視為語言的歷史 bug。

### `typeof` 如何處理函式與陣列？

typeof 對函式回傳 'function'，對陣列回傳 'object'，因此需要使用 Array.isArray() 等額外方法才能確認是否為陣列。

### `undefined` 在 JavaScript 中代表什麼？

undefined 是一個只有一個值的型別，代表某個變數當前沒有持有任何值（已宣告但尚未或已不再被賦值）。

### `typeof` 永遠回傳字串有什麼意義？

透過永遠回傳字串，typeof 提供了一組可預測且有限的回傳值，降低判斷型別時的混淆，讓型別檢查更加可靠。

## 小測驗

<details>
<summary>typeof 運算子永遠回傳什麼？</summary>
字串
</details>

<details>
<summary>對一個未賦值的變數使用 typeof，會回傳什麼？</summary>
"undefined"
</details>

<details>
<summary>typeof null 回傳什麼？</summary>
"object"
</details>

<details>
<summary>如何確認一個值是否為陣列？</summary>
使用 Array.isArray()
</details>

<details>
<summary>undefined 在 JavaScript 中實際代表什麼？</summary>
該變數當前沒有持有任何值
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
