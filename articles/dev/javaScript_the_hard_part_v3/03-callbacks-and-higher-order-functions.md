---
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 3
title: JavaScript 的 Higher-Order Functions：從 DRY 到函式作為參數
description: 從 DRY 原則出發，說明 parameter 如何讓函式通用化，再延伸到 Higher-Order Functions：以函式作為 callback 傳入，讓行為在呼叫時才決定——`map`、`filter`、`reduce` 背後的核心機制。
date: 2026-04-22
section: dev
category: JavaScript Hard Parts v3
tags:
    - JavaScript
    - HigherOrderFunction
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# JavaScript 的 Higher-Order Functions：從 DRY 到函式作為參數

## 為什麼需要函式

先看一個最直接的問題：如果要計算 10²、9²、8²，最直覺的寫法是：

```javascript
function tenSquared() {
    return 10 * 10;
}
function nineSquared() {
    return 9 * 9;
}

function eightSquared() {
    return 8 * 8;
}
tenSquared(); // 100
nineSquared(); // 81
eightSquared(); // 64
```

顯然這違反了 **DRY 原則（Don't Repeat Yourself）**，每次有新的需求就寫一份幾乎相同的程式碼，不只浪費時間還難以維護

## 用 Parameter 通用化函式

解法是引入 **parameter（參數）**：定義函式時不寫死資料，改用一個佔位符，等實際呼叫時再傳入 **argument（引數）**。

```javascript
function squareNum(num) {
    return num * num;
}
squareNum(10); // 100
squareNum(9); // 81
squareNum(8); // 64
```

一份程式碼，重複使用，資料由外部決定。

> **Parameter vs Argument**
>
> - Parameter：函式定義時的佔位符（`num`）
> - Argument：實際呼叫時傳入的值（`10`、`9`、`8`）

## Higher-Order Functions

Parameter 解決了「資料可以延遲決定」的問題。

Higher-Order Functions 把這個概念推進一步：**連部分功能本身也可以延遲決定**。

> 接受函式作為參數，或回傳函式的函式，稱為 **Higher-Order Function**。

這個設計讓函式的行為在呼叫時才確定，是 `map`、`filter`、`reduce` 等內建方法的底層基礎，也是 JavaScript 函式式程式設計的核心機制。

**後續將會使用實際例子討論此概念。**

## 複習

### 為什麼分別建立 `10squared`、`9squared`、`8squared` 這樣的函式，而非單一通用函式，違反了什麼程式設計原則？

建立多個相似函式而非將功能抽象化為單一可重用函式，違反了 **DRY（Don't Repeat Yourself）** 原則。

### Parameter 如何讓函式更具可重用性？

Parameter 作為佔位符，讓函式得以通用化。與其將資料寫死，不如透過 parameter 將資料的決定延後到函式被呼叫時，使同一個函式能以不同的輸入重複使用。

### Function 中 parameter 與 argument 的差別是什麼？

Parameter 是定義函式時宣告的佔位符，用來指定函式將接收的資料。Argument 則是實際呼叫函式時傳入的值。

## 小測驗

<details> 
<summary>建立多個相似函式（如 `10squared`、`9squared`、`8squared`）違反了什麼程式設計原則？</summary> 
DRY（Don't Repeat Yourself）
</details>

<details> 
<summary>什麼特性讓函式能以不同的資料輸入重複使用？</summary> 
Parameter（參數）
</details>

<details> 
<summary>實際呼叫函式時，傳入給 parameter 的值稱為什麼？</summary> 
Argument（引數）
</details>

<details> 
<summary>用 parameter 通用化函式之後，能達到什麼效果？</summary> 
函式只需定義一次，即可以不同資料重複呼叫
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
