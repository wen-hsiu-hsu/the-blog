---
title: '`ToBoolean` 抽象操作：falsy 清單與 truthy 的判斷邏輯'
description: '介紹 ToBoolean 抽象操作的運作方式：它不執行轉換演算法，只做 falsy 清單查表。列出 JavaScript 中完整的七個 falsy 值，並說明為什麼空陣列是 truthy，以及 ToBoolean 與 ToNumber 的關鍵行為差異。'
date: 2026-06-01
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 13
chapter: 'Coercion'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - TypeCoercion
    - ToBoolean
---

# `ToBoolean` 抽象操作：falsy 清單與 truthy 的判斷邏輯

> 本文是抽象操作系列的最後一篇，涵蓋 `ToPrimitive`、`toString`、`ToNumber`、`ToBoolean` 這四個核心操作中的最後一個。與前三個相比，`ToBoolean` 的機制最為單純，但它有一個容易讓人犯錯的關鍵特性。

## `ToBoolean` 不是演算法，是查表

每當一個非 boolean 的值出現在需要 boolean 的地方（例如 `if` 條件、`&&`、`||`、`!` 等），`ToBoolean` 就會被觸發。

與 `ToNumber` 或 `toString` 不同，`ToBoolean` **不執行任何轉換演算法**，也不呼叫 `ToPrimitive`、`valueOf()` 或 `toString()`。它只做一件事：**查表**。

規格書中定義了一份固定的 falsy 清單。`ToBoolean` 的唯一邏輯是：

- 值在清單上 → 回傳 `false`
- 值不在清單上 → 回傳 `true`

## Falsy 清單（完整且固定）

以下是 JavaScript 中所有的 falsy 值，清單是封閉的，不可擴充：

| Falsy 值        |
| --------------- |
| `""` （空字串） |
| `0`             |
| `-0`            |
| `null`          |
| `NaN`           |
| `false`         |
| `undefined`     |

**不在這份清單上的任何值，一律是 truthy。**

## Truthy 值的例子

Truthy 的清單在理論上是無限的，只要不是上面七種，都是 truthy。常見例子：

| Truthy 值                |
| ------------------------ |
| `"foo"`（任何非空字串）  |
| `23`（任何非零數字）     |
| `{ a: 1 }`（物件）       |
| `[1, 3]`（陣列）         |
| `true`                   |
| `function(){..}`（函式） |

## 最常見的誤解：空陣列是 truthy

```javascript
Boolean([]); // true
```

`[]` 不在 falsy 清單上，因此是 truthy。`ToBoolean` 不會呼叫 `toString()` 把它轉成空字串再判斷，它只查表——查完發現 `[]` 不在清單裡，直接回傳 `true`。

這是與 `ToNumber` 行為的重要區別：`ToNumber([])` 會觸發一連串的轉換最終得到 `0`，但 `ToBoolean([])` 完全不走那條路。

## 實用記憶法

只需記住 falsy 清單，其餘所有值都是 truthy：

> 空字串、`0`、`-0`、`null`、`NaN`、`false`、`undefined`——這七個是 falsy，其他全是 truthy。

## 小結

`ToBoolean` 是四個核心抽象操作中機制最簡單的一個：不做轉換，只查表。掌握 falsy 清單，並記住「查表，不轉換」這個核心特性，就能在所有涉及 boolean 判斷的場景中做出正確預測。

## 複習

### JavaScript 中的 falsy 值有哪些？

空字串、0、-0、null、NaN、false 和 undefined。

### 空陣列強制轉型為 boolean 時會發生什麼？

它是 truthy（變成 true）。

### ToBoolean 抽象操作是如何運作的？

它透過查表來判斷一個值是否在 falsy 清單上，不會觸發其他強制轉型演算法。

### JavaScript 中 truthy 值的例子有哪些？

字串、數字、物件、陣列、true 和函式。

### 在 JavaScript 的 ToBoolean 操作中，如何判斷一個值是 truthy 還是 falsy？

檢查該值是否在 falsy 清單上；若不在清單上，該值就是 truthy。

## 小測驗

<details>
<summary>以下哪些值在 JavaScript 中被視為 falsy？</summary>
空字串、null、0、NaN、false、undefined
</details>

<details>
<summary>空陣列強制轉型為 Boolean 時會發生什麼？</summary>
變成 true
</details>

<details>
<summary>JavaScript 中 ToBoolean 操作是如何運作的？</summary>
透過簡單查表來判斷值是 truthy 還是 falsy
</details>

<details>
<summary>以下哪些被視為 truthy 值？</summary>
字串、數字、物件、陣列、true、函式
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
