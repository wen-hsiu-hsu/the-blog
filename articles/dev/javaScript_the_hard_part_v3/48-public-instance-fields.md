---
title: Public Instance Fields 的執行流程
description: 逐步拆解 public instance fields 在物件建立時的完整執行流程，說明 `new` 關鍵字如何在執行 `constructor` 主體之前就將 `fields` 中的預設值附加到新物件上。
date: 2026-05-24
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 48
chapter: 'Classes & Prototypes (OOP)'
tags:
    - JavaScript
    - OOP
    - Class
    - Prototype
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# Public Instance Fields 的執行流程

## 完整執行流程逐步拆解

以下程式碼展示了 public instance field 如何在物件建立時自動附加：

```javascript
class UserCreator {
    loggedIn = false;
    constructor(name, score) {
        this.name = name;
        this.score = score;
    }
    increment() {
        this.score++;
    }
    login() {
        this.loggedIn = true;
    }
}

const user1 = new UserCreator('Ari', 3);
user1.login();
```

執行 `new UserCreator("Ari", 3)` 時，JavaScript 依序完成以下步驟：

**第一步：參數指派**

進入執行環境後，先處理參數與引數的配對，在本地記憶體中建立 `name = "Ari"`、`score = 3`。

**第二步：`new` 自動建立空物件**

`new` 關鍵字建立一個空物件，並將其指派給隱含參數 `this`。

**第三步：設定 `[[prototype]]` 連結**

這個空物件的隱藏 `[[prototype]]` 連結自動指向 `UserCreator.prototype`，那裡存放著 `increment` 與 `login` 方法。

**第四步：套用 Public Instance Fields**

`new` 在執行任何 `constructor` 內的程式碼之前，先去讀取 class 定義時儲存在函式物件組合隱藏屬性 `fields` 中的內容，並自動將它們加入 `this` 物件。在這個例子中，`loggedIn = false` 被加進來，此時物件上已有 `loggedIn: false`。

**第五步：執行 `constructor` 主體**

接著才執行我們手寫的那兩行：`this.name = "Ari"`、`this.score = 3`，將屬性加入物件。

**第六步：自動回傳物件**

`new` 將完成後的物件回傳，存入 `user1`。此時 `user1` 的完整狀態為：

```
user1: {
  loggedIn: false,   ← 由 fields 自動加入
  name: "Ari",       ← constructor 手動加入
  score: 3           ← constructor 手動加入
  [[prototype]] → UserCreator.prototype（存有 increment、login）
}
```

## 呼叫 `user1.login()` 的查找流程

執行 `user1.login()` 時：

1. 在 `user1` 自身上查找 `login`，只找到 `loggedIn`、`name`、`score`，找不到。
2. 沿 `[[prototype]]` 前往 `UserCreator.prototype`，找到 `login`。
3. 建立新執行環境，`this` 自動設為 `user1`。
4. 執行 `this.loggedIn = true`，即 `user1.loggedIn = true`。

## Public Instance Field 的本質

Public instance field 存放於函式物件組合的一個隱藏屬性 `fields` 中。每次以 `new` 呼叫建構函式時，JavaScript 都會在執行 `constructor` 主體之前，先從 `fields` 讀取這些預設值並附加到新物件上。每個實例都擁有自己獨立的一份，適合用來設定預設值。

## 複習

### 從 class 建立物件時，`new` 關鍵字的第一個自動步驟是什麼？

`new` 關鍵字建立一個全新的空物件，並將其指派給執行環境中的 `this`。

### 使用 `new` 關鍵字搭配 class 建構函式時，JavaScript 會自動將隱藏的 `__proto__` 連結指向哪裡？

`__proto__` 連結會被設定為指向函式物件組合上的 prototype 物件，也就是建構函式的 prototype 屬性，即範例中的 `userCreator.prototype`。

### 什麼是 JavaScript class 中的 public instance field？它最初儲存在哪裡？

Public instance field 是一個在每個由 class 建立的新物件上都存在的屬性，每個物件各自擁有一份副本。它最初儲存在透過 class 關鍵字建立的函式物件組合的隱藏屬性 `fields` 中。

### JavaScript 在什麼時候將 public instance fields 自動加入新建立的物件？

JavaScript 在執行 constructor 主體的程式碼之前就會自動加入。`new` 關鍵字會讀取儲存在 `fields` 隱藏屬性中的內容，並在 constructor 執行前先將它們指派到自動建立的物件上。

### 當嘗試存取物件上不存在的方法時，會發生什麼事？

JavaScript 首先在物件自身上尋找該方法。若找不到，便透過隱藏的 `__proto__` 連結沿原型鏈查找，前往建構函式的 prototype 物件，那裡存放著 `increment` 和 `login` 等方法。

## 小測驗

<details>
<summary>從 class 建立實例時，哪個關鍵字負責自動建立物件並處理原型連結？</summary>
new
</details>

<details>
<summary>在 class 中定義的 `increment` 和 `login` 等方法儲存在哪裡？</summary>
儲存在 prototype 物件上
</details>

<details>
<summary>使用 `new` 關鍵字時，自動建立的空物件被指派給哪個標籤（label）？</summary>
this
</details>

<details>
<summary>物件上隱藏的 `__proto__` 連結的作用是什麼？</summary>
連結到 prototype 物件，以便沿原型鏈查找屬性
</details>

<details>
<summary>在屬性查找過程中，若某個屬性在物件自身上找不到，會發生什麼事？</summary>
JavaScript 透過 `__proto__` 連結沿原型鏈繼續查找
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
