---
title: '響應式渲染：監聽 Store 變動並動態產生選單 DOM'
description: '在 MenuPage 元件中監聽 Store 變動事件，實作渲染邏輯：判斷載入狀態、雙層迴圈渲染分類與商品，並透過 data attributes 把資料傳入子元件。'
date: 2026-07-12
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 26
chapter: 'Reactive Programming with Proxies'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - Proxy
  - ReactiveProgramming
  - WebComponents
---

# 響應式渲染：監聽 Store 變動並動態產生選單 DOM

> [[25-creating-a-proxy|上一篇]]用 Proxy 包裝了 Store，讓每次資料變動都能廣播對應的自訂事件。這篇回到 `MenuPage` 元件，監聽這個事件並實際把選單資料渲染到畫面上。

## 在 connectedCallback 中監聽資料變動

`MenuPage` 的 `connectedCallback` 除了複製 template 之外，還需要監聽 Store 的變動。當資料就緒時，呼叫 `render` 方法：

```javascript
connectedCallback() {
  const template = document.getElementById("menu-page-template");
  const content = template.content.cloneNode(true);
  this.root.appendChild(content);

  window.addEventListener("appmenuchange", () => {
    this.render();
  });
}
```

事件監聽掛在 `window` 上，因為 Proxy 是透過 `window.dispatchEvent` 廣播的，而 `window` 是整個應用程式唯一的全域物件，不受 Shadow DOM 的文件隔離影響。

## render 方法：判斷載入狀態與渲染內容

`render` 方法需要先確認資料是否已經就緒：

```javascript
render() {
  if (app.store.menu) {
    this.root.querySelector("#menu").innerHTML = "";

    for (let category of app.store.menu) {
      const liCategory = document.createElement("li");
      liCategory.innerHTML = `
        <h3>${category.name}</h3>
        <ul class='category'>
        </ul>
      `;
      this.root.querySelector("#menu").appendChild(liCategory);

      category.products.forEach(product => {
        const item = document.createElement("product-item");
        item.dataset.product = JSON.stringify(product);
        liCategory.querySelector("ul").appendChild(item);
      });
    } 
  } else {
    this.root.querySelector("#menu").innerHTML = "Loading...";
  }
}
```

選單資料的結構是：最外層是一個分類陣列，每個分類有 `name` 和 `products` 兩個欄位，每個 `products` 又是一個商品陣列。因此渲染邏輯是雙層迴圈：外層遍歷分類，內層遍歷每個分類的商品。

## 混合技術：innerHTML 與 createElement 並用

這段程式碼刻意示範了兩種建立 DOM 的方式混合使用：

`liCategory.innerHTML = \`... \``這種方式適合一次設定一個結構相對固定的 HTML 片段，用模板字串可以嵌入變數（例如`${category.name}`），寫法簡潔。

`document.createElement("product-item")` 這種方式適合需要後續操作的元素，例如設定 `dataset`、附加事件監聽器等。兩種方式可以在同一段程式碼中混用，沒有優劣之分，視情況選擇即可。

## 渲染前必須先清除舊內容

這是 Vanilla JS 中的常見陷阱。因為 `render` 可能被呼叫多次（例如資料更新時），每次都用 `appendChild` 而不清除前一次的內容，就會讓 DOM 不斷累積。

在開始 `appendChild` 之前，先把容器的 `innerHTML` 設為空字串：

```javascript
this.root.querySelector("#menu").innerHTML = "";
```

這樣就能確保每次渲染都從乾淨的狀態開始，不保留前一次的「Loading...」或任何舊節點。

## 把商品資料傳入子元件

每個商品會對應一個 `product-item` 自訂元素。要把商品資料傳進去，使用 `dataset` 屬性：

```javascript
item.dataset.product = JSON.stringify(product);
```

`dataset` 只能存字串，所以物件需要先用 `JSON.stringify` 序列化。這不是唯一的做法，也可以只傳 ID，讓元件自己去 Store 查詢詳細資料。這裡的目的是展示不同的傳遞方式。

`product-item` 這個自訂元素目前尚未被 `customElements.define` 註冊，所以目前在 DOM 中雖然看得到這個標籤和它的 `data-product` 屬性，但不會渲染任何內容。下一步就是建立並註冊這個元件。

## 複習

### 如何在 Web Component 的 render 方法中檢查選單是否已載入？

使用條件判斷檢查 menu 是否為 null。如果是 null，就渲染一個載入狀態（例如顯示「Loading...」的段落或圖片）；如果不是 null，則繼續進行選單項目的渲染。

### 在 Vanilla JavaScript 中，可以用哪些技術來動態建立 DOM 元素？

兩種主要技術是：
1. 使用 innerHTML 建立 HTML 字串並設定內容
2. 使用 document.createElement() 以程式方式建立個別元素並設定其屬性

### 為什麼在附加新元素之前，清除前一次的內容很重要？

清除舊內容可以防止舊元素不斷累積，例如附加新的選單項目時仍保留之前的「載入中」狀態。這確保了動態內容渲染有一個乾淨的起點。

### 如何將資料傳遞給自訂的 Web Component 元素？

使用 dataset 屬性以字串的形式傳遞資料。對於像商品這樣的複雜物件，可以先將物件序列化（stringify）或只傳遞唯一識別碼。然後透過 dataset.propertyName 將資料附加到自訂元素上。

### 建立自訂 HTML 元素時，有什麼重要的注意事項？

自訂 HTML 元素必須先完成註冊，才能被正確渲染。如果只用 document.createElement() 建立了一個尚未被定義的標籤，該元素在真正被 define 之前不會渲染任何內容。

## 小測驗

<details>
<summary>哪個方法可以用來動態修改 HTML 元素的內容？</summary>
innerHTML
</details>

<details>
<summary>如何將一個物件傳遞給自訂元素用於渲染？</summary>
使用 dataset.product 搭配 JSON.stringify()
</details>

<details>
<summary>在 Vanilla JavaScript 中附加新元素之前，有什麼重要的步驟？</summary>
清除容器中的舊內容
</details>

<details>
<summary>在 Web Component 開發中，使用自訂元素的目的是什麼？</summary>
建立可重用的 UI 元件
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記