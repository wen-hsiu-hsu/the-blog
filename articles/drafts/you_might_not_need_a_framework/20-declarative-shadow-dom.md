---
title: 'Web Components 的 CSS 策略與常見問題釐清'
description: '補充 Declarative Shadow DOM 的現況、為 Web Component 定義 CSS 的多種方式，以及 template 與 Custom Element 之間連結的建立方式。'
date: 2026-07-09
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 20
chapter: 'Web Components'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - WebComponents
  - DOM
---

# Web Components 的 CSS 策略與常見問題釐清

> [[19-shadow-dom|上一篇]]完整說明了 Shadow DOM 的機制，以及它如何解決 template 樣式洩漏到全域的問題。這篇補充幾個相關的實務細節：Declarative Shadow DOM 的現況、如何為 Web Component 定義 CSS，以及幾個常見的概念澄清。

## Declarative Shadow DOM：還不夠成熟

Declarative Shadow DOM 是一個讓你直接在 HTML 標記中宣告 Shadow DOM 的方式，不需要透過 JavaScript 的 `attachShadow`。它的優勢在於伺服器端渲染（Server-Side Rendering）引擎可以在不執行 JavaScript 的情況下，直接在 HTML 輸出中建立 Shadow DOM。

不過截至課程錄製時，這個功能才剛剛在 Safari 中取得支援，整體瀏覽器相容性還不夠完整。因此這門課不使用它，未來等相容性更成熟後，它可能會成為建立 Web Components 更推薦的方式。

## 為 Web Component 定義 CSS

使用 Shadow DOM 的元件不會繼承外部的 CSS，所以需要自己為元件定義樣式。這同樣沒有唯一的做法，幾種可行的選項包含：

- 使用 CSSOM API：JavaScript 本身有一套操作 CSS 的 API，可以用 JavaScript 建立樣式表並注入 Shadow DOM
- 在 `<template>` 中加入 `<style>` 標籤
- 在 `<template>` 中加入 `<link>` 標籤，引用外部 CSS 檔案
- 用 Fetch API 載入外部 CSS 檔案，再作為 `<style>` 注入 Shadow DOM（這個 CSS 檔案也可以事先 prefetch）

課程後面實作時會選擇其中一種方式，但選擇的理由是「這是一種可行的方式」，不代表它一定是最佳解。

## template 與 custom element 之間的連結

這個連結不是自動建立的，而是由你作為開發者主動建立。Custom Element 在 `connectedCallback` 中用 `getElementById` 或 `querySelector` 取得指定的 template，然後克隆並使用它。

同一個 template 也可以被多個不同的 custom element 共用，這就是為什麼必須克隆而不是直接使用——每個元件實例需要有自己獨立的 DOM 副本，而不是共享同一份節點。克隆時，template 內部的所有 DOM（包含樣式）都會一起被克隆。

這也再次說明了為什麼 Web Components 被稱為「一組完全獨立的 API 組合」：Custom Elements、HTML Templates 和 Shadow DOM 各自分開，是我們選擇把它們搭配在一起，作為一種設計模式來建立元件。

## 是否一定要用 class？

Custom Element 必須提供一個實作 HTML 介面的物件。在現代 JavaScript 中，最直接的方式是使用 class 語法繼承 `HTMLElement`。但在技術上並不是只有 class 這條路，JavaScript 也可以用較為老式的方式（修改 prototype 鏈）達到同樣的效果，只是今天看起來有些奇怪。

你也可以自己打造一個迷你框架或函式庫，讓使用者能以函式的方式建立 web components，底層再幫你把物件包裝成符合規格的形式。但這些都是你自己要做的事，瀏覽器並不原生支援函式式的寫法。總結來說，在現代 JavaScript 中，使用 class 是最自然、也是最推薦的方式。

## 複習

### Declarative Shadow DOM 是什麼，它與傳統的 Shadow DOM 建立方式有何不同？

Declarative Shadow DOM 允許直接在 HTML 標記中宣告 Shadow DOM，不需要 JavaScript，讓伺服器端渲染引擎可以在不執行 JavaScript 的情況下，直接在 HTML 輸出中建立 Shadow DOM。

### 為 Web Component 克隆 template 時，會克隆哪些內容？

克隆 template 時，template 內部的所有 DOM 都會被克隆，確保每個元件實例都有自己獨立的 Shadow DOM。

### 有哪些方式可以為使用 Shadow DOM 的 Web Component 添加 CSS？

可以使用 CSSOM API、在 template 中加入 style 或 script、在 template 中加入 link 引用外部 CSS，或是用 Fetch API 載入外部 CSS 檔案並注入 Shadow DOM 作為 style。

### 建立 Web Component 是否一定需要使用 class？

class 不是硬性要求，但傳入的物件必須實作 HTML 介面。在現代 JavaScript 中，使用 class 是最推薦的方式，其他方式技術上可行但看起來較不直觀。

### template 與 custom element 之間的連結是如何建立的？

由開發者手動建立，通常透過 ID 載入 template。同一個 template 可以被多個 custom element 重複使用，這也是為什麼在使用時需要克隆而不是直接共用。

## 小測驗

<details>
<summary>Declarative Shadow DOM 是什麼？</summary>
一種不需要 JavaScript，直接在 HTML 標記中宣告 Shadow DOM 的方式
</details>

<details>
<summary>如何為 Shadow DOM 添加樣式？</summary>
可以使用 CSSOM API 建立樣式表
</details>

<details>
<summary>為 Web Component 克隆 template 時會發生什麼？</summary>
template 內部所有的 DOM 元素和樣式都會被克隆
</details>

<details>
<summary>建立 Web Component 是否一定需要使用 class？</summary>
不一定，但傳入的物件必須實作 HTML 介面
</details>

<details>
<summary>Shadow DOM 的一個關鍵特性是什麼？</summary>
它不會繼承元件外部的 CSS
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記