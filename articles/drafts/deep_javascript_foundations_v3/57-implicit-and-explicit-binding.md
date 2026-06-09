---
title: '隱式綁定與明確綁定：`this` 的前兩種規則'
description: '介紹 this 的前兩種呼叫規則：隱式綁定（點號左側的物件）與明確綁定（.call / .apply）。說明傳遞函式導致 this 遺失的問題、.bind() 硬綁定的解法，以及 Kyle Simpson 對彈性與可預測性的設計取捨框架。'
date: 2026-06-23
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 57
chapter: 'Objects'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - ThisKeyword
---

# 隱式綁定與明確綁定：`this` 的前兩種規則

> 本篇延續[[56-the-this-keyword|上一篇]]對 `this` 關鍵字的介紹。上一篇確立了核心原則：`this` 由呼叫方式決定，共有四種規則。本篇深入前兩種：隱式綁定（implicit binding）與明確綁定（explicit binding），並說明 `this` 遺失問題與硬綁定的使用取捨。

## 規則一：隱式綁定（Implicit Binding）

隱式綁定是四種規則中最常見、也最直覺的一種。規則很簡單：

> **`this` 指向呼叫該方法時，點號（`.`）左側的物件。**

```javascript
var workshop = {
  teacher: "Kyle",
  ask(question) {
    console.log(this.teacher, question);
  },
};

workshop.ask("What is implicit binding?");
// Kyle What is implicit binding?
```

`workshop.ask(...)` 的呼叫點（call site）是 `workshop.ask`，點號左側是 `workshop`，因此 `this` 指向 `workshop`。

這個規則之所以直覺，是因為它的行為與其他語言的 `this` 最為相似：方法所屬的物件就是 `this`。

### 隱式綁定的實際用途：跨物件共享行為

隱式綁定的真正價值在於，同一個函式可以被多個物件共享，而不需要為每個物件各自定義一份：

```javascript
function ask(question) {
  console.log(this.teacher, question);
}

var workshop1 = { teacher: "Kyle", ask: ask };
var workshop2 = { teacher: "Suzy", ask: ask };

workshop1.ask("How do I share a method?");
// Kyle How do I share a method?

workshop2.ask("How do I share a method?");
// Suzy How do I share a method?
```

只有一個 `ask` 函式，但透過隱式綁定，它在 `workshop1` 和 `workshop2` 兩個不同的上下文中各自執行，得到各自的 `this`。這就是 `this` 系統提供動態彈性的具體體現。

## 規則二：明確綁定（Explicit Binding）

隱式綁定依賴呼叫點的寫法，有時我們需要更主動地控制 `this` 的指向。`Function.prototype` 上的 `.call()` 與 `.apply()` 提供了這個能力：

```javascript
function ask(question) {
  console.log(this.teacher, question);
}

var workshop1 = { teacher: "Kyle" };
var workshop2 = { teacher: "Suzy" };

ask.call(workshop1, "Can I explicitly set context?");
// Kyle Can I explicitly set context?

ask.call(workshop2, "Can I explicitly set context?");
// Suzy Can I explicitly set context?
```

`.call(thisArg, arg1, arg2, ...)` 與 `.apply(thisArg, [args])` 的第一個參數就是要指定的 `this` 上下文，差別只在於後續參數的傳遞方式。這裡我們明確告訴 JavaScript：「用這個物件作為 `this` 來呼叫這個函式。」

## `this` 遺失問題（Losing the `this` Binding）

明確綁定的一個常見陷阱：把方法作為 callback 傳遞時，`this` 會遺失。

```javascript
var workshop = {
  teacher: "Kyle",
  ask(question) {
    console.log(this.teacher, question);
  },
};

setTimeout(workshop.ask, 10, "Lost this?");
// undefined Lost this?
```

`setTimeout` 接收到的是 `workshop.ask` 這個函式的參考，而非 `workshop.ask` 這個呼叫。當計時器觸發時，呼叫點大約等同於 `cb.call(window, ...)`，`this` 被綁定到全域物件（瀏覽器中是 `window`），不是 `workshop`，因此 `this.teacher` 是 `undefined`。

這個問題的根本原因是：**傳遞的是函式本身，與它原本的物件脫鉤了**。

### 硬綁定（Hard Binding）：`.bind()`

解決 `this` 遺失的常見方案是 `.bind()`：

```javascript
setTimeout(workshop.ask.bind(workshop), 10, "Hard bound this?");
// Kyle Hard bound this?
```

`.bind()` 不會立即呼叫函式，而是回傳一個**新的函式**，這個新函式無論被誰呼叫、以何種方式呼叫，`this` 永遠固定指向指定的物件。這就是「硬綁定」的名稱由來：把 `this` 鎖死。

## 彈性 vs 可預測性：工具選擇的判斷框架

Kyle Simpson 在這裡提出了一個重要的設計取捨：

- **`this` 系統的價值在於動態彈性**：同一個函式能在不同上下文中重用
- **`.bind()` 把這個彈性抹除**：換來可預測性，但也放棄了 `this` 系統的核心優勢

如果你的程式碼大量使用 `.bind()`，這是一個信號：你可能正在用錯誤的工具解決問題。Kyle Simpson 的判斷啟發如下：

> 如果大多數呼叫點都需要硬綁定，你付出了撰寫 `this` aware 程式碼的代價，卻沒有得到動態彈性的好處。此時應該改用閉包與詞彙範疇，寫出可預測的程式碼。

`.bind()` 本身不是壞東西，偶爾使用是合理的取捨。但如果發現頻繁使用它，值得重新思考這段程式碼是否適合用 `this` 系統來設計。

## 複習

### 隱式綁定規則如何決定 `this` 的指向？

在隱式綁定中，`this` 指向呼叫該方法時點號左側的物件，即呼叫點所使用的物件。

### `.call()` 和 `.apply()` 在函式呼叫中有什麼用途？

兩者都允許在呼叫函式時，明確指定 `this` 的上下文，方式是將目標上下文物件作為第一個參數傳入。

### 「`this` 遺失」問題在傳遞函式時會造成什麼狀況？

當函式被作為 callback 傳遞到其他上下文時，它可能與原本的物件脫鉤，導致 `this` 被重新綁定到其他物件（通常是全域物件）。

### `.bind()` 方法在 JavaScript 中的作用是什麼？

`.bind()` 建立並回傳一個新函式，無論該函式以任何方式被呼叫，`this` 都永遠固定指向指定的上下文物件。

### 若頻繁使用 `.bind()`，建議採取什麼做法？

頻繁使用 `.bind()` 可能代表應該改用詞彙閉包（lexical closure），以獲得更自然、更可預測的行為。

## 小測驗

<details>
<summary>`this` 指向物件的主要規則是哪一種？</summary>
隱式綁定（implicit binding）
</details>

<details>
<summary>哪個方法可以在呼叫函式時明確指定其上下文？</summary>
.call() 或 .apply()
</details>

<details>
<summary>`.bind()` 方法解決了什麼問題？</summary>
建立一個擁有固定 `this` 上下文的新函式
</details>

<details>
<summary>使用 `this` 關鍵字最主要的優勢是什麼？</summary>
能夠跨不同上下文共享同一個函式的行為
</details>

<details>
<summary>在什麼情況下應該考慮從 `this` aware 程式碼改用詞彙閉包？</summary>
當大多數呼叫點都需要使用硬綁定（.bind()）時
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記