---
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 11
title: JavaScript Closure 的核心問題：變數存取由定義位置還是呼叫位置決定？
description: 透過兩個範例觀察 JavaScript 函式的 Call Stack 執行流程，比較函式存取外層變數的依據究竟是「定義位置」還是「呼叫位置」，為理解 Closure（閉包）與 Lexical Scope 建立基礎。
date: 2026-04-30
section: dev
category: JavaScript Hard Parts v3
chapter: Closure
tags:
    - JavaScript
    - Closure
    - Scope
    - ExecutionContext
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# JavaScript Closure 的核心問題：變數存取由定義位置還是呼叫位置決定？

## 情境一：在定義的地方呼叫函式

先觀察這個範例程式碼的執行流程

```javascript
function outer() {
    let counter = 0;
    function add1() {
        counter++;
    }
    add1();
}

outer();
```

1. 全域記憶體中儲存 `outer` 的函式定義
2. `outer()` 被呼叫，建立新的執行環境，加入 Call Stack
3. 在 `outer` 的本地記憶體中：`counter = 0`，接著儲存 `add1` 的函式定義
4. `add1()` 被呼叫，建立新的執行環境，疊加在 Call Stack 頂端
5. `add1` 執行 `counter++`——在 `add1` 的本地記憶體中找不到 `counter`，於是向外查找，在 `outer` 的記憶體中找到 `counter = 0`，將其加一變為 `1`
6. `add1` 執行完畢，從 Call Stack 移除，回到 `outer`
7. `outer` 執行完畢，從 Call Stack 移除，回到全域

### 為什麼知道要去哪裡找 `counter`

更確切的問題：`add1` 在找不到 `counter` 時，為什麼會去 `outer` 的記憶體中尋找？

要回答這個問題，我們可以先提出兩個假設

1. 呼叫位置決定：`add1` 是在 `outer` 內部被呼叫的，所以沿著 Call Stack 往下找，自然找到 `outer` 的記憶體
2. 定義位置決定：`add1` 是在 `outer` 內部被**定義**的，所以它天生就能存取 `outer` 的作用域

在目前的範例中，因為定義位置與呼叫位置都在相同位置，所以我們無從判斷。

## 情境二：在定義以外的地方呼叫函式

為了搞清楚哪一個假設正確，我們把這兩個條件拆開，讓 `add1` 在定義他的地方外被呼叫

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

這裡的設計是：`outer` 不直接呼叫 `add1`，而是將 `add1` 的函式定義**回傳到全域**，再從全域呼叫它。

此時就可以觀察到這些狀況：

- `outer()` 執行完畢後，其執行環境**關閉並從 Call Stack 移除**
- `newFunc` 儲存的是 `add1` 的函式定義
- 當 `newFunc()` 在全域被呼叫時，Call Stack 中**只有全域環境**，`outer` 已不存在

如果「呼叫位置決定」是對的，`newFunc()` 在全域執行時，找不到 `counter`，因為 `outer` 的執行環境早已消失。

如果「定義位置決定」是對的，`newFunc()` 應該仍然能存取 `counter`，因為 `add1` 當初是在 `outer` 內部被定義的。

下一節將揭曉答案，而答案正是 Closure 的本質所在。

## 複習

### 函式執行完畢後，其執行環境會發生什麼事？

函式執行完畢後，其執行環境會關閉並從 Call Stack 中被移除（pop off）。
執行緒會回到 Call Stack 中位於其下方的執行環境繼續執行。

### 理解 Closure 必須回答的核心問題是什麼？

函式存取變數的依據，是它被「定義」的位置，還是被「呼叫」的位置？

函式存取變數的依據是它被定義的位置，而非被呼叫的位置。
這正是 Closure 的本質——函式會保留對其被建立時所在作用域的存取權。

### 如何驗證函式對變數的存取權，究竟是由定義位置還是呼叫位置決定？

可以將函式從其定義的地方回傳出去，然後在不同的執行環境中呼叫它。
若該函式在定義它的執行環境已關閉之後，仍能存取原本作用域中的變數，
則可證明決定變數存取權的是定義位置，而非呼叫位置。

### Call Stack 是什麼？它如何追蹤函式的執行？

Call Stack 是一種資料結構，用來追蹤目前正在執行的函式。
當一個函式被呼叫時，它會被推入（push）Call Stack 的頂端；
當函式執行完畢時，它會從 Call Stack 中被移除（pop），
執行權回到其下方的函式。

## 小測驗

<details>
<summary>當 add1 在 outer 內部被呼叫，且在 add1 的本地記憶體中找不到 counter 時，JavaScript 會去哪裡尋找 counter？</summary>
在 outer 的執行環境（本地記憶體）中
</details>

<details>
<summary>add1 函式執行完畢後，其執行環境會怎樣？</summary>
執行環境關閉，並從 Call Stack 中被移除
</details>

<details>
<summary>在範例程式碼中，add1 能存取 outer 中的 counter 變數，目前有哪兩種可能的原因？</summary>
因為 add1 是在 outer 內部被「定義」的，或因為 add1 是在 outer 內部被「呼叫」的
</details>

<details>
<summary>`counter++` 在 add1 函式內執行時，會進行什麼操作？</summary>
找到 counter 變數，並將其值加一
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
