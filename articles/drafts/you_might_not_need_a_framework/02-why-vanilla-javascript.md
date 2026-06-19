---
title: 'Vanilla JS 的優勢與開發者的常見疑慮'
description: '了解學習 Vanilla JS 的實際理由、主要優勢，以及開發者常見的疑慮與誤解。'
date: 2026-06-30
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 2
chapter: 'Vanilla JavaScript'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - WebAPI
  - Performance
---

# Vanilla JS 的優勢與開發者的常見疑慮

> [[01-what-is-vanilla-javascript|上一篇]]介紹了 Vanilla JS 的定義與歷史脈絡。這篇延續課程開場，整理講師說明的「為什麼要在意 Vanilla JS」，包含學習它的實際理由、它的優勢，以及開發者常見的疑慮。

## 為什麼要在意 Vanilla JS？

### 理解你的框架在做什麼

當你了解瀏覽器原生 API 的運作方式，你才能真正理解框架替你做了什麼。當某個函式庫發布新版本、推出新的寫法時，你有能力判斷「它為什麼更好」，而不只是盲目跟著更新。

### 擴充與跳脫框架的能力

大多數時候，框架能處理大部分的工作，但偶爾你會需要暫時跳脫框架，例如直接存取硬體 API 或平台原生功能。這時你需要直接操作 DOM，而不是透過框架的抽象層。理解 Vanilla JS 讓你在這類情境下仍能寫出正確的程式碼，再安全地回到框架的脈絡中。

### 成為更好的 Web 開發者

這不只是一個可以寫在 LinkedIn 上的技能，招募人員確實會把 Vanilla JS 的理解列為加分項目。更重要的是，理解底層 DOM API，會讓你在使用框架時也做得更好。因為你知道框架底下發生了什麼事。

### 與框架混用

Vanilla JS 和框架不是互斥的。你不需要讓 React 或 Vue 管理整個應用程式的每一個角落，它們可以只是整體 Vanilla JS 應用中的一個小元件。反過來，你也可以在 Vanilla JS 專案裡單獨引入 Redux 這類狀態管理工具，不一定要把整個 React 生態系都帶進來。

### 真的拿來用

講師特別強調這一點：他希望你不只是把 Vanilla JS 當成理論知識或歷史課。Vanilla JS 可以讓你在沒有 CLI、沒有建置流程的情況下，快速建立一個可運作的應用程式，一個 HTML 檔案加一個 JavaScript 檔案就夠了。

Frontend Masters 本身就是用 Vanilla JS 建構的，這也是為什麼它的使用體驗如此快速。

## 現代框架的效能警訊

講師提到，React 最近更新了官方文件，不再建議在沒有額外框架（如 Next.js）的情況下，單純用 React 做純客戶端渲染。這背後的原因正是客戶端框架過度使用所引發的效能問題。

一個常見的現象是：企業級應用動輒有 5MB 的 JavaScript，開發者習以為常地認為「這不算大」。但問題不只是下載時間，還有解析（parsing）與執行（execution）的開銷。如果整個 UI 的渲染都依賴這段 JavaScript，那麼在它執行完之前，使用者什麼都看不到。

開發者 Ben Holmes 也在推文中表達了類似的觀點：他認為每個前端開發者都應該試著自己從頭建立一個框架，因為這個過程讓他在一個月內學到的 JavaScript 和 Web API，比多年使用 React 學到的還要多。

## Vanilla JS 的主要優勢

| 優勢            | 說明                                                   |
| --------------- | ------------------------------------------------------ |
| 輕量            | 沒有框架的額外負擔（overhead）                         |
| 控制力與彈性    | 你直接操作底層，不受框架設計的限制                     |
| 程式碼簡潔      | 對中小型專案來說，直接操作 DOM 往往更直觀              |
| 效能            | 少一層抽象，通常執行更快                               |
| 相容性          | 不需要擔心框架版本、套件相依性或伺服器端框架的相容問題 |
| 無 node_modules | 不會有那個裝了幾千個檔案、看起來一片混亂的資料夾       |

## 開發者常見的疑慮

這份清單來自講師在 Twitter 上做的問卷調查，整理開發者對 Vanilla JS 的主要恐懼：

- **SPA 的路由處理**：習慣了 React Router 之後，很多人不知道沒有它該怎麼做
- **程式碼太冗長、太耗時**
- **狀態管理**：不知道如何在沒有框架的情況下管理全域狀態
- **模板語法（Templating）**：沒有 JSX 或 Angular 的模板指令
- **複雜度**：講師認為這個恐懼大多來自陌生感，而不是 Vanilla JS 本身真的更複雜
- **沒有可重用元件**
- **維護性疑慮**
- **學習曲線**：有趣的是，有些人覺得學 Vanilla JS 比學 Angular 還難，但講師的看法恰恰相反，Angular 需要理解的概念量可能是 Vanilla JS 的五倍以上
- **瀏覽器相容性**：有些開發者誤以為 React 替他們解決了跨瀏覽器問題，但這個認知並不準確
- **每次都要重新造輪子**
- **擴展性（Scalability）**

講師說明，這門課不會宣稱能解決所有這些問題，但課程結束後，你至少能判斷哪些是真實的挑戰，哪些只是過度擔憂，哪些其實是誤解。

## 課程的立場

> 學會這個工具，在它是最好選擇的時候使用它。我們不會主張在每一個專案都用 Vanilla JS。

## 複習

### Vanilla JavaScript 的主要優勢有哪些？

輕量、更高的控制力與能力、程式碼簡潔、彈性、更好的效能、更好的相容性，以及避免複雜的 node_modules 依賴問題

### 開發者對於使用 Vanilla JavaScript 常見的疑慮有哪些？

路由處理的挑戰、程式碼冗長且耗時、狀態管理的複雜度、缺少模板語法、感知上的學習曲線、瀏覽器相容性的顧慮，以及擔心每次都要重新造輪子

### Vanilla JavaScript 如何與現代函式庫並用？

Vanilla JS 可以與 Vue 或 React 混合使用，作為特定的元件或小工具，也可以在不引入整個框架的情況下單獨使用 Redux 等工具

### 為什麼現代 Web 框架逐漸轉向伺服器端渲染？

由於過度依賴客戶端框架所引發的效能問題，包括 JavaScript 檔案過大、解析與執行的額外開銷，以及 UI 渲染延遲

### 理解 Vanilla JavaScript 能為開發者帶來哪些好處？

更深入理解函式庫的內部運作、擴充函式庫的能力、提升 Web 開發技術、更具競爭力的開發者履歷，以及對 DOM API 與 Web 技術更扎實的掌握

## 小測驗

<details>
<summary>Vanilla JS 的一個關鍵優勢是什麼？</summary>
輕量，沒有函式庫的額外負擔
</details>

<details>
<summary>學習 Vanilla JS 對開發者有什麼好處？</summary>
能夠理解函式庫的內部運作
</details>

<details>
<summary>開發者對 Vanilla JS 常見的疑慮是什麼？</summary>
複雜的狀態管理
</details>

<details>
<summary>Vanilla JS 如何與現代函式庫搭配使用？</summary>
作為另一個函式庫中的一個小元件
</details>

<details>
<summary>大量使用客戶端框架存在什麼效能問題？</summary>
大型 JavaScript 檔案導致解析與執行速度變慢
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記