---
title: 'DetailsPage 元件：複用既有模式與調試 dataset 命名'
description: '建立 DetailsPage 元件，沿用 Shadow DOM 與 Fetch CSS 的模式，並排查 dataset 屬性命名不一致造成商品 ID 讀取失敗的問題。'
date: 2026-07-13
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 28
chapter: 'Reactive Programming with Proxies'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - WebComponents
  - DOM
---

# DetailsPage 元件：複用既有模式與調試 dataset 命名

> [[27-productitem-component|上一篇]]建立了 `ProductItem` 元件，解決了連結內嵌按鈕的事件衝突，並完成了依 ID 查找商品的邏輯。這篇接續建立 `DetailsPage` 元件，內容大量沿用之前頁面元件的模式，重點放在一個實際遇到的命名不一致問題，以及如何排查。

## DetailsPage 的結構

`DetailsPage` 是一個頁面層級的元件，因此使用 Shadow DOM，做法和之前的 `MenuPage` 相同：

```javascript
export default class DetailsPage extends HTMLElement {
  constructor() {
    super();

    this.root = this.attachShadow({ mode: "open" });

    const template = document.getElementById("details-page-template");
    const content = template.content.cloneNode(true);
    const styles = document.createElement("style");
    this.root.appendChild(content);
    this.root.appendChild(styles);

    async function loadCSS() {
      const request = await fetch("/components/DetailsPage.css");
      styles.textContent = await request.text();
    }
    loadCSS();
  }

  async renderData() {
    if (this.dataset.productId) {
      this.product = await getProductById(this.dataset.productId);
      this.root.querySelector("h2").textContent = this.product.name;
      this.root.querySelector("img").src = `/data/images/${this.product.image}`;
      this.root.querySelector(".description").textContent = this.product.description;
      this.root.querySelector(".price").textContent = `$ ${this.product.price.toFixed(2)} ea`;
      this.root.querySelector("button").addEventListener("click", () => {
        // TODO addToCart(this.product.id);
        app.router.go('/order');
      });
    } else {
      alert("Invalid Product ID");
    }
  }

  connectedCallback() {
    this.renderData();
  }
}

customElements.define("details-page", DetailsPage);
```

constructor 的內容和之前的頁面元件幾乎一致：建立 Shadow DOM、克隆 template、用 Fetch 載入外部 CSS 並注入。`connectedCallback` 中只呼叫了 `renderData`，把渲染邏輯獨立成一個方法，便於閱讀。

## renderData 的核心邏輯

`renderData` 檢查 `this.dataset.productId` 是否存在，存在的話呼叫 `getProductById` 取得商品資料（這個函式如果選單尚未載入，內部會先 `await loadData()`），然後逐一把商品的名稱、圖片、描述和價格填入 template 對應的元素中，並為「Add to Cart」按鈕掛上點擊事件（加入購物車的邏輯目前先留 TODO，先導向訂單頁）。

## 排查一個實際的命名不一致問題

把程式碼貼上後，畫面跳出了「Invalid Product ID」的警示，代表 `this.dataset.productId` 是 `undefined`。

問題出在哪裡？回頭檢查 Router 中建立 `details-page` 元素時所設定的 dataset 屬性名稱：

```javascript
pageElement.dataset.id = paramId;
```

這裡設定的屬性叫做 `id`，對應到 DOM 中就是 `data-id`，而不是 `data-product-id`。但在 `DetailsPage` 元件中讀取的卻是 `this.dataset.productId`，兩者名稱不一致，自然讀不到值。

排查的方式是直接打開 DevTools 檢查 DOM，確認實際渲染出來的 attribute 名稱（`data-id`），再回去比對程式碼中讀取的屬性名稱是否一致。

修正的方式是統一命名，把 Router 中設定 dataset 的那一行改成：

```javascript
pageElement.dataset.productId = paramId;
```

這樣 `dataset.productId` 就能對應到 `data-product-id`，與 `DetailsPage` 元件中讀取的屬性名稱一致。

## 小結

這次的問題不是邏輯錯誤，而是命名不一致導致的資料對不上。這提醒了一個實務上的習慣：在不同檔案之間透過 `dataset` 傳遞資料時，屬性名稱必須在設定端和讀取端保持完全一致，DevTools 的 Elements 面板是排查這類問題最直接的工具。

修正後，從首頁點選商品就能正確進入該商品的詳細頁，畫面上會顯示對應的名稱、圖片、描述和價格，並有一個目前還沒完整實作的「Add to Cart」按鈕（會先把使用者導向訂單頁）。

## 複習

### 在 DetailsPage.js 元件中使用 Shadow DOM 的目的是什麼？

Shadow DOM 用來建立一個與主文件 DOM 分離的封裝 DOM 樹，有助於隔離樣式，避免元件之間的樣式衝突

### 在 DetailsPage 元件中，用什麼方法來處理資料的渲染？

使用 renderData 方法，檢查 dataset 中是否設定了商品 ID，並渲染對應的商品詳細資訊

### 載入元件的 template 和樣式經過哪些步驟？

元件會克隆 template、載入 template 的內容，並套用 CSS 樣式，藉此建立元件的視覺結構

### 從首頁選取商品時會發生什麼動作？

從首頁選取商品時，使用者會被導向該特定商品的詳細頁面

## 小測驗

<details>
<summary>DetailsPage.js 元件中使用了什麼 DOM 技術？</summary>
Shadow DOM
</details>

<details>
<summary>connectedCallback() 方法的主要用途是什麼？</summary>
渲染 template 並載入樣式
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記