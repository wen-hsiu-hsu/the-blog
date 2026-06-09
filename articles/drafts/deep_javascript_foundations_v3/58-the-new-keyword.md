---
title: '`new` 關鍵字：第三種 `this` 綁定規則'
description: '介紹 new 關鍵字作為第三種 this 綁定方式：說明用 new 呼叫函式時依序發生的四件事，以及為什麼 new 更像是劫持了函式、由關鍵字本身完成所有工作。'
date: 2026-06-24
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 58
chapter: 'Objects'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - ThisKeyword
---

# `new` 關鍵字：第三種 `this` 綁定規則

> 本篇延續前兩篇對 `this` 綁定規則的討論。前兩種規則分別是隱式綁定（由呼叫物件決定）與明確綁定（`.call`/`.apply`/`.bind`）。本篇介紹第三種：使用 `new` 關鍵字呼叫函式。

## `new` 與`Class`無關

`new` 關鍵字在語法上看起來像是在呼叫類別建構子，這讓許多人誤以為它是類別系統的一部分。Kyle Simpson 明確指出：

> **`new` 關鍵字與類別無關，它只是第三種呼叫函式的方式。**

這個語法設計只是讓它「看起來像」在處理類別，實際上它的功能完全與類別無關。

## `new` 呼叫函式時的四個步驟

用 `new` 呼叫一個函式時，JavaScript 引擎會依序執行四件事：

**1. 建立一個全新的空物件**

從無到有建立一個空的物件 `{}`。

**2. 將這個新物件連結到另一個物件**

這個連結涉及原型鏈（prototype chain），會在後續的 Prototypes 章節中詳細說明。此處先記住這個步驟的存在。

**3. 以這個新物件作為 `this`，呼叫函式**

注意：`this` 指向的是第一步建立的新物件，而非第二步連結的對象。

**4. 若函式沒有明確回傳一個物件，則自動回傳 `this`**

如果函式本身 `return` 了一個物件，就使用那個物件。否則，`new` 關鍵字假定你的意圖是回傳 `this`，也就是那個新建立的空物件。

```javascript
function ask(question) {
  console.log(this.teacher, question);
}

var newEmptyObject = new ask("What is 'new' doing here?");
// undefined What is 'new' doing here?
```

這裡的 `this.teacher` 是 `undefined`，因為 `this` 指向的是一個全新的空物件，它沒有 `teacher` 屬性。

### `new` 的本質：劫持函式的關鍵字

Kyle Simpson 提出一個有趣的視角：在這四個步驟中，幾乎所有的工作都是由 `new` 關鍵字完成的，而非函式本身。

事實上，只要在幾乎任何函式前面加上 `new`，就算是一個完全空的函式，這四個步驟也都會發生。函式本身在這個過程中幾乎無關緊要。從這個角度來看，`new` 更像是**劫持（hijack）了函式**，借用函式呼叫的語法來執行這四件事。

## 複習

### `new` 關鍵字在呼叫函式時，具體會執行哪四件事？

1. 建立一個全新的空物件
2. 將這個物件連結到另一個物件
3. 以這個新物件作為 `this`，呼叫函式
4. 若函式未明確回傳一個物件，則自動回傳 `this`

### 使用 `new` 關鍵字呼叫函式的主要目的是什麼？

以一個全新的空物件作為 `this` 上下文來呼叫函式。

### 用 `new` 呼叫函式時，`this` 指向哪裡？

`this` 指向第一步建立的全新空物件，而非連結的物件。

### 若用 `new` 呼叫的函式沒有明確回傳一個物件，會發生什麼事？

`new` 關鍵字會自動假定意圖是回傳 `this`，並將其作為結果回傳。

### 對一個完全空的函式使用 `new`，會發生什麼事？

即使函式是空的，這四個步驟（建立物件、連結、以 `this` 呼叫、回傳 `this`）仍然全部會發生。

## 小測驗

<details>
<summary>`new` 關鍵字在呼叫函式時，具體會執行哪四件事？</summary>
建立空物件、連結該物件、以 `this` 指向新物件呼叫函式、若函式未回傳物件則自動回傳 `this`
</details>

<details>
<summary>使用 `new` 關鍵字呼叫函式的主要目的是什麼？</summary>
以一個全新的空物件作為 `this` 上下文來呼叫函式
</details>

<details>
<summary>使用 `new` 時，若函式沒有回傳物件，會發生什麼事？</summary>
`new` 關鍵字自動回傳 `this` 物件
</details>

<details>
<summary>`new` 關鍵字在函式呼叫上有什麼獨特之處？</summary>
它能劫持幾乎任何函式，強制執行這四個特定步驟
</details>

<details>
<summary>使用 `new` 關鍵字時，函式的 `this` 上下文會指向哪裡？</summary>
指向當下新建立的空物件
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記