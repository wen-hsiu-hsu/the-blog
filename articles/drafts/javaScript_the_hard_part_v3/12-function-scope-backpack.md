---
title: JavaScript Closure 與背包（Backpack）的運作機制
description: 函式被定義時，會與周圍的資料產生隱藏連結。即使父執行環境已關閉，函式仍能透過這份附加的資料——也就是「背包（Backpack）」——持續存取原本的狀態。
date: 2026-05-01
section: dev
category: JavaScript Hard Parts v3
tags:
    - JavaScript
    - Closure
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# JavaScript Closure 與背包（Backpack）的運作機制

先觀察以下程式碼的執行流程

```javascript
function outer() {
    let counter = 0;
    function add1() {
        counter++;
    }
    return add1;
}

const newFunc = outer();
newFunc();
newFunc();
```

1. 建立 `outer` 的執行環境，加入 Call Stack
2. 在本地記憶體中：`counter = 0`，儲存 `add1` 的函式定義
3. `return add1`：將 `add1` 的函式定義回傳至全域，指派給 `newFunc`
4. `outer` 的執行環境關閉，從 Call Stack 移除，本地記憶體清除

此時若按照之前的理解，`counter` 應該隨著 `outer` 的執行環境消失而不復存在。

## 問題：為什麼沒有出錯

第一次呼叫 `newFunc()` 時：

- 建立新的執行環境，本地記憶體空白
- 執行 `counter++`，在本地記憶體中找不到 `counter`
- 沿 Call Stack 往下看——下面只有全域，全域也沒有 `counter`

如果 JavaScript 只依賴 Call Stack 往外查找，`counter` 根本不存在，程式應該出錯。但它沒有。

## Closure 的真相：函式帶著背包（Backpack）

JavaScript 在函式被**定義**的當下，不只儲存了函式的程式碼，還同時建立了一條與周圍資料的**隱藏連結（hidden bond）**。

當 `add1` 在 `outer` 的執行環境中被定義時，它立刻與 `outer` 的本地資料綁定。當 `add1` 被回傳至全域時，它不只帶走了自己的函式定義，還**拉著背後的資料一起離開**：`counter = 0` 這筆活生生的資料，被打包附加在函式定義的背後。

這個附加的持久資料儲存空間，正式名稱是 **Closed Over Variable Environment（閉包變數環境）**，也常被稱為 **C.O.V.E.**，口語上則直覺地稱為「**背包（Backpack）**」。

### 變數查找的完整順序

有了背包之後，JavaScript 查找變數的順序變為：

1. 函式自身的**本地記憶體**（Local Memory）
2. 附加在函式上的**背包**（Closure / Backpack）
3. **全域記憶體**（Global Memory）

背包在全域記憶體之前被檢查，這就是為什麼即使 `outer` 早已關閉，`newFunc` 仍能找到 `counter`。

### 詞源補充：Lexical（語彙）

Closure 的正式名稱中包含「**Lexical**（語彙）」這個詞。Lexical 來自於「你實際書寫的程式碼位置」，而非「程式碼執行時所在的位置」。這印證了核心結論：

> **決定函式能存取哪些資料的，是函式被「定義」的位置，而非被「呼叫」的位置。**

## 複習

### 當一個函式在另一個函式的執行環境中被定義並回傳時，除了函式定義本身之外，還有什麼東西被附加上去？

一條與父執行環境中周圍資料的隱藏連結會被附加上去。
這份附加的資料有時被稱為「背包（backpack）」或閉包（closure），
即使父執行環境已從 Call Stack 中移除，它仍然持續存在。

### 函式執行完畢並從 Call Stack 移除後，其執行環境與本地記憶體會怎樣？

執行環境會被刪除，本地記憶體也會被清除，資料不會持續保留。
但是，如果該函式回傳了一個定義在其作用域內的函式，
被回傳的函式仍可透過 Closure 持續存取父函式的資料。

### 當一個帶有背包（Closure）的函式被多次呼叫時，每次是否會建立新的本地記憶體？背包是否持續存在？

是的，每次函式呼叫都會建立全新的執行環境與全新的本地記憶體。
但是，背包（Closure 資料）會跨越所有呼叫持續存在，並在每次執行之間保持其狀態。

### 在以下程式碼中，當 newFunc 被呼叫兩次時，counter 變數會發生什麼事？

```javascript
function outer() {
    let counter = 0;
    function addOne() {
        counter++;
    }
    return addOne;
}
const newFunc = outer();
newFunc();
newFunc();
```

counter 變數儲存在附加於 newFunc 的 Closure（背包）中。
第一次呼叫時，counter 從 0 遞增為 1；
第二次呼叫時，counter 從 1 遞增為 2。
counter 在每次呼叫之間得以保留，因為它儲存在背包（Closure）中。

## 小測驗

<details>
<summary>當函式執行完畢並回傳後，其執行環境會怎樣？</summary>
執行環境被刪除並從 Call Stack 中移除
</details>

<details>
<summary>當一個函式在另一個函式的執行環境中被定義並回傳時，會有什麼東西附加在它身上？</summary>
一份指向周圍資料的持久儲存空間的參照（即背包 / Closure）
</details>

<details>
<summary>在 outer 回傳 addOne 的範例中，counter 變數的初始值是什麼？</summary>
0
</details>

<details>
<summary>哪個術語與函式在實際書寫的程式碼中被定義的位置有關，而非其執行時所在的位置？</summary>
Lexical（詞法）
</details>

<details>
<summary>在 newFunc 被呼叫兩次之後，背包中 counter 的值是什麼？</summary>
2
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
