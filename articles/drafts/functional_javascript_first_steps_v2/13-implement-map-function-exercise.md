---
title: '用遞迴實作 map：把轉換後的 head 接上 tail 的遞迴結果'
description: '延續遞迴版 filter 的寫法重新實作 map：base case 同樣是空陣列，遞迴情況對 head 套用轉換函數，再用 concat 接上對 tail 遞迴呼叫 map 的結果，全部寫在一行。'
date: 2026-10-13
section: dev
category: Functional JavaScript First Steps
series: functional_javascript_first_steps
seriesTitle: 'Functional JavaScript First Steps'
order: 13
chapter: 'Higher-Order Functions'
tags:
    - frontendMasters
    - functionalJavaScriptFirstSteps
    - JavaScript
    - FunctionalProgramming
    - HigherOrderFunction
    - Recursion
    - BaseCase
    - Map
    - Concat
    - TransformationFunction
    - DeclarativeProgramming
---

# 用遞迴實作 map：把轉換後的 head 接上 tail 的遞迴結果

> [[12-implement-filter-function-exercise|上一篇]]用遞迴與 `length`、`head`、`tail`、`concat` 這幾個輔助函數重新實作了 filter。這一篇輪到下一個高階函數 map，寫法跟 filter 幾乎是同一個套路。

## 練習題目

`funpro.js` 裡的 `filter` 已經完成，這次要填的是 `map`。它接收一個轉換函數 `fn` 和一個陣列 `array`，目標是讓測試通過：

```js
export function map(fn, array) {
    // TODO
}
```

檔案下方依然有上一篇用過的陣列輔助函數，可以繼續拿來用：

```js
// Concatenate two arrays into a new single array
export function concat(array1, array2) {
    return array1.concat(array2);
}

// Return the number of items in an array
export function length(array) {
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

`funpro.test.js` 新增了 `map` 的測試，檢查它會回傳陣列，而且每個元素都有被正確轉換，例如每個數字乘以 2、每個數字除以 2：

```js
import { describe, it, expect } from 'vitest';
import { filter, map } from './funpro.js';

const wholes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

