---
title: 'NaN：無效數字與正確的檢測方式'
description: '釐清 NaN 的正確心智模型：它不是「不是數字」，而是「無效數字」，型別仍是 number。說明 NaN 不等於自身的特性、任何涉及 NaN 的數學運算結果仍為 NaN，以及為什麼應該用 Number.isNaN() 而非舊版 isNaN() 來做檢測。'
date: 2026-05-28
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 5
chapter: 'Types'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - NaN
---

# NaN：無效數字與正確的檢測方式

> 本文延續對 JavaScript 特殊值的討論。前幾篇建立了型別系統的基礎，而 NaN 是 `number` 型別中最容易被誤解的特殊值，也是實務開發中最常產生隱性 bug 的來源之一。

### NaN 不是「不是數字」，而是「無效數字」

NaN 的字面意思是 "Not a Number"，但這個名稱具有誤導性。更準確的心智模型是：**NaN 是一個無效數字（invalid number）**，一個表示「這個數值運算沒有合法結果」的特殊哨兵值（sentinel value）。

它來自 IEEE 754 浮點數規格，`typeof NaN` 的回傳值是 `"number"`。因為 NaN 本身就屬於數值運算的結果空間，只是這個結果是無效的。

```js
var myCatsAge = Number('n/a'); // NaN（無法將 "n/a" 轉為數字）
typeof myCatsAge; // "number"
```

如果把 NaN 理解成「不是數字」，那麼「不是數字的型別是 number」這句話就會顯得矛盾。把它理解成「無效數字」，就完全自然了。

## 哪些情況會產生 NaN

```js
var myAge = Number('0o46'); // 38（八進位字串，合法）
var myNextAge = Number('39'); // 39（合法）
var myCatsAge = Number('n/a'); // NaN（無法轉換）

myAge - "my son's age"; // NaN
// 減法運算子只接受數字，JavaScript 嘗試將字串轉為數字
// 字串 "my son's age" 轉換結果為 NaN，任何數字減去 NaN 仍是 NaN
```

**NaN 具有傳染性**：任何包含 NaN 的數學運算，結果永遠是 NaN。

## NaN 是唯一不等於自身的值

```js
myCatsAge === myCatsAge; // false   OOPS!
```

`===` 在這裡說謊了。這不是 JavaScript 的特例，而是 IEEE 754 規格明確規定的行為：NaN 與任何值（包括它自己）都不相等。NaN 是 JavaScript 中**唯一一個不具備自我同一性（identity property）的值**。

這個特性意味著我們不能用 `===` 來檢測 NaN，需要專用的工具。

## `isNaN` vs `Number.isNaN`

### 舊版 `isNaN()`：有問題的設計

```js
isNaN(myAge); // false（正確）
isNaN(myCatsAge); // true（正確）
isNaN("my son's age"); // true   OOPS！
```

`isNaN()` 在比對前會先將傳入值強制轉型為數字。字串 `"my son's age"` 本身不是 NaN，但被轉型後變成 NaN，導致回傳 `true`——這是錯誤的結果。

### ES6 的 `Number.isNaN()`：正確的工具

```js
Number.isNaN(myCatsAge); // true（正確）
Number.isNaN("my son's age"); // false（正確）
```

`Number.isNaN()` 不做任何強制轉型，只嚴格判斷傳入的值是否就是 NaN 本身。這才是現代 JavaScript 中應該使用的檢測方式。

## 關於「用 0 代替 NaN」的誤區

數字 `0` 是一個有意義的數學值，用它來表示「沒有合法數值」是錯誤的概念。當一個數值運算無法產生有意義的結果，正確的表達方式是回傳 `NaN`，而非 `0` 或 `-1`（後者是 C 語言時代的歷史遺留做法）。

## 小結

NaN 是 `number` 型別下的無效數字，不是一個獨立的型別。它的兩個關鍵特性——不等於自身、在數學運算中具傳染性——決定了它必須用 `Number.isNaN()` 來正確檢測。舊版的 `isNaN()` 因為內部強制轉型而行為不可靠，在現代程式碼中應避免使用。

## 複習

### NaN 在 JavaScript 中實際代表什麼？

NaN 代表一個無效數字，而非字面上的「不是數字」。它是一個特殊的哨兵值，用來表示無效的數值運算結果，其型別實際上是 'number'。

### NaN 在相等性比較上有什麼獨特之處？

NaN 是 JavaScript 中唯一一個不等於自身的值，即使使用 `===` 也是如此。這是由 IEEE 754 規格所定義的行為。

### `isNaN()` 和 `Number.isNaN()` 有什麼差異？

`isNaN()` 在檢查前會先將值強制轉型為數字，可能對非 NaN 的值回傳 true。`Number.isNaN()` 則不做任何轉型，嚴格判斷傳入值是否就是 NaN 本身。

### 涉及 NaN 的數學運算會有什麼行為？

任何包含 NaN 的數學運算結果都是 NaN。NaN 會在數學運算中傳播，任何涉及 NaN 的計算都永遠產生 NaN。

### 在現代 JavaScript 中，檢測一個值是否為 NaN 的建議方式是什麼？

使用 `Number.isNaN()`，它會嚴格判斷值是否為 NaN，不像舊版的 `isNaN()` 會進行強制轉型。

## 小測驗

<details>
<summary>在 JavaScript 中，描述 NaN 最準確的方式是什麼？</summary>
無效數字
</details>

<details>
<summary>JavaScript 中哪個方法能可靠地判斷一個值是否為 NaN？</summary>
Number.isNaN()
</details>

<details>
<summary>NaN 在 JavaScript 中的型別是什麼？</summary>
number
</details>

<details>
<summary>對包含 NaN 的數學運算求值，結果會是什麼？</summary>
回傳 NaN
</details>

<details>
<summary>NaN 在比較行為上有什麼獨特之處？</summary>
永遠不等於自身
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
