---
title: '購物車邏輯與響應式徽章更新：Proxy、陣列不可變性與全域事件'
description: '實作購物車的新增與移除邏輯，說明 Proxy 無法偵測 push 操作的原因，並示範如何讓導覽列徽章響應式反映購物車數量。'
date: 2026-07-14
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 29
chapter: 'Reactive Programming with Proxies'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - Proxy
  - ReactiveProgramming
  - DOM
---

# 購物車邏輯與響應式徽章更新：Proxy、陣列不可變性與全域事件

> [[28-detailspage-component|上一篇]]完成了 `DetailsPage` 元件，並修正了 dataset 命名不一致的問題。這篇實作購物車的核心邏輯，同時揭示一個使用 Proxy 時的重要陷阱，並示範如何讓導覽列上的徽章對購物車變動做出即時反應。

## 建立 Order 服務

在 `services/` 資料夾中建立 `Order.js`，包含兩個函式：`addToCart` 和 `removeFromCart`。

```javascript
export async function addToCart(id) {
  const product = await getProductById(id);
  const results = app.store.cart.filter(
    prodInCart => prodInCart.product.id == id
  );

  if (results.length == 1) {
    // 商品已在購物車中，更新數量
    app.store.cart = app.store.cart.map(
      p => p.product.id == id
        ? { ...p, quantity: p.quantity + 1 }
        : p
    );
  } else {
    // 新增商品到購物車
    app.store.cart = [...app.store.cart, { product, quantity: 1 }];
  }
}

export function removeFromCart(id) {
  app.store.cart = app.store.cart.filter(
    p => p.product.id !== id
  );
}
```

## Proxy 的一個重要陷阱：修改陣列內容不等於改變屬性

在理解為什麼用 `push` 不行之前，先回想 Proxy 的運作方式：Proxy 的 `set` trap 在「某個屬性被賦予新的值」時觸發。

如果用 `app.store.cart.push(newItem)`，陣列的內容確實改變了，但 `cart` 這個屬性本身仍然指向同一個陣列物件，屬性並沒有被「賦予新的值」。Proxy 的 `set` trap 不會被觸發，所以不會廣播 `appcartchange` 事件，UI 也不會有任何反應。

解決方式是讓 `cart` 屬性指向一個全新的陣列：

```javascript
// 新增：展開舊陣列並加入新項目，建立全新陣列
app.store.cart = [...app.store.cart, { product, quantity: 1 }];

// 更新數量：map 本身就回傳新陣列
app.store.cart = app.store.cart.map(...);

// 刪除：filter 本身也回傳新陣列
app.store.cart = app.store.cart.filter(...);
```

這三種操作都是把一個新的陣列賦值給 `app.store.cart`，Proxy 的 `set` trap 因此能夠正確偵測到變動。Redux 和其他狀態管理方案也有同樣的要求，這不是 Vanilla JS 特有的限制，而是「如何讓 Proxy 或狀態監控機制感知到變動」的共同原則。

## 更新既有商品的數量

如果商品已在購物車中，用 `filter` 找到它確認存在後，用 `map` 建立新陣列，對符合的那一筆用展開語法建立新物件並遞增 `quantity`，其餘的原樣保留：

```javascript
app.store.cart = app.store.cart.map(
  p => p.product.id == id
    ? { ...p, quantity: p.quantity + 1 }
    : p
);
```

## 串接 addToCart 到元件

`addToCart` 需要在兩個地方被呼叫：

- `ProductItem.js` 的按鈕事件中：把之前的 TODO 換成 `addToCart(product.id)`
- `DetailsPage.js` 的「Add to Cart」按鈕事件中：同樣把 TODO 換成 `addToCart(this.product.id)`

由於用的是 ES 模組，`addToCart` 需要在各個使用的檔案中明確 `import`，不是全域函式。

## 讓導覽列的購物車徽章響應式更新

在 `app.js` 中監聽 `appcartchange` 事件，每次購物車變動就更新徽章的數字和顯示狀態：

```javascript
window.addEventListener("appcartchange", event => {
  const badge = document.getElementById("badge");
  const qty = app.store.cart.reduce(
    (acc, item) => acc + item.quantity, 0
  );
  badge.textContent = qty;
  badge.hidden = qty == 0;
});
```

計算購物車總數量時，不能直接用 `app.store.cart.length`，因為那只是「有幾種商品」，如果有 10 杯拿鐵，`length` 仍然是 1。正確的做法是用 `reduce` 把每個品項的 `quantity` 累加起來，得到總件數。

`badge.hidden = qty == 0` 這一行的作用是：購物車為空時隱藏徽章，避免顯示一個沒有意義的「0」在圖示旁邊。

## 整體響應式流程的串聯

現在整個資料流是：

1. 使用者點擊加入購物車按鈕
2. `addToCart` 建立一個包含新內容的新陣列並賦值給 `app.store.cart`
3. Proxy 的 `set` trap 偵測到 `cart` 屬性改變，廣播 `appcartchange` 事件
4. `app.js` 監聽到事件，計算總數量並更新徽章

這是這門課展示的 Vanilla JS 響應式程式設計的完整鏈路：Proxy 作為資料層的感知機制，自訂 DOM 事件作為廣播管道，各個元件和模組各自訂閱自己關心的事件，彼此不需要直接互相引用。

## 複習

### 使用 Proxy 時，如何偵測購物車陣列的變動？

當用 push 方法在陣列中新增元素時，Proxy 可能無法偵測到變動，因為陣列的引用沒有改變。要觸發 Proxy 的變動偵測，必須使用展開語法或 map()、filter() 等會回傳新陣列的方法來建立全新的陣列。

### 如何用函式型程式設計的方式計算購物車中商品的總數量？

使用 reduce() 方法從零開始累加總數量。reduce 方法會逐一取得每個購物車項目，將其 quantity 加到累加器上，最終得到所有項目的總件數。

### 建立像 appcartchange 這樣的自訂事件的目的是什麼？

這個自訂事件讓 Vanilla JavaScript 能夠實現響應式程式設計，每當購物車發生變動時廣播通知。這使得應用程式的不同部分可以監聽並回應購物車的更新，而不需要元件之間緊密耦合。

### 加入購物車的商品已經存在時，如何遞增其數量？

使用 map() 方法建立新陣列，檢查每個項目是否符合要加入的商品。如果符合，就回傳一個新物件並將 quantity 遞增 1；否則回傳原本的商品物件。

### 購物車為空時，如何隱藏購物車徽章？

當購物車總數量為零時，將徽章元素的 hidden 屬性設為 true。這可以避免在沒有商品時，購物車圖示旁顯示一個「0」。

## 小測驗

<details>
<summary>以何種方式將商品加入購物車，才能觸發 Proxy 的更新機制？</summary>
使用展開運算子建立新陣列
</details>

<details>
<summary>如何用函式型程式設計的方式計算購物車中商品的總數量？</summary>
使用 reduce() 累加數量
</details>

<details>
<summary>在這個狀態管理方式中，使用 Proxy 的目的是什麼？</summary>
偵測購物車陣列的變動
</details>

<details>
<summary>加入已存在於購物車中的商品時，如何更新數量？</summary>
建立一個數量遞增的新物件
</details>

<details>
<summary>自訂事件如何被用來更新購物車徽章？</summary>
透過監聽 appcartchange 事件
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記