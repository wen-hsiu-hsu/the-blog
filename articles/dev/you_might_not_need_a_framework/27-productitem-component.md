---
title: 'ProductItem 元件與事件目標判斷：event.target 與 event.currentTarget'
description: '建立 ProductItem 元件，處理連結內嵌按鈕的事件衝突，並實作依商品 ID 查找資料的非同步函式。'
date: 2026-07-13
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 27
chapter: 'Reactive Programming with Proxies'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - WebComponents
  - EventListener
---

# ProductItem 元件與事件目標判斷：event.target 與 event.currentTarget

> [[26-rendering-the-menu|上一篇]]在 `MenuPage` 中渲染出了每個分類，但每個商品對應的 `product-item` 元件還沒有被定義。這篇建立這個子元件，並處理一個常見的事件衝突問題：連結內嵌套按鈕時，點擊行為該如何正確分流。

## 建立 ProductItem 元件

`ProductItem.js` 的結構和之前建立的元件大致相同，使用前面已經熟悉的技巧：

```javascript
export default class ProductItem extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const template = document.getElementById("product-item-template");
    const content = template.content.cloneNode(true);
    this.appendChild(content);

    const product = JSON.parse(this.dataset.product);
    this.querySelector("h4").textContent = product.name;
    this.querySelector("p.price").textContent = `$${product.price.toFixed(2)}`;
    this.querySelector("img").src = `data/images/${product.image}`;
    this.querySelector("a").addEventListener("click", event => {
      if (event.target.tagName.toLowerCase() == "button") {
        // TODO 加入購物車
      } else {
        app.router.go(`/product-${product.id}`);
      }
      event.preventDefault();
    });
  }
}

customElements.define("product-item", ProductItem);
```

這個元件沒有建立 Shadow DOM，這是有意為之，元件直接附加到自己本身（`this`），共用父層頁面元件的樣式表。

`connectedCallback` 中先複製 template，再用 `JSON.parse` 把先前用 `dataset.product` 傳入的字串還原成物件，接著用 `querySelector` 找到 template 內各個對應的元素，逐一填入內容。這不是用一整段 HTML 字串覆寫，而是逐項填空。

跟之前一樣，元件建立完成後必須記得在 `app.js` 中加入 import，否則瀏覽器永遠不會執行這個檔案，自訂標籤也就不會被註冊。

## 連結內嵌按鈕的事件衝突問題

template 的結構中，整個商品列其實是一個 `<a>` 連結，圖片和資訊都包在裡面，同時裡面還有一個按鈕（用於加入購物車）。

問題是：當使用者點擊那個按鈕時，因為按鈕在連結裡面，外層連結的點擊事件也會一起觸發，導致使用者點按鈕卻意外被導向商品詳細頁。

### 解法：event.target 與 event.currentTarget 的差異

事件監聽器是綁定在 `<a>` 元素上的，所以：

- `event.currentTarget` 永遠是事件監聽器所掛載的元素，在這裡就是這個 `<a>` 連結
- `event.target` 是使用者實際點擊的最底層元素，可能是連結內任何一個子元素，例如 `<h4>`、`<button>`，或連結本身

利用這個差異，可以判斷使用者實際點到了什麼，再決定要執行哪個行為：

```javascript
this.querySelector("a").addEventListener("click", event => {
  if (event.target.tagName.toLowerCase() == "button") {
    // 點到按鈕，加入購物車邏輯（後面章節會補上）
  } else {
    // 點到其他地方，導向商品詳細頁
    app.router.go(`/product-${product.id}`);
  }
  event.preventDefault();
});
```

`event.preventDefault()` 阻止連結的預設導覽行為，確保所有跳轉都透過 Router 處理，而不是讓瀏覽器直接發出新的請求。

## 依商品 ID 查找商品

`ProductItem` 連到商品詳細頁時，傳遞的是商品 ID（而不是整個商品物件），詳細頁需要自己根據 ID 找到對應的商品資料。這個邏輯寫在 `Menu.js` 的 `getProductById` 函式：

```javascript
export async function getProductById(id) {
  if (app.store.menu == null) {
    await loadData();
  }

  for (let c of app.store.menu) {
    for (let p of c.products) {
      if (p.id == id) {
        return p;
      }
    }
  }
}
```

這個函式設計為 `async`，原因是：如果使用者直接用深度連結進入詳細頁，而不是先經過首頁，這時 `app.store.menu` 可能還是 `null`，尚未載入過任何資料。函式會先檢查這個狀態，如果是 `null` 就先 `await loadData()` 把資料載入完成，再繼續往下執行。

實際的查找邏輯很直接：用兩層迴圈，逐一檢查每個分類底下每個商品的 ID 是否相符，找到就回傳該商品物件，沒有對應的特殊處理就代表沒找到。

## 複習

### 如何防止連結內嵌按鈕被點擊時觸發連結本身的事件處理函式？

使用 event.target 檢查被點擊元素的標籤名稱。如果目標是按鈕，就阻止連結的預設導覽行為，改為執行按鈕對應的操作

### event.target 與 event.currentTarget 的差異是什麼？

event.currentTarget 是事件監聽器所掛載的元素，而 event.target 是使用者實際點擊的特定元素，可能是 currentTarget 內部的某個子元素

### 使用 data-set 屬性時，可以儲存哪種類型的資料？

使用 data-set 屬性時，只能儲存字串資料。若要傳遞物件等複雜資料型別，需要用 JSON.parse() 將字串還原為物件

### 如何從分類與商品的陣列中，根據 ID 找到特定商品？

逐一遍歷每個分類及其商品，檢查商品的 ID 是否符合所要找的 ID，找到就回傳該商品，否則回傳 null

### 當選單資料尚未載入時，要如何根據 ID 查找商品？

先檢查選單是否為 null，如果是，可以先 await 載入原始資料，或是實作一個延遲載入（lazy loading）的 getter，在第一次存取時才載入資料

## 小測驗

<details>
<summary>當按鈕位於連結元素內部時，用什麼方法來處理事件冒泡的問題？</summary>
檢查 event.target.tagName 來阻止連結的導覽行為
</details>

<details>
<summary>在 ProductItem 元件中，商品資料最初是如何被傳遞進來的？</summary>
透過 dataset 以字串的形式傳遞
</details>

<details>
<summary>根據商品 ID 查找商品時，使用了什麼做法？</summary>
使用一個會遍歷各分類的非同步函式
</details>

<details>
<summary>在區分 event.target 和 event.currentTarget 時，展示了什麼與 DOM 相關的概念？</summary>
事件冒泡
</details>

<details>
<summary>當選單資料一開始可能尚未載入時，建議用什麼技巧來處理？</summary>
使用延遲載入（lazy loading）的 getter
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記