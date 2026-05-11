---
title: 原型鏈的運作機制與 `this`
description: 逐步追蹤 Object.create() 搭配原型鏈的執行流程，說明 `[[prototype]]` 隱藏屬性如何讓 JavaScript 自動向上查找方法，以及 `this` 作為隱含參數如何確保共用函式能正確作用於不同物件。
date: 2026-05-21
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 41
chapter: 'Classes & Prototypes (OOP)'
tags:
    - JavaScript
    - OOP
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# 原型鏈的運作機制與 `this`

## 執行流程逐步拆解

以下列程式碼為例，逐步追蹤 JavaScript 的執行過程：

```javascript
function userCreator(name, score) {
    const newUser = Object.create(userFunctionStore);
    newUser.name = name;
    newUser.score = score;
    return newUser;
}

const userFunctionStore = {
    increment: function () {
        this.score++;
    },
    login: function () {
        console.log('Logged in');
    },
};

const user1 = userCreator('Ari', 3);
const user2 = userCreator('Jae', 5);
user1.increment();
```

呼叫 `userCreator("Ari", 3)` 時，JavaScript 建立新的執行環境，在本地記憶體中將參數 `name` 指派為 `"Ari"`、`score` 指派為 `3`。接著執行函式主體：

1. `Object.create(userFunctionStore)` 回傳一個**空物件**，存入 `newUser`。
2. 將 `name` 與 `score` 屬性手動加進 `newUser`。
3. `return newUser` 將物件輸出至全域的 `user1`。

一個關鍵點：傳入 `Object.create()` 的引數並不會讓屬性出現在新物件上，若直接 `return Object.create(userFunctionStore)`，就沒有機會在回傳前加入 `name` 和 `score`，因此必須先把物件存進變數、加完屬性後再回傳。

## `[[prototype]]`：隱藏的原型連結

`Object.create(userFunctionStore)` 產生的空物件，除了之後手動加入的 `name` 與 `score` 之外，還帶有一個**隱藏屬性** `[[prototype]]`，它是一個指向 `userFunctionStore` 的連結。這個屬性在一般的屬性迭代中不可見，但 JavaScript 引擎知道它的存在。

`[[prototype]]` 在物件建立的瞬間就被設定好，是 `Object.create()` 自動完成的行為。

## 原型鏈的查找過程

執行 `user1.increment()` 時，JavaScript 的查找流程如下：

1. 在 `user1` 自身的屬性中找 `increment`，只找到 `name` 和 `score`，找不到。
2. 不報錯，而是沿著 `[[prototype]]` 連結，前往 `userFunctionStore`。
3. 在 `userFunctionStore` 中找到 `increment`，建立新的執行環境並執行它。

所有使用者物件共用 `userFunctionStore` 中**同一份** `increment` 函式，記憶體不再浪費在重複副本上。

## `this`：隱式參數

`userFunctionStore` 中的 `increment` 需要能對任意使用者物件的 `score` 進行操作，但它在撰寫時並不知道自己會被哪個物件呼叫。JavaScript 透過一個**隱式參數（implicit parameter）** `this` 來解決這個問題。

`this` 會在函式被呼叫時自動出現在本地記憶體中，其值為**呼叫該方法時，點（`.`）左側的那個物件**：

```javascript
user1.increment(); // this === user1，this.score++ 即 user1.score++
user2.increment(); // this === user2，this.score++ 即 user2.score++
```

因此，`increment` 中的 `this.score++` 在執行時會動態解析為對應物件的 `score` 屬性，同一份函式就能正確作用於不同的使用者物件。

## 複習

### 使用 Object.create() 搭配原型鏈建立物件，相較於直接把函式複製到每個物件上，主要優點是什麼？

Object.create() 讓多個物件能共用一份儲存在原型物件中的函式。與其在 user1、user2、user400 等每個物件上各自複製一份 increment，所有物件都可以透過原型鏈存取同一份函式，同時仍能在各自的資料上呼叫該方法。

### 呼叫 user1.increment() 時，increment 函式內的 `this` 指向什麼？

```javascript
const userFunctionStore = {
    increment: function () {
        this.score++;
    },
};
const user1 = Object.create(userFunctionStore);
user1.score = 3;
```

`this` 指向 user1，也就是呼叫該方法時點（.）左側的物件。
因此 `this.score++` 會解析為 `user1.score++`，將 user1 的分數從 3 增加到 4。

### 在以下程式碼中，return 語句執行之前，newUser 物件上直接存在哪些屬性？

```javascript
function userCreator(name, score) {
    const newUser = Object.create(userFunctionStore);
    newUser.name = name;
    newUser.score = score;
    return newUser;
}
```

newUser 上直接存在兩個屬性：`name` 和 `score`，這兩個屬性是從參數手動指派的。
此外，物件還有一個隱藏的 `[[prototype]]` 屬性連結到 userFunctionStore，
但這不是一個普通的屬性。

### 為什麼不能在工廠函式中直接寫 `return Object.create(userFunctionStore)`？

如果直接回傳 Object.create(userFunctionStore)，就沒有機會對新建立的物件加入屬性。必須先將空物件存入一個變數，再加入 name 和 score 等屬性，最後才回傳修改後的物件。

## 小測驗

<details>
<summary>使用 Object.create 搭配原型鏈方法的主要目標是什麼？</summary>
讓多個物件共用同一份函式，而不需要在每個物件上重複複製該函式
</details>

<details>
<summary>呼叫 Object.create 時，它會回傳什麼？</summary>
一個空物件
</details>

<details>
<summary>將物件連結到其原型的隱藏屬性叫什麼名稱？</summary>
`[[prototype]]`
</details>

<details>
<summary>當 JavaScript 在一個物件上找不到某個屬性時，接下來會去哪裡查找？</summary>
沿著物件的 `[[prototype]]` 連結，去連結的物件上查找該屬性
</details>

<details>
<summary>當一個函式以物件方法的形式被呼叫時，會自動出現在本地記憶體中的隱式參數叫什麼？</summary>
this
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
