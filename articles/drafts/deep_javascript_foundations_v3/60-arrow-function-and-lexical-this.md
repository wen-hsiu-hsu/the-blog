---
title: '箭頭函式與詞彙 `this`：沒有自己的 `this` 的函式'
description: '釐清箭頭函式的 this 行為：它不是「硬綁定到父層 this」，而是根本不定義 this，讓 this 像普通變數一樣沿詞彙範疇向上查找。說明為什麼這兩種理解方式在 new 關鍵字的角落案例上會產生根本差異。'
date: 2026-06-25
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 60
chapter: 'Objects'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - ThisKeyword
  - ArrowFunction
---

# 箭頭函式與詞彙 `this`：沒有自己的 `this` 的函式

> 本篇延續前幾篇對 `this` 四種綁定規則的討論。在釐清了隱式綁定、明確綁定、`new` 綁定與預設綁定之後，本篇回頭檢視箭頭函式在 `this` 系統中的特殊地位。

## 常見誤解：箭頭函式是「硬綁定到父層 `this`」

許多開發者對箭頭函式有一個廣泛流傳但不正確的心智模型：

> 「箭頭函式會把 `this` 硬綁定到外層函式的 `this`。」

Kyle Simpson 明確指出，這個說法是錯的，規格書也不是這樣描述的。

### 正確理解：箭頭函式根本不定義 `this`

根據 ECMAScript 規格書的明確說明：

> **箭頭函式不為 `arguments`、`super`、`this`、`new.target` 定義本地綁定。**

這句話的意思是：箭頭函式內部根本沒有 `this` 這個綁定。當你在箭頭函式裡寫 `this`，它的行為與任何其他一般變數完全相同，也就是沿著詞彙範疇向上查找，直到找到一個有定義 `this` 的函式，並使用那個函式的 `this`。

這就是「詞彙 `this`（lexical this）」的含義。

```javascript
var workshop = {
  teacher: "Kyle",
  ask(question) {
    setTimeout(() => {
      console.log(this.teacher, question);
    }, 100);
  },
};

workshop.ask("Is this lexical 'this'?");
// Kyle Is this lexical 'this'?
```

箭頭函式（第 4 行）內部沒有 `this`。當它嘗試解析 `this` 時，行為如同查找一個普通變數：往外一層找到 `ask` 函式的範疇。`ask` 函式是有定義 `this` 的普通函式，而它的 `this` 由呼叫點（第 10 行的 `workshop.ask(...)`）決定，指向 `workshop`。因此箭頭函式最終使用的 `this` 就是 `workshop`。

若有多層巢狀箭頭函式，查找過程會持續向上，直到找到某個定義了 `this` 的普通函式為止。

## 「不定義 `this`」與「硬綁定」的實質差異

這兩種說法在大多數情況下行為相似，但在一個角落案例上會產生根本差異：**`new` 關鍵字的優先順序**。

前面討論過，`new` 的優先順序高於明確綁定（`.bind()`）。也就是說，即使一個函式被硬綁定了，用 `new` 呼叫它仍可以覆蓋 `this`。

若箭頭函式真的是「硬綁定函式」，那理論上也應該能用 `new` 來覆蓋它的 `this`。但實際情況是：

```javascript
const fn = () => {};
new fn(); // TypeError: fn is not a constructor
```

對箭頭函式使用 `new` 會直接拋出例外，不允許呼叫。這證明了箭頭函式不是硬綁定函式，它只是一個根本沒有 `this` 的函式。

## 思考方式的重要性

Kyle Simpson 在此特別強調：用錯誤的心智模型理解程式碼，即使當下僥倖運作，也會在日後系統性地製造更多 bug。

「硬綁定」與「不定義 `this`」這兩種說法在行為上的差異雖然在日常開發中很少遇到，但一旦遇到就會造成完全不同的結果。思考方式與規格書一致，是避免這類問題的根本解法。

## 複習

### 箭頭函式的 `this` 行為的關鍵特性是什麼？

箭頭函式完全不定義 `this` 關鍵字。它會像查找普通變數一樣，沿著詞彙範疇向上查找，直到找到一個有定義 `this` 的函式，並使用那個函式的 `this` 綁定。

### 根據 JavaScript 規格書，箭頭函式不定義哪些本地綁定？

箭頭函式不為 `arguments`、`super`、`this` 及 `new.target` 定義本地綁定。

### 若對箭頭函式使用 `new`，會發生什麼事？

會拋出例外，這也證明了箭頭函式並非硬綁定函式。

### 箭頭函式如何處理函式本體內的 `this` 關鍵字？

箭頭函式把 `this` 視為一般變數，會沿著詞彙範疇向上查找，解析到外層某個有定義 `this` 的範疇。

### 在箭頭函式的脈絡下，「詞彙 `this`」是什麼意思？

詞彙 `this` 意指箭頭函式沒有自己的 `this` 綁定，而是使用其所在詞彙範疇中的 `this`，必要時會跨越多層巢狀範疇向上查找。

## 小測驗

<details>
<summary>箭頭函式的 `this` 行為的關鍵特性是什麼？</summary>
它根本不定義 `this` 關鍵字
</details>

<details>
<summary>箭頭函式中使用 `this` 時，如何解析它的值？</summary>
沿詞彙範疇向上查找，直到找到一個定義了 `this` 的外層範疇
</details>

<details>
<summary>根據規格書，箭頭函式不定義哪些本地綁定？</summary>
arguments、super、this 和 new.target
</details>

<details>
<summary>若對箭頭函式使用 `new`，會發生什麼事？</summary>
拋出例外
</details>

<details>
<summary>箭頭函式的詞彙 `this` 解析如何進行？</summary>
持續向上查找各層範疇，直到找到一個有定義 `this` 的函式
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記