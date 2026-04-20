---
title: JavaScript 執行上下文與高階函式：從重複程式碼到通用化設計
description: 說明 JavaScript 函式呼叫時建立執行上下文與區域記憶體的機制，並透過違反 DRY 原則的範例，引出高階函式（Higher-Order Function）的設計動機，同時介紹 Side Effect 的概念。
date: 2026-04-23
section: dev
category: JavaScript Hard Parts v3
tags:
    - JavaScript
    - HigherOrderFunction
    - ExecutionContext
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# JavaScript 執行上下文與高階函式：從重複程式碼到通用化設計

首先先觀察以下程式碼執行的步驟

```javascript
function copyArrayAndMultiplyBy2(array) {
    const output = [];
    for (let i = 0; i < array.length; i++) {
        output.push(array[i] * 2);
    }
    return output;
}

const myArray = [1, 2, 3];
const result = copyArrayAndMultiplyBy2(myArray);
```

步驟如下

1. 將 `copyArrayAndMultiplyBy2` 函式存入 global 記憶體
2. 宣告 `myArray`，並賦予 `[1,2,3]`的值，存入 global 記憶體
3. 宣告 `result` 變數，接著執行函式 `copyArrayAndMultiplyBy2`，因為使用了`()`來觸發執行該函式並以 `myArray` 作為 argument 傳入
4. 執行該函式
    1. 參數綁定：`array` = `[1, 2, 3]`（對應傳入的 `myArray`）
    2. 宣告 `output`：初始化為空陣列 `[]`
    3. for 迴圈 i=0：`array[0]` = 1，1×2=2，push 到 output
    4. for 迴圈 i=1：`array[1]` = 2，2×2=4，push 到 output
    5. for 迴圈 i=2：`array[2]` = 3，3×2=6，push 到 output
    6. `return output`：回傳 `[2, 4, 6]` 給全域的 `result`
5. 最後 `result` 被賦予 `[2,4,6]` 存於 global 記憶體

> 呼叫函式時發生的事可以參考 [[01-execution-context]]

> **Parameter（參數）**：函式定義時的佔位符，例如 `array`
> **Argument（引數）**：實際呼叫時傳入的值，例如 `myArray`（值為 `[1,2,3]`）

## 違反 DRY 原則的問題

如果我們又接著寫出以下程式碼

```javascript
function copyArrayAndDivideBy2(array) {
    const output = [];
    for (let i = 0; i < array.length; i++) {
        output.push(array[i] / 2);
    }
    return output;
}
const myArray = [1, 2, 3];
const result = copyArrayAndDivideBy2(myArray);
```

```javascript
function copyArrayAndAdd3(array) {
    const output = [];
    for (let i = 0; i < array.length; i++) {
        output.push(array[i] + 3);
    }
    return output;
}
const myArray = [1, 2, 3];
const result = copyArrayAndAdd3(myArray);
```

顯然我們又違反了 DRY（Don't Repeat Yourself），三個函式的結構完全相同，差別只是對每個元素所做的運算。

## 函式通用化 Generalizing Functions

| 一般函式                                  | 高階函式（Higher-Order Function）            |
| ----------------------------------------- | -------------------------------------------- |
| 用 **parameter** 延遲決定要處理的**資料** | 用 **parameter** 延遲決定要執行的**功能**    |
| 呼叫時再傳入實際值（argument）            | 呼叫時再傳入實際函式（function as argument） |

### 為什麼不能直接傳運算子？

- 想傳入 `* 2` 或 `+ 3` 作為參數——**不行**
- 可以傳字串再用 `eval()` 執行，但風險極高，不建議
- **正確做法**：將功能包裝成一個函式，再傳入

```javascript
// 錯誤思路（不可行）
copyArray(myArray, * 2)

// 正確做法：將功能包成函式傳入
copyArray(myArray, function(x) { return x * 2 })
```

> 這就是 **Higher-Order Function（高階函式）** 的核心動機： **把「要做什麼」也當成參數傳入，讓函式更通用、可重複使用。**

## Side Effects（副作用）的概念

### 為什麼函式內部要建立新陣列而非修改原陣列？

這三個函式都遵循一個重要原則：**不修改傳入的陣列，而是建立新陣列後回傳**。

如果直接修改 `array` (傳入的 argument) 會產生 side effect，會有影響到外部資料的風險，我們永遠都要讓函式對外部的影響只來自其 return value，而非透過修改傳入的資料產生隱性副作用。

> **Side Effect 定義**：函式執行時，除了 return value 之外，還對外部狀態造成影響（例如修改了全域變數）。
> 理想狀態下，一個函式的行為應**完全由其 return value 決定**，而非透過修改外部資料產生隱性影響。

## 複習

### 當一個函式在 JavaScript 中被呼叫時，會建立什麼新結構來執行該函式的程式碼？

會建立一個新的執行上下文（execution context）。這個執行上下文包含一個用來儲存資料的區域記憶體（local memory，僅在函式執行期間可用），以及一條執行函式程式碼的執行緒（thread）。

## 小測驗

<details> 
<summary>當一個函式在 JavaScript 中被呼叫時，會建立什麼來執行該函式的程式碼？</summary> 
會建立一個帶有區域記憶體的新執行上下文
</details>

<details> 
<summary>在遍歷 `[1, 2, 3]` 陣列的 for 迴圈中，當迴圈存取第二個元素時，`i` 的值是什麼？</summary> 
值為 1，因為 JavaScript 中陣列的索引從 0 開始
</details>

<details> 
<summary>建議用什麼方式來泛化重複的函式（`copyArrayAndMultiplyBy2`、`copyArrayAndDivideBy2` 等），讓程式碼更具可重用性？</summary> 
將一個函式作為參數傳入，用來處理對每個元素執行的特定運算
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
