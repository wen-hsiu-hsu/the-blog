---
title: Vanilla JS 設計模式課程導覽：五大主題、先備知識與環境
description: 先搞懂設計模式背後要解決的問題，再用在 Vanilla JS 專案。整理課程五大主題：經典模式、SPA、MPA、資料與狀態管理和進階概念，以及不用 Node.js 與 npm 的環境。
date: 2026-11-08
section: dev
category: JavaScript Design Patterns
series: javascript_design_patterns_for_web_apps
seriesTitle: JavaScript Design Patterns for Web Apps
order: 1
chapter: Introduction
tags:
    - JavaScript
    - frontendMasters
    - javaScriptDesignPatterns
    - DesignPatterns
---

# Vanilla JS 設計模式課程導覽：五大主題、先備知識與環境

這門課的主題是設計模式（design pattern），而且聚焦在 Vanilla JavaScript 寫成的 web app 上。課程會先說明什麼是設計模式，再把其中一部分實際套用到三個不同的專案裡。

## 不會把每個設計模式都用上

設計模式的數量多到全部套用一遍大概要花上一個月，所以課程只挑其中一部分來實作。

更重要的是，隨時把所有設計模式都套上去本來就不是好主意。每個設計模式都是為了解決特定問題而存在，專案裡沒有那個問題，硬套只會多出不必要的結構。

## 課程涵蓋的五大主題

### 經典設計模式

第一部分是軟體設計裡的經典設計模式，以及怎麼把它們用在 JavaScript 上。

跟 Java、C#、C++ 比起來，JavaScript 是彈性很大的語言，不需要把其他語言的做法原封不動照抄過來。比較好的做法是：

1. 理解這個模式背後的想法
2. 搞清楚它為什麼重要、要解決什麼問題
3. 再用 JavaScript 的方式，套用到 Vanilla JavaScript 專案裡

### 單頁應用程式（SPA）的模式

SPA 指的是完全在用戶端用 JavaScript 運作的應用程式：整個 app 只有一份 HTML，也就是只發生一次 HTTP 導覽。之後切換路由或頁面，都直接用 JavaScript 透過 DOM API 完成。這部分會介紹專門用在這類 app 的設計模式。

### 多頁應用程式（MPA）的模式

MPA 就像傳統網站，由多份 HTML 組成，頁面之間靠連結互相串接。即使是這種架構，還是有設計模式能改善使用者的操作體驗。

### 資料與狀態管理的模式

這類模式通常在大型應用程式裡最能發揮作用，也就是需要管理大量資料的時候。

### 進階概念

最後會談一些正在進入 web app 設計模式領域的進階想法。

## 先備知識與開發環境

### 先備知識

- 有 JavaScript 開發經驗，最好熟悉 Vanilla JavaScript 的基本概念（可以參考 [[01-what-is-vanilla-javascript|什麼是 Vanilla JavaScript？]]）
- 了解 DOM
- 知道怎麼用 History API 處理不同路由

### 需要準備的工具

- **瀏覽器**：一般瀏覽器就夠了。只有一個設計模式需要 Chrome 126 才有的功能，錄製課程時穩定版還沒支援，所以得用 Chrome Canary 或 Chrome Beta。手邊沒有的話，可以另外下載 Chrome Canary 來測這個功能；如果穩定版 Chrome 已經是 126，就直接能用
- **程式碼編輯器**：課程裡用 Visual Studio Code，習慣用什麼編輯器都可以

不需要 Node.js，也不會用到任何函式庫或相依套件。沒有 `node_modules`，也不用跑 `npm install`，整門課只寫純 HTML、CSS 和 JavaScript。

## 課程資源

課程網址是 `firtman.github.io/webapp-patterns`，裡面有：

- 開始套用設計模式之後，每個步驟的操作指引
- 三個專案的 repo 連結
- 一份簡報

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [JavaScript Design Patterns for Web Apps](https://master.dev/courses/js-design-patterns/) 課程筆記
