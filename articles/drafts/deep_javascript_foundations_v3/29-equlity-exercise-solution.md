---
title: '相等性練習解析：`findAll` 的實作邏輯'
description: '逐步解析 findAll 練習的實作邏輯：以 Object.is() 作為第一關處理 NaN 與 -0，再依序處理 null/undefined 互匹配、boolean 嚴格配對，以及字串與數字的受控強制轉型——示範如何先消除角落案例，再安全地使用 ==。'
date: 2026-06-09
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 29
chapter: 'Equality'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - EqualityComparison
  - TypeCoercion
---

# 相等性練習解析：`findAll` 的實作邏輯

> 本文是[[28-equality-exercise|上一篇]]練習的解答說明。這個練習的核心目的不是教你實作 `findAll` 這個函式本身，而是透過逐一消除角落案例的過程，示範「受控的強制相等比較」應該長什麼樣子。

## 完整解法

```javascript
function findAll(match, arr) {
    var ret = [];
    for (let v of arr) {

        // 規則一：完全相同（處理 NaN、-0 的正確比較）
        if (Object.is(match, v)) {
            ret.push(v);
        }

        // 規則二：null 與 undefined 互相匹配
        else if (match == null && v == null) {
            ret.push(v);
        }

        // 規則三：boolean 只匹配 boolean，且必須完全相同
        else if (typeof match == "boolean") {
            if (match === v) {
                ret.push(v);
            }
        }

        // 規則四：非空字串可以匹配數字（排除 -0）
        else if (
            typeof match == "string" &&
            match.trim() != "" &&
            typeof v == "number" &&
            !Object.is(-0, v)
        ) {
            if (match == v) {
                ret.push(v);
            }
        }

        // 規則五：非特殊數字可以匹配非空字串（排除 -0、NaN、Infinity）
        else if (
            typeof match == "number" &&
            !Object.is(match, -0) &&
            !Object.is(match, NaN) &&
            !Object.is(match, Infinity) &&
            !Object.is(match, -Infinity) &&
            typeof v == "string" &&
            v.trim() != ""
        ) {
            if (match == v) {
                ret.push(v);
            }
        }
    }
    return ret;
}
```

## 規則一：`Object.is()` 作為第一關

```javascript
if (Object.is(match, v)) {
    ret.push(v);
}
```

`Object.is()` 是整個函式的基礎，優先於所有其他規則執行。它正確處理了兩個 `===` 說謊的角落案例：

- `Object.is(NaN, NaN)` → `true`（`NaN` 匹配自身）
- `Object.is(-0, -0)` → `true`（`-0` 匹配自身）
- `Object.is(-0, 0)` → `false`（`-0` 不匹配 `0`）

這一條規則讓後續規則不需要再處理「完全相同」的情況。

## 規則二：`null` 與 `undefined` 的強制相等

```javascript
else if (match == null && v == null) {
    ret.push(v);
}
```

利用 `== null` 同時匹配 `null` 和 `undefined` 的特性（規格書第 2、3 條保證這是安全的，且不會匹配其他任何值）。這是我們在相等性章節中提到的 `== null` 最佳使用場景。

## 規則三：boolean 嚴格配對

```javascript
else if (typeof match == "boolean" && typeof v == "boolean") {
    if (match === v) {
        ret.push(v);
    }
}
```

設計為兩層判斷：外層確認 `match` 是 boolean，內層用 `===` 確保兩者完全相同。

為什麼內層可以用 `==` 替代 `===`？因為外層已經確認 `match` 是 boolean，而如果 `v` 不是 boolean，`match == v` 會觸發 `ToNumber`（boolean 轉 0 或 1），導致 `true == 1` 這類不想要的匹配。所以這裡選擇在外層先確認兩者都是 boolean，再比較——此時 `==` 和 `===` 效果相同，用哪個都可以。

## 規則四：字串匹配數字（排除 `-0`）

```javascript
else if (
    typeof match == "string" &&
    match.trim() != "" &&       // 排除空字串和只有空白的字串
    typeof v == "number" &&
    !Object.is(-0, v)           // 排除 -0
) {
    if (match == v) { ret.push(v); }
}
```

**為什麼要排除 `-0`？**

`String(-0)` 得到 `"0"`，而 `"-0" == -0` 透過強制轉型會讓 `"-0"` 轉成 `-0` 再比較，但字串 `"0"` 對應的是 `0` 而非 `-0`。若不排除 `-0`，`"0"` 可能意外匹配到 `-0`，產生錯誤結果。

**外層先消除角落案例，內層才信任 `==`**：這是整個函式最核心的設計模式——不是直接用 `==`，而是先用外層條件縮小安全範圍，確認沒有角落案例後，才讓 `==` 做強制相等比較。

## 規則五：數字匹配字串（排除 `-0`、`NaN`、`Infinity`）

```javascript
else if (
    typeof match == "number" &&
    !Object.is(match, -0) &&
    !Object.is(match, NaN) &&
    !Object.is(match, Infinity) &&
    !Object.is(match, -Infinity) &&
    typeof v == "string" &&
    v.trim() != ""              // 排除空字串和只有空白的字串
) {
    if (match == v) { ret.push(v); }
}
```

排除的值：

- `-0`：字串化後變 `"0"`，會造成混淆
- `NaN`：`NaN == "NaN"` 是 `false`（NaN 不等於任何東西），但 `NaN` 也是 number，不排除會進入這個分支
- `Infinity`、`-Infinity`：不應參與字串強制轉型的比較

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記