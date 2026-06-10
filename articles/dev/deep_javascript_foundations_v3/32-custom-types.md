---
title: '自訂型別與函式參數的型別標註'
description: '介紹 TypeScript 與 Flow 的自訂型別定義與函式參數標註：如何讓型別保證跨越參數與回傳值傳遞，以及 Kyle Simpson 對聯合型別的實際考量——在型別安全與彈性之間取得平衡。'
date: 2026-06-10
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 32
chapter: 'Static Typing'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - TypeScript
---

# 自訂型別與函式參數的型別標註

> 本文延續對 TypeScript 和 Flow 的介紹。[[31-inferencing|上一篇]]介紹了型別推斷與基本型別標註，這篇要看更進一步的應用：如何定義自訂型別，並將它用在函式的參數與回傳值上。

## 定義自訂型別

TypeScript 和 Flow 不只支援 `string`、`number` 等內建型別，還允許開發者定義自己的型別：

```javascript
type student = { name: string };

function getName(studentRec: student): string {
    return studentRec.name;
}

var firstStudent: student = { name: "Frank" };

var firstStudentName: string = getName(firstStudent);
```

這段程式碼沒有任何型別錯誤，因為工具能追蹤整條推理鏈：

- `firstStudent` 是 `student` 型別，持有 `name: string`
- `getName` 接受 `student` 型別，回傳 `string`
- `firstStudentName` 被標註為 `string`，收到 `getName` 的回傳值，型別一致

## 函式參數本質上是有型別要求的變數

Kyle Simpson 點出一個值得記住的對應關係：**函式參數在本質上與變數相同**——說「這個參數只接受 `student` 型別」，跟說「這個變數只能持有 `student` 型別的值」是同一件事。

靜態型別系統在這裡提供的保護，就是確保傳入的值符合函式預期的型別。

## 聯合型別（Union Types）的實際考量

Kyle Simpson 也提到，在實際開發中，他通常不會把型別限制得那麼嚴格。更常見的做法是使用聯合型別，允許多種可能的型別：

```javascript
// 允許字串、數字或 null
function process(value: string | number | null) { ... }
```

過於嚴格的型別限制（只允許特定結構的物件）在大多數實際情境下反而不夠彈性。聯合型別讓你在保持型別安全的同時，也保留了一定的靈活性。

## 小結

自訂型別讓靜態型別工具的能力從「基本型別的賦值檢查」擴展到「自訂結構的型別驗證」，並可以跨越函式參數與回傳值傳遞型別保證。這是靜態型別系統最具實用價值的部分之一——當「型別賦值錯誤」是你真正面臨的問題時，這套機制能在靜態層面捕捉這類錯誤。

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記