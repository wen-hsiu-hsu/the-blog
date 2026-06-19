---
title: '在實際專案中操作 DOM：查詢範圍與效能意識'
description: '透過實際專案示範 querySelector 與 querySelectorAll 的行為差異，以及如何縮小查詢範圍與快取元素參考來改善效能。'
date: 2026-07-03
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 7
chapter: 'The DOM'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - DOM
  - WebAPI
  - Performance
---

# 在實際專案中操作 DOM：查詢範圍與效能意識

> [[06-course-project-overview|上一篇]]介紹了 Coffee Masters 專案的結構，以及 DOM 與 HTML 原始碼的本質差異。這篇透過在 DevTools Console 中直接操作這個專案的 DOM，進一步理解查詢方法的實際行為，以及如何思考查詢效能。

## 在 Console 中直接操作 DOM

在瀏覽器開啟 Coffee Masters 專案後，可以直接在 DevTools 的 Console 中使用 DOM API 進行操作，不需要任何 JavaScript 檔案。這是驗證與理解 DOM 行為的好方式。

例如，`document.querySelector("header")` 會回傳頁面中第一個 `<header>` 元素的物件參考。`document.querySelector(".navlink")` 則會找到第一個帶有 `navlink` class 的元素，注意 class 選擇器前面要加上 `.`，這和 CSS 的語法相同。

## querySelector 與 querySelectorAll 的行為差異

這是 Vanilla JS 中一個常見的錯誤來源，值得特別留意。

`querySelector` 永遠只回傳**第一個**符合條件的元素。即使頁面上有多個 `.navlink`，它只會給你其中一個。

`querySelectorAll` 則回傳一個包含**所有**符合元素的 `NodeList`。

當查詢條件找不到任何符合的節點時，兩者的回傳值不同：

- `querySelector` 回傳 `null`
- `querySelectorAll` 回傳空的 `NodeList`，而不是 `null`

```javascript
// 只拿到第一個 .navlink
document.querySelector(".navlink");

// 拿到所有 .navlink，以 NodeList 回傳
document.querySelectorAll(".navlink");

// 不存在的 class，querySelector 回傳 null
document.querySelector(".important");

// 不存在的 class，querySelectorAll 回傳空 NodeList
document.querySelectorAll(".important");
```

## DOM API 不只屬於 document

這是一個容易被忽略的觀念：`querySelector` 和 `querySelectorAll` 不只能在 `document` 上呼叫，**每一個 DOM 元素物件都有這些方法**。

這意味著你可以先取得某個父元素的參考，再從那個元素往內查詢，而不是每次都從整個 document 開始搜尋。

```javascript
// 先取得 nav 元素的參考並存入變數
const nav = document.querySelector("nav");

// 之後的查詢都在 nav 的範圍內進行，不需要再搜尋整個 document
const badge = nav.querySelector("#badge");
```

## 縮小查詢範圍與快取參考

直接在 `document` 上查詢，表示瀏覽器需要搜尋整個 DOM 樹。如果只需要在某個子樹中尋找，先取得父元素再往內查，可以縮小搜尋範圍。

這也是 Vanilla JS 效能抱怨常見的來源之一：大量的程式碼都在對 `document` 做查詢，而沒有善用更小的搜尋範圍。

另一個實用的做法是**快取常用的元素參考**，也就是在初始化時就把常用的元素存進變數，之後直接使用，不需要重複查詢 DOM：

```javascript
// 初始化時一次查詢，之後重複使用
const nav = document.querySelector("nav");
const mainContent = document.querySelector("main");
```

講師提到，不同瀏覽器對 DOM 查詢的實作方式不同，這也是各家瀏覽器速度有差異的原因之一。這門課的目標是先建立正確的基本概念，效能優化可以之後再深入。

## 複習

### querySelector 與 querySelectorAll 的差異是什麼？

querySelector 只回傳第一個符合條件的元素；querySelectorAll 回傳包含所有符合元素的 NodeList。若找不到任何元素，querySelector 回傳 null，querySelectorAll 回傳空的 NodeList。

### 如何提升 DOM 查詢的效能？

不要每次都對整個 document 進行查詢，而是將某個父元素的參考儲存在變數中，再使用該元素的 querySelector 方法，縮小搜尋範圍，藉此提升效能。

### 哪些 DOM API 方法可以用來選取元素？

可以使用 querySelector 選取單一元素，使用 querySelectorAll 選取多個元素。這些方法不只在 document 物件上可用，在每個 DOM 元素上都可以呼叫。

### 如何用 querySelector 透過 class 名稱選取元素？

在 class 名稱前加上點號，例如 document.querySelector('.navlink')，即可選取帶有 navlink class 的元素。

### 查詢一個不存在的元素時會發生什麼？

使用 querySelector 查詢不存在的元素時，回傳 null；使用 querySelectorAll 查詢不存在的元素時，回傳空的 NodeList。

## 小測驗

<details>
<summary>querySelector 與 querySelectorAll 的關鍵差異是什麼？</summary>
querySelector 只回傳第一個符合的元素；querySelectorAll 回傳包含所有符合元素的 NodeList
</details>

<details>
<summary>對不存在的元素使用 querySelector 時，回傳值是什麼？</summary>
null
</details>

<details>
<summary>什麼做法可以讓 DOM 查詢更有效率？</summary>
查詢文件中特定的子範圍，而不是每次都搜尋整個 document
</details>

<details>
<summary>如何在特定的 DOM 元素範圍內查詢子元素？</summary>
將父元素存入變數，再呼叫該變數的 querySelector 方法
</details>

<details>
<summary>對不存在的選擇器使用 querySelectorAll 時，回傳值是什麼？</summary>
空的 NodeList
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記