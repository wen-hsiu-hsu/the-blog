---
title: '用遞迴實作 filter：靠 head、tail、concat 寫出函數式高階函數'
description: '不用內建 filter 與迴圈，靠遞迴與 length、head、tail、concat 重寫 filter：從空陣列的 base case 寫起，用三元運算子決定第一個元素的去留，再遞迴處理其餘元素。'
date: 2026-10-12
section: dev
category: Functional JavaScript First Steps
series: functional_javascript_first_steps
seriesTitle: 'Functional JavaScript First Steps'
order: 12
chapter: 'Higher-Order Functions'
tags:
    - frontendMasters
    - functionalJavaScriptFirstSteps
    - JavaScript
    - FunctionalProgramming
    - HigherOrderFunction
    - Recursion
    - BaseCase
    - Filter
    - Concat
    - PredicateFunction
    - TernaryOperator
    - SpreadOperator
---

# 用遞迴實作 filter：靠 head、tail、concat 寫出函數式高階函數

> [[11-higher-order-functions|上一篇]]用三明治認識了 filter、map、reduce 三個高階函數。這一篇開始自找麻煩：不用 JavaScript 內建的陣列方法，改用函數式的寫法把它們一個一個重新實作，第一個是 filter。

## 練習題目

接下來的練習會依序重新實作 filter、map、reduce 這三個函數，這一題先從 filter 開始。

`funpro.js` 裡有一個還沒實作的 `filter`，它接收一個 predicate 函數 `predicateFn` 和一個陣列 `array`：

```js
export function filter(predicateFn, array) {
    // TODO
}
```

`funpro.test.js` 裡有幾個很基本的測試，檢查 `filter` 有沒有做到預期的事：接收一個陣列、濾掉一些東西，再回傳一個新的陣列。

```js
import { describe, it, expect } from 'vitest';
import { filter } from './funpro.js';

const wholes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

describe('filter', () => {
    it('should return an array', () => {
        expect(Array.isArray(filter((i) => i, []))).toBe(true);
    });
    it('should filter the array values correctly', () => {
        expect(JSON.stringify(filter((n) => n % 2 === 0, wholes))).toBe(`[0,2,4,6,8,10]`);
        expect(JSON.stringify(filter((n) => n > 4, wholes))).toBe(`[5,6,7,8,9,10]`);
    });
});
```

### 限制：不用內建方法，也不用迭代

直接呼叫 `array.filter(predicateFn)` 當然最快，但講師笑說這樣這堂課很快就上完了，也學不到函數式程式設計。所以這題要用最萬用的鐵鎚，也就是遞迴，來重複做同一件事。

也不能用 `for (let element of array)` 這種迭代，理由是「因為我說不行」。真正的原因是要避開狀態、避開意外，例如某天太累，沒發現自己把 `i` 寫成遞增而不是遞減。沒有狀態，就不用記住任何值。這跟[[06-iteration-vs-recursion|第六篇]]說迭代是函數式程式設計的禁忌，是同一個理由。

### 可以用的輔助函數

除了遞迴，題目還準備了幾個輔助函數。它們本質上是把 JavaScript 內建陣列方法包成函數式風格的外殼，如果講師沒有加上這些人為限制，平常就會直接用那些內建方法：

```js
// Concatenate two arrays into a new single array
function concat(array1, array2) {
    return array1.concat(array2);
}

// Return the number of items in an array
function length(array) {
    return array.length;
}

// Return the first item in an array
export function head(array) {
    return array[0];
}

// Return the rest of an array after the first item
export function tail(array) {
    return array.slice(1);
}
```

- **`length`、`concat`**：`array.length` 這種寫法可以說比較偏物件導向的 API，這裡改成對陣列呼叫 `length(array)` 這種函數式的 API，`concat` 也一樣
- **`head`、`tail`**：在其他函數式語言裡常會看到，例如 Lisp 家族的 Scheme 或 Clojure。`head` 是陣列的第一個元素，相當於 JavaScript 裡存取 `array[0]`；`tail` 是除了第一個以外的其他所有元素

函數式程式設計常會談到陣列的 head 與 tail，這個說法來自 Lisp 系列語言，它是函數式語言最核心的參考對象之一。

