---
title: '費波那契數列練習：用 for 迴圈與遞迴各寫一次 Fibonacci'
description: '費波那契數列練習：同一題分別用命令式 for 迴圈與遞迴實作。看懂迴圈版如何用 previous、current 追蹤位置，遞迴版又如何照著數列定義寫出 base case 與遞迴呼叫。'
date: 2026-10-10
section: dev
category: Functional JavaScript First Steps
series: functional_javascript_first_steps
seriesTitle: 'Functional JavaScript First Steps'
order: 8
chapter: 'Recursion'
tags:
    - frontendMasters
    - functionalJavaScriptFirstSteps
    - JavaScript
    - FunctionalProgramming
    - Recursion
    - Iteration
    - ImperativeProgramming
    - Fibonacci
    - BaseCase
    - State
---

# 費波那契數列練習：用 for 迴圈與遞迴各寫一次 Fibonacci

> [[07-calculate-factorials-with-recursion|上一篇]]讀了兩種階乘實作，比較哪一種比較好讀。這一篇換成動手寫，講師也好奇寫完之後，大家對命令式與遞迴的偏好會不會改變。

## 費波那契數列是什麼？

講師說，函數式程式設計的老梗函數「階乘」已經用掉了，但還剩一個老梗可以用：**費波那契數列（Fibonacci sequence）**。它跟黃金比例有關，在自然界、螺旋等各種地方都看得到，也常用在美學相關的用途。

費波那契數列是一個無限長的數列，從 0 和 1 開始，之後每個數字都是前兩個數字的和：

- 0 + 1 = 1
- 1 + 1 = 2
- 1 + 2 = 3
- 2 + 3 = 5

以此類推。

## 練習題目

這次要寫的函數接收一個非負整數 `n`，回傳費波那契數列裡第 `n` 個數字。這個數字是前兩個數字的和，而前兩個數字又各自是它們前兩個數字的和，以此類推。

題目要寫兩個版本：

- `imperativeFibonacci`：命令式風格，使用迴圈
- `recursiveFibonacci`：遞迴風格，呼叫 `recursiveFibonacci` 自己。講師笑說，也許不只呼叫一次

起始檔案 `fibonacci.js` 裡，兩個函數都還沒實作：

```js
export const imperativeFibonacci = (n) => {
    // TODO
};
export const recursiveFibonacci = (n) => {
    // TODO
};
```

練習附有 Vitest 測試。`cases` 裡每一組都是 `[輸入, 預期輸出]`，兩個 `test` 各自用 `for...of` 把每一組代進對應的函數，用 `expect(...).toBe(...)` 確認結果：

```js
import { test, expect } from 'vitest';
import { imperativeFibonacci, recursiveFibonacci } from './fibonacci.js';

const cases = [
    [2, 1],
    [6, 8],
    [10, 55],
    [20, 6765],
];

test('fibonacci.js imperative', () => {
    for (const [input, output] of cases) {
        expect(imperativeFibonacci(input)).toBe(output);
    }
});

test('fibonacci.js recursive', () => {
    for (const [input, output] of cases) {
        expect(recursiveFibonacci(input)).toBe(output);
    }
});
```

## 命令式解法：`imperativeFibonacci`

講師說，命令式版本是熟悉的世界：寫指令、告訴程式要做什麼，並且像 JavaScript 裡處理大多數重複工作一樣，用迭代的迴圈來做。

### 先處理前兩個數字

有兩種情況完全不需要迴圈或複雜的計算，就是數列的前兩個數字。它們是固定的，費波那契數列的前兩個數字就是 0 和 1：

```js
if (n === 0) return 0;
if (n === 1) return 1;
```

`n` 是 0 時，要的是數列第 0 個數字，直接回傳 0。`n` 是 1 時，也已經知道答案是 1。

### 用兩個變數記住目前的位置

剩下的自然數就得靠迴圈處理。程式需要某種方式記住「目前算到數列的哪裡、已經知道哪些值」，所以定義兩個變數：

```js
let previous = 0;
let current = 1;
```

講師特別說明，這裡用 `let` 是因為等一下會修改它們，這正是[[06-iteration-vs-recursion|第六篇]]說的狀態。

執行到這裡，代表 `n` 不是 0 也不是 1。講師假設 `n` 不會是負數或非整數，所以 `n` 至少是 2。要算出這個位置的數字，就需要記住數列裡的前兩個數字：

- `previous`：前一個數字，講師說可以想成 `n - 2` 位置上的值
- `current`：目前已經算到的數字。0 和 1 都已經知道，所以一開始算到的最遠位置是 1，`current` 就是那個位置的值 1

講師也說，如果想得到更好的變數名稱，儘管換掉。

### 用 for 迴圈往下算

迴圈可以用傳統的 `for`，也可以用新式的 `for...of`。講師選傳統的 `for`，因為它把迭代有多命令式表現得很清楚：

