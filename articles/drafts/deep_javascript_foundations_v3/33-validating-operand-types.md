---
title: 'TypeScript 的運算元型別驗證：被低估的功能'
description: '介紹 Kyle Simpson 認為 TypeScript 最被低估的功能：不只檢查變數賦值，還能驗證運算本身的型別有效性（如阻止字串參與數學運算）。同時說明他對 TypeScript 目前「全有或全無」設定方式的批評。'
date: 2026-06-11
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 33
chapter: 'Static Typing'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - TypeScript
---

# TypeScript 的運算元型別驗證：被低估的功能

> 本文延續對 TypeScript 功能的介紹。[[32-custom-types|上一篇]]聚焦在變數賦值的型別保護，這篇要介紹 Kyle Simpson 認為更具實際價值、卻常被忽略的功能：對運算本身的型別有效性檢查。

## 不只是賦值，還有運算的有效性

```typescript
var studentName: string = "Frank";

var studentCount: number = 16 - studentName;
// error: can't subtract string
```

TypeScript 不只檢查你是否把錯誤的型別賦給變數，還會檢查你是否對型別做出無意義的運算，例如從數字減去字串。

## 為什麼這個功能更有價值

Kyle Simpson 坦承，在他個人的開發經驗中，「不小心把字串賦給應該是數字的變數」這種 bug 從未發生過。但「對型別做出無效運算」才是真正常見的 bug 來源：

- 數字與字串混用在數學運算中
- 對不支援該操作的型別呼叫方法
- 運算結果型別與預期不符

這類問題發生在業務邏輯的核心，也就是程式碼真正在做事的地方，而不只是變數宣告的時候。

## 理想的工具 vs 現實的工具

Kyle Simpson 的理想是：一個能告訴他「不要把字串和數字混用做減法」的工具，但同時不干涉他刻意選擇的型別重新賦值行為。

然而他研究後發現，TypeScript 目前的做法比較接近「全有或全無」。對於「想在某些地方允許強制轉型，在其他地方禁止」這種更細緻的需求，TypeScript 目前的設定靈活性有限。

## 小結

TypeScript 的運算元型別驗證——阻止無效的型別運算，是比賦值型別檢查更貼近實際 bug 來源的功能。理想的靜態型別工具應該允許開發者在不同的情境下設定不同的嚴格程度，而非只提供開或關兩種選擇。

## 複習

### TypeScript 有什麼功能可以防止像從數字中減去字串這樣的無效操作？

型別檢查，它能防止不適當的型別操作，幫助在開發過程中提早發現潛在的 bug。

### 根據課程討論，TypeScript 目前如何處理型別強制轉型？

TypeScript 的做法似乎是「全有或全無」，也就是要嘛完整採用嚴格的型別檢查，要嘛完全不採用，缺乏細緻的設定選項。

### TypeScript 除了對變數賦值做靜態型別檢查之外，還提供什麼好處？

TypeScript 可以驗證不同型別之間的運算是否有效，防止潛在的型別交互錯誤。

### TypeScript 目前型別檢查方式有什麼關鍵限制？

對型別強制轉型的設定靈活性有限，難以在某些情境允許強制轉型、在其他情境加以阻止。

### 為什麼防止型別不適當的操作在程式設計中很重要？

防止無效的型別操作有助於在開發早期發現潛在的 bug，並減少執行期錯誤。

## 小測驗

<details>
<summary>TypeScript 有什麼功能可以防止不同資料型別之間的無效操作？</summary>
靜態型別檢查
</details>

<details>
<summary>TypeScript 預設會阻止哪種特定的型別相關操作？</summary>
從數字中減去字串
</details>

<details>
<summary>TypeScript 目前如何處理型別強制轉型與驗證？</summary>
全有或全無的做法
</details>

<details>
<summary>TypeScript 除了傳統的型別賦值之外，還提供什麼好處？</summary>
檢查運算的有效性
</details>

<details>
<summary>課程討論對 TypeScript 的型別檢查有什麼建議？</summary>
更細緻的設定選項將會更有幫助
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記