---
title: Closure 獨立性與變數查找順序：同一函式的多個閉包互不干擾
description: 每次呼叫外層函式都會產生獨立的 closure，彼此狀態互不影響。本文透過程式碼範例，說明變數定義在本地、背包或全域時的不同行為，以及 JavaScript 查找變數的完整優先順序。
date: 2026-05-04
section: dev
category: JavaScript Hard Parts v3
tags:
    - JavaScript
    - Closure
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# Closure 獨立性與變數查找順序：同一函式的多個閉包互不干擾

多次用同一個函式來產生的不同函式之間的閉包是有關聯的嗎？我們可以先看看下面的程式碼。

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

const anotherFunction = outer();
anotherFunction();
anotherFunction();
```

## 各自獨立的執行環境，各自獨立的背包

`newFunc` 是第一次呼叫 `outer` 的回傳值，`anotherFunction` 是第二次呼叫 `outer` 的回傳值。這兩次呼叫分別建立了**各自獨立的執行環境**，因此各自在定義 `add1` 的當下，產生了**各自獨立的 `[[scope]]` 連結**，攜帶著各自的 `counter = 0`。

兩個背包完全不會影響彼此：

| 呼叫                       | 查找 `counter` 的位置    | 操作後 `counter` 的值 |
| -------------------------- | ------------------------ | --------------------- |
| `newFunc()` 第一次         | `newFunc` 的背包         | 0 → 1                 |
| `newFunc()` 第二次         | `newFunc` 的背包         | 1 → 2                 |
| `anotherFunction()` 第一次 | `anotherFunction` 的背包 | 0 → 1                 |
| `anotherFunction()` 第二次 | `anotherFunction` 的背包 | 1 → 2                 |

如果在程式最後 `console.log` 每次執行後的 `counter` 值，會依序看到：`1, 2, 1, 2`。這驗證了兩個背包完全獨立，各自維護自己的狀態。

## 變數定義位置決定一切

同樣的程式行為在 `counter` 定義於不同位置時，結果截然不同：

### 情境一：`counter` 定義在 `add1` 的本地記憶體內

```javascript
function add1() {
    let counter = 0; // 每次呼叫都重新定義
    counter++;
}
```

每次呼叫 `add1`，`counter` 在本地記憶體中都從 `0` 開始，JavaScript 永遠先找到本地的 `counter`，背包根本無從插手。每次呼叫結果都是 `1`。

### 情境二：`counter` 定義在背包中（本節範例）

本地記憶體找不到 `counter` → 查找背包 → 找到並累加。跨呼叫狀態持續累積，依序輸出 `1, 2`。

### 情境三：`counter` 定義在全域

```javascript
let counter = 0;
function outer() {
    function add1() {
        counter++;
    }
    return add1;
}
```

本地記憶體找不到 → 背包中也沒有 → 找到全域的 `counter`。所有對 `newFunc` 和 `anotherFunction` 的呼叫**共用同一個** `counter`，四次呼叫後依序輸出 `1, 2, 3, 4`。

## 變數查找的完整優先順序

本地記憶體 → 背包（`[[scope]]`）→ 全域記憶體

JavaScript 嚴格按照這個順序查找，一旦找到就停止。因此，若本地記憶體有同名變數，背包中的同名資料永遠不會被存取到。

## 複習

### JavaScript 中的 closure 是什麼？哪個隱藏屬性使它成為可能？

Closure 是一個函式，它能在外層函式執行完畢後，仍保有對外層函式作用域中變數的存取權。
這是透過 JavaScript 自動附加在函式上的隱藏屬性` [[scope]]` 來實現的，
`[[scope]]` 建立了一份來自函式定義當下執行環境的「背包」（live data）。

### 當一個函式從外層函式被回傳並儲存在變數中時，外層函式執行環境中的變數會怎樣？

被回傳的函式會攜帶一個「背包」（closure），其中包含來自外層函式執行環境的變數。
即使外層函式的執行環境已從 Call Stack 中移除，這些變數仍持續存在，
使內層函式能夠在多次呼叫中存取並修改它們。

### 如果你呼叫外層函式兩次，每次呼叫各回傳一個新的內層函式，這兩個內層函式的 closure 之間有什麼關係？

每次呼叫外層函式都會建立一個完全獨立的執行環境，擁有各自獨立的變數集合。
因此，每個被回傳的內層函式都擁有自己獨立的 closure（背包），
其中的變數互相獨立，透過其中一個內層函式修改變數，不會影響另一個內層函式可存取的變數。

### 當函式內部參照一個變數時，JavaScript 查找該變數的順序是什麼？

JavaScript 首先查找當前執行函式的本地記憶體（本地執行環境）。
若找不到，則查找函式的 closure（背包）。
若仍找不到，則繼續沿作用域鏈（scope chain）向上查找，最終到達全域作用域。

### 如果同一個變數名稱同時存在於函式的本地記憶體和 closure 中，被參照時會使用哪一個？

本地記憶體中的變數永遠優先被使用，因為 JavaScript 總是先查找本地執行環境。
即使背包（closure）中存在同名變數，只要本地記憶體中有同名變數，背包中的那個就永遠不會被存取。

## 小測驗

<details>
<summary>當一個函式在另一個函式的執行環境中被定義時，會發生什麼事？</summary>
它透過 `[[scope]]` 屬性與父函式的變數建立隱藏連結
</details>

<details>
<summary>當帶有 closure 的函式被呼叫，且在本地記憶體中找不到某變數時，JavaScript 接下來去哪裡查找？</summary>
在函式的背包（closure）中
</details>

<details>
<summary>如果變數 `counter` 同時存在於本地記憶體和 closure 中，執行 `counter++` 時 JavaScript 會使用哪一個？</summary>
本地記憶體中的那個
</details>

<details>
<summary>當你多次呼叫一個會回傳函式的函式時，會發生什麼事？</summary>
每次呼叫都會建立一個新的執行環境，並產生各自獨立的 closure
</details>

<details>
<summary>當一個執行環境執行完畢並從 Call Stack 中移除後，被 closure 參照的變數會怎樣？</summary>
它們持續保存在 closure 的背包中
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
