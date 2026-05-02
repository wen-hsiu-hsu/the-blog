---
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 10
title: JavaScript 函式回傳函式：執行環境 (Execution Context) 與 Call Stack 運作解析
description: 詳解 JavaScript 函式回傳函式時的執行流程，包含執行環境 (Execution Context) 的建立與銷毀、Call Stack 的 push/pop、本地記憶體隔離機制，並釐清函式被回傳後與外層函式「再無任何連結」的核心觀念，為理解 Closure 奠定基礎。
date: 2026-04-29
section: dev
category: JavaScript Hard Parts v3
chapter: Closure
tags:
    - JavaScript
    - ExecutionContext
    - CallStack
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# JavaScript 函式回傳函式：執行環境 (Execution Context) 與 Call Stack 運作解析

範例程式碼如下

```javascript
function createFunction() {
    function multiplyBy2(num) {
        return num * 2;
    }
    return multiplyBy2;
}

const generatedFunc = createFunction();
const result = generatedFunc(3); // 6
```

## 逐步解析

### 第一步：定義 `createFunction`

JavaScript 執行第一行時，僅將 `createFunction` 的函式定義儲存到全域記憶體中。此時不會進入函式內部執行任何東西（函式只有在被呼叫時才會執行）。

### 第二步：執行 `createFunction()`，將結果存入 `generatedFunc`

遇到 `createFunction()` 的括號，JavaScript 知道這是「執行」，因此：

1. 建立新的執行環境（Execution Context），加入 Call Stack
2. 在本地記憶體中定義 `multiplyBy2`（但不執行它）
3. 執行 `return multiplyBy2`——將 `multiplyBy2` 的**函式定義本身**（完整的程式碼）取出並回傳
4. `createFunction` 的執行環境從 Call Stack 中移除，本地記憶體**全數清除**
5. 回傳出來的函式定義被指派給全域常數 `generatedFunc`

此後，`generatedFunc` 在記憶體中儲存的內容就是 `multiplyBy2` 的函式定義，與 `createFunction` **再無任何關聯**。

### 第三步：執行 `generatedFunc(3)`

1. 建立新的執行環境，加入 Call Stack
2. 參數 `num` 被賦值為 `3`（`num` 這個名稱來自原本的 `multiplyBy2` 定義）
3. 計算 `num * 2 = 6`，回傳並存入全域的 `result`
4. 執行環境從 Call Stack 移除

## 關鍵觀念：視覺直覺 vs. 實際行為

閱讀這段程式碼時，很容易產生一個錯誤的認知：

> 「`generatedFunc` 好像永遠和 `createFunction` 有連結，每次呼叫 `generatedFunc` 都會再跑一次 `createFunction`。」

但實際的情況應該是

- `createFunction` 只執行了**一次**
- `generatedFunc` 直接執行儲存在記憶體中的函式定義
- 執行完畢後，連結完全斷開

理解這個差異，是後續理解 Closure 運作機制的基礎。因為 Closure 正是讓「被回傳的函式」保有部分外層環境資料的特殊現象。

## 本地記憶體的意義：避免污染全域命名空間

函式擁有自己的本地記憶體，除了讓函式可重複使用之外，還有一個重要作用：**防止命名衝突**。

在不同函式中可以使用相同的變數名稱（例如 `result`、`num`），它們各自存在於獨立的執行環境，不會互相覆蓋，也不會污染全域命名空間（global namespace）。這讓大型程式碼庫得以被切割成一個個獨立、可預測的小模組。

## 複習

### 當一個函式從另一個函式中被回傳並指派給變數時，會發生什麼事？

函式定義本身會被回傳並儲存在該變數中。變數持有的是完整的函式程式碼，
而非指向外層函式的參照。外層函式執行完畢後，其執行環境會從 Call Stack 移除，
被回傳的函式則作為獨立個體存在於記憶體中。

### 在以下程式碼中，`generatedFunc` 儲存的是什麼？

```javascript
function createFunction() {
    function multiplyBy2(num) {
        return num * 2;
    }
    return multiplyBy2;
}
const generatedFunc = createFunction();
```

`generatedFunc` 中儲存的是 `multiplyBy2` 的函式定義。
它包含 `multiplyBy2` 的完整程式碼，但與 `createFunction` 不再有任何持續的連結。
此後可直接透過 `generatedFunc()` 來執行它，無需再次呼叫 `createFunction`。

### 當 `generatedFunc(3)` 被呼叫時，JavaScript 會回頭進入 `createFunction` 執行嗎？

不會。JavaScript 不會回頭去執行 `createFunction`。
`createFunction` 的執行是一次性的操作，執行後回傳了函式定義並儲存在 `generatedFunc` 中。
當 `generatedFunc(3)` 被呼叫時，它直接從記憶體中執行儲存的函式定義，
與 `createFunction` 毫無關聯。

### 函式執行環境中的本地記憶體有什麼用途？

函式的本地記憶體讓變數與函式能被限制在該函式的作用域內，
避免污染全域命名空間（global namespace）。
這防止了命名衝突，允許不同函式使用相同的變數名稱而不互相覆蓋全域變數。
它有助於將程式碼模組化，讓每個函式成為擁有獨立本地資料的小型程式單元。

### 函式執行完畢並回傳值之後，其執行環境與本地記憶體會怎樣？

執行環境會從 Call Stack 中被移除（pop off），
所有儲存在本地記憶體中的標籤與資料都會被遺忘並丟棄。
只有回傳值會保留下來，並被指派給呼叫該函式時所指定的變數或位置。

## 小測驗

<details>
<summary>當一個函式在 JavaScript 中從另一個函式被回傳時，會發生什麼事？</summary>
函式定義會被儲存在變數中，與原本的執行環境完全獨立
</details>

<details>
<summary>在範例程式碼中，執行 `const generatedFunc = createFunction()` 後，`generatedFunc` 中儲存的是什麼？</summary>
原本名為 multiplyBy2 的函式定義
</details>

<details>
<summary>如何告訴 JavaScript 你要執行一個函式，而非僅僅參照它？</summary>
在函式名稱後面加上括號（parentheses）
</details>

<details>
<summary>`createFunction` 回傳函式定義後，其執行環境會怎樣？</summary>
從 Call Stack 中被移除並遺忘
</details>

<details>
<summary>當 `generatedFunc(3)` 執行時，參數名稱是什麼？</summary>
num
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
