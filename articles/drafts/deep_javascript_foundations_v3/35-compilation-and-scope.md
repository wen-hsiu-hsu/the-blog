---
title: '編譯階段與範疇管理：彈珠桶子對話模型'
description: '透過「編譯器與範疇管理器的對話」模型，逐步走讀一段程式碼的編譯階段處理過程：每個正式宣告如何被分配到對應範疇、遮蔽（Shadowing）是什麼，以及為什麼所有範疇與識別字的歸屬在執行前就已完全確定。'
date: 2026-06-12
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 35
chapter: 'Scope'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - Scope
  - LexicalScope
---

# 編譯階段與範疇管理：彈珠桶子對話模型

> 本文延續[[34-scope|上一篇]]對範疇基本概念的介紹。[[34-scope|上一篇]]確立了「JavaScript 是兩階段系統」的核心認知，這篇要用一段具體的程式碼，逐步走過編譯階段的實際處理過程。

## 示範程式碼

```javascript
var teacher = "Kyle";

function otherClass() {
    var teacher = "Suzy";
    console.log("Welcome!");
}

function ask() {
    var question = "Why?";
    console.log(question);
}

otherClass();   // Welcome!
ask();          // Why?
```

## 兩個角色：編譯器與範疇管理器

在編譯階段，有兩個概念實體在互動：

- **編譯器（Compiler）**：負責掃描程式碼，每遇到正式宣告（formal declaration）就發出通知
- **範疇管理器（Scope Manager）**：負責建立桶子（範疇）和彈珠（識別字），並把彈珠放進正確的桶子

## 編譯階段的逐步走讀

用三種顏色對應三層範疇：紅色 = 全域範疇、藍色 = `otherClass` 範疇、綠色 = `ask` 範疇。

**第 1 行：`var teacher`**

編譯器：「全域範疇，我遇到一個正式宣告，識別字叫 `teacher`，你認識嗎？」 範疇管理器：「不認識，給你一顆紅色彈珠。」→ 紅色彈珠放入紅色桶子。

**第 3 行：`function otherClass`**

編譯器：「全域範疇，又一個正式宣告，識別字叫 `otherClass`。」 範疇管理器：「不認識，給你一顆紅色彈珠。另外，這是一個函式，我會建立一個新的藍色桶子。」

現在步入藍色桶子（`otherClass` 的範疇）：

**第 4 行：`var teacher`（在 `otherClass` 裡）**

編譯器：「藍色桶子，我有一個識別字叫 `teacher`，你認識嗎？」 範疇管理器：「不認識（藍色桶子從來沒聽說過，紅色桶子的 `teacher` 不算），給你一顆藍色彈珠。」

> 這就是**遮蔽（Shadowing）**：兩個不同範疇中存在相同名稱的識別字。藍色的 `teacher` 遮蔽了紅色的 `teacher`，在 `otherClass` 內部無法再存取到外層的 `teacher`。這不是壞事，只是需要理解的行為。

退出藍色桶子，回到全域（紅色）範疇。

**第 8 行：`function ask`**

編譯器：「全域範疇，識別字 `ask`。」 範疇管理器：「不認識，給你一顆紅色彈珠，並建立一個新的綠色桶子。」

步入綠色桶子（`ask` 的範疇）：

**第 9 行：`var question`**

編譯器：「綠色桶子，識別字 `question`。」 範疇管理器：「不認識，給你一顆綠色彈珠。」

第 10 行的 `console.log(question)` 是一個識別字的參考，不是宣告，編譯階段不建立新彈珠，但已知道這個 `question` 是綠色彈珠。

全域範疇沒有更多宣告，編譯階段完成。

## 關鍵結論：範疇在編譯期就決定了

走完這個過程，可以得出幾個重要結論：

**所有範疇與識別字的歸屬，在編譯期就完全確定，執行期只是使用它，不再改變。** 這就是「詞彙範疇（lexical scope）」名稱的由來——範疇由你寫程式碼時的文字結構（詞彙位置）決定，不是執行時動態決定的。

這個特性讓 JavaScript 引擎能夠在執行前就完全了解識別字的顏色（所屬範疇），從而大幅提升最佳化效率。

**範疇是作者時間（author-time）的決定。** 當你把一個變數宣告放在某個函式裡，那個彈珠的顏色就已經固定了，不論之後程式怎麼執行都不會改變。

## 小結

JavaScript 的範疇處理透過「編譯器與範疇管理器的對話」在執行前完成：每遇到正式宣告就建立對應顏色的彈珠，每遇到函式就建立新的桶子。相同名稱在不同範疇出現時形成遮蔽，內層會遮蔽外層的同名識別字。所有這些決策都在編譯期完成，這是詞彙範疇系統的核心特性。

## 複習

### JavaScript 程式在編譯過程中，涉及的兩個主要角色是什麼？

編譯器（Compiler）和範疇管理器（Scope Manager）

### 當相同名稱的變數存在於不同範疇時，使用什麼術語來描述？

遮蔽（Shadowing）

### 在範疇管理的比喻中，不同顏色的彈珠和桶子分別代表什麼？

不同的範疇：全域範疇用紅色桶子表示，內層函式範疇用藍色和綠色桶子表示，而彈珠則代表變數宣告。

### JavaScript 中的詞彙範疇和識別字是在什麼時候決定的？

在編譯期決定，而非執行期。

### 為什麼 JavaScript 在編譯期就決定範疇？

讓 JavaScript 引擎能夠更有效率地最佳化程式碼的執行，因為範疇和識別字的資訊是固定且已知的。

## 小測驗

<details>
<summary>課程說明中 JavaScript 編譯過程的兩個主要角色是什麼？</summary>
編譯器（Compiler）和範疇管理器（Scope Manager）
</details>

<details>
<summary>描述不同範疇中存在相同名稱變數的術語是什麼？</summary>
遮蔽（Shadowing）
</details>

<details>
<summary>JavaScript 中的詞彙範疇和識別字是在什麼時候決定的？</summary>
在編譯期
</details>

<details>
<summary>在編譯期決定範疇的主要優點是什麼？</summary>
讓 JavaScript 引擎能夠更有效率地進行最佳化
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記