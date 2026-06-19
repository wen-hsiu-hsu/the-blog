---
title: 'DOM 與 HTML 原始碼的差異：瀏覽器如何解析與補全結構'
description: '介紹課程實作專案 Coffee Masters，並釐清 DOM 與 HTML 原始碼的本質差異，包含瀏覽器隱式補全結構的機制。'
date: 2026-07-02
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 6
chapter: 'The DOM'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - DOM
  - PWA
---

# DOM 與 HTML 原始碼的差異：瀏覽器如何解析與補全結構

> 前幾篇建立了 DOM 與 DOM API 的操作基礎。這篇開始進入實作，介紹課程的實作專案，並在動手之前先釐清一個重要概念：瀏覽器 DevTools 裡看到的，和你寫的 HTML 原始碼，並不是同一件事。

## 實作專案：Coffee Masters

接下來課程的實作目標是從零打造一個名為 Coffee Masters 的咖啡點餐 Web App。功能範圍包含：

- 菜單頁面，展示所有可購買的咖啡品項
- 品項詳細資訊頁面
- 購物車，包含填寫姓名與 Email 的表單（用於取得收據）

HTML 和 CSS 已經事先準備好，課程會專注在 JavaScript 的實作，包括取得 JSON 格式的菜單資料、渲染 UI，以及建立 Web Components 和路由。

### 本地開發環境

專案不需要任何建置流程，直接開 HTML 就能運作。但有一個例外：當程式碼需要透過 HTTP 請求來讀取 JSON 資料時，直接用瀏覽器開啟檔案系統上的 HTML 會被瀏覽器的安全限制擋住。因此需要一個本地 Web Server，方式很多，例如 VS Code 的 Live Server 外掛，或是在終端機執行 `npx serve .`。

### 這也是一個 PWA

在 Chrome 中開啟這個專案時，網址列旁邊會出現一個安裝圖示，也可以從選單中選擇「安裝 Coffee Masters」。這是因為它本身也是一個漸進式 Web 應用程式（Progressive Web App，PWA），可以被安裝到 iOS、Android、Windows、Mac 和 Linux 上，以獨立視窗運作、有自己的應用程式圖示，行為接近原生 App。

## DOM 與 HTML 原始碼的差異

在瀏覽器 DevTools 中按右鍵選「檢查」，和按右鍵選「檢視頁面原始碼」，看到的是不同的東西。

「檢視原始碼」顯示的是你實際寫的 HTML 字串。「檢查」顯示的是瀏覽器解析 HTML 之後，在記憶體中建立的 DOM 結構。兩者有關聯，但不完全相同。

講師用一個例子說明這個差異。以下是一份最精簡的 HTML 檔案：

```html
<!DOCTYPE html>
<title>My First HTML Test</title>
<h1>Quick HTML</h1>
<style>
  body { background-color: red; }
</style>
```

這份檔案沒有 `<html>`、`<head>`、`<body>` 標籤，但它是合法的 HTML，可以通過 W3C 驗證器的檢驗。更有趣的是，雖然 HTML 裡沒有寫 `<body>`，但這段樣式中的 `body { background-color: red; }` 仍然生效。

打開 DevTools 就能看到原因：DOM 裡確實存在 `<body>` 元素，儘管你沒有寫它。

這是因為 `<head>` 和 `<body>` 對 DOM 來說是必要的結構，即使你沒有明確寫出來，瀏覽器在解析 HTML 時也會自動補上。它們是「隱式」存在的。

### 瀏覽器如何決定 head 在哪裡結束、body 從哪裡開始？

規則很直觀：當瀏覽器在解析過程中遇到第一個**可見元素**（如 `<p>`、`<div>`、`<h1>`，甚至是純文字節點），它就認定 head 結束、body 從這裡開始。

`<meta>`、`<script>`、`<link>`、`<title>` 這類不可見的元素，都會被歸入 head。

這個機制意味著，即使你把 `<title>` 放在 `<p>` 後面，瀏覽器會把 `<title>` 放進 body，而不是 head。HTML 不會因此報錯，瀏覽器會盡力渲染，但結果可能不符合預期。

### 實際影響

理解這個差異有助於避免兩個常見的混淆：

第一，DevTools 的「檢查」與「檢視原始碼」看到的結果不同，這不是 bug，是正常現象。瀏覽器解析後的 DOM 可能比你寫的 HTML 多出一些元素，甚至瀏覽器擴充功能也可能向 DOM 注入額外的節點。

第二，HTML 的語法容錯性很高，標籤不閉合、省略 `<html>`、`<head>`、`<body>` 都不會讓頁面壞掉。但 DOM 有它自己固定的結構，那些元素即使你不寫，也會存在。

## 複習

### HTML 原始碼與文件物件模型（DOM）的差異是什麼？

DOM 是瀏覽器解析 HTML 時在記憶體中建立的結構，瀏覽器可能會隱式新增或調整元素，例如即使原始碼中沒有明確寫出 head 和 body 標籤，DOM 中仍然會自動建立它們。

### 根據現代網頁標準，HTML 檔案中唯一必要的元素是什麼？

依 HTML 規範，`<title>` 是文件中必要的元素；DOCTYPE 則強烈建議加入，省略時瀏覽器仍會嘗試渲染。

### 瀏覽器如何判斷 HTML 文件的 body 從哪裡開始？

當瀏覽器遇到第一個可見元素（例如段落、div 或文字節點）時，就會結束 head 並開始 body 的部分。

### 什麼是漸進式 Web 應用程式（PWA）？

漸進式 Web 應用程式是一種可以安裝到 iOS、Android、Windows、Mac 和 Linux 等裝置上的 Web 應用程式，能以獨立視窗與應用程式圖示運作，行為接近原生 App。

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記