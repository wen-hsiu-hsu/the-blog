---
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 5
title: 以 copyArrayAndManipulate 拆解高階函式 (Higher-Order Function) 的執行原理
description: 透過手動實作 copyArrayAndManipulate，拆解 JavaScript 高階函式（Higher-Order Function）將函式作為引數傳遞的機制，並追蹤每次迭代中 Execution Context 與 Call Stack 的完整變化過程。
date: 2026-04-24
section: dev
category: JavaScript Hard Parts v3
chapter: Callbacks & Higher Order functions
tags:
    - JavaScript
    - HigherOrderFunction
    - ExecutionContext
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# 以 copyArrayAndManipulate 拆解高階函式 (Higher-Order Function) 的執行原理

接下來會透過了解下面這段程式碼來理解，`map`、`filter`、`reduce` 這些內建方法的運作原理。

```javascript
function copyArrayAndManipulate(array, instructions) {
    const output = [];
    for (let i = 0; i < array.length; i++) {
        output.push(instructions(array[i]));
    }
    return output;
}

function multiplyBy2(input) {
    return input * 2;
}

const result = copyArrayAndManipulate([1, 2, 3], multiplyBy2);
```

## 執行流程

1. 定義函式 `copyArrayAndManipulate`，存入 global 記憶體
2. 定義函式 `multiplyBy2`，存入 global 記憶體
3. 宣告 `result` 變數，在 call stack 放上 `copyArrayAndManipulate([1, 2, 3], multiplyBy2)`，並等待回傳的值
    1. 準備執行函式，建立新的 Execution Context
    2. 接收兩個 argument `[1,2,3]`、`multiplyBy2`
    3. 宣告 `output` 存入該環境內的記憶體
    4. 執行 `for` 迴圈
        1. 因為又要執行新的函式，所以 call stack 又會放上 `multiplyBy2([1,2,3][i])`
        2. 每一圈都會建立新的 Execution Context，然後回傳 `array[i] * 2` 的值
        3. 執行完成後，丟棄該次執行所儲存的記憶體，並從 call stack 移除該函式
    5. `output` 經歷了數次的 push 之後，最終來到 `return`，回傳了一組陣列
    6. 執行完成後，丟棄 `copyArrayAndManipulate` 執行所儲存的記憶體，並從 call stack 移除該函式
4. `result` 被賦予了 `copyArrayAndManipulate([1, 2, 3], multiplyBy2)` 的回傳值

## 為什麼要把函式包在函式裡傳遞？

JavaScript 中若想傳遞「要做的事情」，不能只傳值（如數字 `2`）。必須把行為**包進函式**，才能當作參數傳入、延後執行。

`copyArrayAndManipulate` 就是 JavaScript 內建 `Array.prototype.map` 的手動實作版本。

## 複習

### 在處理陣列的高階函式中，使用像 'instructions' 這樣的參數，而非直接寫死特定操作，目的是什麼？

該參數作為一個佔位符，讓函式保持可重用性與彈性。與其預先定義要對每個元素執行什麼操作，具體的功能可以在呼叫函式時再傳入，讓同一個函式能根據傳入的引數執行不同的操作（例如 multiplyBy2、add3、divideBy2）。

### 當一個函式標籤（如 'multiplyBy2'）作為引數傳入另一個函式時，JavaScript 中會發生什麼事？

傳入的是函式本身的程式碼（即「F box」或函式定義），而不只是標籤名稱。在接收函式的內部，它會被賦予一個新的參數名稱（如 'instructions'）。原本的標籤 'multiplyBy2' 在該 context 中不再有效，函式程式碼改以新的參數名稱來引用。

### 當 `instructions(input)` 被執行，且 `instructions` 內含 multiplyBy2 函式、`input` 為 1 時，執行環境會發生什麼事？

會為 multiplyBy2 函式建立一個全新的 Execution Context，並加入 Call Stack，其本地記憶體中包含 input = 1。函式執行（1 \* 2 = 2），返回 2，接著該 Execution Context 從 Call Stack 中被彈出（pop）。

## 小測驗

<details> 
<summary>`copyArrayAndManipulate` 函式的目的是什麼？</summary> 
建立一個可重複使用的函式，能對陣列中的每個元素套用不同的操作
</details>

<details> 
<summary>在 `copyArrayAndManipulate(instructions)` 函式中，`instructions` 參數是什麼？</summary> 
一個以引數形式傳入的函式
</details>

<details> 
<summary>在 `copyArrayAndManipulate` 執行期間，`output` 變數中儲存了什麼？</summary> 
一開始是空陣列，接著逐步填入經過轉換後的值
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
