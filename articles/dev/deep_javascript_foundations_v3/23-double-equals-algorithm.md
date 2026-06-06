---
title: '`==` 演算法逐步解析：偏好數字、遞迴收斂'
description: '完整解析 == 演算法的核心傾向：偏好將不同型別的值轉為數字再比較。說明型別相同時直接執行 ===、遇到物件時先觸發 ToPrimitive，以及整個演算法如何遞迴收斂到最終結果。'
date: 2026-06-06
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 23
chapter: 'Equality'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - EqualityComparison
    - TypeCoercion
---

# `==` 演算法逐步解析：偏好數字、遞迴收斂

> 本文延續[[22-coercive-equality|上一篇]]對 `==` 演算法的討論。前一篇聚焦在 `null`/`undefined` 的特殊相等性，這篇要完整走過演算法的其餘部分，理解 `==` 在各種型別組合下的實際行為模式。

## 演算法的核心傾向：偏好數字比較

觀察[規格書 7.2.14 的第 4 至 7 條](https://262.ecma-international.org/9.0/index.html#sec-abstract-equality-comparison)：

| 條件                     | 行為                    |
| ------------------------ | ----------------------- |
| x 是 Number，y 是 String | 回傳 `x == ToNumber(y)` |
| x 是 String，y 是 Number | 回傳 `ToNumber(x) == y` |
| x 是 Boolean             | 回傳 `ToNumber(x) == y` |
| y 是 Boolean             | 回傳 `x == ToNumber(y)` |

這四條規則中，`ToNumber` 出現了四次。`==` 演算法的底層傾向非常明確：**盡可能把不同型別的值都轉為數字，再做數值比較**。

知道這一點，就能預測大量 `==` 的行為，而不需要死記每個案例。

## 數字與字串的比較：`==` 的實用場景

```javascript
var workshopEnrollment1 = 16;
var workshopEnrollment2 = workshop2Elem.value;   // 來自表單，是字串

// 顯式轉型（使用 ===）
if (Number(workshopEnrollment1) === Number(workshopEnrollment2)) { ... }

// 問：我們已經知道型別了嗎？
if (workshopEnrollment1 == workshopEnrollment2) { ... }
```

如果你的程式碼結構保證這個比較只會出現數字與字串兩種型別，那麼 `==` 會自動對字串呼叫 `ToNumber`，效果等同於顯式轉型版本。上方那行 `Number()` 的顯式轉型在這個情境下只是雜訊，讓讀者多讀了一個不必要的細節。

## 兩邊型別相同時：`==` 直接執行 `===`

一個常被忽略的事實：如果比較的兩側型別已經相同，`==` 不做任何轉型，直接執行 `===`。因此，如果傳入的兩個值都是字串，`==` 就是字串的嚴格比較，不涉及任何強制轉型。

強制轉型只在型別不同時才發生。

## 非原始型別：先觸發 `ToPrimitive`

演算法第 8、9 條處理物件：

| 條件                                   | 行為                       |
| -------------------------------------- | -------------------------- |
| x 是 String/Number/Symbol，y 是 Object | 回傳 `x == ToPrimitive(y)` |
| x 是 Object，y 是 String/Number/Symbol | 回傳 `ToPrimitive(x) == y` |

`==` 只比較原始值。當一側是物件時，先呼叫 `ToPrimitive` 取得原始值，再重新走一遍演算法。這也是演算法遞迴特性的體現——不斷重新執行，直到兩側都是原始值，或找到某個匹配的條件，或最終回傳 `false`（第 10 條）。

## 演算法的完整收斂邏輯

```
開始比較 x == y
│
├── 型別相同？→ 執行 ===，結束
├── null/undefined 組合？→ true，結束
├── 數字與字串？→ 字串轉為數字，重新執行演算法
├── 有 Boolean？→ Boolean 轉為數字，重新執行演算法
├── 有 Object？→ ToPrimitive，重新比較
└── 以上都不符合？→ false，結束
```

演算法保證最終一定會收斂到兩個原始值的比較，或回傳 `false`。

## 小結

`==` 演算法的核心傾向是偏好數字比較，並在遇到物件時先拆解為原始值。整個演算法是遞迴的，不斷重新執行直到能做出明確判斷。理解這個結構，就能在任何型別組合下預測 `==` 的行為，而不是依靠零散的記憶或盲目迴避它。

## 複習

### 雙等號（`==`）在比較不同型別時偏好做什麼？

雙等號偏好將不同型別都轉換為數字來進行比較，透過呼叫數值強制轉型完成比較。

### 使用雙等號（`==`）比較兩個字串時會發生什麼？

當兩個運算元都是字串（型別相同）時，比較行為與三等號（`===`）完全相同，直接進行字串比較。

### 雙等號（`==`）如何處理非原始型別的值？

對於非原始型別的值，雙等號會先呼叫 `ToPrimitive` 抽象操作將其轉換為原始型別，再進行比較。

### 雙等號（`==`）比較數字和字串時的行為是什麼？

雙等號會將字串轉換為數字，以進行數值比較，從而允許跨型別的比較。

### 雙等號（`==`）在型別強制轉型過程中找不到匹配的條件時，會發生什麼？

若在強制轉型過程中找不到任何匹配的條件，比較最終回傳 false，表示兩個值不相等。

## 小測驗

<details>
<summary>雙等號（==）在比較不同型別時偏好做什麼？</summary>
將所有值都轉換為數字再進行比較
</details>

<details>
<summary>當雙等號比較的兩個運算元型別相同時，會發生什麼？</summary>
執行三等號（===）的比較
</details>

<details>
<summary>雙等號在比較非原始型別值時會做什麼？</summary>
呼叫 ToPrimitive 抽象操作
</details>

<details>
<summary>雙等號比較演算法的最終目標是什麼？</summary>
比較兩個型別相同的原始值，或兩個可強制相等的原始值
</details>

<details>
<summary>如果雙等號演算法找不到比較兩個值的方式，會發生什麼？</summary>
回傳 false
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
