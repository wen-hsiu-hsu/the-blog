---
title: '建立第一個 Web Component：頁面元件的實作起點'
description: '實作 Coffee Masters 的三個頁面元件，說明 Custom Element 的建立流程、import 鏈與元件註冊的關係，以及如何將自訂元素接入 Router。'
date: 2026-07-10
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 21
chapter: 'Web Components'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - WebComponents
  - DOM
  - Router
---

# 建立第一個 Web Component：頁面元件的實作起點

> 前幾篇完整介紹了 Web Components 的三個組成標準：Custom Elements、HTML Templates 和 Shadow DOM。這篇開始實際建立元件，為 Coffee Masters 的三個頁面（選單、訂單、商品詳細）各自建立對應的 Custom Element，並把它們接入 Router。

## 建立 MenuPage 元件

在 `components/` 資料夾中建立 `MenuPage.js`：

```javascript
class MenuPage extends HTMLElement {
  constructor() {
    super();
  }
}

customElements.define("menu-page", MenuPage);

export default MenuPage;
```

幾個重點：

- 類別必須繼承 `HTMLElement`
- constructor 中必須呼叫 `super()`，這是強制要求，不呼叫的話部分元素會出現問題
- `customElements.define` 向瀏覽器註冊這個新的標籤名稱
- 記得 export，讓其他模組可以 import 這個類別

以同樣的方式建立 `DetailsPage.js`（對應 `details-page`）和 `OrderPage.js`（對應 `order-page`），注意每個標籤名稱必須唯一，不能重複定義同一個名稱。

## 瀏覽器如何認識新元素：import 鏈的重要性

如果你在 HTML 中直接寫 `<menu-page></menu-page>`，瀏覽器不會知道它是什麼，只會把它當成一個未知的元素存入 DOM 但不做任何處理。

要讓瀏覽器認識這個元素，必須讓對應的 JavaScript 模組被載入並執行。方法很簡單：在 `app.js` 中 import 這些元件：

```javascript
import MenuPage from "./components/MenuPage.js";
import DetailsPage from "./components/DetailsPage.js";
import OrderPage from "./components/OrderPage.js";
```

當瀏覽器載入並執行 `app.js` 時，它會循著 import 鏈依序載入並執行這些模組。每個模組執行時，`customElements.define` 就會被呼叫，瀏覽器從此認識這些新標籤。

注意：你在 `app.js` 中不一定需要直接用到這些 import 進來的類別，但 import 這個動作本身就足以觸發模組的執行與元件的註冊。

## 在 Router 中使用 Custom Elements

原本 Router 在頁面切換時建立的是 `h1` 元素，現在可以改成建立對應的自訂元素：

```javascript
case "/":
  pageElement = document.createElement("menu-page");
  break;
case "/order":
  pageElement = document.createElement("order-page");
  break;
default:
  if (route.startsWith("/product-")) {
    pageElement = document.createElement("details-page");
    pageElement.dataset.id = route.substring(route.lastIndexOf("-") + 1);
  }
  break;
```

`document.createElement` 可以接受任何已經向 `customElements` 註冊過的標籤名稱。這些自訂元素目前內部仍然是空的（尚未加入 template），但它們已經可以被建立、插入 DOM 並在路由切換時正確替換。

## 關於 Web Components 與 SEO

有學員詢問 Web Components 是否影響 SEO。講師的看法是：這個問題本質上和「所有 SPA 與 SEO 的關係」是同一個問題。就 Web Components 本身而言，如果你使用 template 的方式，HTML 結構本來就在頁面的 HTML 中，影響並不比不用 Web Components 更大。現代搜尋引擎通常能夠處理客戶端渲染的內容，除非渲染時間極長，否則一般不會對 SEO 有負面影響。

## 複習

### 構成 Web Component 的三個關鍵技術是什麼？

Custom Elements、Template 和 Shadow DOM

### 定義自訂 HTML 元素的關鍵方法是什麼？

使用 customElements.define() 以特定的標籤名稱註冊新元素

### 為什麼在 Web Component 的 constructor 中呼叫 super() 很重要？

呼叫 super() 確保父類別 HTMLElement 被正確初始化，避免元素功能出現潛在問題

### 如何讓 Web Component 的 JavaScript 檔案可以在 HTML 中使用？

在另一個 JavaScript 檔案（例如 app.js）中 import 這個 Web Component 檔案，這樣瀏覽器就會載入並執行該模組，從而完成自訂元素的註冊

### Web Components 如何影響瀏覽器渲染和 SEO？

現代搜尋引擎通常夠聰明，足以處理 Web Components，除非渲染時間極長，否則它們不會對 SEO 產生明顯的負面影響

## 小測驗

<details>
<summary>建立 Web Component 的第一步是什麼？</summary>
建立一個繼承自 HTMLElement 的類別
</details>

<details>
<summary>當瀏覽器遇到未知的自訂元素時會發生什麼？</summary>
它會忽略該元素
</details>

<details>
<summary>在 Web Component 的 constructor 中必須呼叫哪個方法？</summary>
super()
</details>

<details>
<summary>如何定義一個新的 HTML 自訂元素？</summary>
使用 customElements.define()
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記