---
title: '`const`：被高估的宣告關鍵字'
description: '說明 const 的真正語意：它防止的是重新賦值，而非值的可變性。整理 Kyle Simpson 對 const 的保守立場——只用於不可變的原始值字面量——以及三種宣告的建議優先順序。'
date: 2026-06-19
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 49
chapter: 'Advanced Scope'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - Scope
  - BlockScope
---

# `const`：被高估的宣告關鍵字

> 本文是變數宣告系列的最後一篇。前兩篇建立了 `var` 與 `let` 各自的語意定位，這篇要面對最常被主流社群推崇的 `const`，並說明為什麼 Kyle Simpson 認為它並未達到它所承諾的價值。

## `const` 防止的是重新賦值，不是值的變動

這是最核心的誤解，也是 `const` 在各種程式語言中一再造成困惑的根本原因：

```javascript
const myTeacher = teacher;
myTeacher = "Suzy";       // TypeError：不能重新賦值

const teachers = ["Kyle", "Suzy"];
teachers[1] = "Brian";    // OK：允許！陣列內容被修改了
```

`const` 只承諾這個**變數不會被重新賦值**，它完全無法阻止值本身被修改（mutation）。對一個新讀者來說，看到 `const teachers = [...]` 很可能誤以為「這個陣列不會改變」，但事實並非如此。

Java 因為同樣的混淆問題，最終移除了 `const` 關鍵字，改用 `final` 來和「不可變」的概念做出區隔。這說明這個混淆不是 JavaScript 特有的問題。

## `const` 在小區塊中的承諾有多大？

`const` 的語意承諾是：「在這個區塊接下來的程式碼中，這個變數不會被重新賦值。」

但如果你遵循「把 `let`/`const` 放在小區塊裡」的原則，這個區塊可能只有三到五行。所謂「接下來的程式碼」頂多就是幾行，保護的範圍極其有限。`const` 讓人感覺在做一件意義重大的事，實際提供的保護卻微乎其微。

## Kyle Simpson 的建議：`const` 只用於不可變的原始值

Kyle Simpson 認為 `const` 真正有意義的使用場景，是作為**具有特殊語意意義的字面量的具名佔位符**：

```javascript
const MAX_RETRIES = 3;
const API_BASE_URL = "https://api.example.com";
const IS_PRODUCTION = true;
```

當一個原始值（字串、數字、布林值）本身就是不可變的，`const` 加在上面傳遞的語意是完整且正確的：這個識別字代表一個有特殊意義的常數，而不只是「我懶得想它以後會不會被改」。

對物件或陣列使用 `const`，意圖與效果之間的落差太大，反而容易誤導讀者。

## 三種宣告的優先順序建議

主流社群的建議通常是：優先用 `const`，其次 `let`，避免 `var`。Kyle Simpson 的建議完全相反：

| 宣告    | 使用時機                             |
| ------- | ------------------------------------ |
| `var`   | 預設選擇，表達函式層級的變數意圖     |
| `let`   | 天然屬於某個區塊的變數               |
| `const` | 保守使用，只用於不可變的原始值字面量 |

這個排序不是隨意的，而是基於每個關鍵字的語意精確度：`var` 表達函式範疇、`let` 表達區塊範疇、`const` 表達「這個原始值在語意上是一個常數」。

## 小結

`const` 防止的是重新賦值，而非值的可變性，這個落差是它最大的問題。它對可變值（物件、陣列）的保護是虛假的，容易製造誤解。它真正適合的場景是作為具有特殊意義的原始值字面量的具名佔位符。在此之外，`var` 和 `let` 各自有更清楚的語意，是更誠實的選擇。

## 複習

### `const` 變數和真正不可變的值在 JavaScript 中有什麼關鍵差異？

`const` 變數防止的是重新賦值，而非值本身的變動。例如，`const` 宣告的陣列仍然可以修改其元素，即使變數本身無法被重新賦值。

### 講師建議 `const` 搭配哪些類型的原始值使用？

字串、布林值和數字，特別是將 `const` 作為語意佔位符，用於程式中具有特殊意義的字面量。

### 根據課程討論，`const` 關鍵字在一個區塊中的主要語意承諾是什麼？

在這個區塊接下來的程式碼中，這個變數不會被重新賦值。這通常只涵蓋三到五行的程式碼範圍。

### `const` 對程式碼的新讀者會造成什麼問題？

新讀者可能誤以為 `const` 變數意味著值本身無法改變，但實際上它只防止變數被重新賦值。

### 講師對 JavaScript 中變數宣告的建議方式是什麼？

預設使用 `var`，在適當的地方使用 `let`，只有在不可變的原始值上才保守地使用 `const`。

## 小測驗

<details>
<summary>`const` 宣告在 JavaScript 中的主要特性是什麼？</summary>
防止變數被重新賦值
</details>

<details>
<summary>將 `const` 用於陣列等可變值時，可能引發什麼問題？</summary>
可能讓讀者誤以為值本身無法改變
</details>

<details>
<summary>關於 JavaScript 中的變數宣告，課程給出了什麼建議？</summary>
預設使用 var，在適當地方使用 let，保守地使用 const
</details>

<details>
<summary>`const` 對陣列等可變值實際上如何運作？</summary>
防止重新賦值，但允許對值進行修改（mutation）
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記