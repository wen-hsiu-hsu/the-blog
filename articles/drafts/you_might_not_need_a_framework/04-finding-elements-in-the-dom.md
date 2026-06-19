---
title: '選取 DOM 元素：方法、回傳型別與操作能力'
description: '介紹 DOM 元素選取的五種方式、回傳型別（HTMLCollection 與 NodeList）的差異，以及取得元素參考後的操作能力。'
date: 2026-07-01
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 4
chapter: 'Vanilla JavaScript'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - DOM
  - WebAPI
---

# 選取 DOM 元素：方法、回傳型別與操作能力

> [[03-the-dom-api|上一篇]]介紹了 DOM 與 DOM API 的基本概念，說明每個 HTML 元素在記憶體中都對應一個 JavaScript 物件，以及執行緒釋放與畫面更新的關係。這篇進入實際操作的第一步：如何從 DOM 中選取元素。

## 選取元素的方式

DOM API 提供五種選取元素的基本方式：

- **By ID**：透過元素的 `id` 屬性選取。HTML 中的 `id` 不是必填項，沒有設定就無法用這個方式選取。
- **By Class Name**：透過 CSS `class` 屬性選取。
- **By Name**：透過 HTML `name` 屬性選取。這個屬性最常出現在表單元素，但技術上其他元素也可以使用。
- **By CSS Selector**：透過 CSS 選擇器語法選取，目前是最常用的方式。
- **By Navigating the DOM Structure**：透過 DOM 樹的父子關係導覽，例如 `firstChild`、`parentNode` 等。有時比直接查詢更合適，但通常較繁瑣。

## 回傳值的三種型別

選取函式的回傳值分三種情況：

**單一元素（`HTMLElement`）**

選取單一元素時，如果找不到符合條件的節點，回傳值會是 `null`，而不是拋出錯誤。因此凡是有可能找不到目標元素的情況，都應該在使用前先檢查是否為 `null`。

**動態集合（`HTMLCollection`）**

這是一個「即時」（live）的集合，意思是如果 DOM 在你迭代這個集合的過程中發生了變化（例如新增了符合條件的元素），集合本身也會跟著變動。

**靜態集合（`NodeList`）**

這是一個「凍結」在查詢當下的快照，後續 DOM 的變化不會影響它的內容。

## 選取單一元素

最常用的兩個方法是：

**`getElementById`**

傳入 ID 字串，回傳唯一一個對應的元素，或 `null`。這個方法從 1990 年代就存在了。

```javascript
const element = document.getElementById("one-item");

if (element !== null) {
  // element found
}
```

**`querySelector`**

傳入 CSS 選擇器，回傳第一個符合的元素，或 `null`。比 `getElementById` 更現代，約有 15 年歷史，彈性也更高。

```javascript
const element = document.querySelector("section>header a");

if (element !== null) {
  // element found
}
```

## 選取多個元素

常用的四個方法：

| 方法                     | 集合型別              |
| ------------------------ | --------------------- |
| `getElementsByTagName`   | 動態 `HTMLCollection` |
| `getElementsByClassName` | 動態 `HTMLCollection` |
| `getElementsByName`      | 動態 `NodeList` |
| `querySelectorAll`       | 靜態 `NodeList`       |

當沒有找到任何符合條件的元素時，這些方法不會回傳 `null`，而是回傳一個空的集合。

```javascript
// elements 是靜態 NodeList，有完整的陣列介面
const elements = document.querySelectorAll("#nav-menu li");

if (elements.length > 0) {
  const firstElement = elements[0];
}
```

```javascript
// elements 是動態 HTMLCollection，只有基本的迭代能力
const elements = document.getElementsByClassName("important");

for (let currentElement of elements) {
  // 可以用 for...of 迭代，但不能用 filter、map 等
}
```

## HTMLCollection 缺少現代陣列方法

這是一個重要的實務差異。`HTMLCollection`（動態集合）不支援現代陣列方法，例如 `filter`、`map`、`reduce`、`forEach`。它有 `length` 屬性，也可以用 `[index]` 存取，但就是沒有這些方法。

這是歷史因素造成的，DOM API 在這些方法出現之前就已經定義好了，為了向後相容，實作不會被更改。

如果你需要對 `HTMLCollection` 使用這些方法，可以用 `Array.from()` 將它轉換為真正的陣列：

```javascript
// 將 HTMLCollection 轉換為陣列，之後就能使用所有陣列方法
const elements = Array.from(document.getElementsByClassName("important"));

elements.filter(e => e.tagName === "p");
```

`querySelectorAll` 回傳的 `NodeList` 支援 `forEach`，但仍不支援 `filter`、`map` 等方法。若需要完整的陣列介面，同樣建議用 `Array.from()` 轉換。

## 取得元素參考後能做什麼

一旦你持有某個 DOM 元素的參考，可以對它做以下操作：

- 讀取或修改屬性值（attributes）
- 讀取或修改樣式（styles）
- 掛載事件監聽器（event listeners）
- 新增、移除或搬移子元素
- 讀取或修改內容
- 使用其他 W3C API（例如拖放、多點觸控、Pointer API 等）

DOM 元素上可用的 API 範圍會持續擴展，因為 W3C 會不斷在新規範中為既有的介面增加新的屬性、方法和事件。

## 複習

### 從 DOM 中選取元素的五種主要方式是什麼？

1. 透過 ID（document.getElementById）
2. 透過 Class Name
3. 透過 name 屬性
4. 透過 CSS 選擇器
5. 透過導覽 DOM 樹狀結構

### HTMLCollection 與 NodeList 的差異是什麼？

HTMLCollection 是動態集合，當 DOM 發生變化時會即時更新；NodeList 是靜態集合，在建立當下就被凍結，後續 DOM 的變化不會影響它。

### 動態集合（如 HTMLCollection）有什麼限制？

動態集合缺少現代陣列方法，例如 filter、map、reduce 和 forEach。若要使用這些方法，必須先透過 Array.from() 將集合轉換為陣列。

### 選取單一 DOM 元素最常用的兩個方法是什麼？

getElementById 和 querySelector。getElementById 透過唯一的 ID 選取元素，querySelector 則回傳第一個符合 CSS 選擇器的元素。

### 取得 DOM 元素參考後可以做哪些操作？

可以讀取與修改屬性值、讀取與修改樣式、掛載或移除事件監聽器、新增/移除/搬移子元素、讀取與修改內容，以及使用各種 W3C API。

## 小測驗

<details>
<summary>哪個方法用於透過唯一識別碼選取 DOM 元素？</summary>
document.getElementById
</details>

<details>
<summary>哪個方法回傳靜態的元素集合？</summary>
querySelectorAll
</details>

<details>
<summary>動態 HTML 集合（HTMLCollection）的特性是什麼？</summary>
當 DOM 發生變化時會即時更新
</details>

<details>
<summary>如何將動態的 HTMLCollection 轉換為具有現代方法的陣列？</summary>
使用 Array.from(collection)
</details>

<details>
<summary>querySelector 在選取元素時的行為是什麼？</summary>
回傳第一個符合 CSS 選擇器的元素
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記