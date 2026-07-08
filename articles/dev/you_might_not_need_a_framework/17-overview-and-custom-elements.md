---
title: 'Web Components 與 Custom Elements：瀏覽器原生的元件化方式'
description: '介紹 Web Components 的核心概念與組成標準，說明 Custom Elements 的建立方式、命名規則、生命週期方法，以及 Slot 與 data attributes 的使用。'
date: 2026-07-08
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 17
chapter: 'Web Components'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - WebComponents
  - DOM
---

# Web Components 與 Custom Elements：瀏覽器原生的元件化方式

> [[16-dynamic-routing|上一篇]]完成了 Router 的實作，頁面已經可以根據 URL 切換。接下來要讓每個頁面有實際的內容，這就是引入 Web Components 的時機。

## 什麼是 Web Component？

Web Component 是一個讓你可以建立自己的自訂 HTML 標籤的瀏覽器原生機制，簡單來說就是「你自己的 HTML 元素」。它是一種模組化、可重用的 UI 構建方式，封裝了相關的功能與介面。

這個概念和 React、Angular、Vue 的元件想法很相近，但它是瀏覽器的標準功能，不依賴任何函式庫。目前已在所有現代瀏覽器中獲得支援。

「Web Components」這個詞其實是一個傘型術語，底下包含了幾個可以獨立或搭配使用的標準：

- **Custom Elements**：本篇重點，讓你定義新的 HTML 標籤
- **HTML Templates**：下一節會介紹
- **Shadow DOM**：下一節會介紹
- **Declarative Shadow DOM**：非常新，Safari 才剛加入支援，這門課不使用

如何定義和組合這三個標準，沒有唯一正確的方式，有相當大的自由度。

## Custom Elements：定義自訂 HTML 標籤

Custom Element 是讓你用 JavaScript 定義一個新的、可重用的 HTML 元素的機制。建立方式是撰寫一個繼承自 `HTMLElement` 的類別，然後透過 `customElements.define` 向瀏覽器註冊：

```javascript
class MyElement extends HTMLElement {
  constructor() {
    super();
    // 設定初始狀態、事件監聽器等
  }
}

customElements.define("my-element", MyElement);
```

註冊後，你可以直接在 HTML 中使用這個標籤，或是透過 DOM API 建立：

```html
<my-element></my-element>
```
```javascript
document.createElement("my-element");
```

你也可以繼承自更具體的介面，例如 `HTMLHeadingElement`，而不只是 `HTMLElement`，但這取決於你的需求。

## 標籤名稱必須含有連字號

自訂元素的標籤名稱**必須包含至少一個連字號（`-`）**，這是規格強制要求的。原因是 W3C 承諾未來定義的原生 HTML 標籤不會使用連字號，因此含有連字號的名稱可以確保永遠不會和未來的標準元素衝突，這是向後相容的設計。

## 傳遞屬性：使用 data attributes

HTML 的屬性只能是字串，不能傳入 JavaScript 物件。因此，自訂元素的屬性通常使用 `data-*` 規格來定義：

```html
<my-element data-language="en"></my-element>
```

在元件類別內部，透過 `this.dataset` 來存取：

```javascript
constructor() {
  super();
  const lang = this.dataset.language;
}
```

如果你需要傳入更複雜的資料（例如物件），只能在 JavaScript 中直接設定類別的屬性，不能從 HTML 中傳入，因為 HTML 本身只接受字串。

## 生命週期方法

Custom Elements 提供幾個可以覆寫的生命週期方法：

```javascript
class MyElement extends HTMLElement {
  constructor() {
    super();
    // 設定初始狀態與事件監聽器
  }

  connectedCallback() {
    // 元素被加入到文件中時觸發
  }

  disconnectedCallback() {
    // 元素被從文件中移除時觸發
  }

  adoptedCallback() {
    // 元素被移動到另一個 document 時觸發（不常見）
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // 元素的屬性發生變化時觸發
  }
}
```

實務上最常用的是 `connectedCallback`，它是元件進入 DOM 時的入口，相當於「元件被掛載」的時機。

`adoptedCallback` 觸發的時機是元素在不同 document 之間移動，這和 Shadow DOM 有關，目前不需要深入理解。

`attributeChangedCallback` 在屬性值改變時觸發，收到屬性名稱、舊值和新值三個參數。

## Slot：讓元件接收子元素

Slot 是讓元件使用者能夠傳入子元素的機制，類似其他框架的 `children` 或 child props。在 HTML 中，你可以把任意內容放在自訂元素的標籤內：

```html
<my-element>
  <div>
    <h2>Slot of My Element</h2>
  </div>
</my-element>
```

搭配 HTML Templates（下一節會介紹），還可以定義多個具名 slot，例如 header、main content、footer，讓元件的使用者決定各個區域的內容。

## Customized Builtins：目前不建議使用

這個進階功能允許你繼承現有的 HTML 元素（例如 `ul`）並在 HTML 中透過 `is` 屬性使用：

```html
<div is="my-element"></div>
```

但這個功能目前在 Safari 中不支援，因此在需要 Safari 相容性的專案中應避免使用，改用自訂標籤名稱（`<my-element>`）的方式。

## 複習

### Web Component 的主要定義是什麼？

一種模組化、可重用的 Web 開發構建單元，封裝了一組相關的功能與使用者介面元素

### 建立自訂 HTML 元素時，標籤命名有什麼規定？

標籤名稱必須包含連字號，以確保未來相容性並與標準 HTML 元素區分開來

### Web Components 由哪三個主要標準組成？

Custom Elements、HTML Templates 和 Shadow DOM

### Web Component 中 connectedCallback() 生命週期方法的用途是什麼？

當元素被加入到文件中時觸發，作為元件進入 DOM 時執行相關操作的入口

### 在 Web Components 的情境中，slot 是什麼？

一種讓自訂元素接收和管理子元素的機制，類似其他框架中的 children 或 child props，可以用來定義元件內的多個內容區域

## 小測驗

<details>
<summary>自訂 Web Component 標籤命名的強制要求是什麼？</summary>
標籤名稱必須包含連字號
</details>

<details>
<summary>建立 Custom Element 時，類別必須繼承哪個類別？</summary>
HTMLElement
</details>

<details>
<summary>Web Component 的主要用途是什麼？</summary>
建立模組化、可重用的 Web 開發構建單元
</details>

<details>
<summary>Web Components 中最常使用的生命週期方法是哪一個？</summary>
connectedCallback
</details>

<details>
<summary>Web Components 由哪三個主要標準組成？</summary>
Custom Elements、HTML Templates 和 Shadow DOM
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記