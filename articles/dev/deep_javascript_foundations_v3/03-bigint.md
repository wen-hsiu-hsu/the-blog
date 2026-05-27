---
title: 'BigInt：JavaScript 的大整數原始型別'
description: '介紹 JavaScript 的 BigInt 原始型別：字面量語法（42n）、typeof 回傳值、與普通 number 型別的區別，以及為什麼兩者不能混合運算。'
date: 2026-05-27
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 3
chapter: 'Types'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - BigInt
---

# BigInt：JavaScript 的大整數原始型別

> 本文延續對 `typeof` 運算子的討論。[[02-type-of-operator|前一篇]]提到 `typeof` 回傳的是有限的已知字串集合，BigInt 正是其中一個新成員，對應回傳值為 `"bigint"`。

## 什麼是 BigInt

JavaScript 的 `number` 型別底層採用 IEEE 754 浮點數格式，這代表它能精確表示的整數有上限。BigInt 是一個獨立的原始型別，突破了這個限制，理論上可以表示任意大的整數，實際上限只受系統記憶體約束。

## 建立 BigInt

BigInt 有兩種建立方式：

```js
var v = 42n; // 字面量語法：在整數後加上 n
var v = BigInt(42); // 函式呼叫語法

typeof v; // "bigint"
```

`42n` 與 `42` 看起來相似，但它們屬於完全不同的型別。`typeof` 能幫助我們在執行期區分兩者。

## BigInt 與一般數字不能混用

BigInt 與 `number` 是完全分離的兩個型別，不能直接混合運算：

```js
42n + 1; // TypeError：不能混合 BigInt 和其他型別
42n + 1n; // 43n（正確：兩邊都是 BigInt）
```

這也是為什麼能夠可靠地辨識一個值究竟是 `number` 還是 `bigint` 很重要。

## 小結

BigInt 是 JavaScript 正式納入規格的原始型別，用於處理超出 IEEE 754 安全整數範圍的大整數場景。字面量語法是在數字後附加 `n`，`typeof` 回傳 `"bigint"`。使用時最需要注意的是：BigInt 與普通 `number` 不能混合運算，兩者在型別系統中是完全獨立的分區。

## 複習

### BigInt 與 JavaScript 中的普通數字有什麼不同？

BigInt 可以成長到幾乎無限大（上限為系統記憶體），且與 IEEE 浮點數是完全分離的空間。它是一個獨立的原始型別，無法與普通數字直接混合使用。

### 如何在 JavaScript 中建立 BigInt 字面量？

在整數後加上 n，例如 42n，這樣建立的就是 BigInt 而非普通數字。

### typeof 對 BigInt 會回傳什麼？

字串 'bigint'。

### 使用 BigInt 時有什麼關鍵限制？

BigInt 與普通數字無法輕易混合或比較，兩者是完全獨立的型別。

### BigInt 的最大值由什麼決定？

系統的記憶體空間。

## 小測驗

<details>
<summary>在數字後加上 'n' 代表什麼意義？</summary>
表示這是一個 BigInt 原始型別
</details>

<details>
<summary>BigInt 和普通數字在 JavaScript 中有什麼差異？</summary>
BigInt 和普通數字無法輕易混合或比較
</details>

<details>
<summary>BigInt 在數值表示上有什麼獨特之處？</summary>
它可以成長到幾乎無限大
</details>

<details>
<summary>如何在 JavaScript 中識別一個 BigInt？</summary>
使用 typeof 運算子，它會回傳字串 'bigint'
</details>

<details>
<summary>建立 BigInt 字面量的範例是什麼？</summary>
let num = 42n
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