不過講師強調，這裡做的只是用函數式 API 把 JavaScript 實際的樣子遮起來，讓大家習慣這類工具。如果用的是純函數式語言，或是 JavaScript 的某些工具函式庫，手邊就會有這類工具，講師會在課程最後附上相關連結。

## 實作 filter

### Base case：陣列是空的

遞迴函數至少要有兩種情況：base case 與遞迴情況，跟[[08-iteration-vs-recursion-fibonacci-exercise|費波那契那篇]]說的「遞迴函數一定需要 base case」一樣。先從 base case 開始通常是好主意，因為它往往比較好想。

什麼時候可以確定已經做完了？學員的答案是陣列長度為 0 的時候。陣列裡什麼都沒有，就代表所有東西都篩完了。

這時要回傳什麼？依照定義，filter 接收陣列、回傳陣列，所以一定要回傳陣列，這裡就回傳空陣列：

```js
if (length(array) === 0) return [];
```

講師補充，直接回傳 `array` 大概也可以，因為它本來就是空的。

### 只有一個元素時：用 predicate 決定要不要留下

接著是遞迴情況。講師先問：如果陣列裡只有一個東西，該怎麼做？就像在跟人解釋一樣，學員回答：用 predicate 函數測試那一個東西，通過的話就回傳它。

先用 `head` 取出陣列的第一個元素：

```js
const firstItem = head(array);
```

接著對 `firstItem` 呼叫 predicate 函數。但如果只寫到 `predicateFn(firstItem)` 就停下來，結果只會是一個布林值，因為依照定義，predicate 函數回傳的就是布林值。這裡要的不是布林值，而是「這個元素」或「沒有這個元素」。

JavaScript 有好幾種寫法可以做到，講師選了最宣告式的三元運算子：predicate 回傳 `true` 時，回傳包在陣列裡的 `firstItem`；否則回傳空陣列。

```js
const filteredFirst = predicateFn(firstItem) ? [firstItem] : [];
```

`firstItem` 要包進陣列，而不是直接回傳元素本身，因為 filter 處理的單位是陣列。這樣陣列為空、陣列只有一個元素這兩個最重要的情況就都解決了。

### 處理剩下的元素：遞迴呼叫

但只處理一個元素還不足以讓測試通過，接下來要「畫完剩下的貓頭鷹」，也就是處理其他所有元素。做法就是遞迴，再呼叫一次 `filter`。

predicate 函數照樣傳入同一個，因為所有元素都要用同一個函數篩選。陣列則不能再傳原本的，第一個元素已經檢查過了，剩下的就是其他所有元素，也就是 `tail`。例如陣列是 `[0, 1, 2, 3, 4]` 時，head 是 `0`，tail 是 `[1, 2, 3, 4]`。

```js
filter(predicateFn, tail(array));
```

### 用 concat 把兩部分接起來

到這裡還沒做完，函數還沒回傳任何東西。而且也不能只回傳遞迴呼叫的結果，那樣會少了第一個元素。

要把兩者合在一起，就用題目給的 `concat` 輔助函數，把兩個陣列接成一個陣列：

- 前面放 `filteredFirst`
- 後面放篩選過的剩餘陣列

`filteredFirst` 本來就是陣列，裡面不是有第一個元素就是空的。空的話也沒關係，有的話就接到陣列前面。完整的解答：

```js
export function filter(predicateFn, array) {
    if (length(array) === 0) return [];
    const firstItem = head(array);
    const filteredFirst = predicateFn(firstItem) ? [firstItem] : [];
    return concat(filteredFirst, filter(predicateFn, tail(array)));
}
```

測試全部通過，原本在 JavaScript 裡習慣稱為「方法」的 filter，現在全部變成函數了，講師說這叫「一路都是函數」。

每次呼叫都只處理陣列的第一個元素，再把剩下的交給下一次呼叫，陣列每次少一個元素，最後一定會縮到長度 0、碰到 base case，遞迴就此結束。

## 另一種寫法：展開運算子

