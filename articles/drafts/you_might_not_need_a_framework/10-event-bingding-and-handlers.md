---
title: 'DOM 事件綁定：事件種類、命名規則與兩種綁定方式比較'
description: '整理 DOM 事件的種類與 W3C 命名規則，並比較 onevent 屬性與 addEventListener 兩種綁定方式的差異與適用情境。'
date: 2026-07-04
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 10
chapter: 'The DOM'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - DOM
  - EventListener
---

# DOM 事件綁定：事件種類、命名規則與兩種綁定方式比較

> [[09-main-script-setup|上一篇]]介紹了 `DOMContentLoaded` 事件作為應用程式初始化的正確時機。這篇更深入事件綁定的基礎，整理 DOM 事件的種類、命名慣例，以及兩種綁定方式的差異。

## DOM 事件的種類

每個 DOM 元素都有一份可監聽的事件清單，事件種類很多：

- 基本互動：`load`、`click`、`dblclick`
- 值的變動：`change`（常用於表單元素，例如下拉選單的選項切換）
- 鍵盤事件：`keyup`、`keydown`、`keypress`
- 滑鼠事件：`mouseover`、`mouseout` 等
- 指標與觸控事件（Pointer and Touch Events）：可偵測多點觸控，例如 iPad 支援偵測最多 11 個觸控點，手機一般為 5 個
- 滾動與焦點事件：`scroll`、`focus` 等

除了標準事件之外，W3C 持續新增新的 API（例如拖放、串流投放），這些 API 也會帶來各自的事件。舉例來說，Netflix 在網頁上偵測 Chromecast 或 Apple TV 是否在同一個網路中，就是透過特定的 DOM 事件 API 實現的。

另外，有些事件只適用於特定物件。例如 `DOMContentLoaded` 和 `popstate` 只能在 `window` 物件上監聽，在其他元素上監聽不會有任何效果。

## W3C 事件命名規則

W3C 規格的事件命名慣例是：**全部小寫、沒有分隔符號**。因此不用駝峰式、不用底線，也不加 `-ed` 後綴，例如 `click`（不是 `clicked`）、`change`（不是 `changed`）。

這個規則有少數例外，`DOMContentLoaded` 就是其中之一，它保留了大寫字母。此外，瀏覽器廠商有時會自定義事件名稱，例如 Apple 為 Apple TV 串流定義的事件名稱是：

```
webkitcurrentplaybacktargetiswirelesschanged
```

這是一個沒有任何分隔符號的超長字串，也是命名規則缺乏一致性的極端案例。

大約 99% 的標準事件名稱都遵守「全小寫、無分隔符號、無 -ed」的規則。

## 兩種事件綁定方式

### 方式一：onevent 屬性

這是 DOM 最早期的事件綁定方式，每個事件對應一個屬性，例如 `onclick`、`onload`，全部小寫。

```javascript
element.onclick = function() {
  // 處理點擊
};
```

如果你來自 React，會對 `on` 開頭的寫法感到熟悉。不過 React 使用駝峰式（`onClick`），而原生 DOM 的 `onevent` 屬性全部是小寫。

**這個方式的關鍵限制**：因為它是屬性的賦值，同一個屬性只能存放一個函式。如果你對同一個事件屬性賦值兩次，後者會覆蓋前者，最終只有最後一個函式會被執行。

### 方式二：addEventListener

`addEventListener` 採用觀察者模式（Observer Pattern，也稱為 pub/subscribe），可以對同一個事件註冊多個監聽函式，所有函式都會被執行，不會互相覆蓋。

```javascript
element.addEventListener("click", handlerA);
element.addEventListener("click", handlerB);
// 點擊時，handlerA 和 handlerB 都會執行
```

這在應用程式開發中很實用。例如 `DOMContentLoaded` 可以在不同的 JavaScript 檔案中各自監聽，每個模組負責自己的初始化邏輯，不需要擔心「是否已經在其他地方綁定過了」。

```javascript
// 模組 A
window.addEventListener("DOMContentLoaded", initDatabase);

// 模組 B（不同檔案）
window.addEventListener("DOMContentLoaded", initWebSocket);
```

兩者都會在 `DOMContentLoaded` 觸發時執行，彼此獨立。

## 複習

### 在 DOM 物件中將函式綁定到事件的兩種主要方式是什麼？

兩種方式分別是：onevent 屬性，以及 addEventListener

### 使用 onevent 屬性進行事件綁定的主要限制是什麼？

因為它是屬性的賦值操作，如果對同一個屬性賦值不同的函式，只有最後一個函式會被執行，前面的會被覆蓋

### 大多數 DOM 事件名稱的命名規則是什麼？

全部小寫、沒有分隔符號（例如 click、change），結尾也不加 'ed'

### 瀏覽器中可以偵測哪些類型的事件？

load、click、dblclick、change、鍵盤事件（keyup、keydown、keypress）、滑鼠事件、指標事件、觸控事件、scroll，以及 focus 事件

### addEventListener 相較於 onevent 屬性有什麼優勢？

addEventListener 採用觀察者設計模式，可以對同一個事件綁定多個監聽函式，觸發時所有函式都會被執行，不會互相覆蓋

## 小測驗

<details>
<summary>哪個方法可以在不覆蓋既有處理函式的情況下，為同一個事件新增多個處理函式？</summary>
addEventListener
</details>

<details>
<summary>DOM 事件名稱的標準命名規則是什麼？</summary>
全部小寫、沒有分隔符號
</details>

<details>
<summary>使用 onevent 屬性進行事件處理的主要限制是什麼？</summary>
只有最後一個被賦值的函式會被執行
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記