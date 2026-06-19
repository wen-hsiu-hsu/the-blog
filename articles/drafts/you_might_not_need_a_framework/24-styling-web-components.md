---
title: '為 Web Component 載入外部 CSS：Fetch API 與效能優化'
description: '說明如何用 Fetch API 為 Shadow DOM 載入外部 CSS 檔案，以及透過 prefetch/preload 提前下載改善效能的方式。'
date: 2026-07-11
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 24
chapter: 'Web Components'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - WebComponents
  - DOM
  - Performance
---

# 為 Web Component 載入外部 CSS：Fetch API 與效能優化

> [[23-applying-a-shadow-dom|上一篇]]啟用了 Shadow DOM，讓元件的樣式不再洩漏到外部。但 Shadow DOM 同時也意味著外部的 CSS 不會自動套用進來，元件需要自己載入樣式。這篇說明如何用 Fetch API 載入外部 CSS 檔案並注入 Shadow DOM。

## 為什麼需要另外寫一個函式來載入 CSS

你可能直覺想在 `constructor` 裡直接用 `await fetch(...)` 載入 CSS，但 `constructor` 不能是 `async` 函式。解決方式是在 constructor 內建立一個獨立的非同步函式並呼叫它：

```javascript
class MenuPage extends HTMLElement {
  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });

    const loadCSS = async () => {
      const request = await fetch("components/MenuPage.css");
      const css = await request.text();

      const styles = document.createElement("style");
      styles.textContent = css;
      this.root.appendChild(styles);
    };

    loadCSS();
  }

  connectedCallback() {
    const template = document.getElementById("menu-page-template");
    const content = template.content.cloneNode(true);
    this.root.appendChild(content);
  }
}
```

幾個重點：

- `fetch` 回傳的是 HTTP 回應物件，要取得 CSS 文字內容需要呼叫 `.text()`，它同樣回傳 Promise，所以也要 `await`
- 不是用 `.json()`，因為這次讀的是純文字，不是 JSON
- 建立一個 `<style>` 元素，將 CSS 文字設定為它的 `textContent`，再把這個 `<style>` 附加到 Shadow Root

這樣的方式確實有點囉嗦，但它能讓你把每個元件的 CSS 保持在獨立的外部檔案中，與 JavaScript 分開管理。

## 每個元件都要重複這段程式碼嗎？

如果有多個 Web Component 都用這個方式載入 CSS，直覺上會讓人覺得重複。這正是建立基礎類別的好時機，讓它封裝這段 CSS 載入邏輯，其他元件繼承它就可以了。這是 OOP 繼承在這個場景下的典型應用。

## 效能考量：prefetch 和 preload

用 Fetch API 載入 CSS 的問題之一是：CSS 檔案要到元件初始化時才開始下載，可能稍微晚了一些，有時會造成短暫的無樣式閃爍。

如果想提前讓瀏覽器開始下載，可以在 HTML 的 `<head>` 中加入 prefetch 或 preload 提示：

```html
<link rel="prefetch" href="components/DetailsPage.css" as="style">
```

這告訴瀏覽器：「這個檔案之後會用到，有空的時候先下載。」等到 Web Component 真的透過 Fetch 請求它時，檔案已經在快取裡了。這個步驟不是必須的，但在意效能的情況下可以考慮加入。

## 複習

### 如何用 JavaScript 為 Web Component 載入外部 CSS 檔案？

使用 Fetch API 取得 CSS 檔案，建立一個 style 元素，將載入的 CSS 設定為它的文字內容，再用 appendChild() 將這個 style 元素附加到 Shadow DOM。

### 為什麼需要建立獨立的函式來載入 CSS，而不是直接在 constructor 中處理？

因為 constructor 不能是 async 函式，所以需要建立一個獨立的 async 函式，才能在其中使用 await 搭配 Fetch API 載入外部 CSS。

### 使用 Fetch API 載入 CSS 檔案時，哪個方法用來取得檔案的文字內容？

使用回應物件上的 .text() 方法，它回傳一個帶有檔案文字內容的 Promise。

### 如何改善 Web Component 載入 CSS 的效能？

使用 link rel 搭配 prefetch 或 preload，讓瀏覽器在 Web Component 實際需要之前就提前開始下載 CSS 檔案。

### 處理多個 Web Component 的 CSS 載入時，有什麼建議的做法？

建立一個實作了 CSS 載入邏輯的基礎類別，讓其他 Web Component 繼承它，避免在每個元件中重複相同的載入程式碼。

## 小測驗

<details>
<summary>如何用 JavaScript 為 Web Component 載入外部 CSS 檔案？</summary>
使用 Fetch API 搭配 async 函式取得 CSS 文字內容
</details>

<details>
<summary>哪個方法用來將已載入的 CSS 附加到 Web Component 的 Shadow DOM？</summary>
this.root.appendChild(styles)
</details>

<details>
<summary>為什麼要為 Web Component 的 CSS 載入建立基礎類別？</summary>
為了減少各元件之間的重複程式碼
</details>

<details>
<summary>如何改善 CSS 檔案的載入效能？</summary>
使用 link rel 搭配 prefetch 或 preload
</details>

<details>
<summary>在 fetch CSS 檔案時，使用 await 需要什麼前提？</summary>
建立一個 async 函式
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記