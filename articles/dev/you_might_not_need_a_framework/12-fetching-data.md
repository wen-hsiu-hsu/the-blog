---
title: '建立 Services 層：API、Store 與 ES 模組系統'
description: '建立 Coffee Masters 的 Services 層，介紹 Store 與 API 的設計模式，並說明 ES 模組的啟用方式、import/export 語法，以及如何在模組化環境中管理全域狀態。'
date: 2026-07-05
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 12
chapter: 'The DOM'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - ESModule
  - WebAPI
  - Promise
---

# 建立 Services 層：API、Store 與 ES 模組系統

> 前幾篇建立了事件綁定的基礎，以及 `DOMContentLoaded` 作為應用程式入口的模式。這篇開始進入 Coffee Masters 的實際程式碼架構，建立負責資料管理的 Services 層，並正式引入 ES 模組系統。

## 什麼是 Service？

「Service」不是 JavaScript 的原生概念，它是一個設計模式，代表「為應用程式提供某種服務的物件或函式集合」。如果你用過 Angular，對這個詞會很熟悉，但在其他框架裡可能有不同的叫法。在這個課程中，它只是一種組織程式碼的方式，名稱可以自由決定。

專案的結構上，會在根目錄建立一個 `services/` 資料夾，裡面包含兩個檔案：`API.js` 負責從網路取得資料，`Store.js` 負責儲存應用程式的全域狀態。

## Store：全域狀態的容器

Store 是一個單純的物件，用來保存整個應用程式共用的狀態。目前的狀態包含兩個欄位：

```javascript
const Store = {
  menu: null,   // null 表示尚未載入
  cart: []      // 購物車，初始為空陣列
};

export default Store;
```

`menu` 初始值設為 `null` 而不是空陣列，是為了區分「還沒載入」和「載入後結果是空的」這兩種不同狀態。

## API：使用 Fetch API 取得資料

API 服務也是一個物件，負責對外發出 HTTP 請求。這裡使用瀏覽器內建的 Fetch API，搭配 `async/await` 語法讓程式碼更清晰：

js

```javascript
const API = {
  url: "data/menu.json",

  fetchMenu: async function() {
    const result = await fetch(API.url);
    return await result.json();
  }
};

export default API;
```

`fetch` 回傳的是一個 Promise，代表 HTTP 回應。呼叫 `.json()` 才能取得實際的資料，它同樣是非同步的，所以需要再 `await` 一次。

## 用 ES 模組組織程式碼

### 為什麼需要模組？

JavaScript 在沒有模組機制的情況下，所有變數都是全域的，不同檔案之間容易產生命名衝突。ES 模組讓每個檔案擁有自己的作用域，你可以明確選擇哪些東西要公開（`export`）、哪些東西要引入（`import`）。

### 啟用模組：修改 script 標籤

要讓 `app.js` 能夠使用 `import`，需要在 HTML 的 `<script>` 標籤加上 `type="module"`：

```html
<script src="app.js" type="module" defer></script>
```

加上這個屬性後，`app.js` 內定義的變數不再是全域變數，只存在於這個檔案的作用域中。

### 在瀏覽器中使用 import 的注意事項

在瀏覽器環境中直接使用 ES 模組時，`import` 路徑必須包含完整的副檔名 `.js`：

```javascript
import Store from "./services/Store.js";
import API from "./services/API.js";
import { loadData } from "./services/menu.js";
```

如果使用 Babel 或 TypeScript 這類編譯工具，可以省略副檔名，工具會自動處理。但在不經過編譯直接跑在瀏覽器的 Vanilla JS 專案中，這個 `.js` 是必要的。

### default export 與具名 export 的差異

`API.js` 和 `Store.js` 使用 `export default`，引入時不需要花括號：

```javascript
import Store from "./services/Store.js";
```

如果使用具名 export（例如 `export function loadData`），引入時則需要花括號：

```javascript
import { loadData } from "./services/menu.js";
```

## 建立 Menu Service 並串接資料流

為了讓關注點分離，資料載入的邏輯不直接寫在 `DOMContentLoaded` 的事件處理函式中，而是另外建立一個 `menu.js`：

```javascript
import API from "./API.js";

export async function loadData() {
  const menu = await API.fetchMenu();
  app.store.menu = menu;
}
```

這個函式的職責是：呼叫 API 取得選單資料，然後存入 Store。

## 讓 Store 在模組之間共用：掛載到 window

由於啟用了模組系統，Store 不再是全域變數。一個可行的做法是在 `app.js` 初始化時，將 Store 掛載到 `window` 上：

```javascript
window.app = {};
window.app.store = Store;
```

這樣做讓 `app.store` 在整個應用程式的任何地方都能存取，同時也控制了哪些東西需要是全域的，不是所有變數都暴露出去。

講師也建議不要直接把多個全域變數掛到 `window` 上，而是統一放在一個命名物件下（例如 `window.app`），可以減少與未來瀏覽器 API 命名衝突的風險。如果擔心 `app` 這個名字本身也有衝突的可能，可以加上自訂前綴。

## 複習

### 從設計角度來看，JavaScript 中的 Service 是什麼？

Service 是一種概念與設計模式，用來為應用程式提供不同的服務，它不是 JavaScript 的原生結構，而是一種組織程式碼與功能的方式

### API 服務中用什麼方法取得資料？

使用 Fetch API，它回傳一個 Promise，可以搭配 async/await 語法來從 JSON 檔案中取得資料

### 如何將 JavaScript 檔案轉換為模組？

在 HTML 的 script 標籤中加上 type="module" 屬性，這能讓變數的作用域限定在該檔案內，並允許在檔案之間進行 import 和 export

### 在不使用模組的情況下，JavaScript 變數的預設作用域是什麼？

不使用模組時，JavaScript 中所有變數都是全域的，可能導致不同檔案使用相同變數名稱而產生衝突

### 為什麼在 JavaScript 中建議使用分號？

在對 JavaScript 進行打包與壓縮時，不使用分號可能導致潛在的問題

### 在模組化的 JavaScript 環境中，如何建立全域物件？

一種做法是將物件掛載到 window 上，例如建立一個名為 app 的物件，再將方法和屬性附加到這個物件上

### default export 與具名 export 在引入時的差異是什麼？

使用 default export 的模組在引入時不需要花括號；具名 export 則在引入時需要加上花括號

## 小測驗

<details>
<summary>在這個應用程式中，建立 services 資料夾的目的是什麼？</summary>
用來組織負責資料管理的 JavaScript 檔案
</details>

<details>
<summary>API 服務中使用什麼方法來取得資料？</summary>
Fetch API
</details>

<details>
<summary>要支援 ES 模組，HTML 的 script 標籤需要加上什麼？</summary>
加上 type="module" 屬性
</details>

<details>
<summary>在變數作用域方面，JavaScript 模組與非模組 JavaScript 的主要差異是什麼？</summary>
非模組 JavaScript 中，所有變數預設都是全域的
</details>

<details>
<summary>在瀏覽器中直接使用 import 時，有什麼額外的要求？</summary>
必須使用包含 .js 副檔名的完整檔案路徑
</details>

<details>
<summary>在 JavaScript 模組中，建立全域物件的建議做法之一是什麼？</summary>
建立一個物件，然後將方法與屬性附加到這個物件上
</details>

<details>
<summary>JavaScript 模組中，default export 與具名 export 的差異是什麼？</summary>
引入 default export 時不需要花括號
</details>

<details>
<summary>開發者為什麼可能偏好在 JavaScript 中使用分號？</summary>
不使用分號在壓縮與打包時可能造成問題
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記