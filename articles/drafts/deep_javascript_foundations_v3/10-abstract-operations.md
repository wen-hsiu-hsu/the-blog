---
title: '抽象操作與 ToPrimitive：型別轉換的底層機制'
description: '介紹 ECMAScript 規格書中的抽象操作概念，以及型別轉換的核心機制 ToPrimitive：型別提示（number / string）如何決定 valueOf() 與 toString() 的呼叫順序，以及整個演算法的遞迴特性。'
date: 2026-05-30
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 10
chapter: 'Coercion'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - TypeCoercion
    - ToPrimitive
---

# 抽象操作與 ToPrimitive：型別轉換的底層機制

> 本文進入「型別與強制轉型」的第二節——強制轉型（Coercion）。前幾篇建立了對原始型別與特殊值的認識，現在要深入語言內部，理解 JavaScript 在進行型別轉換時實際執行的演算法步驟。這些步驟在規格書中被稱為「抽象操作」。

## 什麼是抽象操作

ECMAScript 規格書第 7 章定義了一系列抽象操作（Abstract Operations）。這些操作**不是語言本身可以呼叫的函式**，而是規格書用來描述語言語意的概念性演算法步驟。JavaScript 引擎在實作時不一定以相同名稱存在，但其行為必須符合規格書描述的這些步驟。

在 JavaScript 中，型別轉換（type conversion）與強制轉型（coercion）指的是同一件事，可以互換使用。

## ToPrimitive：將非原始型別轉為原始型別

當一個非原始型別的值（物件、陣列、函式等）出現在需要原始型別的場合（例如數學運算或字串拼接）時，JavaScript 會觸發 `ToPrimitive` 這個抽象操作。

### 型別提示（hint）

`ToPrimitive` 接受一個可選的型別提示，告訴演算法「我希望得到哪種原始型別」：

- `"number"` 提示：用於數學運算的場合
- `"string"` 提示：用於字串相關的場合
- 無提示：給我任何原始值都行

提示只是期望，不是保證——最終結果不一定符合提示的型別。

### 執行順序：`valueOf()` 與 `toString()`

所有非原始型別上都可能存在 `valueOf()` 與 `toString()` 這兩個方法，`ToPrimitive` 依據提示決定呼叫順序：

| 提示       | 優先嘗試     | 備選         |
| ---------- | ------------ | ------------ |
| `"number"` | `valueOf()`  | `toString()` |
| `"string"` | `toString()` | `valueOf()`  |
| 無提示     | `valueOf()`  | `toString()` |

演算法會先嘗試第一個方法，若回傳的是原始值則停止；若回傳的仍是非原始值，或方法不存在，再嘗試第二個。若兩者都無法取得原始值，通常會拋出錯誤。

### 遞迴特性

型別轉換演算法本質上是遞迴的：若 `ToPrimitive` 的回傳值依然不是原始型別，它會再次被觸發，直到取得原始值或產生錯誤為止。後續討論強制相等（coercive equality）時會看到更多這種遞迴應用的例子。

## 實務意涵

當你將一個物件放進數學運算或字串拼接時，JavaScript 在背後執行的正是這套 `ToPrimitive` 演算法。理解它的觸發時機與執行順序，是掌握強制轉型行為的前提，也是避免意外 bug 的關鍵。

```javascript
var obj = {
    valueOf() {
        return 42;
    },
    toString() {
        return 'hello';
    },
};

obj + 1; // 43（數字提示，先呼叫 valueOf() 得到 42）
`${obj}`; // "hello"（字串提示，先呼叫 toString() 得到 "hello"）
```

## 小結

抽象操作是規格書定義語言行為的概念工具，不可直接呼叫。`ToPrimitive` 是其中最核心的型別轉換操作，依據提示決定先呼叫 `valueOf()` 還是 `toString()`，並在兩者都失敗時拋出錯誤。整個演算法具有遞迴特性，直到取得原始值為止。

## 複習

### JavaScript 中 ToPrimitive 抽象操作的主要目的是什麼？

將非原始型別（如物件、陣列、函式）轉換為原始型別，透過呼叫 valueOf() 和 toString() 方法，並接受可選的型別提示（number 或 string）。

### ToPrimitive 如何決定呼叫哪個方法來進行轉換？

若提示為 number，先嘗試 valueOf()，再嘗試 toString()；若提示為 string，先嘗試 toString()，再嘗試 valueOf()。一旦取得原始值便停止，否則拋出錯誤。

### ToPrimitive 抽象操作中用於型別轉換的兩個方法是什麼？

valueOf() 和 toString()，這兩個方法可存在於非原始物件上，用於將物件轉換為原始型別。

### ToPrimitive 抽象操作可接受哪些型別提示？

number 提示、string 提示，或不提示（表示「給我任何可以取得的原始值」）。

### JavaScript 型別轉換演算法有什麼關鍵特性？

它本質上是遞迴的：若初次轉換的結果不是原始值，操作會再次被觸發，直到取得原始值或拋出錯誤為止。

## 小測驗

<details>
<summary>ToPrimitive 抽象操作的主要目的是什麼？</summary>
將物件等非原始型別轉換為原始型別
</details>

<details>
<summary>ToPrimitive 操作通常使用哪兩個方法將非原始型別轉換為原始型別？</summary>
valueOf() 和 toString()
</details>

<details>
<summary>ToPrimitive 抽象操作可使用哪些型別提示？</summary>
number 和 string
</details>

<details>
<summary>當 ToPrimitive 的提示為 'number' 時，valueOf() 和 toString() 的呼叫順序為何？</summary>
先呼叫 valueOf()，再呼叫 toString()
</details>

<details>
<summary>若 ToPrimitive 嘗試過 valueOf() 和 toString() 後仍無法取得原始值，會發生什麼？</summary>
通常會拋出錯誤
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
