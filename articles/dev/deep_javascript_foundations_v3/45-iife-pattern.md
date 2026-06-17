---
title: 'IIFE：立即調用函式表達式'
description: '介紹 IIFE（立即調用函式表達式）的推導邏輯與正式定義：如何建立臨時範疇而不污染外層、為什麼 IIFE 也應該命名，以及把 try/catch 陳述式轉為表達式的進階用途。'
date: 2026-06-17
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 45
chapter: 'Advanced Scope'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - Scope
  - IIFE
---

# IIFE：立即調用函式表達式

> 本文延續[[44-function-scoping|上一篇]]對函式範疇與最小暴露原則的討論。前一篇發現了「用具名函式建立範疇」的問題：函式名稱本身會留在外層範疇，等於把一個命名衝突換成另一個。這篇要介紹解決這個問題的正式模式。

## 從推導到 IIFE

上一篇展示了把函式呼叫拆成兩步驟的概念：

```javascript
(anotherTeacher)();   // 括號取值，再執行
```

既然括號內可以放任何表達式，為什麼要先宣告一個具名函式再放進去？直接把函式表達式放進括號就好：

```javascript
var teacher = "Kyle";

(function anotherTeacher() {
    var teacher = "Suzy";
    console.log(teacher);   // Suzy
})();

console.log(teacher);       // Kyle
```

這就是 **IIFE（Immediately Invoked Function Expression，立即調用函式表達式）**，2010 年由社群正式命名。

整個模式的核心是：建立一個函式表達式，立刻調用它，只需要它提供的那個臨時範疇，用完即丟。`anotherTeacher` 這個名稱不會出現在外層範疇，命名污染的問題得到解決。

## 為什麼它是表達式而非宣告

讓 `function` 關鍵字不是陳述式第一個詞的方式不只有括號，任何一元運算子都能達到同樣效果：

```javascript
!function() { /* .. */ }();
+function() { /* .. */ }();
void function() { /* .. */ }();
```

這些都能把函式轉為表達式並執行。括號只是最常見、可讀性最好的形式。

## IIFE 也應該命名

你見過的 IIFE 大多是匿名的：

```javascript
// 常見但不好
(function(teacher) {
    console.log(teacher);   // Suzy
})("Suzy");
```

Kyle Simpson 的立場與前一篇完全一致：IIFE 也是函式，函式就應該有名字。如果你能描述這個範疇的用途，就用描述性名稱；如果真的想不出名稱，至少寫 `IIFE`，這樣在 stack trace 中還能知道它是從哪裡來的。

IIFE 可以接受參數，讓外部值傳入範疇內使用，不需要透過賦值操作，讓程式碼更直接。

## IIFE 的另一個用途：把陳述式變成表達式

IIFE 還有一個較少人知道的應用：把只能是陳述式的語法放進需要表達式的位置。

常見的情境是包含 `try/catch` 的賦值。傳統寫法必須先宣告變數，再在兩個地方分別賦值：

```javascript
var teacher;
try {
    teacher = fetchTeacher(1);
}
catch (err) {
    teacher = "Kyle";
}
```

這段程式碼需要讀者追蹤「`teacher` 最終被賦值了幾次」才能理解意圖。用 IIFE 可以讓賦值只發生一次，意圖更清楚：

```javascript
var teacher = (function getTeacher() {
    try {
        return fetchTeacher(1);
    }
    catch (err) {
        return "Kyle";
    }
})();
```

`teacher` 只被賦值一次，從 IIFE 的回傳值取得，讀者一眼就能理解這個變數只會有一個確定的值。

## 小結

IIFE 是建立臨時範疇、不污染外層範疇的標準模式。它的本質是把函式轉為表達式、立即執行、取得範疇後丟棄。與所有函式一樣，IIFE 也應該命名。除了隔離範疇之外，它也可以用來把 `try/catch` 等陳述式放進需要表達式的位置，讓賦值意圖更清楚。

## 複習

### What does IIFE stand for in JavaScript?

Immediately Invoked Function Expression, a pattern used to create a scope that runs once and then goes away

### How can a function declaration be transformed into a function expression?

By surrounding the function with parentheses, or by using unary operators like plus, negate, minus, tilde, delete, or void operators

### What is a key benefit of using an IIFE?

It creates a scope without polluting the enclosing scope and allows running a function just once

### What is an alternative approach if you can't think of a descriptive name for an IIFE?

Use the word 'IIFE' in capital letters to provide some context in the stack trace

### What is an uncommon but useful usage of an IIFE?

Turning statements into expressions, such as wrapping a try-catch block to make it work in an expression position

## 複習

### IIFE 在 JavaScript 中代表什麼？

立即調用函式表達式（Immediately Invoked Function Expression），一種建立範疇、執行一次後即消失的模式。

### 如何將函式宣告轉換為函式表達式？

用括號將函式包起來，或使用一元運算子，例如加號（+）、否定（!）、減號（-）、位元反（~）、delete 或 void。

### 使用 IIFE 的主要優點是什麼？

它能建立一個範疇而不污染外層封閉範疇，並且只需執行一次。

### 如果想不到 IIFE 的描述性名稱，有什麼替代做法？

使用大寫的「IIFE」作為函式名稱，讓 stack trace 中仍能提供一些上下文資訊。

### IIFE 有什麼較不常見但實用的用途？

將陳述式轉換為表達式，例如把 try/catch 區塊包起來，讓它能在需要表達式的位置使用。

## 小測驗

<details>
<summary>IIFE 在 JavaScript 中代表什麼？</summary>
立即調用函式表達式（Immediately Invoked Function Expression）
</details>

<details>
<summary>IIFE 在 JavaScript 中有什麼用途？</summary>
建立一個臨時範疇，同時不污染外層的封閉範疇
</details>

<details>
<summary>如何將函式宣告轉換為函式表達式？</summary>
用括號將它包起來
</details>

<details>
<summary>除了使用括號之外，還有什麼方式可以將函式轉換為表達式？</summary>
使用一元運算子，例如加號（+）、否定（!）或 void
</details>

<details>
<summary>當建立一個沒有明確用途的 IIFE 時，有什麼命名建議？</summary>
使用大寫的「IIFE」作為函式名稱
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記