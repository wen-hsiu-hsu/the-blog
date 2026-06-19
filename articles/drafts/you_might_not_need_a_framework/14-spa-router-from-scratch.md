---
title: '實作客戶端 Router：攔截連結、歷史紀錄與深度連結'
description: '逐步實作 SPA 的客戶端 Router，涵蓋攔截導覽連結的預設行為、推送歷史紀錄，以及透過初始 URL 支援深度連結。'
date: 2026-07-06
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 14
chapter: 'Routing'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - Router
  - HistoryAPI
  - EventListener
---

# 實作客戶端 Router：攔截連結、歷史紀錄與深度連結

> [[13-browser-routing-and-history-api|上一篇]]說明了 SPA 路由的兩種頁面切換策略，以及 History API 的基本概念。這篇進入實作，從零建立一個 `Router` 服務，涵蓋攔截連結的預設行為、推送新的 URL，以及初始化時的深度連結支援。

## Router 的基本結構

在 `services/` 資料夾中建立 `Router.js`，物件包含兩個函式：

```javascript
const Router = {
  init: () => {
    // 初始化：攔截導覽連結、檢查初始 URL
  },
  go: (route, addToHistory = true) => {
    console.log(`Going to ${route}`);
    if (addToHistory) {
      history.pushState({ route }, '', route);
    }
  }
};

export default Router;
```

`go` 接受兩個參數：目標路由，以及是否要寫入瀏覽器歷史紀錄（預設為 `true`）。

`addToHistory` 設計為可選是有實際用途的。以登入頁為例：使用者填完表單登入後，若想讓他們無法按上一頁回到登入表單，就可以在跳轉時傳入 `false`，不在歷史紀錄中留下這個頁面。

## 在 app.js 中初始化 Router

Router 和 Store 一樣，在 `DOMContentLoaded` 時初始化，並掛載到全域物件：

```javascript
window.app.router = Router;

window.addEventListener("DOMContentLoaded", () => {
  Router.init();
});
```

## 攔截導覽連結的預設行為

HTML 中的導覽連結被標記了 `navlink` class。預設情況下點擊這些連結，瀏覽器會向伺服器發出新的請求，頁面會重新載入，這不是我們想要的行為。

在 `init` 中，用 `querySelectorAll` 取得所有導覽連結並逐一增強：

```javascript
// ...
init: () => {
  document.querySelectorAll("a.navlink").forEach(a => {
    a.addEventListener("click", event => {
      event.preventDefault();
      const url = event.target.getAttribute("href");
      Router.go(url);
    });
  });

  // 檢查初始 URL
  Router.go(location.pathname);
}
// ...
```

`event.preventDefault()` 的作用是告訴瀏覽器：「不要執行這個事件的預設行為」。對 `<a>` 元素的點擊來說，預設行為就是跳轉到 `href` 指定的 URL。呼叫這個方法後，瀏覽器不會發出新的請求，完全由我們的 JavaScript 接管。

## 三種讀取連結 href 的方式

在點擊事件的處理函式中，有三種方式可以取得連結的目標 URL，結果大致相同：

```javascript
const url1 = a.href;                      // 透過閉包取得外層變數
const url2 = a.getAttribute("href");      // 同上，但讀取的是 HTML attribute
const url3 = event.target.getAttribute("href"); // 透過事件物件取得目標元素
```

`a.href` 和 `a.getAttribute("href")` 在這個情境下行為類似，但兩者在底層有微妙的差異：前者是 JavaScript property，後者是 HTML attribute，這個差異在某些情況下會有影響（課程後面會提到）。`event.target` 是觸發事件的元素本身，在這個場景中和 `a` 指向同一個物件。

## pushState 的第二個參數

`history.pushState` 接受三個參數：

```javascript
history.pushState({ route }, '', route);
```

- 第一個參數是 state 物件，可以存放任意資料，之後在 `popstate` 事件中可以取得。目前只放了 `route`，未來可以擴充（例如加入捲動位置）。
- 第二個參數在規格中定義為「unused」，規格本來打算用它當作歷史紀錄選單的標題，但後來決定不用，又不想移除它以免破壞既有實作，所以傳空字串或 `null` 都可以。
- 第三個參數是要在網址列顯示的路徑。

## 支援深度連結：檢查初始 URL

`init` 的最後一步是讀取當前的 `location.pathname`，並呼叫 `go` 導覽到對應的頁面：

```javascript
Router.go(location.pathname);
```

這讓應用程式支援「深度連結」（deep linking）：使用者可以直接在網址列輸入或貼上一個內部路由（例如 `/order`），應用程式啟動時會根據這個 URL 顯示正確的頁面，而不是永遠從首頁開始。

## 複習

### 在連結的事件監聽器中，preventDefault() 方法的用途是什麼？

阻止瀏覽器執行預設的頁面跳轉行為，讓 Single Page Application 能夠自行控制路由邏輯

### 在點擊事件中，如何取得錨點元素的 URL？

可以用三種方式：a.href、a.getAttribute('href')，或 event.target.href

### pushState() 方法中第二個參數的意義是什麼？

這是一個未使用的參數，可以傳入空字串或 null，規格曾打算用它作為歷史紀錄的標題，但最終沒有實作

### 為什麼在初始化 Single Page Application 時，需要檢查初始 URL？

為了支援深度連結，讓使用者可以直接透過輸入 URL 載入特定的頁面或路由

## 小測驗

<details>
<summary>在處理連結點擊時，哪個方法用來阻止瀏覽器的預設導覽行為？</summary>
event.preventDefault()
</details>

<details>
<summary>在事件處理函式中，如何取得連結的 href 屬性？</summary>
event.target.getAttribute('href')
</details>

<details>
<summary>在 Single Page Application 中，哪個方法用來向瀏覽器的歷史紀錄新增一個項目？</summary>
history.pushState()
</details>

<details>
<summary>哪個 DOM 方法用來選取具有特定 class 的多個元素？</summary>
document.querySelectorAll()
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記