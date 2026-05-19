---
title: 物件導向 JavaScript：OOP 的核心目標與原型鏈基礎
description: 從「儲存資料、對資料執行操作」這兩件事出發，說明為什麼大型程式碼庫需要物件導向設計，以及 JavaScript 如何透過原型鏈實現 OOP 典範。
date: 2026-05-19
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 37
chapter: 'Classes & Prototypes (OOP)'
tags:
    - JavaScript
    - Prototype
    - OOP
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# 物件導向 JavaScript：OOP 的核心目標與原型鏈基礎

## 為什麼需要物件導向？

程式設計的核心，本質上只有兩件事：

1. **儲存資料**（例如：在測驗遊戲中儲存每位玩家的分數）
2. **對資料執行操作**（例如：增加某位玩家的分數）

聽起來很簡單，但實際的應用程式規模可以輕易達到十萬行程式碼。在那樣的規模下，同一個系統裡可能同時存在使用者、管理員、題目、排行榜、遊戲畫面等各種資料類型，每種類型都有自己對應的資料與操作邏輯。這時候就會出現兩個核心問題：

- 當我需要某個功能時，它到底在哪裡？
- 我要怎麼確保某個功能只被用在正確的資料上？

## 好的程式碼需要同時滿足三個目標

為了解決上述問題，我們對程式碼有三項要求：

1. **易於推理（Easy to reason about）**：能清楚知道資料和對應的操作邏輯在哪裡，不需要在十萬行程式碼中大海撈針。
2. **易於擴充功能（Easy to add features）**：新增操作（例如扣分、登出使用者）時，不會破壞現有的可讀性。
3. **高效能（Efficient and performant）**：不佔用不必要的記憶體空間。

這三個目標之間存在潛在的張力。例如，把每個使用者的資料和功能完整地放在一起固然直覺，卻可能造成記憶體浪費。物件導向程式設計（OOP）的目標，就是讓我們同時達成這三點。

## 兩種「資料與功能綁定」的典範

JavaScript 中有兩種主要方式可以讓資料和功能保持在一起：

- **物件導向程式設計（OOP）**：將資料與功能封裝在物件（object）內。
- **函式程式設計（Functional Programming）**：透過閉包（closure）將功能與持久資料綁定。

這兩者是相互競爭的典範。本系列筆記聚焦於物件導向路線，也就是用物件把資料與功能統一管理。

## 用物件儲存資料與功能

以一個簡化的測驗遊戲為例：

```
user1:
  name: 'Ari'
  score: 3

user2:
  name: 'Jae'
  score: 5
```

每位使用者除了各自的資料之外，還需要對應的操作功能，例如增加分數、扣除分數、登入、登出、顯示於畫面上等。物件提供了一個天然的容器，讓我們把這些資料和功能放在同一個地方。

## JavaScript OOP 的底層機制：Prototype Chain

與 Java、Python 等語言不同，JavaScript 的物件導向並非原生實作，而是建立在一套稱為**原型鏈（prototype chain）** 的機制之上。原型鏈本身是一個獨立且強大的工具，理解它不僅是學習 OOP 的必要條件，也有助於釐清許多常見的混淆，尤其是來自其他物件導向語言的開發者。

其中一個重要概念是區分兩個容易混淆的東西：隱藏屬性 `[[Prototype]]` 與物件上的 `prototype` 屬性，後續章節會實際拆解兩者的差異。

## `new` 與 `class` 關鍵字

在了解原型鏈的運作方式之後，JavaScript 提供了 `new` 與 `class` 兩個關鍵字，讓我們能自動化大量的物件與方法建立流程，以更接近傳統物件導向語言的語法來撰寫程式碼。此外，近年來新增的 `static`、`private`、`public` 欄位（fields）進一步擴充了這套典範的表達能力。

## 複習

### JavaScript 用什麼底層機制來實作物件導向程式設計？這個機制與其他語言的原生實作有何不同？

JavaScript 使用原型鏈（prototype chain）作為底層機制。與其他語言原生實作 OOP 不同，JavaScript 的 OOP 功能是建立在原型鏈之上的。

### 所有程式設計的兩項基本活動是什麼？

兩項基本活動分別是：

1. 儲存資料
2. 對資料執行操作（包含透過網路傳送、顯示於 UI、或修改資料等）

### 在數十萬行的大型程式碼庫中，若資料與功能未妥善組織，會產生什麼主要問題？

主要問題是：當你需要某個功能時，它可能散落在程式碼庫的任何地方。這讓人難以找到正確的函式來操作特定資料，也難以確保功能只被用在正確的資料上。

### JavaScript 中有哪兩種程式設計風格可以讓功能與持久資料綁定在一起？

兩種程式設計風格分別是

1. 物件導向程式設計，將資料與功能封裝在物件內
2. 函式程式設計，使用閉包（帶有關聯持久資料的函式）。

### 在使用原型鏈模擬傳統物件導向程式設計時，哪些 JavaScript 關鍵字可以自動化相關工作？

`new` 與 `class` 關鍵字可用來自動化物件與方法的建立流程，以模擬傳統 OOP。

## 小測驗

<details>
<summary>JavaScript 的物件導向典範在底層依賴什麼機制？</summary>
原型鏈（Prototype Chain）
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
