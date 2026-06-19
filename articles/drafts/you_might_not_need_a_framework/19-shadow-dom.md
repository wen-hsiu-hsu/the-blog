---
title: 'Shadow DOM：Web Components 的樣式封裝機制'
description: '介紹 Shadow DOM 的隔離機制、open 與 closed 兩種模式，以及為 Custom Element 定義 HTML 內容的多種方式。'
date: 2026-07-09
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 19
chapter: 'Web Components'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - WebComponents
  - DOM
---

# Shadow DOM：Web Components 的樣式封裝機制

> [[18-html-templates|上一篇]]介紹了 HTML Templates，並說明在沒有額外保護的情況下，template 內的樣式會洩漏到整個文件。這篇介紹解決這個問題的機制：Shadow DOM，也是 Web Components 三個標準的最後一個。

## 什麼是 Shadow DOM？

Shadow DOM 是一個附著在 Custom Element 內部的私有、隔離的 DOM 樹，和主文件的 DOM 樹是分開的。你可以把它理解為元件擁有自己的迷你文件，類似 iframe 的概念，但沒有獨立的導覽或載入行為，只有獨立的 DOM 和 CSS 作用域。

這就是為什麼 Custom Element 有一個 `adoptedCallback` 生命週期方法：當你把一個元素從一個 Shadow DOM 移動到另一個 DOM 時，這個方法就會觸發。

## CSS 在 Shadow DOM 中的行為

Shadow DOM 的核心優勢之一就是 CSS 隔離：

- 主文件的 CSS 不會自動套用到 Shadow DOM 內部（例如你在全域定義的字型家族，在 Shadow DOM 裡不會生效）
- Shadow DOM 內部定義的 CSS 只作用於那個 Shadow DOM，不會影響外部

這直接解決了上一篇提到的問題：有了 Shadow DOM，template 內的 `<style>` 就只會影響元件自己的內容，不會污染整個頁面。

啟用 Shadow DOM 之前，如果不想讓樣式洩漏，只能靠給所有元素加上具體的 class 或 ID 來縮小選擇器的範圍，這往往導致 HTML 裡充斥著大量的 class，也就是講師說的「classitis（class 過度使用症）」。Shadow DOM 提供了一個乾淨的替代方案。

CSS 的跨 DOM 溝通仍然是可能的，可以透過特定的偽類（pseudo-class）和偽元素（pseudo-element）讓宿主元素與 Shadow DOM 之間傳遞樣式，但這個課程不深入這部分。

## open 與 closed 兩種模式

建立 Shadow DOM 時，需要指定 `mode` 為 `"open"` 或 `"closed"`：

- **open**：外部的 DOM 可以透過 JavaScript 取得這個 Shadow DOM 的參考，等於是允許外部程式碼穿透進來
- **closed**：只有元件自身的 JavaScript 可以操作這個 Shadow DOM，外部完全無法存取，類似 Java 或 C# 的私有屬性

## 如何建立 Shadow DOM

在 Custom Element 的 `constructor` 中呼叫 `attachShadow`，並把回傳的 Shadow Root 儲存為屬性：

```javascript
class MyElement extends HTMLElement {
  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    // 把內容附加到 shadow root，而不是 this
    this.root.appendChild( ... );
  }
}
```

建立後，在元件內部的所有 DOM 操作，都應該針對 `this.root`（Shadow Root），而不是 `this`（元件本身在外部 DOM 的節點）。

啟用 Shadow DOM 之後，template 內的 `<style>` 的行為就從「影響整個文件」變成「只影響這個元件的 Shadow DOM 內部」。

## 定義元件 HTML 的多種方式

講師最後整理了幾種為 Custom Element 提供 HTML 內容的選項，沒有唯一正解：

- 完全用 DOM API 手動建立元素
- 在主 HTML 檔案中定義 `<template>` 並克隆
- 用 Fetch API 載入外部 HTML 檔案，再用 `innerHTML` 或 `DOMParser` 注入（`DOMParser` 可以把 HTML 字串解析為 Document Fragment 再插入 DOM）

曾經有一個名為「HTML imports」的規格試圖提供一種像 CSS `@import` 一樣直接引入外部 HTML 的方式，但它已經從規格中移除，不再可用。

## 複習

### Web Components 中的 Shadow DOM 是什麼？

Shadow DOM 是附著在 Web Component 內部的私有、隔離的 DOM 樹，與主文件的 DOM 樹相互獨立，讓開發者能對樣式和功能有更高的封裝控制能力。

### CSS 樣式在 Shadow DOM 中的行為是什麼？

主文件 DOM 中宣告的 CSS 不會自動套用到 Shadow DOM 內部，而 Shadow DOM 內部定義的樣式也只會作用於那個 Shadow 樹，不影響外部。

### Shadow DOM 有哪兩種模式？

Shadow DOM 可以設定為 open 或 closed。open 模式允許外部 DOM 透過 JavaScript 存取 Shadow DOM；closed 模式則限制存取，只有 Shadow DOM 自身的 JavaScript 才能與它互動。

### 如何在 Web Component 中建立 Shadow DOM？

在 constructor 中呼叫 attachShadow() 方法，通常指定 mode 為 'open' 或 'closed'，並將回傳的結果儲存為屬性，之後透過這個屬性來操作 Shadow Root。

### Shadow DOM 在樣式方面提供什麼優勢？

Shadow DOM 讓 CSS 的作用範圍限定在特定的 Web Component 內，使 CSS 更清晰，也減少了對複雜 ID 和 class 選擇器的依賴。

## 小測驗

<details>
<summary>Web Components 中的 Shadow DOM 是什麼？</summary>
附著在 Web Component 內部的私有、隔離的 DOM 樹
</details>

<details>
<summary>什麼決定了 Shadow DOM 的對外可見性？</summary>
它的 mode 設定（open 或 closed）
</details>

<details>
<summary>Shadow DOM 如何處理 CSS 樣式？</summary>
在 Shadow DOM 內宣告的 CSS 只作用於該 DOM 內部
</details>

<details>
<summary>在 Web Component 中，Shadow DOM 通常在什麼時候建立？</summary>
在 constructor 中使用 attachShadow 方法建立
</details>

<details>
<summary>使用 Shadow DOM 的主要優點是什麼？</summary>
透過隔離元件樣式，讓 CSS 和 HTML 更加乾淨
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記