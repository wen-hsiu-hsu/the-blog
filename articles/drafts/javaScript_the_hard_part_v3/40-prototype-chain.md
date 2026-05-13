---
title: 解法二：用原型鏈共享方法，避免記憶體浪費
description: 工廠函式的記憶體缺陷，以及如何透過 Object.create() 建立原型連結，讓所有使用者物件共享同一份方法，達成高效能目標。
date: 2026-05-20
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 40
chapter: 'Classes & Prototypes (OOP)'
tags:
    - JavaScript
    - Prototype
    - OOP
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# 解法二：用原型鏈共享方法，避免記憶體浪費

> 本章節建議從 [[37-object-oriented-javascript]] 開始閱讀

> 前情提要：在[[38-creat-javascript-objects]]中，我們示範了三種建立物件的方式，但每種都需要手動逐一設定屬性，違反了 DRY 原則。

## [[39-generate-objects-using-a-function|解法一]]的缺陷

工廠函式解法雖然可讀性高，但存在一個根本性的記憶體問題：每次呼叫 `userCreator` 建立新使用者時，`increment` 等方法都會被完整複製一份存進該物件。若系統有一百個使用者、十個方法，記憶體中就有一千份內容完全相同的函式副本。這完全不符合「高效能」的目標。

## 核心想法：共用一份函式

理想情況是：所有使用者物件共享**同一份** `increment` 函式。當 JavaScript 在某個使用者物件上找不到 `increment` 時，它不應該報錯，而是自動去一個集中存放函式的地方查找。

這個「集中查找」的機制，正是**原型鏈（prototype chain）**。

## Object.create() 建立原型連結

把所有共用方法統一存在一個物件 `userFunctionStore` 中，並透過 `Object.create(userFunctionStore)` 建立新的使用者物件。這樣，`newUser` 本身是一個空物件，但它與 `userFunctionStore` 之間存在一條隱藏的**原型連結**：

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

## Object.create() 做了什麼

`Object.create(userFunctionStore)` 回傳的永遠是一個**空物件**。傳入的引數 `userFunctionStore` 並不會被直接複製進去，而是建立一條隱藏的原型連結，指向 `userFunctionStore`。

當 JavaScript 執行 `user1.increment()` 時：

1. 在 `user1` 上找 `increment`，找不到。
2. 沿原型鏈查找，找到 `userFunctionStore.increment`。
3. 執行該函式。

整個過程中，`increment` 只有一份，存在 `userFunctionStore` 裡，所有使用者物件共用它。

## 複習

### 在每個使用者物件上各自儲存一份 increment 函式副本，會造成什麼效能問題？

這會因為在每個物件上建立相同函式的重複副本而浪費記憶體空間。
如果有 100 個使用者物件和 100 個函式，記憶體中就會存在 10,000 份函式副本，
完全不切實際。

### 像 increment 這樣的共用函式，在記憶體中理想上應該存在幾份？

一份。不應在不同物件間複製相同的函式，而應只保留一份，
讓所有物件在需要時都能存取它。

### JavaScript 的哪個功能讓物件能夠存取不直接儲存在自身上的函式？

原型鏈（prototype chain）。當在原始物件上找不到屬性或函式時，
它允許 JavaScript 在連結的物件上繼續查找，而不會拋出錯誤。

### 將物件（例如 userFunctionStore）作為引數傳入 Object.create() 的目的是什麼？

該引數會在新建立的空物件與傳入的物件之間建立一條隱藏的連結（原型連結）。
這讓新物件能透過原型鏈存取傳入物件中儲存的函式，
而那些函式並不會被直接加入新物件中。

### 當 JavaScript 的直譯器在一個以 Object.create() 建立的物件上找不到 increment 時，會怎麼做？

直譯器不會報錯，而是沿著原型鏈，去連結的物件（即傳入 Object.create() 的那個物件）
上查找該函式。如果在那裡找到，就從那裡執行它。

## 小測驗

<details>
<summary>JavaScript 的哪個功能讓物件能夠存取儲存在其他地方的函式，而不需要將函式直接放在物件自身上？</summary>
原型鏈（prototype chain）
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
