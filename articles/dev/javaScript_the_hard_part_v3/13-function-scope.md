---
title: JavaScript Closure 背包機制：私有狀態如何被保留
description: 剖析 JavaScript Closure（閉包）的背包機制:為什麼只打包被參照的變數、資料如何保持私有,以及它在 Module Pattern 與非同步程式中扮演的關鍵角色。
date: 2026-05-02
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 13
section: dev
category: JavaScript Hard Parts v3
tags:
    - JavaScript
    - Closure
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# JavaScript Closure 背包機制：私有狀態如何被保留

## 函式的兩種記憶體

透過前一節的範例知道，當一個函式從另一個函式內部被定義並回傳時，它會同時擁有**兩種記憶體**：

| 記憶體類型                 | 存在時間                         | 存取範圍             |
| -------------------------- | -------------------------------- | -------------------- |
| 本地記憶體（Local Memory） | 僅限該次函式執行期間，結束即清除 | 函式執行時           |
| 背包（Backpack / Closure） | 跨越多次呼叫，持續存在           | 僅限持有該背包的函式 |

這打破了我們原本對函式的認識：函式不只是「執行時建立記憶體、結束後全部清除」的單純單元，如果它是從另一個函式中被定義並回傳的，它就會額外擁有一份持久的私有資料儲存空間。

## 背包裡裝了什麼？

一個合理的問題是：背包會不會把外層函式所有的本地資料都打包進去？

答案是**不會**。JavaScript 在函式被定義的當下，會讀取該函式的程式碼內容，分析它實際**參照（reference）了哪些識別字（identifier）**，然後只保留那些有被用到的資料。

以下面的例子說明：

```javascript
function outer() {
    let counter = 0;
    let anotherCounter = 5; // add1 從未參照這個
    function add1() {
        counter++; // 只參照了 counter
    }
    return add1;
}
```

`anotherCounter` 從未在 `add1` 的函式主體中出現，因此 JavaScript 不會將它納入背包。它會被**垃圾回收（garbage collection）**，從記憶體中清除。

背包中的資料只能透過持有它的函式來存取，外界無法直接讀取。既然如此，只儲存真正有用的部分即可。

## 背包具有私有性

背包中的資料有一個重要特性——它**不是全域資料**，也**不是每次呼叫都重寫的本地資料**，而是只有持有它的函式才能存取的**私有持久資料**。

```javascript
const newFunc = outer();
newFunc(); // counter: 0 → 1
newFunc(); // counter: 1 → 2
```

第二次呼叫 `newFunc` 時，本地記憶體是**全新的**（沒有上次的任何資料），但背包中的 `counter` 已是 `1`，並在此基礎上繼續累加至 `2`。這份資料無法從外部直接取用，也不會被其他程式碼意外覆蓋。

## 為什麼這件事很重要？

Closure 之所以在 JavaScript 中無處不在，是因為它優雅地解決了一個長期存在的矛盾：

- 函式執行結束後資料就消失：讓程式可預測，但無法持久保存狀態
- 把資料放進全域：可以持久，但容易造成命名衝突，污染全域命名空間

Closure 提供了第三條路：**資料持久存在，但只對特定函式可見**。

這正是 Module Pattern（模組模式）的核心原理。在一個龐大的程式庫中，不同的開發者可能都想使用 `result` 這樣的變數名稱。透過 Closure，這些資料可以被鎖在各自的背包中，互不干擾，也不會洩漏到全域。

此外，在非同步程式設計中，當一個函式要在「稍後的某個時機」（例如 API 回傳資料後）才被執行時，Closure 確保它在被呼叫的當下，仍能取得它最初定義時所綁定的資料——這是非同步回呼能夠正確運作的根本原因。

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
