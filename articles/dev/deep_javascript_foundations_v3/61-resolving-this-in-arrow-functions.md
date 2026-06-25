---
title: '箭頭函式的詞彙 `this`：物件不是 Scope，以及何時該用箭頭函式'
description: '說明物件字面值的大括號不是範疇，因此物件內的箭頭函式會直接向上查找到全域範疇。整理箭頭函式唯一值得使用的場景（需要詞彙 this 時）、var self = this 的命名問題，以及箭頭函式不是第五條 this 規則的收尾論點。'
date: 2026-06-25
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 61
chapter: 'Objects'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - ThisKeyword
  - ArrowFunction
---

# 箭頭函式的詞彙 `this`：物件不是 Scope，以及何時該用箭頭函式

> 本篇直接延續[[60-arrow-function-and-lexical-this|上一篇]]對箭頭函式與詞彙 `this` 的討論。上一篇確立了核心原則：箭頭函式不定義 `this`，因此 `this` 會像普通變數一樣沿詞彙範疇向上查找。本篇深入一個常見陷阱，並釐清箭頭函式真正適合使用的場景。

## 物件不是範疇

在討論詞彙 `this` 的查找時，有一個非常容易犯的錯誤：**把物件字面值的大括號當成範疇邊界**。

```javascript
var workshop = {
  teacher: "Kyle",
  ask: (question) => {
    console.log(this.teacher, question);
  },
};

workshop.ask("What happened to 'this'?");
// undefined What happened to 'this'?

workshop.ask.call(workshop, "Still no 'this'?");
// undefined Still no 'this'?
```

這裡把 `ask` 定義成箭頭函式。直覺上會以為它的詞彙 `this` 應該指向 `workshop` 物件，但實際上兩次呼叫都印出 `undefined`，即使第二次用 `.call(workshop, ...)` 明確傳入上下文也沒有效果。

原因是：**物件字面值的大括號不是範疇**。`workshop` 是一個物件值，不是一個函式，它不產生任何範疇。這個程式只有兩個範疇：`ask` 箭頭函式本身的範疇，以及全域範疇。

箭頭函式沒有 `this`，向上查找時直接跳過 `workshop` 物件（因為它不是範疇），來到全域範疇。全域物件上沒有 `teacher` 屬性，因此是 `undefined`。

物件的屬性（如 `teacher`）也不參與詞彙範疇。它們是物件值上的成員，與識別字查找完全無關。

## `var self = this`：一個命名很糟的 hack

在箭頭函式出現之前，開發者常用一個變通方式解決 callback 中 `this` 遺失的問題：

```javascript
var self = this;
setTimeout(function() {
  console.log(self.teacher);
}, 100);
```

Kyle Simpson 指出，`self` 這個名字是個糟糕的選擇，因為 `this` 從來就不指向函式本身，它指向的是一個**上下文（context）**。如果真的需要用這個手法，應該命名為 `var context = this`，才能正確傳達它的語意。

但無論如何，箭頭函式的詞彙 `this` 是比這個 hack 更好的解法，因為它直接表達了「我想要使用外層範疇的 `this`」這個意圖，不需要靠額外的變數來橋接。

## 箭頭函式唯一值得使用的場景

Kyle Simpson 對箭頭函式的立場在前幾篇已提到：一般情況下不建議使用，因為它是匿名函式，帶來可讀性與除錯上的代價。但他提出了唯一的例外：

> **當你需要詞彙 `this` 行為時，使用箭頭函式。**

這是箭頭函式被設計來解決的問題，也是它真正發揮優勢的場景。相比 `.bind()` 硬綁定或 `var context = this` hack，箭頭函式的詞彙 `this` 更直接、更符合意圖。

## 使用箭頭函式時應對匿名的三個代價

即使在使用詞彙 `this` 的場景中選用了箭頭函式，匿名函式的三個固有代價仍然存在，需要主動應對：

**1. 無法自我參考**

箭頭函式沒有識別字可以指向自身，若需要遞迴或解除事件監聽，會遇到困難。使用前應確認這個場景不需要自我參考。

**2. 名稱推斷**

把箭頭函式賦值給變數或物件屬性，可以讓引擎推斷出函式名稱，使 stack trace 更易讀。盡量讓箭頭函式透過賦值取得名稱，而非在呼叫時以匿名 inline 方式出現。

**3. 用途應清楚可見**

不要讓讀者需要閱讀函式本體才能理解它的用途。透過命名或所在脈絡，讓函式的目的一目了然。

## 箭頭函式不是第五條 `this` 規則

Kyle Simpson 最後強調了一個重要的收尾觀點：箭頭函式並沒有為 `this` 系統增加新的規則。`this` 的四條規則依然完整且足夠。

箭頭函式只是讓 `this` 的規則**不適用**於它，而非引入新規則。要理解一段程式中 `this` 的行為，永遠只需要做一件事：找到定義了 `this` 的那個函式的呼叫點，再套用四條規則判斷。

## 複習

### 物件字面值中的箭頭函式，其詞彙範疇是哪裡？

全域範疇。即使物件使用了大括號，物件並不是範疇，因此箭頭函式會跳過物件，將 this 解析到全域範疇。

### 箭頭函式最主要的推薦使用場景是什麼？

需要詞彙 `this` 行為時，讓函式直接採用外層範疇的 `this` 上下文，避免使用 `var self = this` 這類變通手法。

### 箭頭函式處理 `this` 的方式與一般函式有何不同？

箭頭函式沒有自己的 `this` 上下文，而是詞彙性地採用外層父範疇的 `this`，可以避免複雜的綁定機制。

### 使用箭頭函式取得詞彙 `this` 時，還需要注意哪些事項？

①透過賦值給變數或屬性讓函式取得名稱推斷；②確保函式的用途不需要閱讀本體就能理解；③注意缺乏自我參考帶來的遞迴或解除綁定限制。

### 使用匿名箭頭函式有哪些潛在缺點？

①沒有自我參考，無法用於遞迴或解除事件監聽；②在 stack trace 中缺乏清楚的名稱；③若沒有額外脈絡，讀者可能無法立即理解函式的用途。

## 小測驗

<details>
<summary>箭頭函式如何解析 `this` 關鍵字？</summary>
詞彙性地繼承外層父範疇的 `this`
</details>

<details>
<summary>箭頭函式最理想的使用時機是什麼時候？</summary>
需要詞彙 `this` 行為時
</details>

<details>
<summary>使用 `var self = this` 作為範疇管理技巧有什麼問題？</summary>
`this` 指向的是上下文，而非函式本身，self 這個命名具有誤導性
</details>

<details>
<summary>物件屬性是否屬於詞彙範疇的一部分？</summary>
不是，物件屬性完全不參與詞彙範疇
</details>

<details>
<summary>使用箭頭函式取得詞彙 `this` 時，應該設法解決哪些問題？</summary>
缺乏命名、遞迴困難，以及用途不夠清晰等匿名函式的固有代價
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記