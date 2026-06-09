---
title: '預設綁定：`this` 的第四種做法與總覽'
description: '介紹 this 的第四種規則：預設綁定。說明非嚴格模式下退回全域物件、嚴格模式下為 undefined 並拋出 TypeError 的原因，並整合四種規則建立判斷 this 的完整框架。'
date: 2026-06-24
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 59
chapter: 'Objects'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - ThisKeyword
---

# 預設綁定：`this` 的第四種做法與總覽

> 本篇延續前兩篇對 `this` 綁定規則的介紹。前三種規則分別是隱式綁定、明確綁定與 `new` 綁定。本篇說明最後一種規則：預設綁定（default binding），並整合四種規則建立完整的判斷框架。

## 規則四：預設綁定（Default Binding）

預設綁定是四種規則中的「兜底規則」：當呼叫一個函式時，若不符合前三種規則中的任何一種，就套用預設綁定。

最常見的情境是單純的函式呼叫，沒有任何物件、沒有 `.call`、沒有 `.bind`、也沒有 `new`：

```javascript
var teacher = "Kyle";

function ask(question) {
  console.log(this.teacher, question);
}

function askAgain(question) {
  "use strict";
  console.log(this.teacher, question);
}

ask("What's the non-strict-mode default?");
// Kyle What's the non-strict-mode default?

askAgain("What's the strict-mode default?");
// TypeError
```

### 非嚴格模式：`this` 退回全域物件

在非嚴格模式下，若函式呼叫沒有任何綁定上下文，`this` 會預設指向全域物件（瀏覽器中是 `window`，Node.js 中是 `global`）。

上例的 `ask` 函式沒有使用嚴格模式，呼叫時也沒有任何上下文，因此 `this` 指向全域物件，而全域物件上恰好有 `teacher = "Kyle"`，所以印出 `Kyle`。

### 嚴格模式：`this` 為 `undefined`，拋出 TypeError

在嚴格模式下，同樣的情況會讓 `this` 保持 `undefined`。嘗試存取 `undefined.teacher` 就會拋出 TypeError。

這個設計是刻意的。Kyle Simpson 的解釋是：

> 如果你定義了一個 `this` aware 的函式，卻在沒有任何 `this` 上下文的情況下呼叫它，這幾乎可以確定是個錯誤。嚴格模式讓這個錯誤立即浮現，而非悄悄地把 `this` 指向全域物件。

這個行為與「自動建立全域變數」是同一類問題：表面上可以運作，但幾乎從來不是你真正想要的結果。嚴格模式在兩種情況下都替開發者攔截了這類疏失。

## 四種做法完整整合

至此，四種 `this` 綁定規則已全部介紹完畢：

| 規則       | 觸發條件                                          | `this` 指向                              |
| ---------- | ------------------------------------------------- | ---------------------------------------- |
| 隱式綁定   | `obj.fn()`                                        | 呼叫點左側的物件                         |
| 明確綁定   | `fn.call(ctx)` / `fn.apply(ctx)` / `fn.bind(ctx)` | 明確傳入的物件                           |
| `new` 綁定 | `new fn()`                                        | 新建立的空物件                           |
| 預設綁定   | `fn()`（無其他規則匹配）                          | 全域物件（非嚴格）或 `undefined`（嚴格） |

### 四種規則的優先順序

當一個呼叫點同時符合多種規則時（雖然不建議這樣寫，但語言上是合法的），JavaScript 有明確的優先順序決定哪條規則生效。

判斷 `this` 指向時，依序問以下四個問題，第一個符合的規則就是答案：

**1. 函式是否用 `new` 呼叫？** 是 → `this` 指向新建立的空物件。

**2. 函式是否用 `.call()`、`.apply()` 或 `.bind()` 呼叫？** 是 → `this` 指向明確傳入的上下文物件。（`.bind()` 底層使用 `.apply()`，屬於同一條規則。）

**3. 函式是否透過上下文物件呼叫（如 `workshop.ask(...)`）？** 是 → `this` 指向該上下文物件。

**4. 以上皆否？** 非嚴格模式 → `this` 退回全域物件。嚴格模式 → `this` 為 `undefined`，拋出 TypeError。

### 判斷 `this` 的正確方式

整個 `this` 系統的核心結論只有一句話：

> **判斷 `this` 指向什麼，唯一的方法是看呼叫點（call site），也就是函式是如何被呼叫的，而非函式是如何被定義的。**

每次函式被呼叫，「呼叫的方式」就決定了 `this` 的綁定結果。沒有其他方法可以事先從函式定義推斷出 `this` 的值。

## 複習

### JavaScript 中呼叫函式並綁定 `this` 的四種方式是什麼？

1. 預設綁定（default binding）
2. 明確綁定（explicit binding，使用 call/apply/bind）
3. 隱式綁定（implicit binding，透過上下文物件）
4. 建構子綁定（constructor binding，使用 new 關鍵字）

### 在嚴格模式下，若呼叫一個含有 `this` 的函式卻沒有提供上下文，會發生什麼事？

`this` 會是 `undefined`，嘗試存取其屬性時會拋出 TypeError，防止意外參考全域物件。

### 在非嚴格模式下，若呼叫一個含有 `this` 的函式卻沒有提供上下文，會發生什麼事？

`this` 會退回全域物件作為預設綁定，這通常不是預期的行為。

### 如何判斷一個函式中 `this` 的值？

必須檢查呼叫點（call site）以及函式被呼叫的方式，而非看函式本身的定義。

### 嚴格模式為何在沒有提供上下文時，將 `this` 設為 `undefined`？

這是為了防止開發者在沒有適當上下文的情況下，不小心呼叫了一個 `this` aware 的函式，這種情況幾乎可以確定是一個錯誤。

## 小測驗

<details>
<summary>在嚴格模式下，若函式在沒有任何上下文的情況下被呼叫，會發生什麼事？</summary>
因為 `this` 是 `undefined`，會拋出 TypeError
</details>

<details>
<summary>在 JavaScript 中，有幾種方式可以呼叫函式並綁定 `this`？</summary>
四種
</details>

<details>
<summary>要判斷函式中 `this` 指向什麼，應該看哪裡？</summary>
呼叫點（call site）以及函式被呼叫的方式
</details>

<details>
<summary>在非嚴格模式下，若函式在沒有上下文的情況下被呼叫，`this` 的預設行為是什麼？</summary>
退回全域物件
</details>

<details>
<summary>嚴格模式為何在沒有上下文時，讓 `this` 為 `undefined`？</summary>
用來提示在沒有上下文的情況下呼叫 `this` aware 函式，幾乎可以確定是一個錯誤
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記