---
title: '完成購物車頁面：CartItem 與 OrderPage 元件，以及元件註冊的關鍵機制'
description: '建立 CartItem 與 OrderPage 元件完成購物車 UI，並說明忘記 import 導致元件無法渲染的常見陷阱與解法。'
date: 2026-07-14
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 30
chapter: 'Reactive Programming with Proxies'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - WebComponents
  - DOM
  - ReactiveProgramming
---

# 完成購物車頁面：CartItem 與 OrderPage 元件，以及元件註冊的關鍵機制

> [[29-adding-items-to-the-order|上一篇]]完成了購物車的資料邏輯，並用 Proxy 和自訂事件讓徽章能夠即時更新數字。這篇把購物車的 UI 完成，建立顯示單筆商品的 `CartItem` 元件和整個訂單頁面的 `OrderPage` 元件，並說明一個只要在 Vanilla JS 中建立 Web Component 就會遇到的關鍵機制。

## CartItem 元件

`CartItem` 負責渲染購物車中的單筆商品，不使用 Shadow DOM，原因和 `ProductItem` 一樣：讓它共用父層容器的 CSS，不需要獨立的樣式封裝。

```javascript
import { removeFromCart } from "../services/Order.js";

export default class CartItem extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const item = JSON.parse(this.dataset.item);
    this.innerHTML = "";

    const template = document.getElementById("cart-item-template");
    const content = template.content.cloneNode(true);
    this.appendChild(content);

    this.querySelector(".qty").textContent = `${item.quantity}x`;
    this.querySelector(".name").textContent = item.product.name;
    this.querySelector(".price").textContent = `$${item.product.price.toFixed(2)}`;
    this.querySelector("a.delete-button").addEventListener("click", event => {
      removeFromCart(item.product.id);
    });
  }
}

customElements.define("cart-item", CartItem);
```

資料從 `dataset.item` 讀入並用 `JSON.parse` 還原成物件，再逐一填入對應欄位。刪除按鈕直接呼叫 `removeFromCart`，這個函式建立新陣列並賦值給 `app.store.cart`，觸發 Proxy 廣播 `appcartchange` 事件。

## OrderPage 元件

`OrderPage` 是頁面層級的元件，使用 Shadow DOM。它不依賴 HTML template 來建立基本骨架，而是直接在 constructor 中用 DOM API 建立 `section` 和 `style` 節點，再透過 Fetch 載入 CSS：

```javascript
constructor() {
  super();
  this.root = this.attachShadow({ mode: "open" });
  const styles = document.createElement("style");
  this.root.appendChild(styles);
  const section = document.createElement("section");
  this.root.appendChild(section);

  async function loadCSS() {
    const request = await fetch("/components/OrderPage.css");
    styles.textContent = await request.text();
  }
  loadCSS();
}
```

`connectedCallback` 中，除了呼叫 `render` 之外，也監聽 `appcartchange` 事件，讓購物車每次變動都能觸發重新渲染：

```javascript
connectedCallback() {
  window.addEventListener("appcartchange", () => {
    this.render();
  });
  this.render();
}
```

`render` 方法根據 `app.store.cart` 的狀態決定顯示內容：空購物車顯示提示文字，否則渲染商品清單和表單。每筆商品對應一個 `cart-item` 自訂元素，用 `dataset.item` 傳入序列化的商品資料：

```javascript
const item = document.createElement("cart-item");
item.dataset.item = JSON.stringify(prodInCart);
this.root.querySelector("ul").appendChild(item);
```

總金額用迴圈累加後直接寫入 HTML 字串。

## 常見陷阱：忘記 import 導致元件無法渲染

加入 `CartItem` 後，發現購物車頁面可以看到 `cart-item` 標籤出現在 DOM 中，但完全是空的，也沒有錯誤訊息。這是 Vanilla JS 中每次新增 Web Component 都會碰到的問題。

