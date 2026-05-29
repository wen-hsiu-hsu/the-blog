---
title: '強制相等性：`==` 的實際運作與 `null`/`undefined` 的特殊關係'
description: '說明 == 在型別不同時的實際演算法，並聚焦在最具實用價值的場景：null 與 undefined 在強制相等下只彼此匹配、不與其他任何值相等，讓 == null 成為同時處理兩種空值狀態的簡潔慣用法。'
date: 2026-06-05
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 22
chapter: 'Equality'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - EqualityComparison
    - TypeCoercion
---

# 強制相等性：`==` 的實際運作與 `null`/`undefined` 的特殊關係

> 本文延續[[21-double-and-triple-equals|上一篇]]對 `==` 與 `===` 真正差異的討論。釐清了「兩者都檢查型別，差異在於是否允許強制轉型」之後，這篇要進一步看 `==` 在型別不同時的實際演算法，並聚焦在一個最具實用價值的場景：`null` 與 `undefined` 的相等性比較。

## 選擇 `==` 還是 `===`：正確的問法

不應該問「哪個更安全」，而應該問：

> **我知道這個比較涉及的型別嗎？如果知道，強制轉型在這裡是有幫助的還是有風險的？**

Kyle Simpson 的核心論點是：**選擇使用 `===` 是一個落後指標（trailing indicator）**，它往往指向一個更根本的問題，你不確定這個比較中的型別是什麼，所以用 `===` 來自保。

如果可以，更好的做法是解決根本問題：讓型別清楚、縮小可能出現的型別範圍，而不是依賴 `===` 來掩蓋不確定性。這才是根本上減少 bug 的方式。

## `null` 與 `undefined`：強制相等性的最佳使用案例

在[規格書 7.2.14](https://262.ecma-international.org/9.0/index.html#sec-abstract-equality-comparison)中揭示了一個重要事實：`null` 與 `undefined` 在 `==` 下**只彼此相等，不與語言中任何其他值相等**（第 10 條的 `return false` 確保了這一點）。

查看下面的程式碼：

```javascript
var workshop1 = { topic: null };
var workshop2 = {};   // workshop2.topic 是 undefined（從未設定）

// 顯式寫法（使用 ===）：冗長，讀者必須在腦中同時維持兩個空值的概念
if (
    (workshop1.topic === null || workshop1.topic === undefined) &&
    (workshop2.topic === null || workshop2.topic === undefined)
) { ... }

// 強制相等寫法（使用 ==）：簡潔，意圖清楚
if (
    workshop1.topic == null &&
    workshop2.topic == null
) { ... }
```

下方的 `== null` 寫法同時匹配了 `null` 與 `undefined`，且不會匹配任何其他值。這正是強制轉型幫助我們隱藏「不必要細節」的典型範例，讀者不需要知道這個屬性是從來沒被設定（`undefined`），還是被明確清空（`null`），因為在絕大多數情境下，那個區分毫無意義。

## 關於 Linter 的補充立場

許多 linter（如 JSHint）預設禁止使用 `==`，建議一律改用 `===`。Kyle Simpson 認為這是過度保守的規則：linter 的目的是提供意見、幫助發現潛在問題，而非強制所有人採用同一套偏好。

一個好的 linter（如 ESLint）應該是高度可設定的，讓團隊根據自己的判斷選擇有用的規則、關閉阻礙生產力的規則。`== null` 的慣用法即使在最嚴格的反強制轉型社群中也普遍被接受，連很多強力反對 `==` 的開發者也在用這個模式。

## 小結

選擇 `==` 或 `===` 的核心是：你知不知道這個比較中的型別？如果知道，且強制轉型在這個情境下有幫助，`==` 可以讓程式碼更清楚。`null == undefined` 是規格書明確定義的行為，也是強制相等性最有說服力的實際用途：用一個簡短的 `== null` 同時處理兩種空值狀態，讓讀者聚焦在真正重要的問題上。

## 複習

### 在選擇雙等號（`==`）和三等號（`===`）時，關鍵的考量是什麼？

分析被比較的型別，判斷強制轉型在特定情境下是否有幫助或安全，並決定這個比較是讓程式碼更清楚還是引入潛在的混淆。

### 使用雙等號（`==`）比較 null 和 undefined 時，它們的行為是什麼？

null 和 undefined 在強制相等下彼此相等，但不等於 JavaScript 中任何其他值。在大多數情況下，可以將它們視為可互換的。

### 在 JavaScript 比較中，理解型別的關鍵指標是什麼？

選擇使用三等號（`===`）是一個落後指標，暗示對被比較的型別存在不確定性，可能揭示出需要釐清或修正程式碼中型別相關問題的需求。

### ESLint 這類 linter 的主要用途是什麼？

linter 提供關於程式碼結構和潛在 bug 的意見，幫助開發者識別潛在問題並提升程式碼品質，同時可以根據團隊需求進行設定。

### 講師對處理 null 和 undefined 值有什麼建議？

盡可能將 null 和 undefined 視為可互換的值，偏好使用較簡短且清楚的 null 來表示空值，並使用雙等號（`==`）進行簡化的 null/undefined 檢查。

## 小測驗

<details>
<summary>在 JavaScript 中決定使用雙等號（==）還是三等號（===）時，主要的考量是什麼？</summary>
理解比較中涉及的型別
</details>

<details>
<summary>根據課程討論，null 和 undefined 在強制相等下的行為是什麼？</summary>
它們彼此匹配，但不與任何其他值匹配
</details>

<details>
<summary>處理 null 和 undefined 值時，建議採用什麼方式？</summary>
將它們視為可互換的值
</details>

<details>
<summary>ESLint 這類 linter 的主要用途是什麼？</summary>
提供關於程式碼結構和潛在 bug 的意見
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
