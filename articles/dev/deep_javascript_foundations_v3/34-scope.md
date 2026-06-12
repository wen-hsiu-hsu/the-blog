---
title: '範疇（Scope）：JavaScript 的兩階段處理模型'
description: '介紹 JavaScript 範疇的基礎概念：範疇就是「找識別字的地方」，而 JavaScript 在執行前必然存在一個解析階段來設定所有範疇。說明為什麼 JavaScript 是兩階段系統，以及函式與區塊這兩種範疇單位。'
date: 2026-06-12
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 34
chapter: 'Scope'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - Scope
  - LexicalScope
---

# 範疇（Scope）：JavaScript 的兩階段處理模型

> 本文進入課程的第二大主題：範疇與閉包（Scope & Closures）。從一個全新的角度來理解 JavaScript 引擎處理程式碼的方式。範疇是通往閉包、閉包是通往模組模式的必經之路。

## 範疇是什麼

**範疇（Scope）就是「我們去哪裡找東西」。**

更具體地說，找的東西是**識別字（identifiers）**，也就是變數。在任何程式中，變數只有兩種存在方式：

- **接收賦值**：某個值被放進這個變數
- **取出值**：從這個變數取得目前持有的值

就這兩種，沒有其他可能。JavaScript 引擎在處理程式碼時，看到每一個識別字，就在問兩個問題：「這個識別字處於哪個位置（接收賦值還是取值）？」以及「它屬於哪個範疇？」

## 彩色彈珠與彩色桶子的比喻

理解範疇處理過程最好的方式，是想像一個分類遊戲：

- **彈珠（marbles）** = 程式中的每一個識別字
- **桶子（buckets）** = 各個範疇

JavaScript 引擎在處理程式碼時，會把每一個彈珠放進對應顏色的桶子。識別字屬於哪個範疇，就放進哪個桶子。這個「分類」的過程不是在執行期即興決定的，而是在程式執行之前就完成的。

## JavaScript 是兩階段系統，不是逐行執行

這是最多人對 JavaScript 有錯誤心智模型的地方。

很多人認為 JavaScript 是從第一行開始，一行一行往下執行。但有一個簡單的反例可以證明這不正確：

> 如果你在第 10 行有語法錯誤，但第 1 到 9 行一行都沒有執行，JavaScript 怎麼可能知道第 10 行有問題？

**答案是：JavaScript 在執行之前，必然存在一個處理（解析）階段。**

這讓 JavaScript 更接近「編譯型語言」的行為，而非純粹的「解釋型語言」。用編譯理論的語言來說，它至少經歷了以下幾個步驟：

1. **語彙分析（Lexing）與分詞（Tokenization）**
2. **解析（Parsing）**：將 token 流轉換為抽象語法樹（AST）
3. **程式碼生成（Code Generation）**：產生可執行的中間表示

JavaScript 引擎先走過這些步驟，建立所有範疇的計畫（哪些識別字屬於哪些範疇），再將這個計畫交給執行階段去執行。

## 範疇的兩種單位

在 JavaScript 中，桶子（範疇）有兩種形式：

- **函式（function）**：最基本、歷史最久的範疇單位
- **區塊（block）**：ES6 引入，用 `{}` 包起來的程式碼塊

這兩種構造都會創建新的範疇桶子，識別字在解析階段就被分配到對應的桶子裡。

## 小結

範疇就是「找識別字的地方」。JavaScript 不是簡單的單次逐行執行，而是先進行解析（編譯）階段設定好所有範疇，再進入執行階段。如果把這個兩階段模型搞錯，就會對變數的查找行為產生錯誤預期，進而製造難以追蹤的 bug。把識別字想成彈珠、把範疇想成桶子，是建立正確心智模型的第一步。

## 複習

### JavaScript 中範疇（Scope）的基本定義是什麼？

範疇是「我們去哪裡找東西」，具體來說是我們尋找識別字（變數）的地方，而識別字要嘛是接收賦值，要嘛是取出值。

### JavaScript 中主要的兩種範疇單位是什麼？

函式（function）和區塊（block）；區塊是在 ES6 中引入的。

### JavaScript 處理程式碼的方式與一般認知有何不同？

JavaScript 是一種編譯（或解析）型語言，採用兩階段系統：程式碼先被處理並設定好所有範疇，之後才進入執行階段，而非逐行執行。

### 變數在程式中的主要角色是什麼？

變數要嘛是接收某個值的賦值，要嘛是從變數中取出值，沒有其他存在方式。

### 用什麼比喻來描述 JavaScript 處理範疇的方式？

將彩色彈珠分類到對應顏色的桶子中，其中識別字是彈珠，而範疇是桶子。

## 小測驗

<details>
<summary>JavaScript 中範疇（Scope）的基本定義是什麼？</summary>
我們尋找東西的地方
</details>

<details>
<summary>根據課程討論，變數在程式中如何存在？</summary>
要嘛接收賦值，要嘛取出值
</details>

<details>
<summary>JavaScript 中主要的範疇單位是什麼？</summary>
函式和區塊
</details>

<details>
<summary>JavaScript 在執行前如何處理程式碼？</summary>
兩階段的編譯/解析系統
</details>

<details>
<summary>用什麼比喻來描述 JavaScript 處理變數的方式？</summary>
將彩色彈珠分類到對應的桶子中
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記