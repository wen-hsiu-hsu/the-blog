---
title: '明確的 `let` 區塊：縮短變數的生命週期'
description: '說明為短命變數主動建立專屬 let 區塊的做法：用大括號縮小變數的生命週期，並把宣告和開括號放在同一行讓意圖立即清楚。這不是新發明，而是其他有區塊範疇語言幾十年來的常見做法。
'
date: 2026-06-19
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 48
chapter: 'Advanced Scope'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - Scope
  - BlockScope
---

# 明確的 `let` 區塊：縮短變數的生命週期

> 本文延續 `var` 與 `let` 語意分工的討論。[[47-choosing-let-or-var|上一篇]]說明了哪些變數應該用 `var`，這篇要談 `let` 的積極用法：當一個變數只需要存活幾行程式碼時，應該主動為它建立一個專屬的區塊，而不是讓它漂浮在整個函式範疇的頂層。

## 問題：把 `let` 堆在函式頂層

很多開發者習慣把所有 `let` 宣告放在函式的最上方：

```javascript
function formatStr(str) {
    let prefix, rest;       // 宣告在頂層

    prefix = str.slice(0, 3);
    rest = str.slice(3);
    str = prefix.toUpperCase() + rest;

    if (/^FOO:/.test(str)) {
        return str;
    }

    return str.slice(4);
}
```

`prefix` 和 `rest` 實際上只在第 3 到第 5 行被用到，但它們宣告在函式頂層，意味著它們在函式的整個生命週期都「存在」，即使後續的程式碼根本不需要它們。這對讀者也造成負擔，他們必須掃描整個函式才能確認這兩個變數的用途範圍。

## 解法：用明確的區塊縮小生命週期

```javascript
function formatStr(str) {
    { let prefix, rest;         // 宣告和開括號放在同一行，意圖一目了然
        prefix = str.slice(0, 3);
        rest = str.slice(3);
        str = prefix.toUpperCase() + rest;
    }

    if (/^FOO:/.test(str)) {
        return str;
    }

    return str.slice(4);
}
```

刻意建立一個只為 `prefix` 和 `rest` 存在的區塊，用完即消。當讀者看到 `{ let prefix, rest;` 時，立刻就能理解：這兩個變數是為了這個區塊而生的，不需要在其他地方尋找或擔心它們。

Kyle Simpson 特意把 `let` 宣告和開括號放在同一行，這不只是節省空間，而是刻意讓「這兩個變數是為這個區塊建立的」這個意圖無法被誤讀。

## 這不是新概念

在 C、C++、Java 等有區塊範疇的語言中，主動開一對大括號來限制變數的存活範圍，已經是幾十年的常見做法。JavaScript 在有了 `let` 之後，終於能做同樣的事。

## 小結

當一個變數只需要幾行程式碼，就為它建立一個專屬的 `let` 區塊。把宣告和開括號放在同一行，讓意圖立即清楚。主動縮小變數的生命週期，是讓程式碼意圖更精確、更易讀的具體做法。

## 複習

### 對於只需要幾行程式碼的變數，建議採用什麼方式？

用大括號建立一個區塊範疇，並在該有限的範疇內宣告變數，明確表達其使用範圍與生命週期。

### 在區塊範疇內宣告變數時，有什麼能讓用途更清楚的建議做法？

將變數宣告和開括號放在同一行，讓讀者一眼就能看出這些變數是專為這個區塊而建立的。

### 對短命變數使用區塊範疇的主要好處是什麼？

更清楚地傳達程式碼的意圖，限制變數的作用範圍和生命週期，讓程式碼更易讀且更具明確性。

### 使用區塊範疇變數時，效能上有明顯差異嗎？

沒有，在實際開發中幾乎不可能觀察到任何有意義的效能差異。

### 區塊範疇可以有效應用在哪些地方？

區塊範疇可以用在程式碼的任何地方，包括 if 陳述式內，用來限制只需要幾行程式碼的變數的作用範圍。

## 小測驗

<details>
<summary>對於只需要幾行程式碼就用完的變數，建議採用什麼方式？</summary>
用大括號建立一個專屬的區塊範疇
</details>

<details>
<summary>為變數建立明確的區塊範疇，主要目的是什麼？</summary>
讓程式碼更易讀且意圖更清楚
</details>

<details>
<summary>根據課程討論，使用區塊範疇可能帶來什麼效能影響？</summary>
幾乎沒有可觀察到的效能差異
</details>

<details>
<summary>區塊範疇的建議在什麼情境下適用？</summary>
在 if 陳述式和其他程式碼區塊中
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記