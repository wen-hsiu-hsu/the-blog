---
title: '強制轉型練習解析：`isValidName` 與 `hoursAttended`'
description: '逐步解析 isValidName 與 hoursAttended 兩個驗證函式的實作邏輯：如何用 typeof 搭配 trim() 排除空白字串、如何讓「先轉型再統一驗證」的流程自然過濾非法輸入，以及 Number.isInteger() 在整數檢查中的角色。'
date: 2026-06-04
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 20
chapter: 'Coercion'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - TypeCoercion
---

# 強制轉型練習解析：`isValidName` 與 `hoursAttended`

> 本文延續[[19-coercion-exercise|上一篇]]的實作練習，逐步解析兩個驗證函式的解題邏輯，並比較不同實作方式的權衡取捨。

## `isValidName` 解析

### 講者解法

```javascript
function isValidName(name) {
    if (typeof name == 'string' && name.trim().length >= 3) {
        return true;
    }
    return false;
}
```

兩個條件缺一不可：

**`typeof name == "string"`**：`typeof` 永遠回傳非空字串，與字串字面量用 `==` 比對是安全的，不存在角落案例。這一步同時排除了 `null`、`undefined`、`false` 等非字串值。

**`name.trim().length >= 3`**：`trim()` 去除前後所有空白字元（包括 `\t`、`\n`），之後再量長度。這樣的寫法一次同時處理了「空字串」和「只有空白的字串」兩種情況，不需要分開判斷。

## `hoursAttended` 解析

這個函式的核心挑戰是：允許字串或數字傳入，但必須排除空字串、無法轉換的字串、`null`、`undefined`、`boolean` 等值。

### 講者解法的策略：先嘗試轉型，再統一驗證

```javascript
function hoursAttended(attended, length) {
    // 若是非空字串，嘗試轉為數字
    if (typeof attended == 'string' && attended.trim() != '') {
        attended = Number(attended);
    }
    if (typeof length == 'string' && length.trim() != '') {
        length = Number(length);
    }

    // 統一驗證：此時兩者必須都是數字，且通過所有數值檢查
    if (
        typeof attended == 'number' &&
        typeof length == 'number' &&
        attended >= 0 &&
        length >= 0 &&
        Number.isInteger(attended) &&
        Number.isInteger(length) &&
        attended <= length
    ) {
        return true;
    }
    return false;
}
```

**流程邏輯：**

1. 若傳入的是非空字串，嘗試用 `Number()` 轉型。若字串無法轉為有效數字（如 `"foo"`），`Number("foo")` 得到 `NaN`，`typeof NaN` 是 `"number"`，但 `Number.isInteger(NaN)` 是 `false`，最後的驗證自然失敗。
2. 若傳入的是空字串或只有空白，`attended.trim() != ""` 為 `false`，不進行轉型，值保持為字串，最後的 `typeof == "number"` 檢查失敗。
3. 若傳入的是 `null`、`undefined`、`boolean`，完全不觸發字串分支，也不是數字，同樣在最後的型別檢查失敗。

這個方法巧妙地讓「先轉型，再統一驗證」的流程自然過濾掉所有非法輸入，不需要針對每種異常型別個別處理。

## 小結

這個練習展示了如何運用對強制轉型的理解來設計實用的輸入驗證邏輯：利用 `trim()` 處理空白問題、利用型別轉換的自然失敗來過濾非法輸入、用 `Number.isInteger()` 精確排除小數。

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
