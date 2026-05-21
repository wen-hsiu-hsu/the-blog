---
title: '強制轉型練習：實作輸入驗證函式'
description: '透過兩個輸入驗證函式（isValidName、hoursAttended）練習強制轉型的實際應用：如何正確排除空字串、非法型別、非整數，以及在允許字串與數字混用的情境下，有意識地決定在哪裡允許轉型、在哪裡阻止它。'
date: 2026-06-04
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 19
chapter: 'Coercion'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - TypeCoercion
---

# 強制轉型練習：實作輸入驗證函式

> 本文是強制轉型章節的實作練習。前幾篇建立了強制轉型的心智模型與判斷框架，這個練習的目的是在真實的輸入驗證情境中，運用對型別與強制轉型的理解來撰寫正確的驗證邏輯。

## 練習情境

驗證函式是 Web 應用中最常見的型別處理場景之一：使用者輸入的資料來自 DOM 元素，永遠是字串，但程式邏輯可能需要數值。如何在不拋出錯誤的前提下，正確處理各種輸入型別，正是這個練習要訓練的判斷力。

## 函式一：`isValidName(name)`

驗證使用者輸入的姓名是否合法。傳入值需同時滿足以下條件才回傳 `true`，否則回傳 `false`：

- 必須是字串型別
- 不能是空字串
- 去除空白後，至少有 3 個字元

**關鍵考量：** `false`、`null`、`undefined` 等非字串值必須被排除。只有空白字元的字串（如 `" \t\n"`）不應被視為有效姓名。

### 函式二：`hoursAttended(attended, length)`

驗證出席時數與課程總時數是否合理。兩個參數需同時滿足以下條件才回傳 `true`：

- 兩個參數只允許是字串或數字（`null`、`undefined`、`boolean` 一律回傳 `false`）
- 兩個值都應被當作數字處理（允許以字串形式傳入，但必須是可轉換為有效數字的字串）
- 兩個數字都必須是 0 以上的整數（不接受負數、小數點）
- `attended` 必須小於或等於 `length`

**關鍵考量：** 空字串、`"foo"` 這類無法轉為有效數字的字串必須被排除。`6.1` 或 `"6.1"` 雖然是合法數字，但不是整數，應回傳 `false`。

## 練習重點

這個練習刻意允許字串與數字混用（`hoursAttended("6", 10)` 應回傳 `true`），模擬真實的表單輸入場景。目標不是拒絕所有強制轉型，而是**有意識地選擇在哪裡允許它、在哪裡阻止它**。

測試案例的設計涵蓋了前幾篇討論過的各種角落案例：空字串轉 `0`、`NaN` 的傳播、`boolean` 被轉為數字的問題等。

## 測試範例

```javascript
// tests:
console.log(isValidName('Frank') === true);
console.log(hoursAttended(6, 10) === true);
console.log(hoursAttended(6, '10') === true);
console.log(hoursAttended('6', 10) === true);
console.log(hoursAttended('6', '10') === true);

console.log(isValidName(false) === false);
console.log(isValidName(null) === false);
console.log(isValidName(undefined) === false);
console.log(isValidName('') === false);
console.log(isValidName('  \t\n') === false);
console.log(isValidName('X') === false);
console.log(hoursAttended('', 6) === false);
console.log(hoursAttended(6, '') === false);
console.log(hoursAttended('', '') === false);
console.log(hoursAttended('foo', 6) === false);
console.log(hoursAttended(6, 'foo') === false);
console.log(hoursAttended('foo', 'bar') === false);
console.log(hoursAttended(null, null) === false);
console.log(hoursAttended(null, undefined) === false);
console.log(hoursAttended(undefined, null) === false);
console.log(hoursAttended(undefined, undefined) === false);
console.log(hoursAttended(false, false) === false);
console.log(hoursAttended(false, true) === false);
console.log(hoursAttended(true, false) === false);
console.log(hoursAttended(true, true) === false);
console.log(hoursAttended(10, 6) === false);
console.log(hoursAttended(10, '6') === false);
console.log(hoursAttended('10', 6) === false);
console.log(hoursAttended('10', '6') === false);
console.log(hoursAttended(6, 10.1) === false);
console.log(hoursAttended(6.1, 10) === false);
console.log(hoursAttended(6, '10.1') === false);
console.log(hoursAttended('6.1', 10) === false);
console.log(hoursAttended('6.1', '10.1') === false);
```

詳細解法將在下一篇說明

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
