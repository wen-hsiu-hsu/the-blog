---
title: 'TypeScript 與 Flow 的型別推斷與型別標註'
description: '介紹 TypeScript 與 Flow 的兩種基本型別機制：型別推斷（根據初始值猜測）與型別標註（開發者明確聲明）。說明兩者的差異、JavaScript 變數型別的根本不同，以及 Kyle Simpson 對靜態推斷的個人立場。'
date: 2026-06-10
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 31
chapter: 'Static Typing'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - TypeScript
---

# TypeScript 與 Flow 的型別推斷與型別標註

> 本文延續對靜態型別工具的介紹。[[30-typescript-and-flow|上一篇]]概述了 TypeScript 和 Flow 的整體優缺點，這篇聚焦在它們最基本的功能：型別推斷（type inference）與型別標註（type annotation），以及兩者之間的差異。

## 型別推斷：靜態的最佳猜測

當你沒有明確標註型別時，TypeScript 和 Flow 會根據變數的初始值推斷其型別：

```javascript
var teacher = "Kyle";   // 推斷 teacher 的型別為 string

// ...

teacher = { name: "Kyle" };
// Error: can't assign object to string
```

工具觀察到 `teacher` 被初始化為字串，便「猜測」這個變數應該永遠只持有字串。之後試圖賦予不同型別的值時，會拋出錯誤。

這是靜態分析在編譯期做出的推測，不是執行期的保證。

## 型別標註：明確表達意圖

與其讓工具猜測，你可以直接告訴工具你的意圖：

```typescript
var teacher: string = "Kyle";   // 明確標註為 string

// ...

teacher = { name: "Kyle" };
// Error: can't assign object to string
```

結果相同——賦予非字串值時拋出錯誤。差別在於：推斷是工具的猜測，標註是開發者的明確聲明。標註消除了猜測帶來的不確定性，讓意圖直接寫進程式碼。

## JavaScript 與 TypeScript/Flow 的根本差異

這裡有一個值得釐清的概念：

**JavaScript 的型別屬於值，而非變數。** 一個變數可以先持有字串，後來持有數字，這在 JavaScript 中完全合法。

TypeScript 和 Flow 在 JavaScript 之上疊加了額外的約束，讓變數也有型別要求。這不是 JavaScript 本身的特性，而是工具層面的靜態分析規則。

## Kyle Simpson 的個人立場

他坦承，在超過二十年的開發經驗中，從未因為「不小心把錯誤型別賦給變數」而產生 bug。他刻意這樣做的情況有很多，但從未因為意外賦值而出問題。

這說明靜態型別推斷解決的問題因人而異。如果你的程式碼庫中確實存在「意外型別重新賦值」的 bug，這個功能對你很有價值；對沒有這個問題的開發者來說，它的價值就相對有限。

## 小結

型別推斷讓工具根據初始值猜測變數型別，型別標註讓開發者明確聲明意圖——後者消除了猜測，讓型別資訊成為程式碼溝通的一部分。兩者都會在型別不符時拋出錯誤，差別在於確定性的程度。靜態型別工具的分析發生在編譯期，能幫助的是「在真實執行前就能發現的問題」，而執行期的實際行為仍然是 JavaScript。

## 複習

### TypeScript 和 Flow 中的靜態型別推斷是什麼？

靜態型別推斷是型別系統根據變數的初始值自動猜測其預期型別，並防止將不相容的型別重新賦值給該變數的功能。

### TypeScript 和 Flow 在沒有提供型別標註時，如何處理型別推斷？

它們根據變數的初始值自動推斷型別，例如假設持有字串的變數應該只存放字串，若嘗試賦予不同型別的值則會拋出錯誤。

### 明確標註型別與依賴型別推斷之間的關鍵差異是什麼？

明確標註型別時，開發者主動指定變數的預期型別；而型別推斷則是根據初始賦值自動判斷型別。

### JavaScript 與 TypeScript/Flow 在變數型別方面有什麼根本差異？

JavaScript 的變數本身沒有型別，而 TypeScript 和 Flow 透過新增靜態型別能力，在 JavaScript 之上疊加了型別要求。

### 當你試圖將非字串值賦給已被推斷為字串型別的變數時，會發生什麼？

TypeScript 和 Flow 會拋出錯誤，阻止賦予與推斷型別不符的值。

## 小測驗

<details>
<summary>TypeScript 和 Flow 中的靜態型別推斷是什麼？</summary>
根據變數的初始值自動猜測其型別
</details>

<details>
<summary>TypeScript 和 Flow 在未明確指定型別時，如何處理型別賦值？</summary>
根據初始值推斷型別，並防止重新賦值為不同的型別
</details>

<details>
<summary>開發者如何在 TypeScript 和 Flow 中明確指定變數的型別？</summary>
透過使用型別標註
</details>

<details>
<summary>JavaScript 變數與 TypeScript/Flow 變數之間存在什麼根本差異？</summary>
TypeScript/Flow 在 JavaScript 之上額外疊加了型別要求
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記