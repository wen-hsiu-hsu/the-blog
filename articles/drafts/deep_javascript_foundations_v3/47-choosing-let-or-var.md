---
title: '`var` 與 `let` 的語意分工：各自有其適當的位置'
description: '說明 var 與 let 的語意分工：var 表達「屬於整個函式」、let 表達「屬於這個區塊」。整理 var 仍然有價值的三個具體場景，以及為什麼「let is the new var」是錯誤的建議。'
date: 2026-06-18
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 47
chapter: 'Advanced Scope'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - Scope
  - BlockScope
---

# `var` 與 `let` 的語意分工：各自有其適當的位置

> 本文延續[[46-block-scoping|上一篇]]對區塊範疇的討論。上一篇建立了「`let` 用於已在語意上屬於區塊的變數」的原則，這篇要更進一步說明為什麼 `var` 仍然是有價值的工具，以及兩者應如何搭配使用。

## 函式層級變數應使用 `var`，迴圈計數器應使用 `let`

```javascript
function repeat(fn, n) {
    var result;          // 屬於整個函式，用 var 表達這個意圖

    for (let i = 0; i < n; i++) {   // i 只屬於迴圈，用 let
        result = fn(result, i);
    }

    return result;
}
```

`result` 在函式的整個生命週期都會被使用（迴圈內賦值、函式最後回傳），它自然屬於函式範疇；`i` 只在迴圈執行期間有意義，天然是區塊範疇。

如果把第 2 行的 `var result` 改成 `let result`，程式雖然在這個例子中仍然能運作，但語意訊號變模糊了，讀者無法從 `let` 判斷你是否打算讓這個變數跨越多個區塊使用。`var` 在這裡傳遞的訊息是：「這個變數屬於整個函式」。

## `var` 的獨特能力：同一範疇可以重複宣告

`var` 允許在同一個函式範疇內被宣告多次，`let` 不允許。在某些情況下，這個能力很有用：

```javascript
function lookupRecord(searchStr) {
    try {
        var id = getRecord(searchStr);
    }
    catch (err) {
        var id = -1;        // 重複宣告，編譯期視為 no-op，只是一顆彈珠
    }

    return id;              // 可以存取，因為 var 附著在函式範疇
}
```

`var` 會忽略 `try/catch` 的區塊邊界，直接附著到函式範疇。在這個例子中，兩個 `var id` 在編譯期只會建立一顆彈珠（第二次宣告等同於 no-op），但在程式碼可讀性上，在兩個不同路徑各放一個 `var id` 能清楚表達「無論走哪條路，這個函式範疇都會有一個 `id`」。

如果改用 `let`，`id` 會被困在各自的區塊內，第 9 行就會出現 ReferenceError。

## `try/catch` 不是為了隱藏範疇而存在的

Kyle Simpson 的觀點是：`try/catch` 是用來處理例外的語法結構，不是用來建立範疇邊界的。如果在裡面使用 `let`，它就意外地成為一個範疇，這通常不是你想要的行為。這是「`let` 全域替換 `var`」建議的另一個會導致 bug 的場景。

## 在長函式中用 `var` 重複宣告來消除歧義

對於超過 100 行的長函式（雖然不理想，但現實中確實存在），在函式中段重新使用某個變數時，讀者可能已經忘記它是在哪裡宣告的。用 `var` 重複宣告可以作為一種提示：

```javascript
function processData() {
    var id = fetchInitialId();

    // ... 200 行程式碼 ...

    var id = recalculate();    // 明確告訴讀者：id 屬於這個函式範疇
    return id;
}
```

第二個 `var id` 在執行層面不建立新的彈珠（只有一顆），但它在程式碼閱讀層面傳達了明確的訊息：「這個 `id` 是函式層級的變數，不是某個更外層的東西」。`let` 做不到這一點，因為重複宣告 `let` 會直接拋出錯誤。

## `let` 是 `var` 的補充，不是替代

Kyle Simpson 對「let is the new var」這個口號的回應是：在電腦科學歷史上，幾乎沒有哪個新事物真的完全取代了舊事物，幾乎都是「增補」而非「取代」。`let` 也一樣——它是 `var` 的補充工具，兩者各有其語意定位：

| 工具  | 適合場景                                                                                        |
| ----- | ----------------------------------------------------------------------------------------------- |
| `var` | 屬於整個函式生命週期的變數；需要跨越 `try/catch` 等區塊的變數；需要在長函式中重複宣告以消除歧義 |
| `let` | 天然屬於某個區塊的變數（如迴圈計數器、`if` 內的臨時變數）                                       |

## 小結

`var` 和 `let` 不是互相取代的關係，而是表達不同語意意圖的兩種工具。`var` 表達「這個變數屬於整個函式」，`let` 表達「這個變數只屬於這個區塊」。在需要跨越 `try/catch` 等結構、或需要在長函式中重複宣告作為語意提示時，`var` 是比 `let` 更合適的工具。選對工具，並用正確的方式使用它，才是這兩個關鍵字共存的正確姿勢。

## 複習

### 對於跨越整個函式範疇的變數，建議使用哪種宣告方式？

使用 `var` 關鍵字宣告應在整個函式中使用的變數，因為它能傳達更廣泛範疇使用意圖的語意訊號。

### `var` 有哪個 `let` 沒有的獨特能力？

`var` 可以在同一個函式範疇內被多次宣告，而 `let` 不允許重複宣告。

### 在 try/catch 區塊內使用 `let` 時會發生什麼？

`let` 會自動將自身限制在 try/catch 區塊的範疇內，如果該變數需要在區塊外使用，可能會導致程式碼出錯。

### `var` 如何幫助在長函式中消除變數範疇的歧義？

透過在長函式的不同位置重複宣告變數，`var` 能清楚說明變數所屬的範疇，提升程式碼可讀性。

### `let` 和 `var` 在現代 JavaScript 中是什麼關係？

`let` 不是 `var` 的完全替代品，而是與 `var` 並存的額外工具，兩者有不同的範疇行為。

## 小測驗

<details>
<summary>對於應跨越整個函式使用的變數，建議使用哪種宣告關鍵字？</summary>
var
</details>

<details>
<summary>`var` 有哪個 `let` 沒有的獨特能力？</summary>
可以在同一個函式範疇內多次重複宣告
</details>

<details>
<summary>關於使用 `let` 還是 `var`，講師的主要論點是什麼？</summary>
`let` 應用於天然屬於區塊範疇的變數
</details>

<details>
<summary>在 try/catch 區塊內宣告的 `let` 變數會發生什麼？</summary>
它會被限制在 try/catch 的區塊範疇內
</details>

<details>
<summary>講師如何描述 `let` 和 `var` 之間的關係？</summary>
let 不是新的 var，而是 let 加上 var 才是完整的組合
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記