---
title: '相等性練習：實作受控制的強制相等搜尋函式'
description: '實作 findAll(value, array) 練習：在一套明確的強制相等規則下，找出陣列中所有符合條件的值。規則涵蓋 null/undefined 互匹配、字串與數字的受控轉型、NaN 與 -0 的特殊處理，以及 boolean 與物件的嚴格限制。'
date: 2026-06-08
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 28
chapter: 'Equality'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - EqualityComparison
  - TypeCoercion
---

# 相等性練習：實作受控制的強制相等搜尋函式

> 本文是相等性章節的實作練習。前幾篇完整分析了 `==` 演算法、各種角落案例，以及使用準則。這個練習的目標是把這些知識整合起來：在一個受明確規則約束的強制相等比較系統中，實作一個搜尋函式。

## 練習情境

寫一個 `findAll(value, array)` 函式，在 `array` 中找出所有與 `value` 符合特定強制相等規則的元素，回傳一個包含所有匹配項目的陣列。

這個練習的核心挑戰在於：**規則不是直接用 `==` 就好**，而是一套更精確的強制相等規則，涵蓋了我們在這一系列討論中見過的幾乎所有角落案例。

## 條件說明

1. `findAll(..)` 函式接受一個值和一個陣列，並回傳一個陣列。

2. 允許的強制相等匹配規則如下：

   - 完全相同（使用 `Object.is(..)`）
   - 字串（空字串或只有空白字元的字串除外）可以匹配數字
   - 數字（`NaN` 及正負無限大除外）可以匹配字串（提示：注意 `-0` 的處理！）
   - `null` 可以匹配 `undefined`，反之亦然
   - boolean 只能匹配 boolean
   - 物件只能匹配完全相同的物件參考

## 測試範本

```javascript
var myObj = { a: 2 };

var values = [null, undefined, -0, 0, 13, 42, NaN, -Infinity, Infinity, "", "0", "42", "42hello", "true", "NaN", true, false, myObj];

console.log(setsMatch(findAll(null, values), [null, undefined]) === true);
console.log(setsMatch(findAll(undefined, values), [null, undefined]) === true);
console.log(setsMatch(findAll(0, values), [0, "0"]) === true);
console.log(setsMatch(findAll(-0, values), [-0]) === true);
console.log(setsMatch(findAll(13, values), [13]) === true);
console.log(setsMatch(findAll(42, values), [42, "42"]) === true);
console.log(setsMatch(findAll(NaN, values), [NaN]) === true);
console.log(setsMatch(findAll(-Infinity, values), [-Infinity]) === true);
console.log(setsMatch(findAll(Infinity, values), [Infinity]) === true);
console.log(setsMatch(findAll("", values), [""]) === true);
console.log(setsMatch(findAll("0", values), [0, "0"]) === true);
console.log(setsMatch(findAll("42", values), [42, "42"]) === true);
console.log(setsMatch(findAll("42hello", values), ["42hello"]) === true);
console.log(setsMatch(findAll("true", values), ["true"]) === true);
console.log(setsMatch(findAll(true, values), [true]) === true);
console.log(setsMatch(findAll(false, values), [false]) === true);
console.log(setsMatch(findAll(myObj, values), [myObj]) === true);

console.log(setsMatch(findAll(null, values), [null, 0]) === false);
console.log(setsMatch(findAll(undefined, values), [NaN, 0]) === false);
console.log(setsMatch(findAll(0, values), [0, -0]) === false);
console.log(setsMatch(findAll(42, values), [42, "42hello"]) === false);
console.log(setsMatch(findAll(25, values), [25]) === false);
console.log(setsMatch(findAll(Infinity, values), [Infinity, -Infinity]) === false);
console.log(setsMatch(findAll("", values), ["", 0]) === false);
console.log(setsMatch(findAll("false", values), [false]) === false);
console.log(setsMatch(findAll(true, values), [true, "true"]) === false);
console.log(setsMatch(findAll(true, values), [true, 1]) === false);
console.log(setsMatch(findAll(false, values), [false, 0]) === false);

// ***************************

function setsMatch(arr1, arr2) {
    if (Array.isArray(arr1) && Array.isArray(arr2) && arr1.length == arr2.length) {
        for (let v of arr1) {
            if (!arr2.includes(v)) return false;
        }
        return true;
    }
    return false;
}
```

詳細解法將在下一篇說明。

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記