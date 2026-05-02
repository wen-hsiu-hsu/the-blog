---
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 8
title: JavaScript 陣列變異方法與 ES2023 非變異替代方案（Pure Function、Side Effect）
description: 說明 JavaScript 陣列中會直接修改原始資料的變異方法（reverse、splice、sort），以及 ES2023 新增的非變異替代版本（toReversed、toSpliced、toSorted）。並介紹 Side Effect 概念，補充 flat()、findLastIndex()、Object.groupBy() 等高階函式（Higher-Order Function）的用法。
date: 2026-04-27
section: dev
category: JavaScript Hard Parts v3
chapter: Callbacks & Higher Order functions
tags:
    - JavaScript
    - HigherOrderFunction
    - PureFunction
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# JavaScript 陣列變異方法與 ES2023 非變異替代方案（Pure Function、Side Effect）

## 函式不應改變輸入資料

`map` 與我們自製的 `copyArrayAndManipulate` 都遵守同一個原則：**不修改原始陣列，而是回傳一個新陣列**。

這個原則很重要：若函式偷偷改變了輸入資料，就會產生函式定義之外的副作用（Side Effect），讓程式行為難以預測與追蹤。

## 經典的「修改」陣列方法

JavaScript 早期有幾個內建方法**直接修改原陣列**（稱為 Mutating），而非回傳新陣列：

```javascript
const arr1 = [1, 2, 3];

arr1.reverse(); // arr1 變成 [3, 2, 1]
arr1.splice(1, 1, 6); // 從 index 1 取代 1 個元素為 6，arr1 變成 [3, 6, 1]
arr1.sort(); // arr1 變成 [1, 3, 6]

console.log(arr1); // [1, 3, 6]（原始資料已被永久改變）
```

以 UI 開發為例，若你想「顯示反序清單」就對原陣列執行 `.reverse()`，底層資料就被破壞了。

## ES2023 的替代方案

JavaScript 在 ES2023 新增了對應的**無修改版本**，命名規則是加上 `to` 前綴：

```javascript
const arr2 = [1, 2, 3];

const reversed = arr2.toReversed(); // ES2023 — 新陣列 [3, 2, 1]
const spliced = arr2.toSpliced(1, 1, 6); // ES2023 — 新陣列 [1, 6, 3]
const sorted = arr2.toSorted(); // ES2023 — 新陣列 [1, 2, 3]

console.log(arr2, reversed, spliced, sorted);
// [1, 2, 3]  [3, 2, 1]  [1, 6, 3]  [1, 2, 3]
// arr2 完全沒有被改變
```

## JavaScript 持續新增的陣列方法

```javascript
// flat() — ES2019
// 將巢狀陣列攤平，預設展開 1 層，可傳入深度或 Infinity
const deepArr = [1, 2, [1, 2], 2];
const flattened = deepArr.flat(); // [1, 2, 1, 2, 2]

// findLastIndex() — ES2023
// 從陣列末端往前找，回傳第一個符合條件的元素索引
const last2 = flattened.findLastIndex((x) => x === 2);
// flattened 為 [1, 2, 1, 2, 2]，從後往前第一個 2 在 index 4

// Object.groupBy() — ES2024
// 根據函式回傳的標籤將元素分組，回傳一個物件
function oddOrEven(num) {
    return num % 2 === 0 ? 'even' : 'odd';
}
const grouped = Object.groupBy(flattened, oddOrEven);
// → { even: [2, 2, 2], odd: [1, 1] }
```

這些方法都是**高階函式**（Higher-Order Function），接受另一個函式作為引數，且都不修改原始陣列。

## 複習

### JavaScript 中有哪三個內建陣列方法會變異（修改）原始陣列？

三個會變異的陣列方法是 `reverse`、`sort` 和 `splice`。這些方法會直接修改呼叫它們的陣列，而不是回傳一個包含變更的新陣列。

### JavaScript 新增了哪些取代 `reverse`、`splice` 和 `sort` 的非變異方法？

非變異的替代方法是 `toReversed()`、`toSpliced()` 和 `toSorted()`。這些方法會建立並回傳一個套用變更後的全新陣列，原始陣列保持不變。

## 小測驗

<details>
<summary>哪些 JavaScript 內建陣列方法會變異（修改）原始陣列？</summary>
reverse、splice 和 sort
</details>

<details>
<summary>為什麼函式避免變異輸入資料很重要？</summary>
為了防止在函式明確輸出之外產生非預期的副作用
</details>

<details>
<summary>toReversed() 和 reverse() 有什麼差別？</summary>
toReversed() 建立一個新的反序陣列，而 reverse() 會直接變異原始陣列
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
