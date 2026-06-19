---
title: '操作 DOM 元素：屬性、樣式、事件與內容'
description: '介紹取得 DOM 元素參考後的操作方式，包含屬性修改、樣式設定、事件監聽，以及 textContent、innerHTML 與手動建立節點三種內容操作方式。'
date: 2026-07-02
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 5
chapter: 'Vanilla JavaScript'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - DOM
  - WebAPI
  - EventListener
---

# 操作 DOM 元素：屬性、樣式、事件與內容

> [[04-finding-elements-in-the-dom|上一篇]]說明了如何從 DOM 中選取元素，以及 `HTMLCollection` 與 `NodeList` 的差異。這篇接著介紹：取得元素的參考之後，可以用哪些方式對它進行操作。

## 讀取與修改屬性

操作 DOM 元素的屬性不需要任何特殊語法，直接用 JavaScript 的點記法（dot syntax）存取屬性即可。

```javascript
element.hidden = false;
element.src = "logo.png";
element.className = "myClass";  // 對應 HTML 的 class 屬性
```

有一個重要的前提需要說明：JavaScript 屬性名稱與 HTML 屬性名稱有 99% 是相同的，但有兩個例外：

- HTML 的 `class` 在 JavaScript 中叫做 `className`，因為 `class` 是 JavaScript 的保留字。
- HTML 的 `for`（用於 `<label>`）在 JavaScript 中叫做 `htmlFor`，原因相同。

此外，屬性（property）與 HTML attribute 在底層並非完全相同的東西，但在這個入門階段可以先理解為對應關係，課程後面會再深入說明兩者的差異。

## 讀取與修改樣式

每個 DOM 元素都有一個 `style` 物件，其中包含該瀏覽器支援的所有 CSS 屬性。

CSS 使用連字號（kebab-case）命名屬性，JavaScript 則需要改成駝峰式（camelCase）：

```javascript
element.style.color = "blue";
element.style.fontSize = "1.2em";        // 對應 font-size
element.style.borderRightColor = "#FCFCFC"; // 對應 border-right-color
```

這個轉換規則和大多數框架的做法一致，因為 JavaScript 屬性名稱不能包含連字號。

## 監聽事件

任何 DOM 物件（元素、`document`、`window` 都算）都可以掛載事件監聽器，使用 `addEventListener` 方法，傳入事件名稱字串與處理函式：

```javascript
// 方式一：先宣告函式，再傳入
function eventHandler(event) {
  // do something
}
element.addEventListener("click", eventHandler);

// 方式二：直接傳入匿名函式
element.addEventListener("click", function(event) {
  // do something
});

// 方式三：使用箭頭函式（目前最常見的寫法）
element.addEventListener("click", (event) => {
  // do something
});

// 若不需要使用 event 物件，參數可以省略
element.addEventListener("click", () => {
  // do something
});
```

事件處理函式會接收一個包含事件資訊的 `event` 參數，但如果用不到，在 JavaScript 中可以直接省略不寫。

## 讀取與修改元素內容

修改元素的內容有三種方式，各有不同的使用場景。

### 1. `textContent`

純文字內容的讀寫。如果你寫入包含 HTML 標籤的字串，標籤不會被解析，而是直接顯示成文字（`<` 和 `>` 會被轉換為 Unicode 表示）。

```javascript
const element = document.querySelector("#message");

// 讀取
const contents = element.textContent;

// 寫入（純文字）
element.textContent = "The text has been changed";
```

### 2. `innerHTML`

允許寫入 HTML 字串，瀏覽器會解析並建立對應的 DOM 節點。搭配 JavaScript 的模板字串（template literals），可以用接近 HTML 的方式撰寫多行內容：

```javascript
const element = document.querySelector("#section-6 header");

// 讀取
const contents = element.innerHTML;

// 寫入（HTML 字串）
element.innerHTML = `
  <h1>My App</h1>
  <p>The best platform for learning frontend</p>
`;
```

這看起來有點像 JSX，但它本質上是一個字串，瀏覽器在解析時不會驗證 HTML 的正確性。

### 3. 使用 DOM API 手動建立節點

透過 `document.createElement` 建立新元素，再用 `appendChild` 掛入 DOM：

```javascript
const element = document.querySelector("#section-6 header");

const h1 = document.createElement("h1");
h1.textContent = "My App";
element.appendChild(h1);

const p = document.createElement("p");
p.textContent = "The best platform for learning frontend";
element.appendChild(p);
```

`appendChild` 呼叫後，節點進入 DOM 結構，但畫面要等到執行緒釋放後才會更新。

### 三種方式的比較

這三種方式最終可以達到相同的 DOM 結果，但各有優缺點。`innerHTML` 寫法簡潔，適合一次性渲染整塊結構；手動建立節點雖然較繁瑣，但在需要精確控制的場景更合適。課程後面實作時會兩種都用到，屆時再根據情境判斷選哪一種。

## 複習

### 如何在 JavaScript 中修改 DOM 元素的屬性？

直接對元素使用點記法，例如 element.propertyName = value

### 有哪兩個屬性名稱與 HTML 屬性名稱不同？

HTML 的 'class' 在 JavaScript 中叫做 'className'，'for' 叫做 'htmlFor'，因為 class 是 JavaScript 的保留字

### 如何在 JavaScript 中修改 DOM 元素的樣式？

存取 DOM 元素的 style 物件，並將 CSS 的連字號命名（kebab-case）轉換為駝峰式命名（camelCase），例如 'font-size' 寫成 'fontSize'

### textContent 與 innerHTML 的差異是什麼？

textContent 只支援純文字，HTML 標籤會被直接顯示而不解析；innerHTML 允許寫入 HTML，可以定義複雜的 HTML 結構

### 在 JavaScript 中用哪個方法掛載事件監聽器？

addEventListener()，接收兩個主要參數：事件名稱字串，以及處理該事件的函式

## 小測驗

<details>
<summary>在 JavaScript 中，由於 'class' 是保留字，應使用哪個屬性來修改 DOM 元素的類別？</summary>
className
</details>

<details>
<summary>在 JavaScript 中修改 CSS 樣式時，連字號命名的屬性應如何轉換？</summary>
轉換為駝峰式命名（camelCase）
</details>

<details>
<summary>在 JavaScript 中通常使用哪個方法來掛載事件監聽器？</summary>
addEventListener
</details>

<details>
<summary>修改元素內容時，textContent 與 innerHTML 的差異是什麼？</summary>
textContent 不支援 HTML；innerHTML 允許寫入 HTML
</details>

<details>
<summary>在 HTML label 中，'for' 屬性對應的 JavaScript 屬性名稱是什麼？</summary>
htmlFor
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記