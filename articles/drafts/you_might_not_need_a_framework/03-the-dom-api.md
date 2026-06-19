---
title: 'DOM 與 DOM API 基礎概念'
description: '介紹 DOM 與 DOM API 的基本概念，包含瀏覽器記憶體結構、執行緒與畫面更新的關係，以及 Virtual DOM 的補充說明。'
date: 2026-07-01
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 3
chapter: 'Vanilla JavaScript'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - DOM
  - WebAPI
  - VirtualDOM
---

# DOM 與 DOM API 基礎概念

## DOM 是什麼？

DOM 是 Document Object Model 的縮寫。當瀏覽器載入一個 HTML 檔案並開始渲染頁面時，它會在記憶體中建立一個對應的結構，這個結構就是 DOM。

DOM 是瀏覽器在記憶體中建立的文件結構，本身不是 API。DOM API 才是瀏覽器提供給開發者操作這個結構的介面。你在 JavaScript 裡操作的物件，都是這個結構裡的節點。

## DOM API 是什麼？

DOM API 是瀏覽器暴露給開發者的一組函式與屬性，讓你可以從 JavaScript 去讀取或修改那個記憶體結構。

修改 DOM 並不等於修改 HTML 字串本身，你改的是記憶體中的結構，瀏覽器再根據這個結構去更新畫面。看起來像是改了 HTML，但實際上 HTML 檔案沒有變，變的是記憶體裡的表示。

DOM API 的範圍很大，這門課不會全部涵蓋，只會介紹最常用、最重要的部分。

## DOM API 存在於哪些物件上？

DOM API 分布在三個層級的物件上：

**`window` 全域物件**

在瀏覽器環境中，JavaScript 的全域執行環境就是 `window`。大多數你會用到的全域函式都掛在這個物件上。`window` 這個概念源自 1990 年代「一個視窗對應一個頁面」的時代，如今有了分頁、iframe 等機制，這個概念變得比較模糊，但基本上可以理解為主要的瀏覽情境。Web Worker 是獨立的執行緒，有自己的全域環境，不是 `window`。

**`document` 物件**

`document` 代表當前頁面的 DOM 結構，也就是那個記憶體中的文件物件模型。一般情況下一個頁面對應一個 document，iframe 或 Web Components 則可能引入多個 document。

**每個 HTML 元素各自的物件**

頁面上的每一個 HTML 元素都在 DOM 中對應一個 JavaScript 物件，這些物件的介面稱為 `HTMLElement`，或者繼承自它的更具體介面，例如 `HTMLImageElement`（對應 `<img>`）、`HTMLHeadingElement`（對應 `<h1>` 到 `<h6>`）等。

## HTML 元素如何在 DOM 中被表示？

以下面這段 HTML 為例：

```html
<html>
  <body>
    <header>
      <h1>The DOM</h1>
      <p class="tagline">Document Object Model</p>
      <img hidden src="dom.png">
    </header>
  </body>
</html>
```

載入後，每個元素都會成為記憶體中的一個物件，擁有屬性（properties）和方法（methods）。這些物件可以讓你：

- 讀取內容
- 修改內容
- 將元素從 DOM 中移除
- 在元素內新增子元素

改動這些物件的屬性，或是增減子節點，都會在適當時機觸發畫面更新。

## 操作 DOM 元素的兩種方式

要從 JavaScript 操作一個 DOM 元素，首先需要取得它的參考（reference）。取得方式有兩種：

- **從現有 DOM 中選取**：透過 DOM API 的查詢方法，找到頁面上已存在的元素
- **以 JavaScript 建立後注入**：用 JavaScript 動態建立一個新元素物件，再將它插入 DOM 結構中

取得參考後，你可以讀取內容、修改內容、移除元素，或是新增子元素。

## 執行緒（Thread）與畫面更新的關係

這是理解 DOM 操作時非常重要的概念。

瀏覽器的渲染和 JavaScript 共用同一條主執行緒。JavaScript 在執行期間，瀏覽器無法進行重新佈局（layout）或重新繪製（repaint）。因此，對 DOM 的修改不會立即反映在畫面上，而是等到**執行緒釋放**之後，瀏覽器才有機會更新畫面。

「釋放執行緒」最常見的情況，就是你的事件處理函式執行完畢。

這帶來幾個實際影響：

- 如果你在同一次執行中對同一個屬性修改了十次，使用者只會看到最後一次的結果
- 如果你從 DOM 中移除一個元素，然後在同一次執行中馬上嘗試找它，確實找不到，但使用者在這段期間仍然看得到它（因為畫面還沒更新）
- 如果你有一個無限迴圈（`while(true)`），執行緒永遠不會釋放，瀏覽器也無法更新畫面，最終瀏覽器會跳出「頁面無回應」的警告

這也解釋了為何長時間佔用執行緒的 JavaScript 程式碼，會讓頁面滾動感覺卡頓，因為瀏覽器沒有足夠的時間去偵測滾動事件並重新佈局畫面。

對於需要長時間運算的任務，正確的做法是將它移到 Web Worker 中，在獨立的執行緒裡處理。

## 關於 Virtual DOM 的補充說明

來自 React 背景的開發者可能熟悉 Virtual DOM 的概念。React 的 Virtual DOM 是一個由框架管理的記憶體結構，與真實 DOM 沒有直接關係，React 透過比對兩者的差異來決定何時更新真實 DOM。

有些人認為這比直接操作真實 DOM 更有效率，但講師指出，在 Vanilla JS 中，只要你在同一次執行中對 DOM 做多次修改，瀏覽器同樣只會在執行緒釋放後一次性更新畫面，行為上有相似之處。這並不是說兩者完全等價，但 Virtual DOM 並不是使 React 更快的唯一因素。

## 複習

### DOM 代表什麼，它是什麼？

DOM 是 Document Object Model（文件物件模型）的縮寫，是瀏覽器在渲染頁面時於記憶體中建立的 HTML 文件結構，讓網頁與 JavaScript 之間能夠連結。

### DOM API 的主要用途是什麼？

DOM API 提供一系列函式與屬性，讓開發者可以透過 JavaScript 操作記憶體中的 HTML 文件結構，並觸發瀏覽器的畫面更新。

### 對 DOM 做出修改後，變更如何反映在畫面上？

對 DOM 的修改不會立即顯示，需要等到執行緒釋放後，瀏覽器才會更新畫面，使其與當前的 DOM 結構一致。

### 在 Web 環境中，JavaScript 的全域物件是什麼？

`window` 全域物件是瀏覽器中 JavaScript 指令碼的主要全域執行環境，提供全域變數與函式的存取（Web Worker 環境除外）。

### HTML 元素與 DOM 之間的關係是什麼？

網頁應用程式中的每個 HTML 元素，都在 DOM 中對應一個具有特定介面（例如 `HTMLElement`）的物件，這些物件擁有可用來操作元素並觸發畫面更新的屬性與方法。

## 小測驗

<details>
<summary>DOM 在網頁開發中代表什麼？</summary>
Document Object Model（文件物件模型）
</details>

<details>
<summary>在 JavaScript 中，什麼代表 HTML 文件當前的記憶體結構？</summary>
document 物件
</details>

<details>
<summary>在 DOM 操作期間，瀏覽器的佈局更新通常在何時發生？</summary>
當 JavaScript 執行緒釋放時
</details>

<details>
<summary>在同一條執行緒中對 DOM 進行多次修改時，會發生什麼？</summary>
只有最後一次修改會被反映在畫面上
</details>

<details>
<summary>HTML 元素在 DOM 中是如何被表示的？</summary>
以擁有屬性與方法的 JavaScript 物件來表示
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記