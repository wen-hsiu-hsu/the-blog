---
title: '`==` 的使用準則：何時用、何時不用'
description: '整理 == 的實際使用準則：哪三種情境應該避免（任一側可能是 0 或空字串、非原始型別比較、與 true 或 false 比較），以及為什麼知道型別、知道轉型有意義，== 才是好工具。'
date: 2026-06-07
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 26
chapter: 'Equality'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - EqualityComparison
    - TypeCoercion
---

# `==` 的使用準則：何時用、何時不用

> 本文是 `==` 討論系列的收尾。前幾篇分析了演算法結構、`null`/`undefined` 的特殊相等性、以及 Boolean 的角落案例，這篇要把這些討論匯整成一份可以直接使用的實踐準則。

## 準則一：避免任一側可能是 `0`、空字串、或只有空白的字串

這三種值是強制轉型中角落案例的高密度地帶。前幾篇討論過，空字串轉數字得到 `0`、只有空白的字串也一樣。當比較的任一側可能出現這些值，`==` 很容易產生非預期的結果。

如果程式碼中有這種可能性，優先考慮重新設計，縮小可能出現的型別範圍，而不是依賴 `==` 去處理。

## 準則二：不要對非原始型別使用 `==`

`==` 在遇到物件時會呼叫 `ToPrimitive`，觸發一連串轉換。即使某個特定情境下結果恰好正確（如前一篇的 `42 == [42]`），那也是意外巧合，不是可靠的設計。

`==` 的適用範圍應嚴格限定在原始型別之間。遇到物件或陣列，不管比較目的是什麼，一律用 `===`。

```javascript
// 不推薦（即使特定情境下可能有效）
if (arr1 == arr2) { ... }

// 推薦：明確比較參考
if (arr1 === arr2) { ... }
```

`==` 的適用範圍應嚴格限定在原始型別之間的強制轉型比較。

## 準則三：不要使用 `== true` 或 `== false`

這是前一篇的重點結論。讓 `ToBoolean` 在 `if` 條件中自然發生，是最簡單、沒有角落案例的方式：

```javascript
// 推薦：讓 ToBoolean 自然發生
if (workshopStudents) { ... }

// 如果需要精確比對 true 或 false 的值，用 ===
if (someFlag === true) { ... }

// 絕對避免
if (workshopStudents == true) { ... }   // 反直覺
if (workshopStudents == false) { ... }  // 更反直覺
```

### 小結

這份準則的邏輯起點不是「`==` 很危險，盡量別用」，而是「你知不知道這個比較中可能出現的型別」。知道型別、知道強制轉型在這裡有意義，`==` 就是好工具。不知道、或已知可能落入高風險角落案例，就換用 `===` 或重新設計程式碼。這份清單並不長，任何認真學習型別系統的開發者都能掌握並運用。

## 複習

### 使用雙等號（`==`）時，應該避免哪些型別的值？

當任一側可能是 0、空字串、或只有空白字元的字串時，應避免使用雙等號。此外，也應避免對非原始型別使用雙等號，以及避免與 true 或 false 做比較。

### 比較陣列等非原始型別的參考時，建議使用哪個比較運算子？

使用三等號（`===`）來比較非原始型別的參考，以避免潛在的角落案例問題。

### 進行 boolean 比較時，建議採用什麼方式？

允許 ToBoolean 自然轉換，避免用雙等號與 true 或 false 比較。如果確實需要精確比對 true 或 false，則使用三等號。

### 雙等號（`==`）主要適用於哪些情境？

雙等號應只用於原始型別之間的型別強制轉型比較。

### 處理 JavaScript 比較操作的整體策略是什麼？

學習並遵循有助於避免型別強制轉型陷阱的準則，例如謹慎使用雙等號，以及在大多數情境下偏好使用三等號。

## 小測驗

<details>
<summary>使用雙等號（==）時，哪些情境應該避免使用？</summary>
當任一側可能是 0、空字串、或只有空白字元的字串時
</details>

<details>
<summary>根據準則，如何處理與非原始型別的比較？</summary>
完全避免使用雙等號
</details>

<details>
<summary>與 boolean 的 true 或 false 比較時，建議採用什麼方式？</summary>
讓 ToBoolean 轉換自然發生
</details>

<details>
<summary>什麼情況下可以接受在比較中使用雙等號？</summary>
在原始型別之間進行強制轉型比較時
</details>

<details>
<summary>這些比較準則的主要目標是什麼？</summary>
避免意外的型別強制轉型角落案例
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
