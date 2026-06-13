---
title: '執行階段：變數查找與目標/來源位置'
description: '介紹 JavaScript 執行階段的識別字查找機制：變數的目標（接收賦值）與來源（提供值）兩種角色，執行期如何沿著詞彙範疇鏈向外查找，以及找不到或對非函式呼叫時會發生什麼。'
date: 2026-06-13
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 36
chapter: 'Scope'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - Scope
  - LexicalScope
---

# 執行階段：變數查找與目標/來源位置

> 本文延續[[35-compilation-and-scope|上一篇]]對編譯階段的介紹。彈珠與桶子的計畫已經在編譯期完成，這篇要進入第二階段：執行期，看 JavaScript 引擎如何在已建立的範疇計畫中查找識別字。

## 變數的兩種角色：目標與來源

每個識別字在程式中只扮演兩種角色之一：

- **目標（Target）**：接收賦值的一側，俗稱 LHS（Left-Hand Side）
- **來源（Source）**：提供值的一側，俗稱 RHS（Right-Hand Side）

```javascript
var teacher = "Kyle";   // teacher 是目標（接收 "Kyle"）

console.log(question);  // question 是來源（提供它持有的值）
```

這不只是語義區分，編譯器在建立抽象語法樹時，就記錄了每個識別字的角色，執行期的行為會因角色不同而有所差異。

參數（parameter）也是目標位置，因為它接收傳入的引數；而在呼叫端作為引數傳入的變數，則是來源位置。

## 執行階段的對話模型

執行階段的對話對象變了：編譯器退場，換成**虛擬機（JavaScript 引擎）** 與 **範疇管理器**對話。

不同的是，執行期已經沒有任何 `var` 宣告——那些都在編譯期處理完了。執行期只剩下兩件事：查找識別字，以及對它做些什麼（賦值或取值）。

## 執行期逐行解讀

使用上一篇的程式碼繼續：

```javascript
var teacher = "Kyle";           // 第 1 行
function otherClass() {          // 第 3 行
    var teacher = "Suzy";       // 第 4 行
    console.log("Welcome!");    // 第 5 行
}
function ask() {                 // 第 8 行
    var question = "Why?";      // 第 9 行
    console.log(question);      // 第 10 行
}
otherClass();                    // 第 13 行
ask();                           // 第 14 行
```

### 第 1 行：`teacher = "Kyle"`

`teacher` 是目標位置。

引擎：「全域範疇，目標參考，識別字 `teacher`，你認識嗎？」 範疇管理器：「認識，給你紅色彈珠。」 引擎將 `"Kyle"` 賦值進那個記憶體位置。

### 第 13 行：`otherClass()`

`otherClass` 是來源位置——需要取出它的值（函式參考）才能執行。

引擎：「全域範疇，來源參考，識別字 `otherClass`，你認識嗎？」 範疇管理器：「認識，給你紅色彈珠。」 引擎取出值（函式），執行它。

> 若取出的值不是函式（例如 `null` 或 `undefined`），嘗試執行會拋出 **TypeError**——這是執行期錯誤，表示對某個型別做了不允許的操作。

### 進入 `otherClass`，第 4 行：`teacher = "Suzy"`

引擎：「藍色桶子，目標參考，`teacher`，你認識嗎？」 範疇管理器：「認識，給你藍色彈珠。」 引擎將 `"Suzy"` 賦值進藍色彈珠的記憶體位置——與全域的紅色 `teacher` 完全不同的位置，兩者互不干擾。

### 第 5 行：`console.log("Welcome!")`

引擎在 `otherClass` 範疇查找 `console`：「藍色桶子，來源參考，`console`，你認識嗎？」 範疇管理器：「不認識。」

找不到，往外一層：

引擎：「全域範疇，來源參考，`console`，你認識嗎？」 範疇管理器：「認識，它是自動全域（auto global），給你紅色彈珠。」 引擎取得 `console` 物件，呼叫 `log` 方法。

### 第 14 行：`ask()`

流程與第 13 行完全相同：`ask` 是來源位置，引擎向全域範疇查找，取得函式參考，執行它。

### 進入 `ask`，第 9 行：`question = "Why?"`

引擎：「綠色桶子，目標參考，`question`，你認識嗎？」 範疇管理器：「認識，給你綠色彈珠。」 引擎將 `"Why?"` 賦值進去。

### 第 10 行：`console.log(question)`

先查找 `console`：綠色桶子沒有，向上查到全域找到自動全域。

再查找 `question` 作為引數（來源位置）：

引擎：「綠色桶子，來源參考，`question`，你認識嗎？」 範疇管理器：「認識，給你綠色彈珠。」 引擎取出值 `"Why?"`，作為引數傳入 `console.log`。

`console.log` 的參數接收這個值——參數是目標位置，引數是來源位置。

## Scope 查找的核心機制

無論識別字是目標還是來源，執行期的第一步都是**查找（lookup）**：

1. 先在當前 Scope 查找
2. 找不到則往外一層 Scope 繼續查找
3. 直到找到，或抵達全域 Scope

這個向外查找的過程，就是詞彙範疇（lexical scope）的運作方式。範疇的嵌套結構在編譯期就已確定，執行期只是沿著這條路線查找。

## 小結

JavaScript 程式的完整執行分為兩個階段：編譯期建立所有範疇計畫（桶子與彈珠），執行期根據計畫查找並操作識別字。每個識別字不是在目標位置（接收賦值）就是在來源位置（提供值），兩者都需要先向範疇管理器查找才能操作。找不到時沿著詞彙範疇鏈往外查，直到全域範疇。若對非函式的值使用呼叫語法，會在執行期拋出 TypeError。這個兩階段的心智模型，是正確理解 JavaScript 範疇行為的基礎。

## 複習

### 變數在 JavaScript 中可以扮演哪兩種角色？

變數可以是賦值的目標（接收值），或是來源位置（提供它的值）。

### 描述變數在賦值中位置的舊式術語是什麼？

LHS（Left Hand Side，左側）代表賦值的目標，RHS（Right Hand Side，右側）代表值的來源。

### 當 JavaScript 引擎遇到變數參考時，會發生什麼？

引擎在當前範疇執行查找，若找不到則往外一層範疇繼續查找，直到找到該變數或抵達全域範疇為止。

### 如果試圖執行一個不是函式的值，會發生什麼？

會拋出 TypeError，因為程式無法將非函式的值作為函式執行。

### JavaScript 如何處理對 console 等全域物件的參考？

console 等全域物件被視為「自動全域（auto global）」，無需明確宣告就已自動存在於全域範疇中。

## 小測驗

<details>
<summary>變數在 JavaScript 中可以扮演哪兩種角色？</summary>
賦值的目標，以及值的來源
</details>

<details>
<summary>LHS 和 RHS 在 JavaScript 中原本代表什麼？</summary>
左側（Left-hand side）和右側（Right-hand side）
</details>

<details>
<summary>試圖執行一個不是函式的變數時，會發生什麼？</summary>
拋出 TypeError
</details>

<details>
<summary>當在當前範疇找不到變數時，JavaScript 會怎麼做？</summary>
往父層/外層範疇繼續查找
</details>

<details>
<summary>在 JavaScript 中參考變數時，主要的過程是什麼？</summary>
執行查找過程
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記