```js
for (let i = n; i > 1; i--) {
    let next = previous + current;
    previous = current;
    current = next;
}
```

`i` 代表目前在計算過程中的位置，從 `n` 開始，每一輪用 `i--` 遞減。條件 `i > 1` 確保 `i` 一直大於 1，因為 1 的情況前面已經處理過了。講師說方向反過來寫，從小往大數也可以，差別不大。

每一輪做的事情就是費波那契數列的定義：

1. 把目前算到的數字與前一個數字相加，存成 `next`
2. 原本的 `current` 變成新的 `previous`
3. 剛算出來的 `next` 變成新的 `current`

`previous` 和 `current` 不會一直停在 0 和 1，每一輪迴圈都會更新，像兩個追蹤用的變數一路沿著數列往前推。

### 回傳最後的 `current`

從 1 到 `n` 之間的數字兩兩相加完之後，最後一次相加並指派給 `current` 的值就是答案，所以直接回傳 `current`。完整的命令式版本：

```js
export const imperativeFibonacci = (n) => {
    if (n === 0) return 0;
    if (n === 1) return 1;
    let previous = 0;
    let current = 1;
    for (let i = n; i > 1; i--) {
        let next = previous + current;
        previous = current;
        current = next;
    }
    return current;
};
```

## 遞迴解法：`recursiveFibonacci`

### 兩個 base case

數列的前兩個數字依然是已知的。而且遞迴函數一定需要 base case，講師眨眨眼說「至少一個」。所以遞迴版本的開頭跟命令式版本的前兩行一模一樣，這兩行就是遞迴版本的兩個 base case：

```js
if (n === 0) return 0;
if (n === 1) return 1;
```

### 照著數列的定義寫

接下來呢？講師請大家回想，用人類的語言怎麼定義費波那契數列：下一個數字是前兩個數字的和。

所以要算 `recursiveFibonacci(n)`，就遞迴算出數列中的前兩個數字，再把它們加起來。能執行到這一行，代表 `n` 不是 0 也不是 1，至少是 2，因此可以對 `n - 1` 和 `n - 2` 各呼叫一次 `recursiveFibonacci`，相加後回傳：

```js
export const recursiveFibonacci = (n) => {
    if (n === 0) return 0;
    if (n === 1) return 1;
    return recursiveFibonacci(n - 2) + recursiveFibonacci(n - 1);
};
```

整個函數沒有任何需要重新指派的變數，不像命令式版本得靠 `previous`、`current`、`i` 一路更新狀態，遞迴版本只是把數列的定義直接寫成程式碼。

寫完之後跑測試，講師看到測試全部通過，宣布大功告成。

## 複習

### 費波那契數列的前兩個數字是什麼？

0 和 1。

### 費波那契數列中的每個數字是怎麼算出來的？

每個數字都是數列中前兩個數字的和。

### 實作費波那契數列計算器時，討論了哪兩種做法？

使用迴圈的命令式風格，以及遞迴呼叫函數的遞迴風格。

### 實作遞迴版的費波那契函數時，base case 有哪些？

`n` 是 0 時回傳 0；`n` 是 1 時回傳 1。

### 遞迴版的費波那契實作怎麼算出數列中的數字？

對 `n - 1` 和 `n - 2` 遞迴呼叫費波那契函數，再把兩個結果相加。

### 在遞迴版的費波那契實作中，base case 是什麼？

`n` 是 0 時回傳 0；`n` 是 1 時回傳 1。

### 命令式版的費波那契實作用的是什麼策略？

用迴圈追蹤並更新 `previous` 與 `current` 兩個值。

## 小測驗

<details>
<summary>費波那契數列的前兩個數字是什麼？</summary>
0 和 1
</details>

<details>
<summary>費波那契數列中的每個數字是怎麼算出來的？</summary>
每個數字都是前兩個數字的和
</details>

<details>
<summary>實作費波那契數列計算器時，討論了哪兩種做法？</summary>
使用迴圈的命令式風格，以及遞迴呼叫函數的遞迴風格
</details>

<details>
<summary>實作遞迴版的費波那契函數時，base case 有哪些？</summary>
<code>n</code> 是 0 時回傳 0；<code>n</code> 是 1 時回傳 1
</details>

<details>
<summary>遞迴版的費波那契實作怎麼算出數列中的數字？</summary>
對 <code>n - 1</code> 和 <code>n - 2</code> 遞迴呼叫，再把兩個結果相加
</details>

<details>
<summary>在遞迴版的費波那契實作中，base case 是什麼？</summary>
<code>n</code> 是 0 時回傳 0；<code>n</code> 是 1 時回傳 1
</details>

<details>
<summary>命令式版的費波那契實作用的是什麼策略？</summary>
用迴圈追蹤並更新 <code>previous</code> 與 <code>current</code> 兩個值
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Functional JavaScript First Steps, v2](https://frontendmasters.com/courses/functional-first-steps-v2/) 課程筆記
