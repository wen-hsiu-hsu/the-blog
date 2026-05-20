---
title: '`Object.is()` Polyfill 解題解析'
description: '解析 Object.is() Polyfill 的實作思路：如何利用 1 / v === -Infinity 偵測負零、利用 v !== v 偵測 NaN，以及為什麼這兩個角落案例必須在 === 之前優先攔截。'
date: 2026-05-29
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 8
chapter: 'Types'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - Polyfill
    - NaN
    - NegativeZero
---

# `Object.is()` Polyfill 解題解析

> 本文是[[07-type-check-exercise|上一篇]]實作練習的解答說明。練習要求在不使用內建 `Object.is()` 的前提下手刻一個等效的 polyfill，核心挑戰在於正確處理 `===` 說謊的兩個角落案例：負零與 NaN。

## 解題思路

`Object.is(x, y)` 的語意幾乎等同於 `x === y`，唯獨兩個例外需要優先攔截：

1. 任一參數是負零
2. 兩個參數都是 NaN

只要這兩種情況都處理正確，其餘所有值直接交給 `===` 即可。

## 核心工具：如何在不借助內建函式的情況下偵測特殊值

### 偵測負零：利用 `1 / v` 的正負

`1 / 0` 得到 `Infinity`，`1 / -0` 得到 `-Infinity`。這是唯一能從零值取得正負資訊的數學手段。加上 `v === 0` 的前提判斷，確保只對零值做除法測試，非零值（如普通負數）不需要走這條路。：

```javascript
function isNegZero(v) {
    return v === 0 && 1 / v === -Infinity;
}

isNegZero(-0); // true
isNegZero(0); // false
isNegZero(-1); // false
```

### 偵測 NaN：利用「NaN 是唯一不等於自身的值」

```javascript
function isNaNValue(v) {
    return v !== v;
}

isNaNValue(NaN); // true
isNaNValue(42); // false
isNaNValue('hi'); // false
```

這個方式不需要 `Number.isNaN()`，直接利用 NaN 在 IEEE 754 規格中的固有特性。

## 完整實作

```javascript
if (!Object.is) {
    Object.is = function ObjectIs(x, y) {
        var xNegZero = x === 0 && 1 / x === -Infinity;
        var yNegZero = y === 0 && 1 / y === -Infinity;

        // 角落案例一：任一為負零
        if (xNegZero || yNegZero) {
            return xNegZero && yNegZero;
        }

        // 角落案例二：兩個都是 NaN
        if (x !== x && y !== y) {
            return true;
        }

        // 其餘情況交給 ===
        return x === y;
    };
}
```

### 邏輯說明

**負零的處理：** 只要任一參數是負零，`===` 就可能說謊（`-0 === 0` 回傳 `true`），因此優先攔截。進入這個分支後，只有「兩個都是負零」才回傳 `true`，否則回傳 `false`。

**NaN 的處理：** `x !== x` 為 `true` 時，`x` 必然是 NaN。兩個都是 NaN 時，回傳 `true`；只有一個是 NaN 時，因為已跳過負零分支，`x === y` 會回傳 `false`，結果正確。

## 小結

這個練習的價值不在於 polyfill 本身，而在於過程中必須直面兩個問題的底層原理：負零只能透過除法觀察到，NaN 的不等於自身是它在整個語言中的唯一識別特徵。能夠不依賴工具函式推導出這兩點，代表對 JavaScript 特殊值的理解已達到從規格出發的層次。

## 複習

### 如何在 JavaScript 中判斷一個值是否為負零？

將 1 除以該值，並檢查結果是否為負無限大（-Infinity），同時確保該值是兩種零之一（即通過 v === 0 的檢查）。

### NaN 在 JavaScript 的值比較中有什麼獨特之處？

NaN 是 JavaScript 中唯一不等於自身的值，因此 `NaN !== NaN` 永遠為 true。

### `Object.is()` 方法在 JavaScript 中的用途是什麼？

提供比三個等號（`===`）更精確的比較，正確處理負零和 NaN 這兩個角落案例。

### `Object.is()` 與三個等號（`===`）有什麼差異？

它能正確比較負零和 NaN，而三個等號對這些特殊情況會給出錯誤的結果。

### 在 JavaScript 中，不借助內建工具函式判斷一個值是否為 NaN 的可靠方式是什麼？

判斷該值是否不等於自身，因為 NaN 是唯一一個不等於自身的值。

## 小測驗

<details>
<summary>如何在 JavaScript 中判斷一個值是否為負零？</summary>
檢查 1 除以該值的結果是否等於 -Infinity
</details>

<details>
<summary>NaN 在 JavaScript 中有什麼獨特特性？</summary>
它不等於自身
</details>

<details>
<summary>Object.is() 方法的用途是什麼？</summary>
與三個等號（===）類似地比較值，但能正確處理 NaN 和負零的特殊情況
</details>

<details>
<summary>如何避免在定義 polyfill 時覆蓋已存在的 Object.is() 方法？</summary>
在建立 polyfill 前先檢查 Object.is 是否尚未定義
</details>

<details>
<summary>Object.is() 與三個等號（===）在哪個特殊情況的處理上不同？</summary>
負零與 NaN 的比較
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
