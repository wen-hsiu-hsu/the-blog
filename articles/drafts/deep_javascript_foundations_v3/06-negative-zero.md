---
title: '負零：JavaScript 中被刻意隱藏的特殊值'
description: '介紹 IEEE 754 規格中合法存在的負零（-0）：為什麼 ===、toString() 和大小比較運算子對它都會給出錯誤結果、如何用 Object.is() 正確檢測，以及在需要同時表達大小與方向的場景下負零的實際用途。'
date: 2026-05-28
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 6
chapter: 'Types'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - NegativeZero
---

# 負零：JavaScript 中被刻意隱藏的特殊值

> 本文延續對 JavaScript 特殊數值的討論。上一篇介紹了 NaN 來自 IEEE 754 規格，負零同樣如此——它不是 JavaScript 的發明，而是浮點數規格的一部分，只是早期 JavaScript 刻意試圖把它藏起來。

## 負零是什麼

負零（`-0`）是零值加上符號位元（sign bit）的狀態，也就是「帶有負號的零」。數學家可能會說這不存在，但在 IEEE 754 浮點數規格中，它和 NaN 一樣是被明確定義的值。

早期的 JavaScript 認為開發者不會需要負零，甚至刻意讓語言去隱藏它的存在，結果造成了一連串行為不一致的歷史包袱。

## 負零的各種奇怪狀況

```javascript
var trendRate = -0;

trendRate === -0; // true（正確）

trendRate.toString(); // "0"        ？？？：負號消失了
String(trendRate); // "0"        ？？？
trendRate === 0; // true       ？？？：-0 和 0 被視為相等
trendRate > 0; // false
trendRate < 0; // false      ？？？：既不大於也不小於 0
```

`===`、`toString()`、大小比較運算子——都對負零說謊。這是語言試圖「替開發者做決定」的結果，Kyle Simpson 認為語言不應該做這種事，正確的行為應該交由開發者自行處理。

### 正確檢測負零：`Object.is()`

ES6 新增的 `Object.is()` 是目前最可靠的比較工具，Kyle Simpson 稱它為「四個等號」——比 `===` 更嚴格。

```javascript
Object.is(trendRate, -0); // true（正確）
Object.is(trendRate, 0); // false（正確）
Object.is(trendRate, NaN); // false（正確）
Object.is(NaN, NaN); // true（正確，NaN 的嚴格同一性比較）
```

## `Math.sign()` 對負零也失效

`Math.sign()` 本應告訴我們一個數的正負，但對零值的處理有問題：

```javascript
Math.sign(-3); // -1
Math.sign(3); //  1
Math.sign(-0); // -0   （應該回傳 -1，卻回傳 -0）
Math.sign(0); //  0   （應該回傳  1，卻回傳  0）
```

若需要一個可靠處理負零的 sign 方法，需要自行修正，在值為零時改用 `Object.is()` 來區分：

```javascript
function sign(v) {
    return v !== 0 ? Math.sign(v) : Object.is(v, -0) ? -1 : 1;
}

sign(-0); // -1
sign(0); //  1
sign(-3); // -1
sign(3); //  1
```

## 負零的實際用途

負零看似抽象，但在需要「用單一數值同時表達大小與方向」的場景相當有用：

- **絕對值**代表大小（例如速度）
- **符號**代表方向（例如移動方向）

當一個物件停止（速度為 0）時，若要保留它停止前的行進方向，就需要區分 `+0` 與 `-0`。例如地圖上的車輛圖示，在速度歸零時仍需面向正確方向；股價走勢圖在到達零時也需要知道它是從正值下跌到零，還是從更低值回升到零。

這種語意在只有 `0` 的情況下無法表達，負零讓這成為可能，且不需要額外引入一個獨立的方向變數。

### 小結

負零是 IEEE 754 規格定義的合法值，JavaScript 的許多內建工具（`===`、`toString()`、大小比較）對它都有不正確的行為。唯一可靠的檢測方式是 `Object.is()`。雖然使用場景不多，但在需要用符號表達方向的情境下，它是比額外引入變數更一致、更具語意的選擇。

## 複習

### JavaScript 中的負零是什麼？

負零是一個帶有符號位元的特殊數值，代表帶有負號的零。它存在於 IEEE 754 規格中，在某些運算中的行為與一般的零不同。

### 如何可靠地判斷一個值是否為負零？

使用 `Object.is()` 方法，它能準確比較值，不像 `===` 對零值的比較會給出錯誤結果。

### 負零在程式設計中有什麼實際用途？

負零可以用來表達方向或趨勢，例如在物件靜止時仍能追蹤它之前的移動方向，或顯示股價到達零時的前一個走勢方向。

### 對零值使用 `Math.sign()` 存在什麼問題？

`Math.sign()` 對零值不會如預期回傳 -1 或 1，而是回傳負零或零，因此無法可靠地判斷零值的符號。

### `toString()` 如何處理負零？

將負零字串化時，`toString()` 會把它轉換成普通的 '0' 而不顯示負號，因此隱藏了負零的存在。

## 小測驗

<details>
<summary>JavaScript 中負零（-0）的特殊之處是什麼？</summary>
它在維持零值的同時帶有符號位元
</details>

<details>
<summary>哪個方法可以準確判斷一個值是否為負零？</summary>
Object.is()
</details>

<details>
<summary>負零在程式設計中有什麼用途？</summary>
在保持數值大小的同時表達方向
</details>

<details>
<summary>三個等號（===）對負零的行為是什麼？</summary>
將負零視為等於零
</details>

<details>
<summary>負零的存在由哪個規格定義？</summary>
IEEE 754
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