瀏覽器在遇到它不認識的 HTML 標籤時，不會報錯，而是把它當成一個空的未知元素放入 DOM，什麼都不渲染。要讓瀏覽器知道這個標籤對應到哪個類別，必須讓 `customElements.define` 被執行。而 `define` 只有在對應的 JavaScript 模組被執行的情況下才會跑到，而模組只有在被 `import` 的時候才會執行。

所以只要在 `app.js`（或任何已在 import 鏈上的檔案）中加一行：

```javascript
import CartItem from "./components/CartItem.js";
```

這個 import 就算看起來沒有在用 `CartItem` 這個名稱，它的「副作用」是讓瀏覽器執行這個模組，從而執行 `customElements.define("cart-item", CartItem)`，瀏覽器才知道這個標籤的存在。

## 避免忘記 import 的設計建議

講師提出一個解法：把所有 `customElements.define` 的呼叫集中到 `app.js` 或一個專門的 `components.js` 或 `register.js` 裡，這樣你就不可能忘記 import，因為定義和 import 是放在同一個地方的。

不把 `define` 和類別定義放在同一個檔案裡，雖然有點反直覺，但它讓元件的「建立」和「註冊」分離，讓你有一個中心化的地方管理所有元件的註冊。Angular 要求你在 `@NgModule` 的 `declarations` 陣列中列出所有元件，否則也不能用，這和這個問題的本質一樣：使用前必須明確「告知」框架或瀏覽器這個元件的存在。

## 多個監聽器監聽同一個 window 事件

現在有兩個地方都在監聽 `appcartchange`：`app.js`（更新徽章）和 `OrderPage`（重新渲染商品清單）。兩者都能同時正常運作，因為它們都是監聽 `window` 上的事件。

這裡的關鍵在於要用 `window` 而不是 `document`：`OrderPage` 使用了 Shadow DOM，它有自己獨立的 document，`document.addEventListener` 只能在自己的 document 範圍內監聽，不能跨 Shadow DOM 通訊。`window` 是整個應用程式共用的，才能讓不同 DOM 樹中的元件都能監聽到同一個廣播。

## 複習

### 重複使用的 Web Component 不使用 Shadow DOM 的目的是什麼？

為了在頁面內共用同一個 document 和 CSS，讓這些元件可以使用相同的樣式和文件情境

### 即使自訂元素的 HTML 已經在 DOM 中，為什麼還需要 import Web Component 的 JavaScript 檔案？

為了執行 customElements.define()，這個呼叫才能讓瀏覽器認識這個自訂元素，進而啟用它的渲染和功能

### 當自訂元素沒有被正確 import 和定義時，會發生什麼？

瀏覽器會把這個元素放入 DOM，但它是空的、沒有任何功能，同時不會拋出任何錯誤

### 確保 Web Component 被正確註冊的建議做法是什麼？

在中心化的檔案（例如 app.js 或專用的 components.js）中 import 並定義所有自訂元素，確保它們都會被執行

### 如何讓不同元件都能監聽同一個事件？

使用 window 事件，它可以在不同的 DOM 之間共用，確保 app.js 和訂單頁面等不同元件能同步更新

## 小測驗

<details>
<summary>為什麼 Web Component 的 HTML 已存在，但仍可能在瀏覽器中沒有渲染？</summary>
自訂元素尚未透過 customElements.define() 完成註冊
</details>

<details>
<summary>確保 Web Component 被載入的建議方式是什麼？</summary>
在 app.js 中 import 並定義元件
</details>

<details>
<summary>建立重複使用的 Web Component 時，為什麼選擇不使用 Shadow DOM？</summary>
為了讓各元件之間共用 CSS 和 document 情境
</details>

<details>
<summary>當自訂元素沒有透過 customElements.define() 定義時，會發生什麼？</summary>
瀏覽器渲染一個空元素，不報錯
</details>

<details>
<summary>import 一個 JavaScript 模組如何幫助 Web Component 完成註冊？</summary>
import 的副作用會觸發模組執行，進而執行 customElements.define()
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記