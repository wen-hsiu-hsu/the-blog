---
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 7
title: 箭頭函式（Arrow Function）、匿名函式與 map 方法
description: 比較四種 JavaScript 函式定義語法，說明箭頭函式的簡寫規則與 this 行為差異，介紹匿名函式的使用時機，以及內建 Array.prototype.map 的運作原理與原型鏈基礎。
date: 2026-04-26
section: dev
category: JavaScript Hard Parts v3
chapter: Callbacks & Higher Order functions
tags:
    - JavaScript
    - ArrowFunction
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# 箭頭函式（Arrow Function）、匿名函式與 map 方法

## 定義函式的寫法

同一個 `multiplyBy2` 函式，可以用以下四種語法表達，**執行結果完全相同**：

```javascript
// 版本 1：傳統 function 關鍵字
function multiplyBy2(input) {
    return input * 2;
}

// 版本 2：箭頭函式（保留大括號與 return）
const multiplyBy2 = (input) => {
    return input * 2;
};

// 版本 3：單一 return 可省略大括號與 return 關鍵字
const multiplyBy2 = (input) => input * 2;

// 版本 4：單一參數可省略小括號（最精簡）
const multiplyBy2 = (input) => input * 2;

const output = multiplyBy2(3); // 6
```

| 條件                         | 可以省略的東西                 |
| ---------------------------- | ------------------------------ |
| 函式內只有一個 return 陳述式 | `{ }` 大括號 + `return` 關鍵字 |
| 只有一個參數                 | 參數的 `( )` 小括號            |

## 箭頭函式 Arrow Function

前面有看到這個簡化的函式中間有一個箭頭，所以我們稱為箭頭函式，目前這個只是語法糖 ( Syntactic Sugar )，讓程式碼更簡潔易讀

> 後續會說明箭頭函式的 `this` 指向行為與傳統函式不同——箭頭函式沒有自己的 `this`，會沿用外層語境的 `this`，在物件方法中呼叫內部函式時特別有用

## 匿名函式（Anonymous Function）

將函式**直接作為引數傳入**，不另外命名，稱為匿名函式：

```javascript
// 先命名再傳入
const multiplyBy2 = (input) => input * 2;
const result = copyArrayAndManipulate([1, 2, 3], multiplyBy2);

// 直接傳入匿名箭頭函式（等價）
const result = copyArrayAndManipulate([1, 2, 3], (input) => input * 2);
```

- 優點：程式碼更緊湊，在函式式程式設計（Functional Programming）中常見
- 缺點：若行為複雜，可讀性下降；建議複雜邏輯仍獨立命名

## 內建陣列方法：`map`

我們在前面的文章有提到的 `copyArrayAndManipulate` 就是 JavaScript 內建 `map` 方法的概念原型：

```javascript
// 我們自己實作的版本（已更名為 map）
function map(array, instructions) {
    const output = [];
    for (let i = 0; i < array.length; i++) {
        output.push(instructions(array[i]));
    }
    return output;
}

const result = map([1, 2, 3], (input) => input * 2); // [2, 4, 6]

// JavaScript 內建版本（透過 JavaScript 原形鏈的特性來呼叫）
const sameResult = [1, 2, 3].map((input) => input * 2); // [2, 4, 6]
```

> **為什麼陣列可以使用 `.map`？** 因為所有陣列透過 Prototype Chain 繼承了一組內建方法。完整原理在後面的文章說明。查詢所有內建陣列方法可參考 [MDN Web Docs](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array)。

## 複習

### 在箭頭函式語法中，什麼時候可以省略參數的括號？

當函式只有一個參數時，可以省略參數外的括號。如果有多個參數或沒有參數，則必須保留括號。

### 什麼是 JavaScript 中的匿名函式？

匿名函式是一種在傳入或使用時沒有名稱的函式。不需要另外用名稱定義函式，而是直接在需要的地方提供函式的程式碼，例如將它作為引數傳入另一個函式時。

### 箭頭函式在 `this` 關鍵字的行為上，與傳統函式宣告有什麼不同？

箭頭函式對 `this` 關鍵字有不同的隱式參數指定行為。與傳統函式不同，箭頭函式不擁有自己的 `this`，而是沿用外層語境的 `this`。這在函式內部呼叫另一個函式時特別有用——可以確保 `this` 指向當前物件，而非全域物件。

### 哪個內建陣列方法可以對每個元素套用函式，同時不修改原始陣列？

`map()` 方法。它對陣列的每個元素套用一個函式，回傳一個包含轉換後值的新陣列，同時保持原始陣列不變。例如：[1, 2, 3].map(input => input \* 2) 會回傳 [2, 4, 6]。

## 小測驗

<details>
<summary>什麼是匿名函式？</summary>
一個在傳入時沒有名稱的函式
</details>

<details>
<summary>呼叫以箭頭語法定義的函式（如 `input => input * 2`）時，底層發生了什麼？</summary>
與傳統函式定義相同，會建立一個新的執行環境（Execution Context）
</details>

<details>
<summary>相較於傳統函式定義，箭頭函式有什麼主要優點？</summary>
更容易撰寫且可讀性更高
</details>

<details>
<summary>在考量效能時，選擇不同函式語法風格最重要的考量點是什麼？</summary>
程式碼的可讀性與開發時間，因為語法上的差異對效能的影響極為微小
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
