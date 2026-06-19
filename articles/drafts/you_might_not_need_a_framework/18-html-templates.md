---
title: 'HTML Templates：在 DOM 中定義惰性的 HTML 片段'
description: '介紹 HTML Templates 的運作方式，說明如何在 Custom Element 中克隆 template 內容，以及 template 內定義 CSS 樣式時的作用範圍問題。'
date: 2026-07-08
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 18
chapter: 'Web Components'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - WebComponents
  - DOM
---

# HTML Templates：在 DOM 中定義惰性的 HTML 片段

> [[17-overview-and-custom-elements|上一篇]]介紹了 Web Components 的三個組成標準，以及 Custom Elements 的定義方式與生命週期。這篇進入第二個標準：HTML Templates，說明它如何讓你在 HTML 檔案中定義元件的結構，以及使用時需要注意的 CSS 作用範圍問題。

## 什麼是 template 元素？

`<template>` 是一個特殊的 HTML 標籤，瀏覽器會完全忽略它的內容：不解析、不渲染、不執行任何 CSS 或 JavaScript。它只是一段「備而不用」的 HTML 標記，等待 JavaScript 在需要的時候把它克隆出來使用。

```html
<template id="template1">
  <header>
    <h1>This is a template</h1>
    <p>This content is not rendered initially</p>
  </header>
</template>
```

在有 `<template>` 之前，開發者常用一個取巧的方式：把 HTML 內容塞進 `<script>` 標籤，並設定一個瀏覽器不認識的 `type` 或 `language` 值，讓瀏覽器忽略它，再用 DOM API 和字串處理方法（例如 `JSON.parse`）取出內容。現在 `<template>` 提供了一個正式、乾淨的替代方案。

從概念上看，`<template>` 和 Document Fragment 有些相似，兩者都是在記憶體中建立一個不影響真實 DOM 的結構，某種程度上類似「虛擬 DOM」的概念。

## 如何在 Custom Element 中使用 template

`<template>` 的典型使用方式是在 Custom Element 的 `connectedCallback` 中克隆它的內容並附加到元件本身：

```javascript
connectedCallback() {
  const template = document.getElementById("template1");
  const content = template.content.cloneNode(true);
  this.appendChild(content);
}
```

幾個重點：

- 用 `getElementById` 或 `querySelector` 取得 template 元素
- 必須存取 `template.content` 才能取得模板的內容（DocumentFragment），而不是 template 元素本身
- `cloneNode(true)` 的 `true` 參數表示深度克隆，會一併複製所有子節點
- 附加的是克隆的內容，不是原始 template，因為 template 是唯讀的，應該可以被重複克隆使用

## 注意：CSS 樣式的作用範圍問題

這是使用 `<template>` 時一個重要的陷阱。

如果在 template 內部定義 `<style>`，這些樣式**不會**被限制在元件範圍內，而是會套用到整個頁面：

```html
<template id="template1">
  <style>
    /* 這個宣告會影響頁面上所有的 h1，不只是這個元件內的 */
    h1 { color: red }
  </style>
  <header>
    <h1>This is a template</h1>
  </header>
</template>
```

這是因為預設情況下，Custom Element 的節點是整個頁面 DOM 的一部分，沒有任何隔離機制。克隆進來的 `<style>` 標籤會成為文件的一部分，其中的 CSS 規則會影響頁面上所有符合選擇器的元素。

這個問題的解決方案就是下一個標準：Shadow DOM，它提供了真正的 CSS 作用範圍隔離。

## 複習

### HTML 中的 template 元素是什麼？

template 元素是一段可以在執行時克隆並插入文件的標記片段，包含可以被動態渲染與修改的可重用 HTML 內容。瀏覽器預設會忽略其內容，不會對它進行渲染。

### 如何在 Custom Element 中克隆一個 template？

通常在 connectedCallback 方法中進行，使用 getElementById 或 querySelector 取得 template 元素，然後呼叫 content.cloneNode() 並將克隆的內容（而非 template 本身）附加到元件中。

### 在 template 內部定義樣式有什麼潛在問題？

預設情況下，在 template 內定義的樣式會套用到整個文件，而不僅限於 template 的內容。例如，將 h1 設為紅色的樣式宣告，會影響頁面上所有的 h1 元素，而不只是 template 內的那個。

### template 元素和 Document Fragment 有什麼相似之處？

兩者都可以在記憶體中建立一個不影響真實 DOM 的結構，允許在不直接修改頁面 DOM 的情況下操作內容，本質上類似虛擬 DOM。

### 在有 template 元素之前，開發者常用什麼取巧的方式來處理 HTML 內容？

開發者會使用帶有瀏覽器不認識的 `type` 或 `language` 屬性的 `<script>` 標籤讓瀏覽器忽略其內容，再透過 DOM API（例如讀取 `innerHTML`）取出內容，並視需要用 `JSON.parse` 等方法處理。

## 小測驗

<details>
<summary>HTML template 元素的主要特性是什麼？</summary>
瀏覽器會完全忽略其內容，不進行解析或渲染
</details>

<details>
<summary>在 Web Component 中，通常如何克隆 template 的內容？</summary>
在 connectedCallback 方法中使用 content.cloneNode() 進行克隆
</details>

<details>
<summary>在 template 元素內定義樣式有什麼潛在問題？</summary>
template 內的樣式可能會影響整個文件，而不只限於 template 內部
</details>

<details>
<summary>在建立記憶體中的 DOM 方面，什麼和 template 元素類似？</summary>
Document Fragment
</details>

<details>
<summary>通常用哪個方法來存取 template 元素？</summary>
document.querySelector()
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記