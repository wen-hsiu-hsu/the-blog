---
title: '`this` 關鍵字：由呼叫方式決定的動態上下文'
description: '介紹 this 關鍵字的核心概念：this 的值由函式的呼叫方式決定，與定義位置無關。說明 this 與動態範疇的概念對比，以及後續四種呼叫方式的學習路徑。'
date: 2026-06-23
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 56
chapter: 'Objects'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - ThisKeyword
---

# `this` 關鍵字：由呼叫方式決定的動態上下文

> 本篇進入課程的第三大主題：物件導向系統（Objects & Prototypes）。前兩個主題分別是型別與強制轉型以及範疇與閉包。這個主題涵蓋 `this` 關鍵字、`class` 語法，以及原型系統。本篇是這個主題的起點，專注於 `this` 的核心概念。

## 物件導向系統的學習路徑

在進入 `this` 之前，Kyle Simpson 先描繪了第三主題的整體結構：

1. **`this` 關鍵字** - 動態上下文機制的基礎
2. **`class` 語法** - 疊加在原型系統之上的語法糖
3. **原型系統** - `class` 底層真正運作的機制
4. **繼承 vs 委派** - 最終對比類別導向（class-oriented）與 OLOO（Objects Linked to Other Objects）模式，論證委派模式更為強大

Kyle Simpson 特意使用「objects oriented」而非「object oriented」，強調 JavaScript 本質上不是一個類別系統，`class` 語法只是後來疊加上去的選項，而非語言的內在設計。

## `this` 最常見的誤解

`this` 大概是 JavaScript 中最容易被誤用的功能。Kyle Simpson 認為，混亂的根本原因是：**開發者試圖用其他語言的 `this` 概念來理解 JavaScript 的 `this`**。

在其他語言（例如 Java）中，`this` 通常指向定義該方法的類別實例，是靜態的、由定義位置決定的。JavaScript 的 `this` 完全不同。

## `this` 的正確定義

> **`this` 代表函式被呼叫時的執行上下文（execution context），完全由函式的呼叫方式決定，與函式定義的位置無關。**

這是最關鍵的一句話。看著一個函式的定義，無法判斷 `this` 會指向什麼。唯一重要的問題是：**這個函式是怎麼被呼叫的？**

```javascript
function ask(question) {
  console.log(this.teacher, question);
}

function otherClass() {
  var myContext = { teacher: "Suzy" };
  ask.call(myContext, "Why?");
  // Suzy Why?
}

otherClass();
```

這裡用 `ask.call(myContext, ...)` 明確指定 `this` 要指向 `myContext`。同一個 `ask` 函式可以用不同的上下文物件呼叫，每次的 `this` 就會指向不同的對象。這正是 `this` 存在的理由：讓同一個函式能在不同的上下文中彈性重用。

## `this` 與動態範疇的概念對比

在討論範疇時曾提到「動態範疇（dynamic scope）」的概念，作為詞彙範疇的對比。`this` 在概念上與動態範疇非常接近：

|          | 詞彙範疇（lexical scope） | 動態範疇（dynamic scope） | `this`             |
| -------- | ------------------------- | ------------------------- | ------------------ |
| 決定時機 | 編譯期（定義位置）        | 執行期（呼叫位置）        | 執行期（呼叫方式） |
| 決定依據 | 程式碼的撰寫位置          | 函式從哪裡被呼叫          | 函式如何被呼叫     |

`this` 不是以呼叫位置（call site 的範疇）來決定，而是以**呼叫的方式**來決定，這是它與動態範疇的細微差異，也是理解 `this` 四種規則的基礎。

## 「哪棟樓」的比喻

Kyle Simpson 用一個比喻來說明 `this` 的查找邏輯：

詞彙範疇就像在一棟樓裡，從目前所在的樓層往上找，直到找到目標。`this` 的概念類似，也是在一棟樓裡查找，但**關鍵問題不是從哪層開始找，而是「這是哪棟樓？」**

如果有人說「來 317 室找我」，你的第一個問題一定是「哪棟樓？」。`this` 的四種呼叫規則，就是回答「我們在哪棟樓」的四種不同答案。

## 四種呼叫方式的概覽

JavaScript 中有**四種**呼叫函式的方式，每一種都會以不同的規則決定 `this` 的值。後續篇章將逐一深入說明：

1. 隱式綁定（implicit binding）
2. 明確綁定（explicit binding）
3. `new` 關鍵字綁定
4. 預設綁定（default binding）

## 複習

### JavaScript 中 `this` 關鍵字的值由什麼決定？

由函式的呼叫方式決定，而非定義位置。`this` 的賦值完全取決於函式被呼叫時的方式。

### JavaScript 中有幾種呼叫函式的方式？

有四種，每一種都以不同的規則決定 `this` 關鍵字的值。

### 用來解釋 `this` 上下文的比喻是什麼？

就像詞彙範疇用「從目前樓層往上找」來比喻，`this` 的查找也是在一棟樓裡進行，但關鍵問題是「這是哪棟樓」，也就是我們在哪個上下文中執行。

### `this` 關鍵字為什麼是 JavaScript 中強大的機制？

它提供了動態、彈性且可重用的函式呼叫上下文，讓同一個函式可以用不同的上下文物件呼叫，實現靈活的行為重用。

### `this` 關鍵字在概念上與哪個程式設計概念相似？

與動態範疇（dynamic scope）相似，兩者都提供了根據執行期條件決定的彈性可重用行為，差別在於 `this` 是由呼叫方式決定，而非呼叫位置。

## 小測驗

<details>
<summary>JavaScript 中 `this` 關鍵字的值由什麼決定？</summary>
函式的呼叫方式
</details>

<details>
<summary>JavaScript 中有幾種呼叫函式的方式？</summary>
四種
</details>

<details>
<summary>`this` 關鍵字在概念上與什麼相比較？</summary>
動態上下文物件（動態範疇）
</details>

<details>
<summary>`this` 關鍵字在函式中主要代表什麼？</summary>
函式呼叫時的執行上下文
</details>

<details>
<summary>`this` 關鍵字與動態範疇的相似之處是什麼？</summary>
兩者都具備彈性、可重用的行為特性
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記