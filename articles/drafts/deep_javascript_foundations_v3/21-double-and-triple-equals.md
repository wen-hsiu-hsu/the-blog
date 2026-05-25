---
title: '`==` 與 `===`：兩者的真正差異'
description: '釐清 == 與 === 最常被誤解的地方：兩者都會先檢查型別，真正的差異只在型別不同時是否允許強制轉型。說明型別相同時兩者完全等價，以及物件比較時兩者都做身份比較而非結構比較。'
date: 2026-06-05
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 21
chapter: 'Equality'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - EqualityComparison
    - TypeCoercion
---

# `==` 與 `===`：兩者的真正差異

> 本文進入「型別與強制轉型」的第四節：相等性。強制轉型的討論最終都會匯聚到這裡：`==` 和 `===` 的選擇，是大多數開發者唯一思考過強制轉型的地方。然而，關於這兩個運算子最廣為流傳的說法，其實並不準確。

## 最常見的誤解：「`==` 檢查值，`===` 檢查值與型別」

這個說法聽起來合理，但它是錯的，或者說不夠精確，精確到足以在某些情況下把你帶往完全錯誤的結論。

要找到正確答案，和過去一樣：讀規格書。

## [規格書](https://262.ecma-international.org/9.0/index.html#sec-abstract-equality-comparison)怎麼說

### 抽象相等比較（`==`，規格書 7.2.14）

演算法的第一步：

> **1. 如果 Type(x) 與 Type(y) 相同，回傳 Strict Equality Comparison x === y 的結果。**

`==` 的第一件事，就是檢查型別。這直接反駁了「`==` 不檢查型別」的說法。

### 嚴格相等比較（`===`，規格書 7.2.15）

演算法的第一步：

> **1. 如果 Type(x) 與 Type(y) 不同，回傳 false。**

`===` 同樣在第一步就檢查型別。

**兩者都檢查型別。** 差異在於：型別不同時，各自做了什麼。

## 真正的差異

更精確的描述是：

- **`===`**：型別不同時，直接回傳 `false`，不做任何進一步比較
- **`==`**：型別不同時，允許強制轉型發生，再繼續比較

換句話說：**`==` 允許型別不同時進行強制轉型；`===` 不允許。**

## 型別相同時，`==` 與 `===` 完全一致

這是最容易被忽略的事實。當兩側型別已經相同，`==` 就直接執行 `===`，兩者行為完全相同：

```javascript
var studentName1 = 'Frank';
var studentName2 = `${studentName1}`; // 也是字串 "Frank"

studentName1 == studentName2; // true
studentName1 === studentName2; // true（完全相同）

var workshopEnrollment1 = 16;
var workshopEnrollment2 = workshopEnrollment1 + 0; // 也是數字 16

workshopEnrollment1 == workshopEnrollment2; // true
workshopEnrollment1 === workshopEnrollment2; // true（完全相同）
```

## 物件比較：兩者都做身份比較，而非結構比較

```javascript
var workshop1 = { name: 'Deep JS Foundations' };
var workshop2 = { name: 'Deep JS Foundations' };

workshop1 == workshop2; // false
workshop1 === workshop2; // false
```

兩個物件結構相同、內容相同，但它們是不同的物件實例，指向不同的記憶體位置。`==` 和 `===` 在比較物件時都做的是**身份比較（identity comparison）**，不做結構比較（deep equality）。此時使用哪個運算子結果完全相同。

## 小結

`==` 與 `===` 的差異不是「一個檢查型別，一個不檢查」，而是**「型別不同時，一個允許強制轉型，一個不允許」**。型別相同時，兩者完全等價。理解這個區別，是在程式碼中做出有意識選擇的前提——而不是無條件地「用 `===` 就安全了」。

## 複習

### JavaScript 中 `==` 和 `===` 的關鍵差異是什麼？

主要差異在於當型別不同時是否允許強制轉型。`===` 不允許強制轉型，型別不同時直接回傳 false；`==` 則在型別不同時允許進行型別強制轉型。

### `==` 和 `===` 在什麼情況下行為完全相同？

當兩個比較值的型別已經相同時，`==` 和 `===` 的行為完全一致，執行相同的比較邏輯。

### JavaScript 的相等運算子如何處理結構相同的物件？

結構相同但參考不同的物件，無論用 `==` 還是 `===`，都不會被視為相等。兩者都執行身份比較，而非結構比較。

### 嚴格相等（`===`）對特定值有哪些特殊行為？

在型別匹配的情況下，`===` 對 NaN 值回傳 false，對負零回傳 true，本質上對這兩個特殊值「說謊」。

### `==` 和 `===` 比較的第一步都是什麼？

兩者都首先檢查被比較值的型別，這與「只有 `===` 才檢查型別」的常見誤解相反。

## 小測驗

<details>
<summary>JavaScript 中雙等號（==）和三等號（===）的主要差異是什麼？</summary>
兩者都檢查型別，但雙等號在型別不同時允許強制轉型
</details>

<details>
<summary>雙等號（==）和三等號（===）在什麼情況下行為完全相同？</summary>
比較相同型別的值時
</details>

<details>
<summary>JavaScript 的相等運算子如何處理物件比較？</summary>
比較的是物件參考，而非內容
</details>

<details>
<summary>嚴格相等運算子（===）在型別不同時會做什麼？</summary>
直接回傳 false，不做進一步比較
</details>

<details>
<summary>根據 JavaScript 規格書，抽象相等比較演算法的第一步是什麼？</summary>
檢查被比較值的型別
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
