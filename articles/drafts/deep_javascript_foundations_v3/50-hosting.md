---
title: '提升（Hoisting）：一個有用但不精確的比喻'
description: '說明提升（Hoisting）是描述詞彙範疇的比喻，而非程式碼被實際移動的機制。用兩階段處理模型解釋 var 宣告與函式宣告的差異，以及為什麼函式宣告可以在宣告位置前呼叫，函式表達式不行。'
date: 2026-06-20
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 50
chapter: 'Advanced Scope'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - Hoisting
---

# 提升（Hoisting）：一個有用但不精確的比喻

> 本文延續對範疇與編譯階段的討論。前幾篇建立了 JavaScript 兩階段處理的心智模型，這篇要用這個模型解釋一個廣為流傳、但在精確性上有所不足的概念：提升（hoisting）。

## 提升不是真實存在的機制

「提升」這個詞在 JavaScript 社群中流傳已久，但直到近年，這個詞才正式出現在 ECMAScript 規格書中。實際上，JavaScript 引擎從來不會移動你的程式碼。沒有任何東西被「提升」到頂部。

提升只是一個**英語語言慣例**，一個用來描述詞彙範疇行為的便捷比喻，讓人不需要思考兩階段處理也能大致理解某些現象。

## 真正發生的事：兩個階段

```javascript
student;        // ??
teacher;        // ??
var student = "you";
var teacher = "Kyle";
```

用提升的說法解釋：「`var` 宣告被提升到頂部，所以 `student` 和 `teacher` 在第一行就已存在，值是 `undefined`。」

用實際發生的事解釋：

**編譯階段**：編譯器掃描整個範疇，發現 `var student` 和 `var teacher`，建立兩顆彈珠（但不賦值）。

**執行階段**：第 1 行存取 `student`，彈珠存在，值是 `undefined`；第 2 行同理；第 3、4 行才執行賦值。

等價的「提升後」寫法只是幫助理解的視覺化工具：

```javascript
var student;           // 編譯期建立彈珠
var teacher;
student;               // undefined
teacher;               // undefined
student = "you";
teacher = "Kyle";
```

## 為什麼說「移動程式碼」是不可能的

要找到範疇內後面的 `var` 宣告，引擎必須處理後面的語法結構，才能確定某個位置是否是合法的宣告。而能夠做到「找到範疇內所有宣告」的處理過程，就叫做**解析（parsing）**。

## 函式宣告 vs 函式表達式：提升的關鍵差異

```javascript
teacher();         // Kyle（正常執行）
otherTeacher();    // TypeError（！）

function teacher() {
    return "Kyle";
}

var otherTeacher = function() {
    return "Suzy";
};
```

用兩階段模型解釋：

**函式宣告**：編譯期不只建立彈珠，也把函式本身關聯到那顆彈珠。執行期一開始，`teacher` 就已經是一個完整的函式，可以在任何地方呼叫。

**函式表達式**：`var otherTeacher` 的彈珠在編譯期建立，但值是 `undefined`。賦值（把函式關聯到 `otherTeacher`）只在執行期到達第 8 行時才發生。在那之前呼叫 `otherTeacher()`，它的值是 `undefined`，對 `undefined` 使用 `()` 呼叫語法，就是 TypeError。

等價的「提升後」寫法：

```javascript
function teacher() { return "Kyle"; }   // 完整函式在編譯期就準備好
var otherTeacher;                        // 只建立彈珠，值 undefined

teacher();        // Kyle
otherTeacher();   // TypeError：undefined 不是函式

otherTeacher = function() { return "Suzy"; };
```

## 函式宣告提升的實用價值

Kyle Simpson 現在的習慣是把可執行的程式碼放在檔案或範疇的頂部，函式宣告放在底部。這樣打開檔案時立刻看到程式在做什麼，需要看函式細節再往下捲。這個模式能成立，正是依賴於函式宣告在編譯期就完整可用的特性。

## 小結

提升是描述兩階段處理結果的便捷比喻，不是程式碼被實際移動的機制。`var` 宣告在編譯期建立彈珠（值為 `undefined`），函式宣告在編譯期建立彈珠並關聯完整函式；函式表達式只有 `var` 彈珠被建立，函式本身的賦值發生在執行期。這個差異直接決定了函式宣告可以在宣告前呼叫，函式表達式不行。

## 複習

### JavaScript 中常被稱為「提升（hoisting）」的現象，實際機制是什麼？

提升不是程式碼被實際移動的機制，而是描述 JavaScript 如何在編譯期處理變數和函式宣告的比喻，宣告在第一個階段（編譯期）就被處理，早於程式碼的執行。

### 為什麼正規表達式無法用來識別 JavaScript 中的變數宣告？

JavaScript 是非正規語言，其語法和結構過於複雜，無法用簡單的正規表達式進行準確解析。

### 函式宣告和函式表達式在處理方式上有什麼關鍵差異？

函式宣告在編譯期就完整可用，可以在程式碼中任何位置呼叫，甚至早於其宣告位置。函式表達式只在執行期到達賦值那一行時才被關聯，在那之前無法呼叫。

### JavaScript 實際上用什麼過程來找到並處理變數宣告？

解析（parsing）：對語法標記進行精細的處理，以識別和管理範疇內的宣告。

### 函式宣告與變數宣告在編譯期的行為有什麼不同？

函式宣告在編譯期就完整定義並可在整個所在範疇使用；變數宣告只建立識別字（彈珠），不賦值。

## 小測驗

<details>
<summary>JavaScript 中的提升（hoisting）實際上是什麼？</summary>
一個用來描述詞彙範疇的比喻
</details>

<details>
<summary>函式宣告和函式表達式的關鍵差異是什麼？</summary>
函式宣告可以在定義前呼叫
</details>

<details>
<summary>在 JavaScript 程式碼的第一個階段（編譯期）發生了什麼？</summary>
編譯器識別並處理所有宣告
</details>

<details>
<summary>函式宣告在編譯期有什麼行為？</summary>
在編譯期就被完整定義，可以在宣告位置之前使用
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記