---
title: '實作 Router 的頁面渲染邏輯：切換路由與清除容器'
description: '完成 Router 的 go 函式核心邏輯，包含根據路由建立 DOM 元素、清除容器的兩種方式，以及無效路由處理與切換後的捲動重置。'
date: 2026-07-07
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 15
chapter: 'Routing'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - Router
  - DOM
---

# 實作 Router 的頁面渲染邏輯：切換路由與清除容器

> [[14-spa-router-from-scratch|上一篇]]建立了 Router 的基本結構，實作了連結攔截與 History API 的推送。這篇繼續完成 `go` 函式的核心邏輯：根據路由建立對應的 DOM 元素並注入頁面，同時處理幾個常見的實作細節。

## 根據路由決定要渲染的元素

`go` 函式在更新 URL 之後，還需要決定要把什麼東西顯示在畫面上。這裡用 `switch` 對路由進行判斷，每個 case 負責建立對應的頁面元素：

```javascript
go: (route, addToHistory = true) => {
  if (addToHistory) {
    history.pushState({ route }, '', route);
  }

  let pageElement = null;

  switch (route) {
    case "/":
      pageElement = document.createElement("h1");
      pageElement.textContent = "Menu";
      break;
    case "/order":
      pageElement = document.createElement("h1");
      pageElement.textContent = "Your Order";
      break;
  }

  if (pageElement) {
    const cache = document.querySelector("main");
    cache.innerHTML = "";
    cache.appendChild(pageElement);
    window.scrollTo(0, 0);
  }
}
```

`document.createElement` 建立的元素一開始只存在於記憶體中，不在 DOM 裡。呼叫 `appendChild` 之後，它才被插入 DOM，瀏覽器在執行緒釋放後會更新畫面。

## 常見問題：重複注入，舊內容沒有清除

如果只寫 `appendChild` 而沒有先清除容器，每次路由切換都會把新元素疊加在舊元素後面，畫面上會看到「Menu、Your Order、Menu、Your Order」這樣的累積結果。在 Vanilla JS 中，你需要自己管理這件事，框架不會幫你做。

## 清除容器的兩種方式

**方式一：直接清空 innerHTML（快速簡便）**

```javascript
cache.innerHTML = "";
```

這是最直接的方式，把 `innerHTML` 設為空字串會移除容器內的所有子元素。缺點是這個操作不區分內容是什麼，如果容器內的元素有附掛事件監聽器，這些監聽器不會被主動移除，只是元素從 DOM 中消失了。對於這個應用程式的規模，這個方式可以接受。

**方式二：移除第一個子元素**

```javascript
document.querySelector("main").children[0].remove();
```

這個方式透過 `children` 屬性取得第一個 DOM 元素並移除它。這裡有一個值得注意的細節：`children` 和 `childNodes` 看起來很像，但行為不同：

- `children` 回傳的是 `HTMLCollection`，只包含實際的 DOM 元素
- `childNodes` 回傳的是 `NodeList`，會包含文字節點、換行字元和 HTML 註解

因為 HTML 中的換行字元也會被視為文字節點，如果用 `childNodes[0]` 可能取到的是空白而不是你預期的元素，所以這裡應該用 `children`。

如果這個判斷需要執行多次，可以將查詢結果快取到變數中，避免重複查詢 DOM：

```javascript
const cache = document.querySelector("main");
cache.innerHTML = "";
cache.appendChild(pageElement);
```

## 處理無效路由

如果 `switch` 沒有匹配到任何路由，`pageElement` 會維持 `null`。這時有幾個選擇：什麼都不做、在 console 輸出錯誤，或是建立一個客戶端的 404 頁面元素。無論選哪種，都應該用 `if (pageElement)` 判斷後再執行注入，避免把 `null` 傳給 `appendChild`。

## 切換路由後重置捲動位置

```javascript
window.scrollTo(0, 0);
```

如果頁面內容很長，使用者滾動到一半後切換路由，捲動位置不會自動回到頂部，新頁面會從使用者上次的位置開始顯示。加上這兩行，確保每次路由切換後都從頁面頂端開始，水平和垂直都重置。

## 複習

### 哪個方法可以在不需要對應伺服器路由的情況下，操控瀏覽器的 URL？

history.pushState() 可以在不需要對應伺服器路由的情況下，模擬 URL 並修改瀏覽器網址列的內容

### 在 Vanilla JavaScript 中，如何建立一個新的 HTML 元素？

使用 document.createElement() 並傳入標籤名稱，建立的元素一開始只存在於記憶體中

### DOM 操作中，children 與 childNodes 的差異是什麼？

children 回傳只包含 DOM 元素的 HTMLCollection；childNodes 回傳的 NodeList 還會包含文字節點、換行字元和 HTML 註解

### 在 Single Page Application 中，為什麼注入新內容之前要先清除容器？

為了避免前一個頁面的元素不斷累積，以及防止重複內容或意外的事件監聽器殘留

### 在 Single Page Application 中切換路由時，應如何處理捲動位置？

將 scrollX 和 scrollY 都設為零，確保使用者在路由切換後看到的是頁面頂端

## 小測驗

<details>
<summary>哪個方法可以在不觸發頁面重新載入的情況下，操控瀏覽器的 URL？</summary>
history.pushState()
</details>

<details>
<summary>在 JavaScript 中，建立新 HTML 元素的主要方法是什麼？</summary>
createElement()
</details>

<details>
<summary>DOM 操作中，children 與 childNodes 的差異是什麼？</summary>
children 只回傳 HTML 元素；childNodes 還會包含文字節點和註解節點
</details>

<details>
<summary>哪個方法可以快速清除一個 DOM 元素內的所有內容？</summary>
element.innerHTML = ''
</details>

<details>
<summary>切換路由後，為什麼建議重置捲動位置？</summary>
確保使用者在新頁面中從頂端開始瀏覽
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記