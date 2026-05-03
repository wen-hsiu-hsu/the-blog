---
title: JavaScript 型別強制轉換：運算子、ToNumber 與 DOM 字串
description: 介紹 JavaScript 型別強制轉換的設計背景，說明運算子與函式的本質差異、DOM 輸入為何永遠是字串，以及 ToNumber 如何自動處理混合型別的數學運算。
date: 2026-05-07
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 18
chapter: 'Type Coercion & Metaprogramming'
tags:
    - JavaScript
    - TypeCoercion
    - Metaprogramming
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# JavaScript 型別強制轉換：運算子、ToNumber 與 DOM 字串

## 什麼是型別強制轉換（Type Coercion）

JavaScript 有一套隱藏但威力強大的機制，叫做**型別強制轉換（Type Coercion）**。它不是設計失誤，而是刻意為之的語言特性。JavaScript 從誕生之初就被設計為在瀏覽器中運行，必須在 DOM（瀏覽器視圖層）與 JavaScript 邏輯層之間扮演橋梁角色，而這兩個環境之間傳遞的資料，型別往往不如預期。

要真正理解型別強制轉換，必須對以下幾個主題有扎實的掌握：

- 基本型別（primitives）與物件的底層差異
- 運算子（operators）的運作原理
- 記憶體底層行為
- Symbol 的使用，讓開發者得以手動控制強制轉換流程，進而實現**元程式設計（metaprogramming）**

## 運算子（Operators）是什麼

在介紹型別強制轉換之前，需要先理解**運算子**的本質。

運算子看起來和函式不同，但概念上有高度相似之處：兩者都是「執行某項任務的機制」。差異在於：

|                | 函式（Function） | 運算子（Operator）     |
| -------------- | ---------------- | ---------------------- |
| 作用對象的位置 | 括號內的引數     | 運算子左右兩側的運算元 |
| 呼叫方式       | `multiply(7, 3)` | `7 * 3`                |

以 `price * quantity` 為例：

- `*` 是**運算子（operator）**，代表乘法動作
- `price` 與 `quantity` 是**運算元（operands）**，是運算子作用的對象

運算子可以理解為一個「動作派發器（action dispatcher）」，透過它在程式碼中的位置，觸發對應的運算行為。

## DOM 輸入永遠是字串

考慮以下情境：我們建立一個商品頁面，`price` 固定為 `7`，讓使用者在網頁表單輸入數量。

```javascript
const price = 7;
let quantity; // 來自 document.getElementById("q").value
let total; // 初始為 undefined

function onSubmit() {
    total = price * quantity; // 7 * "3"
}

onSubmit(); // 使用者點擊送出時執行
```

當使用者在表單輸入 `3` 並送出，這個值從 DOM 傳入 JavaScript 時，**不會是數字 `3`，而是字串 `"3"`**。

這是因為 DOM 對所有表單欄位的值一律以字串形式處理。對 JavaScript 而言，字串 `"3"` 與字母 `"A"` 在本質上沒有差別，它只是一個文字符號，無法直接進行數值運算。

## ToNumber 強制轉換

面對 `7 * "3"` 這個表達式，嚴謹的語言可能會拋出錯誤。但 JavaScript 選擇了另一條路：**自動觸發 ToNumber 型別強制轉換**。

當 JavaScript 引擎看到數學運算子（如 `*`）兩側的值，一個是數字、另一個是字串時，它會嘗試將字串強制轉換為數字：

```
total = 7 * "3"
         ↓ ToNumber 強制轉換
total = 7 * 3
         ↓ 一般乘法
total = 21
```

轉換完成後，才執行正常的乘法運算，最終 `total` 得到 `21`。

這個行為正是 JavaScript 作為瀏覽器語言的設計哲學體現：盡量降低 DOM 與 JavaScript 之間的資料型別摩擦，讓開發者不必每次都手動轉換。

## 小結

這節課揭開了 JavaScript 型別強制轉換的序幕。核心認知如下：

- 型別強制轉換是 JavaScript 的**刻意設計**，服務於瀏覽器 I/O 的彈性需求
- 運算子是以**相鄰位置**來接收運算元，與函式透過括號接收引數的方式不同
- DOM 傳入 JavaScript 的值**永遠是字串**
- 數學運算子碰到非數字的值時，會觸發 **ToNumber 強制轉換**

後續文章將進一步探討其他運算子的強制轉換規則，以及如何透過 Symbol 手動介入這個轉換流程。

## 複習

### 為什麼使用者在網頁上輸入的資料傳入 JavaScript 後會是字串，即使使用者輸入的是數字？

當使用者在網頁表單欄位輸入資料，並透過 DOM 傳入 JavaScript 時，無論使用者輸入的是數字還是文字，傳入的值一律是字串。例如，使用者輸入 `3`，傳入 JavaScript 的是字串 `"3"`，而非數字 `3`。

### JavaScript 中，運算子（operators）與函式（functions）在接收輸入的方式上有何不同？

運算子作用於其左右兩側相鄰的資料（運算元），而函式則作用於括號內傳入的引數。例如，`*` 運算子作用於左右兩側的運算元（如 `7 * 3`），而函式則透過括號接收引數（如 `multiply(7, 3)`）。

### 在 JavaScript 運算子的脈絡下，什麼是運算元（operands）？

運算元是運算子所作用的值或變數。以 `price * quantity` 為例，`price` 與 `quantity` 是運算元，而 `*`（乘法符號）是對這些運算元執行動作的運算子。

## 小測驗

<details>
<summary>當使用者在網頁表單輸入數字 3 並傳入 JavaScript 後，它的資料型別是什麼？</summary>
字串（string）
</details>

<details>
<summary>運算子與函式在作用於資料的方式上，最關鍵的差異是什麼？</summary>
函式作用於括號內的資料，運算子作用於其相鄰位置的資料
</details>

<details>
<summary>在 JavaScript 運算子的脈絡下，什麼是運算元（operands）？</summary>
運算子執行任務時所作用的值
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
