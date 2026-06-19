---
title: '為 Custom Element 啟用 Shadow DOM：樣式封裝的實際效果'
description: '實際為 Custom Element 啟用 Shadow DOM，觀察樣式封裝的效果，並比較幾種替代的 template HTML 定義方式。'
date: 2026-07-11
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 23
chapter: 'Web Components'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - WebComponents
  - DOM
---

# 為 Custom Element 啟用 Shadow DOM：樣式封裝的實際效果

> [[22-loading-templates|上一篇]]在 `connectedCallback` 中成功克隆 template 並渲染內容，但也發現元件內的 CSS 會洩漏到整個文件。這篇在 `MenuPage` 中實際啟用 Shadow DOM，觀察樣式隔離的效果，並補充幾種替代的 HTML 定義方式。

## 在 constructor 中建立 Shadow DOM

在 `MenuPage.js` 的 constructor 中呼叫 `attachShadow`，把回傳的 Shadow Root 存為屬性：

```javascript
class MenuPage extends HTMLElement {
  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const template = document.getElementById("menu-page-template");
    const content = template.content.cloneNode(true);
    this.root.appendChild(content);
  }
}
```

兩個變化：

- constructor 中建立 Shadow DOM，`mode: "open"` 表示外部 JavaScript 可以取得這個 Shadow Root 的參考；`"closed"` 則禁止外部存取。
- `connectedCallback` 中附加內容的目標從 `this` 改成 `this.root`，因為現在是把內容加入 Shadow DOM，而不是加入元件本身。因為現在附加的目標是 Shadow Root 而非元件本身，這段程式碼也可以移至 constructor。

## Shadow DOM 的實際效果

啟用後，之前在 template 內定義的 `h2 { color: violet }` 只會影響元件自己 Shadow DOM 內的 h2，頁面其他地方的 h2 顏色不受影響。

在 DevTools 的 Elements 面板中，打開 `<main>` 再打開 `<menu-page>`，你會看到一個標記為「shadow-root (open)」的特殊節點。展開它就是元件自己獨立的 DOM 樹，這就是 Shadow DOM，一個存在於主文件中的隔離文件，樣式只作用於這個範圍內。

## Template HTML 的幾種替代定義方式

有學員提問是否可以把 HTML 直接放在 JavaScript 檔案裡，而不用在 HTML 中定義 `<template>`。答案是可以，幾種選項都行得通：

**直接用 innerHTML 設定字串**

```javascript
this.root.innerHTML = `
  <h2>This is the menu</h2>
  <section>...</section>
`;
```

這樣就不需要在 HTML 中定義 `<template>` 元素。缺點是這是一個字串，IDE 不會對它進行 HTML 驗證，也沒有語法提示。

**用 Fetch API 載入外部 HTML 檔案**

把 HTML 內容放在獨立的檔案中，用 Fetch 載入後注入，這樣可以保有 HTML 檔案的 IDE 支援，但需要考慮非同步載入的時序問題。

**使用 JSX（但需要建置流程）**

JSX 不是 React 專屬的，可以在沒有 React 的情況下使用，但需要設定 JSX factory 指向 DOM API，並加入編譯步驟。如果你希望在 Vanilla JS 專案中使用 JSX 語法，這是一個可行但需要額外設定的選項。

這門課不使用建置流程，所以在這個課程的脈絡中，仍以 `<template>` 元素作為主要方式。

## 複習

### 建立 Shadow DOM 的兩種模式是什麼，它們控制什麼？

兩種模式分別是 open 和 closed，用來定義外部的 DOM 是否能夠存取 Web Component 的內部 DOM。

### 建立 Shadow DOM 後，內容通常應該附加到哪裡？

內容應該附加到 Shadow DOM，而不是作為子元素加入元件本身，因為 Shadow DOM 類似一個獨立的文件。

### Web Component 中 Shadow DOM 的主要特性是什麼？

Shadow DOM 在主文件中建立一個隔離的文件，其中定義的樣式只作用於該特定元素的範圍內。

### 在 Web Component 中，還有哪些替代方式可以定義 HTML template 的內容？

可以用 innerHTML 將 HTML 內容定義為字串，但這種方式無法獲得 IDE 的 HTML 驗證功能。

### 不使用 React，可以在 Web Component 中使用 JSX 嗎？

可以，JSX 不需要 React 就能使用，但需要加入建置流程，並將 JSX factory 設定為指向 DOM API。

## 小測驗

<details>
<summary>建立 Shadow DOM 時設定 mode 的目的是什麼？</summary>
定義外部是否可以存取內部 DOM
</details>

<details>
<summary>在 Web Component 中，Shadow DOM 通常在什麼時候建立？</summary>
在 constructor 中
</details>

<details>
<summary>Web Component 中的 Shadow Root 代表什麼？</summary>
存在於主文件中的一個隔離文件
</details>

<details>
<summary>建立 Shadow DOM 時使用哪個方法來附加它？</summary>
attachShadow()
</details>

<details>
<summary>Shadow DOM 內樣式的主要特性是什麼？</summary>
樣式只作用於該特定元素的範圍內
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記