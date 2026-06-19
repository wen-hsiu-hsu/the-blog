---
title: 'addEventListener 選項、移除事件與自訂事件'
description: '介紹 addEventListener 的進階選項（once、passive）、移除事件監聽器的時機，以及自訂事件與 dispatchEvent 的使用方式。'
date: 2026-07-05
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 11
chapter: 'The DOM'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - DOM
  - EventListener
---

# addEventListener 選項、移除事件與自訂事件

> [[10-event-bingding-and-handlers|上一篇]]比較了 onevent 屬性與 addEventListener 的差異，並說明後者在應用程式開發中的優勢。這篇繼續深入 `addEventListener` 的進階選項，以及移除事件監聽器和自訂事件的使用方式。

## addEventListener 的第三個參數：選項物件

`addEventListener` 可以接受第三個可選參數，傳入一個選項物件來調整事件監聽的行為。

```javascript
const options = {
  once: true,
  passive: true
};
element.addEventListener("load", eventHandler, options);
```

### once

`once: true` 表示這個事件處理函式只會被執行一次，執行後瀏覽器會自動將它移除。不需要手動呼叫 `removeEventListener`。

這個選項不適合像按鈕這樣需要重複點擊的元素，但在「只需要發生一次」的場景下很實用。

### passive

`passive: true` 和執行緒與渲染效能有關。

瀏覽器的渲染與 JavaScript 共用同一條主執行緒。以滾動事件為例：當使用者滑動手指滾動頁面時，瀏覽器預設會等待 JavaScript 的事件處理函式執行完畢，確認是否有 DOM 變動需要重新佈局，才繼續移動畫面。這個等待會讓滾動感覺不順暢。

設定 `passive: true` 是告訴瀏覽器：「這個事件處理函式不會修改 DOM，你可以直接繼續渲染，不需要等我。」瀏覽器因此可以同步進行渲染，讓滾動更流暢。

## removeEventListener：何時需要移除事件？

`removeEventListener` 讓你手動取消一個已掛載的事件監聽器。

但並非所有情況都需要主動移除事件。當使用者離開頁面或關閉瀏覽器時，JavaScript 環境會自動清理，不需要手動做任何事。

需要主動移除的情境主要是 **Single Page Application（SPA）**，也就是在同一個頁面中動態新增與移除元素的情況。需要注意的是，從 DOM 中移除一個元素，不代表這個元素就被丟棄了。DOM 元素是 JavaScript 物件，可以在不顯示於畫面的狀態下繼續存在，之後還可能重新插入 DOM。

更常見的使用案例是**使用者狀態的改變**。例如頁面上有一個客服按鈕，當使用者登出後，這個按鈕仍然顯示在畫面上，但此時連接到使用者帳號的事件處理函式就不應該繼續存在，需要主動移除。

## 自訂事件與 dispatchEvent

DOM API 允許你建立並派送自訂事件，這是一個常被忽略但非常實用的功能。

```javascript
const event = new Event("mycustomname");
element.dispatchEvent(event);
```

自訂事件的名稱是任意字串，不需要遵守 W3C 的命名規則。你可以在任何 DOM 元素、`document` 或 `window` 上派送事件，頁面上其他任何地方只要有監聽這個事件名稱，都會收到通知。

這個機制和 React 的 Context 或 Angular 的事件廣播有類似的概念：一個地方觸發，多個地方可以訂閱與回應。

自訂事件物件也可以攜帶附加的資訊（metadata），甚至可以繼承自 `Event` 類別建立有自己介面的自訂事件型別。這不是你「必須」使用的做法，而是 Vanilla JS 提供的一種工具，視需求選用。

## 多個事件監聽器的執行順序

當同一個元素、同一個事件上掛載了多個 `addEventListener`，它們不會平行執行，而是**依序執行**。這是因為 JavaScript 是單執行緒語言，所有事情都在同一條執行緒上按順序發生。如果確實需要平行處理，需要使用 Web Workers，但那需要手動建立，不會自動發生

## 複習

### 在 addEventListener 中將 once 選項設為 true 的用途是什麼？

當 once 設為 true 時，事件處理函式在第一次觸發後會自動被移除，確保該事件只會被執行一次。

### 在 addEventListener 中，passive 選項的作用是什麼？

passive 選項讓瀏覽器不必等待事件處理函式執行完畢就能繼續進行渲染，主要用於滾動等場景的效能優化，表示該事件處理函式不會修改 DOM。

### 什麼時候建議使用 removeEventListener？

在 Single Page Application 中動態新增與移除元素時，應使用 removeEventListener 來避免不再需要的事件監聽器繼續佔用記憶體。

### 如何在 JavaScript 中派送自訂事件？

使用自訂名稱建立新的 Event 物件，再透過 dispatchEvent 在某個元素（例如按鈕或 document）上派送，讓頁面上其他部分可以透過 DOM API 監聽並回應這個事件。

### 在 JavaScript 中，同一個事件上的多個事件監聽器如何執行？

由於 JavaScript 是單執行緒語言，多個事件監聽器會依照被加入的順序依序執行，不會平行發生。

## 小測驗

<details>
<summary>在 addEventListener 中將 once 選項設為 true 的用途是什麼？</summary>
確保事件處理函式在觸發一次後自動被移除
</details>

<details>
<summary>在新增事件監聽器時，passive 選項的作用是什麼？</summary>
告知瀏覽器可以不等待 DOM 變動，直接繼續執行渲染
</details>

<details>
<summary>什麼時候最適合使用 removeEventListener？</summary>
在動態新增與移除元素的 Single Page Application 中
</details>

<details>
<summary>在 JavaScript 中可以對自訂事件做什麼？</summary>
使用自訂名稱在 document、window 或特定元素上派送事件
</details>

<details>
<summary>同一事件上的多個事件監聽器如何被執行？</summary>
由於 JavaScript 是單執行緒的，它們會依照加入的順序依序執行
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記