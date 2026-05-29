---
title: '詞彙範疇的邊界案例：遮蔽缺失與自動全域變數'
description: '介紹詞彙範疇的兩個邊界案例：沒有宣告遮蔽時，賦值會沿範疇鏈往上修改外層變數；對完全未宣告的變數賦值時，非嚴格模式下會自動建立全域變數。說明為什麼後者幾乎永遠是 bug。'
date: 2026-06-13
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 37
chapter: 'Scope'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - Scope
  - LexicalScope
---

# 詞彙範疇的邊界案例：遮蔽缺失與自動全域變數

> 本文延續執行階段的討論。[[36-executing-code|上一篇]]走過了所有查找都成功的「順利路徑」，這篇要看兩個更微妙的情況：當內層範疇沒有宣告變數時會發生什麼，以及查找失敗時 JavaScript 的預設行為。

## 示範程式碼

```javascript
var teacher = "Kyle";

function otherClass() {
    teacher = "Suzy";       // 注意：沒有 var
    topic = "React";        // 注意：沒有 var，也不在任何範疇中宣告
    console.log("Welcome!");
}

otherClass();
console.log(teacher);   // Suzy
console.log(topic);     // React
```

## 編譯階段：`otherClass` 內部沒有任何宣告

走過編譯階段，全域範疇會建立兩顆紅色彈珠：`teacher` 和 `otherClass`。

進入 `otherClass` 的藍色桶子時，整個函式內部沒有任何 `var`、`let`、`const` 宣告。藍色桶子完全是空的，沒有任何藍色彈珠。這個細節在執行期會產生重要影響。

## 執行階段：沒有遮蔽 (shadowing) 時，賦值找到外層彈珠

**第 4 行：`teacher = "Suzy"`（目標位置）**

引擎：「藍色桶子，目標參考，`teacher`，你認識嗎？」 範疇管理器：「不認識，藍色桶子裡沒有這顆彈珠。」

往外一層：

引擎：「全域範疇，目標參考，`teacher`，你認識嗎？」 範疇管理器：「認識，給你紅色彈珠。」

引擎拿到的是**紅色彈珠**，不是藍色彈珠。`"Suzy"` 被賦值到全域的 `teacher`，覆蓋了原本的 `"Kyle"`。

這與宣告了 `var teacher` 的版本不同，那個版本在函式內部建立了獨立的藍色彈珠，形成遮蔽（shadowing）。**沒有宣告就沒有遮蔽**，賦值會沿著範疇鏈往上找，直到找到已宣告的識別字。

## 執行階段：完全未宣告的變數與自動全域

**第 5 行：`topic = "React"`（目標位置）**

引擎：「藍色桶子，目標參考，`topic`，你認識嗎？」 範疇管理器：「不認識。」

往外一層：

引擎：「全域範疇，目標參考，`topic`，你認識嗎？」 範疇管理器：「不認識。」

這裡是關鍵分歧點。理性上，我們期望的答案是「不認識，拋出錯誤」。但在**非嚴格模式（non-strict mode/sloppy mode）**下，JavaScript 的歷史行為是：

> 全域範疇在執行期動態創建一個新的全域變數 `topic`，並把紅色彈珠交給引擎。

```javascript
// 執行後，全域範疇多了一個沒有被宣告的變數
console.log(topic);   // "React"
```

這就是**自動全域（auto global）**，在執行期動態創建於全域範疇，不是編譯期的正式宣告。Kyle Simpson 認為這是 JavaScript 早期為了「盡量寬容」而做出的糟糕設計，至今成為許多難以追蹤的 bug 來源。

## 嚴格模式：關閉自動全域，得到 ReferenceError

在程式頂端加上 `"use strict"` 後，行為會改變：

```javascript
"use strict";

function otherClass() {
    topic = "React";   // ReferenceError: topic is not defined
}
```

在嚴格模式下，當查找抵達全域範疇仍找不到識別字時，不再默默創建變數，而是直接拋出 **ReferenceError**。

這裡有個值得釐清的術語區別：

- **ReferenceError**：找不到這個變數，無法給你使用
- **TypeError**：找到了變數，但它持有的值不允許你做你想做的事（例如對 `null` 存取屬性、對非函式的值使用呼叫語法）

兩種錯誤的根本原因不同，看到錯誤訊息時要能區分。

### 關於嚴格模式的幾個補充

**嚴格模式不是預設開啟的。** JavaScript 維持向後相容，不能讓 20 年前寫的程式突然壞掉，所以必須主動加上 `"use strict"` 才會啟用。

**但有些環境預設就是嚴格模式。** ES6 的 `class` 語法和 ES6 模組（`import`/`export`）內部，不需要手動宣告，預設就在嚴格模式下執行。如果你使用 Babel 等轉譯工具，輸出的程式碼通常也會自動加上嚴格模式。

**嚴格模式是語言的未來方向。** 愈來愈多新特性只在嚴格模式下以正確的方式運作，Kyle Simpson 建議直接採用——它已經存在將近十年，現在切換過去是值得的。

**嚴格模式除了自動全域之外還有其他影響。** 例如在 ES5 時代，對唯讀屬性賦值在非嚴格模式下會靜默失敗（什麼都不發生）；開啟嚴格模式後就會拋出錯誤。把原本靜默吞掉的問題變成可見的錯誤，是嚴格模式整體設計的核心精神。

## 核心結論

這個練習揭示了兩個關鍵行為：

**賦值給未遮蔽的外層變數**：當函式內部沒有宣告同名變數時，賦值會沿著範疇鏈往上找，修改到外層（甚至全域）的變數。這不一定是 bug，但需要清楚意識到這件事。

**賦值給完全未宣告的變數**：在非嚴格模式下，自動創建全域變數。這幾乎永遠是 bug。解法是永遠明確宣告你需要使用的變數，並打開嚴格模式。

**實踐建議：** 永遠在適當的範疇中使用 `var`、`let`、`const` 明確宣告變數，並啟用嚴格模式。

## 複習

### 在非嚴格模式的 JavaScript 中，對未宣告的變數賦值時，會發生什麼？

會在全域範疇自動創建一個全域變數，這可能導致非預期的行為，被視為不良實踐。

### JavaScript 中自動全域（auto global）的問題是什麼？

當對未宣告的變數賦值時，會自動創建全域變數，可能造成非預期的副作用，並使程式碼更難除錯。

### 嚴格模式如何改變未宣告變數的賦值行為？

在嚴格模式下，嘗試對未宣告的變數賦值會拋出錯誤，而不是創建自動全域變數。

### 當一個變數在全域範疇被重新賦值時，會發生什麼？

原本的值會被覆蓋，變數指向新的值，不會創建獨立的新變數。

### JavaScript 中變數宣告的建議做法是什麼？

始終在適當的範疇中使用 `var`、`let` 或 `const` 明確宣告變數，避免創建自動全域變數。

## 小測驗

<details>
<summary>在非嚴格模式的 JavaScript 中，對未宣告的變數賦值時，會發生什麼？</summary>
創建一個自動全域變數
</details>

<details>
<summary>在全域範疇查找變數時，使用的是哪種參考類型？</summary>
來源參考（Source reference）
</details>

<details>
<summary>在嚴格模式下執行 JavaScript 時，哪個行為會改變？</summary>
防止自動全域變數的創建
</details>

<details>
<summary>當 JavaScript 中的變數被賦予新值時，會發生什麼？</summary>
覆蓋現有變數的值
</details>

<details>
<summary>在非嚴格模式下，全域範疇查找到未宣告的變數時，會如何回應？</summary>
創建並回傳一個新的全域變數
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記