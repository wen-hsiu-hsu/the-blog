---
title: 工廠函式：解決手動建立物件的第一種方法
description: 介紹工廠函式（Factory Function）如何解決手動逐一建立物件的重複問題，並逐步拆解 JavaScript 執行環境在每次呼叫時的運作流程，以及這個解法的記憶體效率缺陷。
date: 2026-05-20
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 39
chapter: 'Classes & Prototypes (OOP)'
tags:
    - JavaScript
    - OOP
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# 工廠函式：解決手動建立物件的第一種方法

> 前情提要：在[[38-creat-javascript-objects]]中，我們示範了三種建立物件的方式，但每種都需要手動逐一設定屬性，違反了 DRY 原則。

## 問題：手動建立物件違反 DRY 原則

[[38-creat-javascript-objects|前一節]]展示了三種建立物件的方式，但無論用哪一種，每個使用者物件都需要手動逐一設定屬性。若應用程式有大量使用者，這種做法不切實際，也違反了程式設計的基本原則：**DRY（Don't Repeat Yourself，不要重複自己）**。

解決方法直覺而簡單：把需要重複執行的工作包進一個函式。

## 解法一：工廠函式（Factory Function）

建立一個名為 `userCreator` 的函式，每次呼叫時接收使用者資料作為引數，在內部產生並回傳一個完整的使用者物件：

```javascript
function userCreator(name, score) {
    const newUser = {};
    newUser.name = name;
    newUser.score = score;
    newUser.increment = function () {
        newUser.score++;
    };
    return newUser;
}

const user1 = userCreator('Ari', 3);
const user2 = userCreator('Jae', 5);
user1.increment();
```

## 執行流程逐步拆解

以 `userCreator("Ari", 3)` 為例：

1. 呼叫 `userCreator`，JavaScript 建立一個全新的**執行環境（execution context）**，並開闢對應的本地記憶體（local memory）。
2. 引數 `"Ari"` 與 `3` 分別被指派給參數 `name` 與 `score`，存於本地記憶體中。
3. 在函式主體內，宣告一個空物件 `newUser`。
4. 逐一將屬性加入 `newUser`：`name` 被指派為 `"Ari"`，`score` 被指派為 `3`。
5. 將 `increment` 方法附加到 `newUser` 上。
6. 執行 `return newUser`，將物件輸出到全域，存入 `user1`。

對 `userCreator("Jae", 5)` 重複相同流程，產生 `user2`。

## 這個解法的優缺點

**優點**：達成了封裝目標，`user1.increment()` 與 `user2.increment()` 都能正常運作，可讀性提升，程式碼不再重複。

**缺點**：每個使用者物件都各自儲存了一份完整的 `increment` 函式定義。一千個使用者就有一千份內容完全相同的函式佔用記憶體，無法達成「高效能」的目標。這個問題將推動我們進入下一個解法，也就是原型鏈的應用。

## 複習

### 在物件導向典範中，產生同時包含使用者資料與功能的物件，第一種解法是什麼？

用函式產生物件。做法是建立一個函式（例如 userCreator），將每個物件的細節作為引數傳入，由函式負責產生並回傳物件。

### 在 userCreator 函式模式中，建立一個帶有屬性的物件需要哪些主要步驟？

1. 建立一個新的空物件（newUser）
2. 使用參數動態指派屬性（例如 name 和 score）
3. 附加必要的方法（例如 increment）
4. 回傳新建立的物件

### 在 JavaScript 中呼叫一個函式時，會發生什麼事？

會建立一個全新的執行環境（execution context），其中包含用於儲存參數、變數，以及執行函式程式碼的本地記憶體。

### 將引數傳入 `userCreator('Ari', 3)` 這樣的函式時，這些值最初儲存在哪裡？

引數會在函式執行環境頂端被指派給對應的參數，儲存於本地記憶體中（例如 name = 'Ari'，score = 3）。

### 當一個函式被儲存為物件的屬性時，它叫什麼？

方法（Method）。當函式被附加到物件上，它就成為該物件的方法。

## 小測驗

<details>
<summary>手動為多個使用者物件逐一填寫屬性，違反了哪個程式設計原則？</summary>
DRY（Don't Repeat Yourself，不要重複自己）
</details>

<details>
<summary>在 userCreator 函式中，進入函式主體後的第一個步驟是什麼？</summary>
宣告一個名為 newUser 的常數，其值為一個空物件
</details>

<details>
<summary>儲存為物件屬性的函式，其專屬術語是什麼？</summary>
方法（Method）
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
