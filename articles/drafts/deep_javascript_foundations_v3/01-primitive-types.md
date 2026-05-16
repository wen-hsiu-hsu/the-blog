---
title: 'JavaScript 型別系統：原始型別的正確定義'
description: '從 ECMAScript 規格書出發，釐清 JavaScript 型別系統的正確樣貌：原始型別有哪些、函式與陣列如何分類、為什麼「所有東西都是物件」是個誤解，以及動態定型語言中型別屬於值而非變數的核心概念。'
date: 2026-05-26
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 1
chapter: 'Types'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - PrimitiveTypes
    - TypeSystem
---

# JavaScript 型別系統：原始型別的正確定義

> 本文是《Deep JavaScript Foundations v3》第一主題「型別與強制轉型」的起點。課程的核心立場是：當開發者對語言行為的假設與 JavaScript 引擎的實際行為出現落差，bug 就會從那個缺口鑽進來。解法始終如一：直接閱讀規格書，建立正確的心智模型。

## 「所有東西都是物件」是錯的

這是 JavaScript 社群裡流傳最廣的誤解之一。許多書籍與文章都把它當成事實陳述，但規格書並不這麼說。

正確的說法是：**JavaScript 中，大多數值可以表現得像物件（behave as objects），但這不代表它們就是物件。** 這個差異不是咬文嚼字，而是建立正確型別心智模型的基礎。至於為什麼某些非物件的值能「表現得像物件」，那涉及 Boxing 機制，後續章節會深入討論。

## 規格書怎麼說

[ECMAScript 規格書第 6.1 節（ECMAScript Language Types）](https://262.ecma-international.org/9.0/index.html#sec-ecmascript-data-types-and-values)明確列出了語言的型別：

> Undefined, Null, Boolean, String, Symbol, Number, and Object

這七個是規格書正式定義的 ECMAScript 語言型別。

**補充：** 規格書的這份列表本身有一個值得注意的地方——`Object` 並不是原始型別（primitive type），它是獨立的一類。原始型別指的是 `undefined`、`null`、`boolean`、`string`、`symbol`、`number`，以及後來正式納入語言的 `bigint`。

## 原始型別一覽

| 型別        | 說明                                                       |
| ----------- | ---------------------------------------------------------- |
| `undefined` | 只有唯一一個值：`undefined`                                |
| `null`      | 只有唯一一個值：`null`（歷史遺留 bug，詳見下方）           |
| `boolean`   | 只有兩個值：`true` 與 `false`                              |
| `string`    | 原始字串（不是 Java 那種 String 物件）                     |
| `symbol`    | ES6 新增，通常用於在物件上建立接近私有的 key，多見於框架層 |
| `number`    | JavaScript 所有數值的型別（有特例，見下方）                |
| `bigint`    | 大整數支援，課程錄製後已正式納入語言規格                   |

### `null` 的歷史 bug

`typeof null` 的回傳值是 `"object"`，這是 JavaScript 早期實作遺留下來的 bug，並非設計意圖。`null` 本身是一個獨立的型別，只包含 `null` 這一個值。

## 不在頂層型別列表裡的「類型」

### 函式（Function）

規格書並未把 `function` 列為頂層型別，而是將它視為 `object` 型別的子型別（subtype），某些地方稱之為 callable object（可呼叫物件）。但函式的行為明顯有別於一般物件，所以在實務上我們還是會區分它。

### 陣列（Array）

同樣是 `object` 的子型別。陣列的特殊之處在於以數字為索引、有自動更新的 `length` 屬性，以及一組專屬方法。它是「特化版的物件」，而非獨立的頂層型別。

### 未宣告的識別字（undeclared）

規格書沒有正式把「未宣告」定義為型別，但它有可預期的行為。在這個意義上，我們可以用加了引號的方式說它「算是一種型別」。

## 值有型別，變數沒有

這是動態定型語言（dynamically typed language）與靜態定型語言（如 C++、Java）最核心的差異之一：

- **靜態定型語言**：變數本身攜帶型別資訊
- **JavaScript**：型別屬於值（value），而非變數（variable）

```javascript
let x = 42; // 42 這個值是 number 型別
let y = '42'; // "42" 這個值是 string 型別
```

`x` 與 `y` 作為變數本身沒有型別，是它們當前持有的值決定了型別。這個區分解釋了為什麼 JavaScript 的型別行為有時讓開發者感到意外。我們對變數的假設，和引擎對值的實際處理之間存在落差。

## 小結

JavaScript 的型別系統比「everything is an object」這句話複雜得多，也嚴謹得多。規格書給出了清楚的定義：原始型別各自獨立，物件是另一個分類，函式與陣列是物件的子型別。把型別視為「值的內在特性」而非「變數的標籤」，是建立正確心智模型的第一步，也是後續理解強制轉型（coercion）的前提。

## 複習

### 根據規格書，JavaScript 的原始型別有哪些？

undefined、null、boolean、string、symbol、number，以及 bigint

### 「JavaScript 中所有東西都是物件」這句話的問題在哪裡？

這是一個誤解。雖然 JavaScript 中大多數值可以表現得像物件，但它們並不真的是物件。型別屬於值本身，而非變數。

### boolean 原始型別包含哪兩個值？

true 與 false

### 函式在 JavaScript 型別系統中如何分類？

函式被視為 object 型別的子型別，有時稱為 callable object（可呼叫物件）。

### undefined 型別有什麼特殊之處？

它只有唯一一個值，就是 undefined。

## 小測驗

<details>
<summary>以下哪些被視為 JavaScript 的原始型別？</summary>
undefined、null、boolean、string、symbol、number、bigint
</details>

<details>
<summary>JavaScript 原始型別有什麼特別之處？</summary>
型別屬於值本身，而非變數
</details>

<details>
<summary>JavaScript 如何看待函式與陣列？</summary>
視為 object 型別的子型別
</details>

<details>
<summary>JavaScript 中 boolean 值的行為是什麼？</summary>
它們是原始值，只有 true 與 false 兩個
</details>

<details>
<summary>哪個原始型別是近期正式加入 JavaScript 的？</summary>
BigInt
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
