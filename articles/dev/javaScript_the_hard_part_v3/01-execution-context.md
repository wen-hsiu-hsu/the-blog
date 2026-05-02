---
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 1
title: JavaScript 執行原理：執行緒、記憶體與執行環境（Execution Context）
description: 深入解析 JavaScript 執行時的兩個核心機制：執行緒（Thread of Execution）與記憶體（Memory）。透過程式碼範例，說明全域與函式執行環境的運作方式、parameter 與 argument 的差異，以及區域記憶體的生命週期。
date: 2026-04-20
section: dev
category: JavaScript Hard Parts v3
chapter: Introduction
tags:
    - javaScriptTheHardPartsV3
    - frontendMasters
    - JavaScript
    - ExecutionContext
---

# JavaScript 執行原理：執行緒、記憶體與執行環境（Execution Context）

> 此文章是 [FrontendMaster](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記

## 核心概念：程式執行的兩件事

程式執行時，本質上只做兩件事：

1. **逐行執行程式碼**（Thread of Execution）
2. **儲存資料**（Memory）

## 全域執行環境（Global Execution Context）

JavaScript 啟動時，會建立一個全域執行環境，包含：

- **執行緒（Thread of Execution）**：逐行執行程式碼
- **全域記憶體（Global Memory）**：儲存變數與函式定義

## 範例程式碼逐行解析

```javascript
const num = 3;
function multiplyBy2(inputNumber) {
    const result = inputNumber * 2;
    return result;
}
const output = multiplyBy2(num);
const newOutput = multiplyBy2(10);
```

1. 第一行：宣告常數 (Constant) num，將值 `3` 存入（全域）記憶體
2. 第二行：將整個函式定義存入記憶體（**不執行**）
3. 第六行：宣告常數 (Constant) output，呼叫函式 `multiplyBy2`，建立新執行環境，結束後將回傳值 `6` 存入
4. 第七行：同上，傳入 `10`，回傳值 `20`

### 函式執行環境（Function Execution Context）

上面的範例程式碼第六行與第七行呼叫函式時，都個別建立了一個函式的執行環境。JavaScript 每次**呼叫**函式時，會建立一個全新的、獨立的執行環境，此環境包含：

- **自己的執行緒**：逐行執行函式內部程式碼
- **區域記憶體（Local Memory）**：只在函式執行期間存在

> **Parameter（參數）**：函式定義時的名稱，如上面函式中的 `inputNumber`
> **Argument（引數）**：實際呼叫時傳入的值，如 `3` 或 `10`
> **函式定義**：遇到 `function` 關鍵字時，僅儲存**不執行**
> **函式呼叫/調用**：遇到 `()` 時，才真正執行，建立執行環境
> **Identifier（識別符）**：變數的名稱標籤，如 `result`、`output`

回到剛剛的範例，第一次呼叫 `multiplyBy2` 的過程如下

```
區域記憶體：
  inputNumber → 3   ← 參數接收引數
  result → 6        ← 3 * 2

return result       → 回傳值 6，賦值給全域的 output
執行環境關閉，區域記憶體銷毀
```

第二次呼叫時的過程大同小異：

```
區域記憶體：
  inputNumber → 10
  result → 20

return result       → 回傳值 20，賦值給全域的 newOutput
執行環境關閉，區域記憶體銷毀
```

## 重要觀念整理

- **函式定義 ≠ 函式執行**：`function` 關鍵字只是把程式碼存起來
- **`()` 是執行的觸發器**：看到括號才代表真正呼叫
- **每次呼叫產生獨立的執行環境**：互不干擾，執行完畢即銷毀
- **`return` 回傳的是值，而非識別符**：區域標籤（如 `result`）在函式結束後消失，只有值被傳出去
- **執行緒是單一的**：JavaScript 是單執行緒，一次只做一件事，執行函式時會「鑽入」函式內部，完成後再「回到」外部繼續

## 複習

### JavaScript 中的執行環境（Execution Context）是什麼？

執行環境是程式碼被執行的空間或情境。它包含一個逐行執行程式碼的執行緒，以及一個儲存資料的地方（記憶體）。當函式被呼叫時，會建立一個新的執行環境，擁有自己的執行緒與區域記憶體。

### 函式中的參數（parameter）與引數（argument）有什麼差異？

參數是函式宣告中定義的標籤或識別符，用來接收傳入的值。引數則是實際呼叫函式時所傳入的值。

### 函式執行完畢後，區域記憶體與執行環境會發生什麼事？

函式執行完畢後，執行環境會關閉，區域記憶體中的所有內容都會被清除。只有回傳值會被傳出，並賦值給外部作用域中的變數。

### 什麼符號或語法代表函式正在被呼叫，而非只是被定義？

函式名稱後方的括號 `()` 代表該函式正在被調用、呼叫、執行或運行。

## 小測驗

<details> 
<summary>JavaScript 程式碼執行時，有哪兩件根本性的事情發生？</summary> 
程式碼透過執行緒逐行執行，同時資料被儲存在記憶體中
</details>

<details> 
<summary>什麼符號代表函式應該被執行或呼叫？</summary> 
括號 ()
</details>

<details> 
<summary>在函式執行的情境中，區域記憶體是什麼？</summary> 
僅在函式執行期間可用的記憶體
</details>

<details> 
<summary>在 `multiplyBy2(3)` 這段程式碼中，參數與引數的關係是什麼？</summary> 
參數是用來接收引數值（3）的標籤（如 inputNumber）
</details>