講師說這不是唯一的解法，尤其最後的 `concat` 那一步。題目要求用輔助函數，所以大家都照做了，但也可以改用 JavaScript 的展開運算子（spread operator），把兩部分展開到一個新的陣列裡：

```js
return [...filteredFirst, ...filter(predicateFn, tail(array))];
```

講師把這個寫法留作課後練習，沒碰過展開運算子的話，可以參考她另一堂講 JavaScript 語言特性的課程。

## 我的解法

自己做這題時的寫法如下，沒有另外存 `firstItem`，而是在需要的地方直接呼叫 `head(array)`，再把三元運算子直接放進 `concat` 的第一個參數：

```js
export function filter(predicateFn, array) {
    if (length(array) === 0) return [];

    const isKeepingHeadElement = predicateFn(head(array));

    return concat(isKeepingHeadElement ? [head(array)] : [], filter(predicateFn, tail(array)));
}
```

寫的時候忘了在遞迴呼叫的 `filter` 第一個參數傳入 `predicateFn`，疑惑了超級久，又被自己笨到了。

## 複習

### 實作遞迴版的 filter 函數時，要考慮哪兩個核心情況？

base case（陣列為空時）與遞迴情況（陣列至少有一個元素時）。

### 在函數式程式設計中，陣列的第一個元素和其餘元素分別叫什麼？

head（第一個元素）與 tail（其餘元素）。

### 函數式風格的 filter 函數，通常怎麼處理只有一個元素的陣列？

用 predicate 函數測試這個元素，通過的話就回傳包著這個元素的陣列，沒通過就回傳空陣列。

### 用這種函數式做法實作 filter 時，關鍵的限制是什麼？

避開狀態、用遞迴取代迭代，並回傳一個新陣列，不修改原本的陣列。

### 這種做法建議用哪些輔助函數來實作函數式的 filter？

使用 `length`（取代 `array.length`）、`concat`、`head`（第一個元素）與 `tail`（其餘元素）這類函數。

### 在函數式程式設計中，常用來把陣列拆成第一個元素與其餘元素的兩個操作是什麼？

head 與 tail。

### 遞迴版 filter 的 base case 是什麼？

陣列長度為 0 的時候。

### 為什麼函數式做法要避免傳統的迭代？

為了避開狀態與可能的意外。

### 在處理陣列的函數式程式設計中，`head` 函數回傳什麼？

陣列的第一個元素。

## 小測驗

<details>
<summary>實作遞迴版的 filter 函數時，要考慮哪兩個核心情況？</summary>
base case（陣列為空時）與遞迴情況（陣列至少有一個元素時）
</details>

<details>
<summary>在函數式程式設計中，陣列的第一個元素和其餘元素分別叫什麼？</summary>
head（第一個元素）與 tail（其餘元素）
</details>

<details>
<summary>函數式風格的 filter 函數，通常怎麼處理只有一個元素的陣列？</summary>
用 predicate 函數測試這個元素，通過的話就回傳包著這個元素的陣列，沒通過就回傳空陣列
</details>

<details>
<summary>用這種函數式做法實作 filter 時，關鍵的限制是什麼？</summary>
避開狀態、用遞迴取代迭代，並回傳一個新陣列，不修改原本的陣列
</details>

<details>
<summary>這種做法建議用哪些輔助函數來實作函數式的 filter？</summary>
使用 <code>length</code>（取代 <code>array.length</code>）、<code>concat</code>、<code>head</code>（第一個元素）與 <code>tail</code>（其餘元素）這類函數
</details>

<details>
<summary>在函數式程式設計中，常用來把陣列拆成第一個元素與其餘元素的兩個操作是什麼？</summary>
head 與 tail
</details>

<details>
<summary>遞迴版 filter 的 base case 是什麼？</summary>
陣列長度為 0 的時候
</details>

<details>
<summary>為什麼函數式做法要避免傳統的迭代？</summary>
為了避開狀態與可能的意外
</details>

<details>
<summary>在處理陣列的函數式程式設計中，<code>head</code> 函數回傳什麼？</summary>
陣列的第一個元素
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Functional JavaScript First Steps, v2](https://frontendmasters.com/courses/functional-first-steps-v2/) 課程筆記
