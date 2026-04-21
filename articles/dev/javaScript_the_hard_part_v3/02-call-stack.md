---
title: Call Stack 是什麼？理解 JavaScript 的呼叫堆疊機制
description: 介紹 JavaScript Call Stack（呼叫堆疊）的運作原理，包含 Global Execution Context 的建立、函式呼叫與 return 時堆疊的變化，以及與 Thread of Execution、Memory 的關係。
date: 2026-04-21
section: dev
category: JavaScript Hard Parts v3
tags:
    - JavaScript
    - CallStack
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# Call Stack 是什麼？理解 JavaScript 的呼叫堆疊機制

> 此文章是 [FrontendMaster](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記

## Call Stack 是什麼？

JavaScript 執行時需要追蹤「目前正在執行哪個函式」以及「執行完畢後要回到哪裡」，這個追蹤機制就是 **Call Stack（呼叫堆疊）**。

它是 JavaScript 執行環境三大核心之一（包含[[01-execution-context]]所提及的其中兩點）：

- **Thread of Execution**逐行執行程式碼
- **Memory**儲存資料與函式定義
- **Call Stack**追蹤目前正在執行哪個函式

## Call Stack 的運作規則

Call Stack 就像一疊盤子，JavaScript 用它來記住「我現在在哪、等一下要回哪裡」。

- **呼叫函式**：將該函式加入這疊盤子的頂端
- **函式執行完畢**：從頂部移除一個盤子
- **Call Stack 頂端的函式**：JavaScript 永遠都只會看這疊盤子最上面的函式
- **`return` 關鍵字**：觸發離開當前執行環境（函式），將這個盤子從頂端拿走，接著看下一個頂部的盤子繼續執行

## 從例子來看 Call Stack 的運作

```javascript
const num = 3;

function multiplyBy2(inputNumber) {
    const result = inputNumber * 2;
    return result;
}

const output = multiplyBy2(num); // 傳入 3
const newOutput = multiplyBy2(10);
```

1. 程式開始執行

Call Stack: `[ global ]`

2. 呼叫 multiplyBy2(3)

Call Stack: `[ global, multiplyBy2(3) ]`

3. 執行完畢，遇到 return，離開 multiplyBy2(3)

Call Stack: `[ global ]`

4. 呼叫 multiplyBy2(10)

Call Stack: `[ global, multiplyBy2(10) ]`

5. 執行完畢，遇到 return，離開 multiplyBy2(10)

Call Stack: `[ global ]`

6. 程式碼全部執行完畢

Call Stack: `[ (空) ]`

## 重要觀念補充

- **Global Execution Context** 在 JavaScript 檔案開始執行時就自動建立，不需要手動呼叫（類似其他語言的 `main()`）
- 函式只需**定義一次**，但可以被**呼叫任意多次**，每次呼叫都會建立全新的執行環境
- Call Stack 是一種「只關心最頂端」的資料結構（Stack），頂端是什麼，JavaScript 就執行什麼

## 複習

### 函式定義幾次？可以被使用幾次？

函式只定義一次，但可以被呼叫並重複使用任意多次。

### 什麼是全域執行環境（Global Execution Context）？

全域執行環境是 JavaScript 檔案開始執行時建立的主要執行環境，包含整個檔案程式碼的執行緒與記憶體。

### JavaScript 使用什麼資料結構來追蹤目前正在執行哪個函式？

JavaScript 使用 Call Stack（呼叫堆疊）來追蹤目前正在執行哪個函式，以及函式執行完畢後應該回到哪裡。

### 函式開始執行與執行完畢時，Call Stack 分別發生什麼事？

函式開始執行時，會被加入 Call Stack 的頂端。執行完畢時，會從 Call Stack 頂端移除（pop off），JavaScript 接著回到目前堆疊頂端的項目繼續執行。

### JavaScript 中哪個關鍵字代表函式應該退出並回到上一個執行環境？

return 關鍵字代表 JavaScript 應該退出當前函式的執行環境，並回到 Call Stack 頂端的項目。

## 小測驗

<details> 
<summary>Call Stack 在 JavaScript 中的用途是什麼？</summary> 
追蹤目前正在執行哪個函式，以及函式執行完畢後應該回到哪裡
</details>

<details> 
<summary>哪個關鍵字用於退出函式的執行環境？</summary> 
return
</details>

<details> 
<summary>JavaScript 程式碼開始執行時，會建立什麼？</summary> 
含有執行緒與記憶體的全域執行環境（Global Execution Context）
</details>
