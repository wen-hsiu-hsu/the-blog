---
title: 'DOMContentLoaded：初始化應用程式的正確時機'
description: '說明為何即使使用 defer，仍應在 DOMContentLoaded 事件中初始化應用程式，以及它與 load 事件的使用時機差異。'
date: 2026-07-04
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 9
chapter: 'The DOM'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - DOM
  - EventListener
---

# DOMContentLoaded：初始化應用程式的正確時機

> [[08-adding-scripts-async-and-defer|上一篇]]建立了 `app.js` 入口點，並加上 `defer` 屬性讓 JavaScript 在 HTML 解析完成後才執行。這篇說明為什麼即使有了 `defer`，仍然建議在 `DOMContentLoaded` 事件中才開始操作 DOM，以及這個事件和另一個常見的 `load` 事件有何不同。

## 為什麼不直接在 defer 腳本頂層操作 DOM？

`defer` 確保腳本在 HTML 解析完成後才執行，理論上此時 DOM 應該已經建立完畢，可以直接呼叫 `querySelector` 或 `getElementById`。

但實務上不建議這樣做，原因是：部分瀏覽器在 HTML 解析結束後，記憶體中的 DOM 結構可能還沒完全建好。這在現實中幾乎不會發生，但理論上在 HTML 解析結束的瞬間，記憶體中的 DOM 結構可能尚未完全建好。

因此，正確的做法是監聽 `DOMContentLoaded` 事件，等到瀏覽器明確通知「DOM 已準備好可以操作」之後，再執行初始化邏輯。

```javascript
window.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("nav");
  console.log(nav);

  nav.innerHTML = `
    <h2>Hello DOM</h2>
    <p>This is HTML within a JavaScript string</p>
  `;
});
```

這個模式是整個應用程式的初始化入口，所有「頁面載入時要做的事」都放在這裡：選取元素、掛載事件監聽器、渲染初始內容等。

## DOMContentLoaded 與 load 的差異

這兩個事件容易混淆，但用途明顯不同：

**`DOMContentLoaded`** 在 DOM 結構建立完成後觸發，此時樣式表、圖片、字型、影片等外部資源不一定已經下載完畢。這是初始化應用程式的建議時機，可以讓應用程式儘早回應使用者的操作。

**`load`** 則要等到頁面上所有資源（樣式表、圖片、字型、影片）都完全載入後才觸發。如果頁面上有一支很大的影片，使用者可能等了很久都沒辦法使用 App，只因為 JavaScript 還在等影片載入完成。

因此，除非有特殊需求（例如確實需要圖片或其他資源載入完才能初始化的功能），否則一律使用 `DOMContentLoaded`。

需要注意的是，`DOMContentLoaded` 觸發時，使用者通常還沒看到畫面，這個事件發生在渲染之前。但 DOM 在記憶體中已經就緒，可以安全地讀取和修改。

## innerHTML 與模板字串

上面的程式碼範例展示了用 `innerHTML` 搭配模板字串（backtick）動態替換元素內容的方式。

執行這段程式碼之後，如果打開 DevTools 查看 DOM，你會看到 `<nav>` 內部的原始內容（連結和 `span`）已經不見了，取而代之的是 `<h2>` 和 `<p>`。這正是 DOM 動態修改的實際結果，HTML 原始碼沒有改變，但 DOM 已經是新的結構了。

模板字串的好處是可以跨行撰寫 HTML，讓程式碼更易讀。它仍然是一個字串，瀏覽器會解析這段字串並建立對應的 DOM 節點。

## 複習

### DOMContentLoaded 事件是什麼，通常在什麼情境下使用？

DOMContentLoaded 是一個在 DOM 準備好可以操作時觸發的事件，發生在 HTML 解析完成之後，但在圖片、影片等資源載入完畢之前。通常用於初始化應用程式、掛載事件處理函式，以及儘早操作 DOM 元素。

### load 事件與 DOMContentLoaded 事件的主要差異是什麼？

load 事件會等到頁面上所有資源（包括樣式表、圖片、字型和影片）都載入完畢後才觸發；DOMContentLoaded 則在 DOM 準備好可以操作時就立即觸發，讓開發者能更早初始化應用程式並掛載事件處理函式。

### JavaScript 如何動態修改 DOM 中的 HTML 內容？

JavaScript 可以透過修改 innerHTML 屬性來更新 HTML 內容。搭配模板字串（backtick）可以方便地插入多行 HTML 字串，完整替換現有的 DOM 元素。

### 為什麼在操作 DOM 元素之前，等待 DOM 準備就緒很重要？

等待 DOM 準備就緒很重要，因為部分瀏覽器在 HTML 解析結束後，記憶體中的 DOM 結構可能尚未完全建立完成。在元素完全就緒之前嘗試操作，可能會取得不完整或狀態異常的物件。

### DOMContentLoaded 事件觸發後，可以使用哪些 DOM 操作方式？

DOMContentLoaded 觸發後，可以使用 getElementById()、getElementsByName()、querySelector() 等方法選取元素，也可以修改 innerHTML 等屬性來與 DOM 元素互動並更新內容。

## 小測驗

<details>
<summary>應該使用哪個事件來確保 DOM 已準備好可以操作？</summary>
DOMContentLoaded
</details>

<details>
<summary>load 與 DOMContentLoaded 事件的主要差異是什麼？</summary>
load 會等待圖片、影片等所有資源載入完畢
</details>

<details>
<summary>何時可以安全地操作 DOM 元素？</summary>
DOMContentLoaded 事件觸發之後
</details>

<details>
<summary>哪種 JavaScript 語法可以方便地建立多行 HTML 字串？</summary>
反引號（backtick，模板字串）
</details>

<details>
<summary>在 JavaScript 中，動態修改 DOM 內容的一種方式是什麼？</summary>
修改 innerHTML 屬性
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記