describe('map', () => {
    it('should return an array', () => {
        expect(Array.isArray(map((i) => i, []))).toBe(true);
    });
    it('should filter the array values correctly', () => {
        expect(JSON.stringify(map((n) => n * 2, wholes))).toBe(`[0,2,4,6,8,10,12,14,16,18,20]`);
        expect(JSON.stringify(map((n) => n / 2, wholes))).toBe(`[0,0.5,1,1.5,2,2.5,3,3.5,4,4.5,5]`);
    });
});
```

## 實作 map

一如往常，這是一個遞迴函數，所以需要一個 base case 和一個遞迴情況。

### Base case：跟 filter 一樣

怎麼知道已經做完了？陣列裡沒有東西可以 map 的時候。所以 base case 跟 filter 那一行幾乎一模一樣：陣列是空的，就代表陣列裡的所有東西（也就是什麼都沒有）都已經 map 完了，回傳空陣列。

```js
if (length(array) === 0) return [];
```

### 遞迴情況：對 tail 再呼叫一次 map

既然是遞迴，遞迴情況裡一定會呼叫 `map`。跟 filter 一樣，傳進去的不會是原本那個陣列。

講師問學員這次要傳什麼進去，學員的回答是：

- **同一個 `fn`**：所有元素要做的是同一種轉換
- **`tail(array)`**：陣列裡除了第一個以外的其他元素

```js
map(fn, tail(array));
```

### 處理 head：先轉換，再接到前面

剩下的中間部分，做法跟 filter 類似：把「剩下元素 map 完的陣列」，跟「陣列第一個元素轉換後的值」接在一起。

講師想把這些全部寫在一行裡。半開玩笑說是為了感覺自己像頂尖高手，但真正的理由是這樣就不會有那些值可能隨時間改變的變數，寫起來更函數式、更宣告式。上一篇的 filter 還用了 `firstItem`、`filteredFirst` 兩個中間變數，這次 map 直接把整個運算放進 `return`。

要接到陣列前面的那個東西，跟學員一步步拼出來：

- 它是一個陣列，因為 `concat` 接的是兩個陣列
- 陣列裡放的是 `head(array)`
- 但不是原封不動的 head，要先對它呼叫 `fn`

拼起來就是 `[fn(head(array))]`，再用 `concat` 把它接到遞迴結果的前面。完整的解答：

```js
export function map(fn, array) {
    if (length(array) === 0) return [];
    return [fn(head(array))].concat(map(fn, tail(array)));
}
```

這份解答直接呼叫陣列的 `.concat` 方法。換成題目給的 `concat` 輔助函數也是同一件事，因為 `concat(array1, array2)` 內部就是 `array1.concat(array2)`：

```js
return concat([fn(head(array))], map(fn, tail(array)));
```

跟 filter 比起來，差別只在第一個元素的處理方式：filter 用 predicate 決定要放 `[firstItem]` 還是 `[]`，map 則一律放 `[fn(head(array))]`。所以 map 回傳的陣列跟原本的一樣長，每個元素都經過轉換。

## 後記

有了上一篇 filter 的經驗，這題寫起來輕鬆很多。base case 一樣、遞迴呼叫的方式一樣、用 `concat` 接起來的手法也一樣，只是把「篩選 head」換成「轉換 head」，算是這個章節裡比較簡單的一題。

## 複習

### 實作遞迴版的 map 函數時，需要哪兩個主要情況？

base case（陣列為空時）與遞迴情況（對陣列的 head 套用函數，再對陣列的 tail 遞迴呼叫 map）。

### 在遞迴版的 map 裡，最終結果是由哪兩樣東西組合而成？

陣列 head 轉換後的值（套用傳入的函數），以及對陣列 tail 做 map 的結果。

### 實作遞迴版的 map 時，哪個函數可以用來組合元素？

`concat` 函數，它可以把轉換後的 head 元素跟 map 過的 tail 陣列接在一起。

### 遞迴版 map 函數的 base case 會發生什麼事？

輸入的陣列是空的時候，函數回傳空陣列，代表 map 已經完成。

### 遞迴版的 map 實作通常會傳入哪兩樣東西？

一個轉換函數，以及要被 map 的陣列。

### 遞迴版 map 函數的 base case 是什麼？

輸入的陣列是空的時候。

### 遞迴呼叫 map 函數時，通常會傳入哪些參數？

轉換函數，以及陣列的 tail。

### 用什麼操作把 map 過的 head 跟遞迴 map 的結果組合起來？

串接（concat）。

### map 的過程中，陣列的 head 會發生什麼事？

對它套用轉換函數。

### 用 map 方法轉換陣列，代表的是哪一種寫程式的方式？

函數式、宣告式的程式設計。

## 小測驗

<details>
<summary>實作遞迴版的 map 函數時，需要哪兩個主要情況？</summary>
base case（陣列為空時）與遞迴情況（對陣列的 head 套用函數，再對陣列的 tail 遞迴呼叫 map）
</details>

<details>
<summary>在遞迴版的 map 裡，最終結果是由哪兩樣東西組合而成？</summary>
陣列 head 轉換後的值（套用傳入的函數），以及對陣列 tail 做 map 的結果
</details>

<details>
<summary>實作遞迴版的 map 時，哪個函數可以用來組合元素？</summary>
<code>concat</code> 函數，它可以把轉換後的 head 元素跟 map 過的 tail 陣列接在一起
</details>

<details>
<summary>遞迴版 map 函數的 base case 會發生什麼事？</summary>
輸入的陣列是空的時候，函數回傳空陣列，代表 map 已經完成
</details>

<details>
<summary>遞迴版的 map 實作通常會傳入哪兩樣東西？</summary>
一個轉換函數，以及要被 map 的陣列
</details>

<details>
<summary>遞迴版 map 函數的 base case 是什麼？</summary>
輸入的陣列是空的時候
</details>

<details>
<summary>遞迴呼叫 map 函數時，通常會傳入哪些參數？</summary>
轉換函數，以及陣列的 tail
</details>

<details>
<summary>用什麼操作把 map 過的 head 跟遞迴 map 的結果組合起來？</summary>
串接（concat）
</details>

<details>
<summary>map 的過程中，陣列的 head 會發生什麼事？</summary>
對它套用轉換函數
</details>

<details>
<summary>用 map 方法轉換陣列，代表的是哪一種寫程式的方式？</summary>
函數式、宣告式的程式設計
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Functional JavaScript First Steps, v2](https://frontendmasters.com/courses/functional-first-steps-v2/) 課程筆記
