---
title: '什麼是 Vanilla JavaScript？'
description: '為什麼你可能不需要框架，以及 Vanilla JS 的定義與歷史脈絡'
date: 2026-06-30
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 1
chapter: 'Vanilla JavaScript'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
---

# 什麼是 Vanilla JavaScript？

> 本篇是「Vanilla JS: You Might Not Need a Framework」課程的第一篇筆記，涵蓋講師 Maximiliano Firtman 的開場說明，包含課程核心主張、Vanilla JS 的定義，以及這個概念的歷史背景。

## 課程的核心主張 

這門課的用意不是要你完全放棄框架。而是很多開發者在還不了解瀏覽器原生能力的情況下，就直接選用框架，這才是問題所在。

他用一個比喻說明：「當你手裡只有一把鎚子，你會覺得所有東西都是釘子。」現在市場上有不少開發者在過去五年內入行，從一開始就只學了某個框架，因此在面對任何新專案時，不管規模大小，都習慣性地套用同一套工具。講師甚至舉了一個例子：有人要做一個部落格，卻用 Create React App 來建立，原因只是因為那是他唯一知道的工具鏈。

這門課的目標是讓你多一個工具，而不是取代你現有的工具。

## Vanilla JavaScript 的定義

講師給出的定義是：

> 使用核心 JavaScript 語言與瀏覽器 API 來建立 Web 應用程式，不在其之上加入任何額外的函式庫或框架。

但他也強調，這不是一個非黑即白的概念。現實中存在很多中間地帶：也許你沒有用 Angular 或 Next.js 這類大型框架，但你還是用了一些小型的開源微型函式庫，或是用了 TypeScript，那就還是需要一個編譯步驟。所以 Vanilla JS 是一個範圍，而不是一個開關。

在本課程中，他們會聚焦在「完全純 JavaScript」的那一端。

## 為什麼叫「Vanilla」？

這個詞來自義大利冰淇淋（gelato）的傳統：香草口味是大多數奶味冰淇淋的基底，其他口味都是在香草的基礎上加料。因此在軟體開發中，「Vanilla」用來表示「最純粹、沒有添加任何東西的原始版本」。

## 這不是新鮮事：歷史一再重演

講師提到 `vanilla-js.com` 這個網站，這是約十二年前（jQuery 盛行時期）的一個玩笑網站。它故意模仿框架的銷售頁面，宣稱 Vanilla JS 是一個「快速、輕量、跨平台的框架」，並列出 Facebook、Google、YouTube 等大公司都在使用它。當你點進去下載時，才會發現每個模組的大小都是 0 bytes，因為那根本就是 JavaScript 本身，不需要下載任何東西。

這個網站的目的是讓開發者意識到：他們用的那些函式庫（Dojo、Prototype、Ext JS、jQuery、YUI、MooTools），有很多功能其實瀏覽器已經內建了。

講師指出，這個現象是歷史在重演。以前是「開新專案，第一步加 jQuery」，現在是「開新專案，第一步選框架」，本質上是一樣的問題。

## Vanilla JS 的適用場景

並非所有專案都適合 Vanilla JS，但有些場景特別適合：

- **微型應用（Micro Apps）**：可以快速部署到雲端、五分鐘內取得一個可用 URL 的小型專案
- **漸進式 Web 應用程式（PWA）**：功能明確、可讓使用者安裝並離線使用的應用程式
- 任何不需要大型框架複雜度的輕量需求

## 關於效能

從效能比較來看，只要寫法正確，Vanilla JS 在大多數情況下會比使用框架更快。原因很直接：所有 UI 框架都是建立在瀏覽器的 JavaScript 引擎之上，它們並不會改變底層引擎的行為（除非討論到 WebAssembly，但那不在一般 UI 函式庫的範疇內）。效能的關鍵在於理解 JavaScript 的運作方式，並寫出正確的程式碼。

但講師也不迴避另一面：某些情況下，用框架確實可以減少你需要自己寫的程式碼量，這也是框架仍然有其價值的地方。

## 小結

這節課的重點不是「框架是壞的」，而是：

- 了解 Vanilla JS 讓你在技術選型時有更多依據
- 框架和函式庫的底層仍然是瀏覽器 API，理解底層才能真正評估上層工具的必要性
- 對某些專案（微型應用、PWA），Vanilla JS 通常已經夠用

## 複習

### Vanilla JavaScript 的定義是什麼？

使用核心 JavaScript 語言與瀏覽器 API 來建立 Web 應用程式，不在其之上加入任何額外的函式庫或框架

### 在軟體開發中為什麼使用「Vanilla」這個詞？

這個詞來自義大利冰淇淋（gelato）的傳統，香草口味是其他口味的基底，因此「Vanilla」用來表示某樣東西的純粹原始版本

### 現代 Web 開發中，與函式庫和框架相關的常見問題是什麼？

只學過單一函式庫或框架的開發者，往往對每個專案都套用同一套工具，即使在不必要的情況下也不例外

### 哪類應用程式特別適合使用 Vanilla JavaScript？

可以快速部署的微型應用、可轉換為漸進式 Web 應用程式（PWA）的功能性應用，以及偏好輕量解決方案的專案

### 在效能方面，Vanilla JavaScript 與使用函式庫的方案相比如何？

Vanilla JavaScript 通常較快，因為所有函式庫都建立在瀏覽器核心 JavaScript 引擎之上；效能的關鍵在於理解並撰寫有效率的程式碼

## 小測驗

<details>
<summary>什麼是 Vanilla JavaScript？</summary>
使用核心語言與瀏覽器 API 來建立 Web 應用程式，不加入任何額外函式庫
</details>

<details>
<summary>在軟體開發中為什麼使用「Vanilla」這個詞？</summary>
用來表示純粹、基礎的版本，就像香草冰淇淋作為其他口味的基底一樣
</details>

<details>
<summary>只熟悉框架開發的現代開發者常見的問題是什麼？</summary>
他們傾向於對所有專案（即使是簡單的專案）都使用複雜的框架
</details>

<details>
<summary>現代 Web 應用程式開發中出現了什麼新趨勢？</summary>
建立可快速部署到雲端的微型應用程式
</details>


> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記