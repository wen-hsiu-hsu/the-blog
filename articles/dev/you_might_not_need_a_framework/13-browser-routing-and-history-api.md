---
title: 'SPA 路由原理：History API 與頁面切換的兩種策略'
description: '介紹 SPA 路由的核心概念，包含頁面切換的兩種策略、History API 的使用方式，以及 popstate 事件的觸發限制與伺服器配置需求。'
date: 2026-07-06
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 13
chapter: 'Routing'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - Router
  - HistoryAPI
---

# SPA 路由原理：History API 與頁面切換的兩種策略

> [[12-fetching-data]]建立了 Services 層，完成了資料的取得與儲存。這篇在開始渲染 UI 之前，先解決 SPA 的核心問題：如何在不換頁的情況下，根據 URL 顯示不同的內容。

## 什麼是路由？

「Router」（路由器）不是 DOM 的原生概念，它是一個抽象的設計模式，用來決定「當 URL 是某個值時，應該顯示什麼內容」。我們會用 DOM API 自己實作這個邏輯，你會發現它其實沒有那麼複雜。

Coffee Masters 需要三個頁面（Page、Route、View，叫什麼名字都可以，這都是自定義的概念）：

- 首頁：顯示咖啡選單
- 品項詳細頁：顯示單一產品的詳細資訊
- 訂單頁：顯示購物車內容與表單

這些「頁面」都不是真正獨立的 HTML 檔案，而是同一個 `index.html` 裡不同的 DOM 區塊，透過 JavaScript 動態決定哪個區塊顯示在畫面上。

## 頁面切換的兩種策略

### 策略一：移除舊頁面、注入新頁面

每次切換頁面時，把目前的 DOM 元素移除，再把下一個頁面的元素插入：

```html
<!-- 導覽列永遠存在 -->
<nav>...</nav>

<!-- 目前畫面只有 Section 3 -->
<section id="section3"></section>
```

這個策略的好處是 DOM 保持精簡，只有當前頁面的元素存在。

### 策略二：全部保留在 DOM，用 hidden 控制顯示

三個頁面的元素同時存在於 DOM 中，透過 `hidden` 屬性切換可見性：

```html
<section id="section1" hidden></section>
<section id="section2"></section>  <!-- 目前顯示的頁面 -->
<section id="section3" hidden></section>
```

這個策略實作更簡單，但在頁面數量多、內容複雜的情況下，DOM 會變得很龐大，擴展性相對較差。

兩種策略沒有絕對的好壞，視應用程式的規模與需求決定。Coffee Masters 這樣的小型應用，哪種都行。

## History API：讓 URL 跟著頁面內容走

SPA 只有一個 HTML 檔案，但使用者應該能看到有意義的 URL（例如 `/order`、`/product/123`），也應該能使用瀏覽器的上一頁、下一頁按鈕。這靠的是瀏覽器內建的 History API。

### 推送新的 URL

```javascript
history.pushState(optional_state, null, "/new-url");
```

`pushState` 接受三個參數：

- 第一個是可選的 state 物件，可以附帶任意資訊，之後可以從事件中取得
- 第二個參數在規格中定義為「未使用」，傳 `null` 即可（這個參數原本設計用來指定歷史記錄的標題，但規格後來決定不採用，為了向後相容而保留了這個位置。）
- 第三個是你想顯示在網址列的路徑字串

呼叫後，網址列的 URL 會改變，但頁面不會重新載入。這個 URL 是純粹的客戶端假象，伺服器不一定有對應的資源。

### 監聽 URL 變化

```javascript
window.addEventListener("popstate", event => {
  let url = location.href;
  // 根據 url 決定要顯示哪個頁面
});
```

當使用者點擊瀏覽器的上一頁或下一頁按鈕時，`popstate` 事件會觸發，你可以在這裡讀取當前 URL 並更新畫面。

### popstate 不觸發的情況

`popstate` 只會在應用程式內部的歷史操作中觸發。以下兩種情況不會觸發：

- 使用者點擊外部連結（瀏覽器會離開這個頁面，整個 Web App 停止運作）
- 使用者手動在網址列輸入新的 URL 並按 Enter

這個限制對 React Router 或 Angular Router 也一樣，不是 Vanilla JS 特有的問題。

## SPA 的伺服器配置需求

SPA 有一個常見的陷阱：使用者在 SPA 內導覽到 `/order`，然後按下重新整理，這時瀏覽器會向伺服器請求 `/order` 這個路徑。但伺服器上不存在這個檔案，會回傳 404。

解決方式是**配置伺服器將所有請求都轉發（forward，不是 redirect）到 `index.html`**，再由客戶端的 JavaScript 根據當下的 URL 決定顯示什麼內容。

這個配置對所有 SPA 框架都一樣，React 或 Angular 的 SPA 也有同樣的需求，不是 Vanilla JS 獨有的問題。

## 複習

### Single Page Application 中，改變頁面內容的兩種主要技術是什麼？

1. 從 DOM 中移除上一個頁面並注入新頁面
2. 使用 hidden 等屬性來隱藏與顯示既有的 DOM 元素

### History API 中，用什麼方法推送新的 URL？

history.pushState()

### 在 Single Page Application 中，用什麼事件來監聽 URL 的變化？

popstate 事件

### 什麼情況下 popstate 事件不會觸發？

當使用者點擊外部連結，或在應用程式之外手動更改 URL 時

### Single Page Application 有什麼重要的伺服器配置需求？

伺服器必須將所有請求轉發（forward）到 index.html，而不是進行重新導向（redirect）

## 小測驗

<details>
<summary>在 Single Page Application 中，不重新載入頁面的情況下改變 URL，主要使用什麼方法？</summary>
history.pushState()
</details>

<details>
<summary>在客戶端路由的實作中，哪個事件用來監聽 URL 的變化？</summary>
window 上的 popstate 事件
</details>

<details>
<summary>Single Page Application 中改變頁面內容的兩種主要技術是什麼？</summary>
移除並注入 DOM 元素，或是隱藏與顯示元素
</details>

<details>
<summary>使用 popstate 事件進行路由時存在什麼限制？</summary>
外部連結導覽或手動更改 URL 時不會觸發
</details>

<details>
<summary>伺服器應如何配置以支援 Single Page Application 的路由？</summary>
將所有請求轉發到 index.html
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記