---
title: '模組模式（Module Pattern）：用閉包實現封裝'
description: '介紹模組模式的核心要求：封裝（公私有區分）加上閉包（讓私有狀態持續存活）。說明命名空間與模組的根本差異、經典模組模式的兩個組成，以及 IIFE 單例版本與工廠函式版本的差異。'
date: 2026-06-22
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 54
chapter: 'Closure'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - Closure
  - ModulePattern
---

# 模組模式（Module Pattern）：用閉包實現封裝

> 本篇延續前兩篇對閉包的討論。前面確立了閉包的定義（函式保有對原始範疇變數的活連結），以及閉包關閉的是變數而非值。模組模式是閉包最重要的應用之一，也是本篇的核心主題。

## 命名空間不是模組

在進入模組模式之前，Kyle Simpson 先釐清一個常見的混淆：把資料與函式收進一個物件，**不是模組**。

```javascript
var workshop = {
  teacher: "Kyle",
  ask(question) {
    console.log(this.teacher, question);
  },
};

workshop.ask("Is this a module?");
// Kyle Is this a module?
```

這個做法有個非正式的名字：**命名空間模式（namespace pattern）**。它確實把相關的資料和行為收集在一起，但所有屬性都是公開可存取的，`workshop.teacher` 可以從外部直接讀取和修改。

命名空間缺少的是**封裝（encapsulation）**。封裝的意思是：有些東西是公開的（public API），有些東西是私有的，外部無法存取。只要沒有這種可見性控制，就不算是模組。

## 模組需要封裝，封裝需要閉包

模組模式的核心要求：

1. **封裝**：區分公開介面與私有狀態
2. **閉包**：沒有閉包，就無法實現封裝

ES6 的原生模組語法在概念上也應視為閉包的運作。閉包是模組模式能存在的根本原因。

## 經典模組模式（Classic / Revealing Module Pattern）

這個模式由 Doug Crockford 在大約 2001 年前後整理並推廣，由兩個必要組成構成：

**第一個組成：外層封閉函式**（通常是 IIFE）

外層函式建立出一個獨立的範疇，讓私有狀態得以存在於其中。

**第二個組成：內層函式對私有變數形成閉包**

內層函式存取外層範疇的變數，使該範疇在函式執行完畢後不被垃圾回收。

```javascript
var workshop = (function Module(teacher) {
  var publicAPI = { ask };
  return publicAPI;

  // **********

  function ask(question) {
    console.log(teacher, question);
  }
})("Kyle");

workshop.ask("It's a module, right?");
// Kyle It's a module, right?
```

這裡的關鍵細節：

- `teacher` 是私有狀態，`workshop.teacher` 從外部無法存取
- `ask` 函式對 `teacher` 形成閉包，使外層範疇持續存活
- 回傳的 `publicAPI` 物件只暴露 `ask`，這就是最小化公開介面

因為使用了 IIFE，這個模組只執行一次，是一種**單例（singleton）**。它執行後「結束了」，但由於閉包的存在，其範疇並未消失，私有狀態持續保留。

## 模組工廠函式（Module Factory Function）

IIFE 版本只能產生一個實例。如果需要多個獨立的模組實例，可以改用普通函式：

```javascript
function WorkshopModule(teacher) {
  var publicAPI = { ask };
  return publicAPI;

  // **********

  function ask(question) {
    console.log(teacher, question);
  }
}

var workshop = WorkshopModule("Kyle");

workshop.ask("It's a module, right?");
// Kyle It's a module, right?
```

每次呼叫 `WorkshopModule` 都會建立一個全新的範疇，產生一個擁有自己私有狀態的獨立模組實例，各實例之間互不干擾。這類函式稱為**工廠函式（factory function）**。

## 模組的本質：追蹤並控制隨時間變化的狀態

Kyle Simpson 提出一個判斷標準：

> 如果一個東西叫做模組，但它沒有任何**會隨時間改變的狀態**，那它不是模組，只是一個過度設計的命名空間。

模組模式的目的就是：封裝某些會隨時間變化的私有狀態，並透過最小化的公開 API 控制對這些狀態的存取。這正是前幾篇討論過的「最小暴露原則（Principle of Least Exposure）」的具體實踐。

## 複習

### 在 JavaScript 中建立模組的關鍵需求是什麼？

閉包是實作模組不可缺少的條件，它使封裝成為可能，讓資料與行為得以隱藏在內部。

### 經典模組模式的兩個核心組成是什麼？

第一是外層封閉函式（通常是 IIFE），第二是對外層變數形成閉包的內層函式，兩者共同建立出帶有私有狀態的範疇。

### 模組模式在 JavaScript 中的主要目的是什麼？

透過封裝資料與行為來追蹤並控制隨時間變化的狀態，只對外暴露最小必要的公開 API，內部細節保持私有。

### 模組與單純命名空間的根本差異是什麼？

模組透過資訊隱藏提供封裝，並且擁有可隨時間改變的狀態；命名空間只是把相關函式和資料組合在一起，並無隱藏機制。

### 在 JavaScript 中建立模組有哪兩種方式？

單例模組（使用只執行一次的 IIFE）以及模組工廠函式（可多次呼叫，每次產生獨立的模組實例）。

## 小測驗

<details>
<summary>模組模式與單純命名空間最根本的差異是什麼？</summary>
封裝與資訊隱藏
</details>

<details>
<summary>實作模組模式不可或缺的語言機制是什麼？</summary>
閉包
</details>

<details>
<summary>模組模式的主要目的是什麼？</summary>
追蹤並控制隨時間變化的狀態
</details>

<details>
<summary>模組模式體現了哪個設計原則？</summary>
最小暴露（最小權限）原則
</details>

<details>
<summary>哪種函式可以建立多個獨立的模組實例？</summary>
工廠函式（factory function）
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記