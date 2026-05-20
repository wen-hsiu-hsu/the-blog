---
title: '型別檢測練習：實作 `Object.is()` Polyfill'
description: '透過實作 Object.is() 的 Polyfill，練習處理 === 的兩個例外案例：NaN 的自我不等於特性，以及負零與正零的區別。同時介紹 Polyfill 的標準實作模式。'
date: 2026-05-29
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 7
chapter: 'Types'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - Polyfill
---

# 型別檢測練習：實作 `Object.is()` Polyfill

> 本文是前幾篇關於特殊值討論的實作整合。我們已知 `===` 對 NaN 和負零都會說謊，而 `Object.is()` 是正確的解決方案。這個練習的目標是從頭實作它，在過程中真正理解這兩個角落案例的底層邏輯。

## 什麼是 Polyfill

Polyfill 是一種常見的模式：先判斷某個功能是否已存在，若不存在才定義自己的實作。這讓程式碼能在不支援新特性的舊環境中正常運作：

```javascript
if (!Object.is) {
    Object.is = function ObjectIs(x, y) {
        /* ... */
    };
}
```

由於 `Object.is` 在 ES6 即已存在，現代環境幾乎都已內建。練習時若直接加上 `if` 保護，自己寫的程式碼永遠不會被執行到。因此練習期間應先移除或暫時繞過這個判斷，完成後再加回去。

## 題目

請實作 `Object.is()`，並符合以下條件

- `Object.is()` 必須接收兩個參數
- 在兩個參數的值完全相同的情況下 (不只是 `===` 的比較) 回傳 `true`，否則回傳 `false`
- 檢查 `NaN` 時，你可以使用 `Number.isNaN()`，不過你可以嘗試完全不使用任何工具來判斷嗎？
- 檢查 `-0` 時，沒有任何內建的工具可以使用，不過你可以嘗試利用 `-Infinity`
- 如果參數是任何其他值，直接使用 `===` 比較即可
- 你不能使用內建的 `Object.is`！
- 你的 JavaScript 環境可能已經有 `Object.is` 了，為了測試你的 polyfill，測試時你可以直接把 `if` 拿掉

### 題目

```javascript
// TODO: define polyfill for `Object.is(..)`
if (!Object.is) {
    Object.is = function ObjectIs(..) { .. };
}

// tests:
console.log(Object.is(42,42) === true);
console.log(Object.is("foo","foo") === true);
console.log(Object.is(false,false) === true);
console.log(Object.is(null,null) === true);
console.log(Object.is(undefined,undefined) === true);
console.log(Object.is(NaN,NaN) === true);
console.log(Object.is(-0,-0) === true);
console.log(Object.is(0,0) === true);

console.log(Object.is(-0,0) === false);
console.log(Object.is(0,-0) === false);
console.log(Object.is(0,NaN) === false);
console.log(Object.is(NaN,0) === false);
console.log(Object.is(42,"42") === false);
console.log(Object.is("42",42) === false);
console.log(Object.is("foo","bar") === false);
console.log(Object.is(false,true) === false);
console.log(Object.is(null,undefined) === false);
console.log(Object.is(undefined,null) === false);
```

## 複習

### JavaScript 中，三個等號（`===`）比較有哪兩個需要特殊處理的案例？

NaN 值與負零值

### JavaScript 中 Polyfill 的用途是什麼？

在某個方法或功能尚未被定義時提供自訂實作，以支援舊版環境或實現向後相容性。

### Object.is 的實作接收兩個參數後應該做什麼？

只有在兩個值完全相同時回傳 true，並針對 NaN 和負零這兩個角落案例做出與三個等號不同的處理。

## 小測驗

<details>
<summary>在這個練習中實作 Object.is polyfill 的目的是什麼？</summary>
理解原始值的特性，並正確處理 NaN 和負零這兩個角落案例
</details>

<details>
<summary>Object.is 需要與三個等號（===）不同處理的兩個主要角落案例是什麼？</summary>
NaN 值與負零值
</details>

<details>
<summary>練習中示範的標準 Polyfill 模式是什麼？</summary>
只在函式尚未定義的情況下才進行定義
</details>

<details>
<summary>哪些 JavaScript 環境原生支援 Object.is？</summary>
ES6 及更新的環境
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
