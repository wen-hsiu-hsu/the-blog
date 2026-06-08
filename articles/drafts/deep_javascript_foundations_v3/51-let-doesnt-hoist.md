---
title: '`let` 不提升？這個說法是錯的'
description: '破解「let 不提升」的常見說法：let 與 const 確實提升，但不像 var 那樣在進入範疇時自動初始化為 undefined，而是保持未初始化狀態直到宣告那一行。說明 TDZ 的由來，以及函式表達式為什麼不像函式宣告那樣提升。'
date: 2026-06-20
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 51
chapter: 'Advanced Scope'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - Hoisting
  - TDZ
---

# `let` 不提升？這個說法是錯的

> 本文延續[[50-hosting|上一篇]]對提升（hoisting）的討論。上一篇澄清了提升不是程式碼移動，而是兩階段處理的結果，這篇要破解另一個廣為流傳的說法：「`let` 不提升」。

## 提升的兩種類型：好的與壞的

在進入 `let` 的討論之前，先用兩個例子整理 `var` 的提升行為評價：

```javascript
// var 提升：通常是壞的
teacher = "Kyle";
var teacher;        // 先賦值後宣告，不好的寫法，但不會報錯
```

```javascript
// 函式宣告提升：通常很有用
getTeacher();       // Kyle（正常執行）

function getTeacher() {
    return teacher;
}
```

`var` 的提升讓你可以在宣告前賦值，這幾乎永遠是不好的設計。但函式宣告的提升讓你可以把執行程式碼放在頂部、函式宣告放在底部，Kyle Simpson 認為這是有用的特性。

## 「let 不提升」是錯的，規格書說得很清楚

```javascript
// 情境一
{
    teacher = "Kyle";   // TDZ error！
    let teacher;
}

// 情境二
var teacher = "Kyle";

{
    console.log(teacher);   // TDZ error！（不是印出 "Kyle"）
    let teacher = "Suzy";
}
```

如果 `let` 真的不提升，情境二的第 4 行應該往外層查找，找到第 1 行的 `"Kyle"` 並印出來。但它拋出了 TDZ error。

為什麼？因為 `let teacher` 在編譯期確實把 `teacher` 這個識別字登記在這個區塊範疇內了，只是沒有初始化它。當執行期在第 4 行查找 `teacher` 時，找到的是這個區塊內未初始化的彈珠，而非外層的紅色彈珠。

**[規格書（ECMAScript 13.3.1）](https://262.ecma-international.org/9.0/index.html#sec-let-and-const-declarations)明確說明：**

> `let` 和 `const` 宣告的變數在其所在的詞彙環境被實例化時就被建立，但在詞彙綁定被求值之前不得以任何方式存取。

「在詞彙環境被實例化時建立」正是提升的定義。

## `var` 和 `let/const` 提升的差異

兩者都提升，但初始化行為不同：

| 宣告            | 提升範圍 | 初始化時機                           |
| --------------- | -------- | ------------------------------------ |
| `var`           | 函式範疇 | 範疇開始時，自動初始化為 `undefined` |
| `let` / `const` | 區塊範疇 | 執行期到達宣告那一行時才初始化       |

`var` 在編譯期建立彈珠，且在執行期一進入範疇就把彈珠初始化為 `undefined`。`let`/`const` 在編譯期建立彈珠，但不初始化，彈珠存在，但處於「不可碰觸」的未初始化狀態，直到執行到宣告那一行才完成初始化。

## 另一個提升案例：`var` 在函式內部的變數遮蔽

```javascript
var teacher = "Kyle";

otherTeacher();   // 印出什麼？

function otherTeacher() {
    console.log(teacher);   // undefined（不是 "Kyle"）
    var teacher = "Suzy";
}
```

`otherTeacher` 函式內的 `var teacher` 在編譯期建立了一顆屬於這個函式範疇的彈珠，執行期進入函式時初始化為 `undefined`。第 6 行查找 `teacher`，找到的是函式範疇內值為 `undefined` 的彈珠，而非全域的 `"Kyle"`。這是提升配合遮蔽產生的效果。

## TDZ 的由來：其實是為了 `const`

TDZ 的設計初衷不是針對 `let`，而是為了 `const` 的語意正確性。

如果 `const` 被允許像 `var` 一樣先初始化為 `undefined`，那麼在宣告前存取它，你會先看到 `undefined`，之後才看到它的「唯一值」。這讓 `const` 在技術上擁有了兩個不同的值，違背了「常數只有一個值」的語意。

因此 TC39 設計了 TDZ 來防止在賦值前存取 `const`。既然為 `const` 做了 TDZ，也就順帶為 `let` 加上了相同的機制。

**實用建議**：只要把所有 `let`/`const` 宣告放在區塊的第一行，就永遠不會碰到 TDZ error。

## 為什麼函式表達式不提升（像函式宣告那樣）

函式表達式的賦值是執行期的操作，不是宣告。只有宣告式的程式碼可以在兩階段處理中被「提前」；可觀察的執行操作必須在它在程式碼中出現的位置才能執行，否則程式行為就無法預測。

值得注意的是，函式表達式裡的函式本身仍然在編譯期被處理（建立了範疇計畫），只是沒有在編譯期被關聯到任何識別字。每次執行到函式表達式所在的那一行，函式的範疇計畫才真正在記憶體中實例化。

## 小結

`let` 確實提升，規格書明確說明如此。它與 `var` 的差異在於：`let`/`const` 不在進入範疇時自動初始化，而是等到執行期到達宣告那一行才初始化。在此之前，變數處於 TDZ（暫時性死區），存取它會拋出錯誤。TDZ 的設計初衷是為了維護 `const` 的語意正確性，而非針對 `let`。

## 複習

### `var` 和 `let/const` 在提升行為上的關鍵差異是什麼？

`var` 提升時會立即將變數初始化為 `undefined`，而 `let/const` 雖然也提升，但只建立變數位置而不初始化，直到執行期到達宣告那一行才完成初始化。

### 什麼是暫時性死區（TDZ）錯誤？

TDZ 錯誤發生在嘗試存取一個已提升但尚未初始化的 `let` 或 `const` 變數時，即在區塊範疇中的宣告行之前存取該變數。

### `let` 和 `const` 與 `var` 在提升範疇上有什麼差異？

`let` 和 `const` 只提升到區塊範疇，而 `var` 提升到函式範疇。

### 暫時性死區（TDZ）機制最初為何被引入？

TDZ 主要是為了確保 `const` 變數只擁有一個不可變的值，防止在中間的未初始化狀態下被觀察到，從而維護 `const` 的語意正確性。

### 為什麼函式表達式不像函式宣告那樣提升？

函式表達式涉及執行期的賦值操作，這類可觀察的執行操作無法在編譯期被重新排序，不像宣告式的程式碼可以提升。

## 小測驗

<details>
<summary>`var` 和 `let/const` 在提升行為上的關鍵差異是什麼？</summary>
let 和 const 提升但不初始化，var 提升且初始化為 undefined
</details>

<details>
<summary>`let` 或 `const` 變數在提升期間處於什麼狀態？</summary>
未初始化且無法存取
</details>

<details>
<summary>暫時性死區（TDZ）錯誤主要是為什麼而存在？</summary>
為了維護 const 的不可變概念
</details>

<details>
<summary>函式表達式在編譯期會發生什麼？</summary>
它們被編譯處理，但不會被關聯到任何識別字
</details>

<details>
<summary>JavaScript 中可執行程式碼在提升方面有什麼關鍵特性？</summary>
可執行程式碼在概念上無法被重新排序
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記