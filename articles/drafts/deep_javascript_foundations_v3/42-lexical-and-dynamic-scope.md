---
title: '詞彙範疇：正式定義與動態範疇的對比'
description: '給詞彙範疇（Lexical Scope）一個正式定義：由編譯期決定、作者時間固定、執行期不受影響的範疇模型。並透過對比動態範疇（以 Bash Script 為例）來加深理解兩者的本質差異。'
date: 2026-06-16
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 42
chapter: 'Advanced Scope'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - Scope
  - LexicalScope
---

# 詞彙範疇：正式定義與動態範疇的對比

> 本文是範疇章節的概念收尾。前幾篇用彈珠與桶子的比喻、編譯與執行的兩階段對話，完整走過了 JavaScript 處理範疇的實際過程。這篇要給這一切一個正式的名稱，並透過對比釐清它的定義。

## 詞彙範疇（Lexical Scope）的正式定義

我們一直在討論的這套機制，正式名稱是**詞彙範疇（lexical scope）**。

「詞彙（lexical）」這個字與解析過程的第一個階段，詞彙分析（lexical analysis）共享同一個詞根。這不是巧合：詞彙範疇的核心意涵正是「範疇在解析（編譯）階段就被決定」。

更具體地說，詞彙範疇意味著：

- **作者時間決策（author-time decision）**：你在寫程式碼的那一刻，就決定了每個識別字屬於哪個範疇。把函式寫在這裡、把變數放在那裡，這些位置決定了彈珠的顏色。
- **編譯期確定，執行期不變**：範疇的歸屬在程式執行前就已固定，執行期發生的任何事情都不會改變它。
- **可預測性**：因為範疇是固定的，任何讀程式碼的人都能靜態地推斷出每個識別字屬於哪個範疇。

幾乎所有你曾使用過的程式語言都是詞彙範疇，JavaScript 絕對也是，這一點毫無疑問。

## 動態範疇（Dynamic Scope）：另一種模型

範疇模型不只有一種。存在另一種稱為**動態範疇（dynamic scope）**的模型，雖然不常見，但有助於透過對比來加深對詞彙範疇的理解。

最具代表性的動態範疇語言是 **Bash Script**。

動態範疇的含義是：範疇的歸屬不在編譯期決定，而是在執行期根據程式的動態條件決定。這與 Bash 作為解釋型語言（不經歷編譯階段）的特性相符：沒有編譯期，自然也就沒有編譯期的範疇決定。

## 小結

詞彙範疇就是「由作者時間的程式碼結構決定、在編譯期固定、執行期不受影響的範疇模型」。它的可預測性是 JavaScript 引擎能夠高效最佳化程式碼的基礎，也是開發者能夠靜態理解程式碼行為的前提。理解這個定義，以及它與動態範疇的本質差異，是掌握 JavaScript 所有範疇相關行為的起點。

## 複習

### 什麼是詞彙範疇（lexical scope）？

一種範疇模型，其中範疇彼此巢狀嵌套，由編譯器在編譯期根據程式碼的撰寫方式決定，不受執行期條件的影響。

### 詞彙範疇中的「詞彙（lexical）」一詞與什麼有關？

它與解析的第一個階段（詞彙分析）共享相同的詞根，表示範疇是在編譯過程中決定的。

### 詞彙範疇的主要特性是什麼？

它在作者時間就已固定，具有可預測性，不受執行期條件或程式執行的影響。

### 哪個語言是使用動態範疇的代表例子？

Bash Script 是動態範疇語言中最具代表性的例子。

### 動態範疇與詞彙範疇有什麼不同？

動態範疇允許執行期條件影響範疇的歸屬，而詞彙範疇是在編譯期決定範疇的。

## 小測驗

<details>
<summary>詞彙範疇的關鍵特性是什麼？</summary>
在編譯期決定，且在作者時間就已固定
</details>

<details>
<summary>哪個程式語言被提及為動態範疇的代表例子？</summary>
Bash Script
</details>

<details>
<summary>詞彙範疇中的「詞彙」一詞與什麼有關？</summary>
解析的第一個階段
</details>

<details>
<summary>詞彙範疇中的範疇是如何組織的？</summary>
彼此巢狀嵌套
</details>

<details>
<summary>詞彙範疇與動態範疇的關鍵差異是什麼？</summary>
執行期條件的影響程度
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記