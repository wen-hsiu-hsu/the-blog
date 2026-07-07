---
title: '完成 Router：動態路由參數、popstate 監聽與瀏覽器歷史導覽'
description: '完成 Router 的剩餘邏輯，包含用字串方法處理動態路由參數、透過 data attributes 傳遞 ID，以及監聽 popstate 事件讓瀏覽器歷史導覽正確更新頁面內容。'
date: 2026-07-07
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 16
chapter: 'Routing'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - Router
  - DOM
  - HistoryAPI
---

# 完成 Router：動態路由參數、popstate 監聽與瀏覽器歷史導覽

> [[15-changing-dom-element-content|上一篇]]實作了基本的路由切換與容器清除邏輯。這篇完成 Router 剩餘的兩個部分：處理帶有動態 ID 的路由（例如 `/product-123`），以及監聽 `popstate` 事件讓瀏覽器的上一頁、下一頁按鈕能夠正確切換頁面內容。

## 處理動態路由：帶有 ID 的路徑

產品詳細頁的 URL 格式是 `/product-{id}`，這種模式不適合用 `switch` 的 case 一一列舉，講師選擇用基本的字串方法來處理，不使用正規表達式：

```javascript
default:
  if (route.startsWith("/product-")) {
    pageElement = document.createElement("h1");
    pageElement.textContent = "Details";

    const paramId = route.substring(route.lastIndexOf("-") + 1);
    pageElement.dataset.productId = paramId;
  }
  break;
```

`route.lastIndexOf("-")` 找到最後一個分隔符號的位置，`+1` 跳過分隔符號本身，`substring` 從那個位置取到字串結尾，得到 ID 值。

URL 的分隔符號也可以改用正斜線（`/product/123`），格式由你決定，邏輯是一樣的。

## 用 data attributes 傳遞 ID 給頁面元素

取得 ID 之後，需要把它附加到頁面元素上，讓後續的渲染邏輯能夠讀取。一個直覺的做法是用元素的 `id` 屬性，但這樣會把資料庫的 ID 混入 HTML 的結構識別符中，語意上不夠清楚。

更好的做法是使用 **data attributes**。每個 DOM 元素都有一個 `dataset` 物件，可以用來存放自訂的資料，這些資料不會被瀏覽器解析或影響渲染，純粹供 JavaScript 使用：

```javascript
pageElement.dataset.productId = paramId;
```

這等同於在 HTML 中寫 `data-id="123"`。如果你用過某些函式庫，應該對 `data-*` 屬性不陌生，很多函式庫都用它來做模板標記或格式化設定。

## 讓上一頁、下一頁按鈕能夠更新頁面內容

目前的實作有一個明顯的問題：點擊連結可以切換頁面內容，但使用瀏覽器的上一頁或下一頁按鈕時，URL 確實會改變，頁面內容卻不會跟著更新。

原因是我們只有在連結點擊時呼叫 `Router.go`，沒有監聽 URL 本身的變化。

解決方式是在 `init` 中加上 `popstate` 事件的監聽：

```javascript
window.addEventListener("popstate", event => {
  Router.go(event.state.route, false);
});
```

`popstate` 會在使用者透過瀏覽器歷史導覽（上一頁、下一頁）時觸發。`event.state` 就是我們當初用 `pushState` 推入的 state 物件，從中取出 `route` 就知道應該渲染哪個頁面。

第二個參數傳 `false` 很重要：使用者按上一頁是在歷史紀錄中移動，不應該再把這個 URL 重新推入歷史紀錄，否則歷史紀錄會不斷累積多餘的項目。

## Router 完整的運作流程

至此，Router 的完整運作流程是：

1. `init` 執行時攔截所有 `navlink` 連結，阻止預設的頁面跳轉
2. 連結被點擊時，呼叫 `Router.go(url)`，推入歷史紀錄並更新頁面內容
3. 使用者按上一頁或下一頁時，`popstate` 觸發，從 state 物件取出路由，呼叫 `Router.go(route, false)` 更新頁面內容但不推入新的歷史紀錄
4. `init` 最後會根據當前 URL 執行一次 `go`，支援深度連結

最後 `Router.go` 會長這樣子

```javascript
go: (route, addToHistory=true) => {
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
            pageElement.textContent = "Menu";
            break;
        default:
            if (route.startsWith("/product-")) {                
                pageElement = document.createElement("h1");
                pageElement.textContent = "Details";
                pageElement.dataset.productId = route.substring(route.lastIndexOf("-")+1);
            }
            break;   
    }
    if (pageElement) {
        document.querySelector("main").innerHTML = "";
        document.querySelector("main").appendChild(pageElement);
    }

    window.scrollTo(0, 0);
}
```

## 未來可以擴充的方向

這個 Router 是專門為 Coffee Masters 寫的，不具備通用性。講師提到，如果想讓它可以跨專案重用，可以改成接收一個路由設定陣列（每個路由包含路徑 pattern 和對應的元件），路徑 pattern 可以用正規表達式來匹配。這只是一般的程式設計問題，和 DOM API 本身無關。

## 複習

### 在 HTML 元素中使用 data attributes 的用途是什麼？

data attributes 讓你可以在 DOM 元素上設定自訂屬性，透過 JavaScript 的 dataset 物件存取。它們用於存放不會被瀏覽器解析的自訂資料，常被函式庫用於模板標記或格式化設定。

### 哪個事件用來處理瀏覽器歷史導覽的變化？

popstate 事件用來監聽使用者透過瀏覽器歷史操作（例如上一頁、下一頁按鈕）觸發的 URL 變化。

### 如何在不使用正規表達式的情況下，從 URL 中提取產品 ID？

使用字串操作方法，例如 substring，從最後一個分隔符號（正斜線或連字號）的位置加一開始取到字串結尾，即可得到 ID 值。

### 用 History API 實作路由有哪些優點？

History API 允許在不重新載入頁面的情況下變更 URL，支援前後導覽，並在現代瀏覽器中穩定可用，不需要像早期的 hash routing 那樣使用複雜的 hack。

### 在瀏覽器歷史回退時，history.pushState() 的第二個引數（false）有什麼作用？

在 popstate 觸發時呼叫 Router.go 並傳入 false，可以防止在使用者回退歷史時再次新增歷史紀錄，避免在瀏覽器的歷史堆疊中建立多餘的項目。

## 小測驗

<details>
<summary>哪種機制可以在 DOM 元素上設定自訂屬性，且不會被瀏覽器解析？</summary>
data attributes
</details>

<details>
<summary>哪個 JavaScript 事件用來監聽使用者在瀏覽器歷史中前後導覽時的 URL 變化？</summary>
popstate
</details>

<details>
<summary>如何在不使用正規表達式的情況下，從 URL 中提取產品 ID？</summary>
使用 substring 從最後一個分隔符號之後的位置取到字串結尾
</details>

<details>
<summary>在路由器中，哪個方法用來監聽 URL 的變化？</summary>
window.addEventListener()
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記