---
title: '區塊範疇：`let`、`const` 與 `var` 的適當使用場景'
description: '介紹區塊範疇的正確使用方式：大括號只有包含 let 或 const 才成為範疇、let 應用在已經在設計上想限制變數存活範圍的地方，以及為什麼全域搜尋取代 var 換 let 是錯誤的做法。'
date: 2026-06-18
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 46
chapter: 'Advanced Scope'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - Scope
  - BlockScope
---

# 區塊範疇：`let`、`const` 與 `var` 的適當使用場景

> 本文延續對範疇機制的討論。前幾篇介紹了函式範疇與 IIFE，這篇要轉向另一種範疇單位：區塊範疇（block scope）。這不只是語法上的選擇，而是需要理解它的設計意圖，才能正確判斷何時該用它。

## 區塊範疇 vs IIFE

```javascript
// IIFE 版本
var teacher = "Kyle";

(function anotherTeacher() {
    var teacher = "Suzy";
    console.log(teacher);   // Suzy
})();

console.log(teacher);       // Kyle

// 區塊範疇版本（更輕量）
var teacher = "Kyle";

{
    let teacher = "Suzy";
    console.log(teacher);   // Suzy
}

console.log(teacher);       // Kyle
```

兩者達到相同的效果：在不污染外層範疇的前提下，建立一個私有的識別字空間。但區塊版本更輕量，不重新定義 `return`、`break` 等行為，也不需要額外的函式呼叫開銷。

## 關鍵：大括號不等於範疇

這是一個常見的誤解。在 JavaScript 中，**並非所有大括號都自動構成範疇**。`if`、`for`、`while` 等結構的大括號，只有在裡面包含 `let` 或 `const` 宣告時，才會成為一個範疇。`var` 不會讓大括號變成範疇，它會忽略區塊邊界，直接附著到外層的函式範疇或全域範疇。

## `let` 的正確使用姿勢：強化你已經在語意上表達的意圖

```javascript
function diff(x, y) {
    if (x > y) {
        var tmp = x;   // 用 var，但放在 if 裡，語意上暗示「這只是臨時用的」
        x = y;
        y = tmp;
    }
    return y - x;
}
```

你可能早就習慣把某些 `var` 宣告放在 `if` 或 `for` 裡——這個習慣本身就是在向讀者傳遞一個訊號：「這個變數只屬於這個區塊」。但 `var` 實際上不遵守這個邊界，它只是風格上的暗示。

換成 `let`，就能把這個語意意圖變成語言層面的強制約束：

```javascript
function diff(x, y) {
    if (x > y) {
        let tmp = x;   // 真正的區塊範疇，tmp 不存在於 if 之外
        x = y;
        y = tmp;
    }
    return y - x;
}
```

Kyle Simpson 的觀點是：**用 `let` 的時機，是你已經在設計上打算讓某個變數只活在那個區塊裡**。不要為了用新語法而強行加入更多區塊範疇。

## `let` 不是 `var` 的全面替代品

曾有 TC39 成員推廣「直接把所有 `var` 全域取代為 `let`」的做法，甚至有相關 T-shirt。Kyle Simpson 的立場非常明確：這是個很糟糕的建議。

`let` 和 `var` 不是等價的，它們有不同的用途：

- `var` 的作用域是整個函式，它表達的是「這個變數屬於這個函式的整個生命週期」
- `let` 的作用域是當前區塊，它表達的是「這個變數只在這個區塊內有意義」

盲目替換不只可能引入 bug，更重要的是誤用了這兩個語意不同的工具。`var` 仍然有它存在的理由，後續討論 hoisting 時會進一步說明。

## 補充說明

在嚴格模式（strict mode）下，函式宣告若放在區塊內部，其範疇會限制在該區塊內，並遵循 hoisting 規則。這是與非嚴格模式不同的行為，使用時需要特別留意。

## 小結

區塊範疇提供了比 IIFE 更輕量的私有化手段，但只有包含 `let` 或 `const` 時大括號才真正成為範疇。`let` 應該用在「已經在設計上想要限制變數存活範圍」的地方，而不是作為 `var` 的全面替代。`var` 仍然是表達「函式層級變數」的語意工具，兩者應各司其職。

## 複習

### 使用 `let` 的區塊範疇與 `var` 的關鍵差異是什麼？

`var` 宣告會附著到外層函式或全域範疇，而 `let` 只在其宣告所在的區塊內建立範疇。區塊本身不會自動成為範疇，除非裡面有 `let` 或 `const` 宣告。

### 何時應該使用 `let` 進行區塊範疇？

應該在語意上已經合理限制變數存取範圍的地方使用區塊範疇，例如 if 陳述式或 for 迴圈中的臨時變數，而不是單純為了使用新語法。

### 為什麼全域搜尋取代將所有 `var` 替換為 `let` 是不好的做法？

`let` 不是 `var` 的直接替代品，而是一個額外的工具。盲目地將所有 `var` 替換為 `let` 可能導致 bug 並誤用這個功能。

### 使用區塊範疇有哪些優點？

區塊範疇有助於減少名稱衝突、保護實作細節、支援未來的重構，並提供比 IIFE 等其他範疇機制更輕量的方式來限制變數的可見範圍。

## 小測驗

<details>
<summary>哪些宣告關鍵字可以讓區塊成為一個範疇？</summary>
let 和 const
</details>

<details>
<summary>根據課程討論，應該如何使用 let 進行區塊範疇？</summary>
在區塊範疇在語意上已經合理的地方使用
</details>

<details>
<summary>在範疇方面，var 的歷史行為與 let 有何不同？</summary>
var 會附著到外層函式或全域範疇
</details>

<details>
<summary>開發者為什麼應該使用 let 進行區塊範疇？</summary>
為了強化對變數局部性的語意表達
</details>

<details>
<summary>什麼決定了大括號是否構成一個範疇？</summary>
區塊內是否存在 let 或 const 宣告
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記