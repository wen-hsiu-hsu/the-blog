---
title: '`class` 的進階特性：`static` 方法與 Public Instance Fields'
description: 說明 `static` 關鍵字如何將方法直接掛在類別函式物件上而非 `prototype`，以及 ES2022 新增的 public instance fields 如何讓每個實例自動帶有預設屬性，並對照三種 class 內部寫法的底層位置。
date: 2026-05-24
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 47
chapter: 'Classes & Prototypes (OOP)'
tags:
    - JavaScript
    - OOP
    - Prototype
    - Class
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# `class` 的進階特性：`static` 方法與 Public Instance Fields

## `class` 底層仍是函式物件組合

使用 `class` 關鍵字定義一個類別時，JavaScript 實際上建立的是一個**函式物件組合（function-object combo）**，與直接宣告函式並手動添加方法到 `prototype` 完全相同。`class` 語法只是把以下三件事包進同一個結構裡：

1. `constructor` 區塊 → 成為函式本體
2. `constructor` 以外的方法 → 自動加入 `UserCreator.prototype`
3. 標記為 `static` 的方法 → 直接加在函式物件自身上（非 `prototype`）

## `static`：直接掛在類別上的方法

`static` 關鍵字讓我們在 `class` 內定義一個方法，但該方法不會進入 `prototype`，而是直接附加到 `UserCreator` 函式物件本身。這種方法屬於整個類別，而非任何由它建立的實例：

```javascript
class UserCreator {
    static describe() {
        console.log('Creates users');
    }
    constructor(name, score) {
        this.name = name;
        this.score = score;
    }
    increment() {
        this.score++;
    }
    login() {
        console.log('login');
    }
}

const user1 = new UserCreator('Ari', 3);
UserCreator.describe(); // logs "Creates users"
```

`UserCreator.describe()` 的查找方式與先前的 `multiplyBy2.stored` 完全一致，直接在函式物件側找到 `describe` 並執行，不涉及原型鏈。

底層等價：

```javascript
UserCreator.describe = function () {
    console.log('Creates users');
};
```

## Public Instance Fields：每個實例自動帶有的預設屬性（ES2022）

Public instance fields 讓我們在 `class` 頂部宣告一個屬性與預設值，使每一個以 `new UserCreator()` 建立出來的物件都自動帶有這個屬性，不需要在 `constructor` 內手動寫 `this.loggedIn = false`：

```javascript
class UserCreator {
    loggedIn = false; // public instance field，每個實例預設為 false
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
user1.login(); // user1.loggedIn 變為 true
```

底層機制上，這等同於在呼叫建構函式並以 `new` 建立物件時，自動在 `constructor` 的最前面插入 `this.loggedIn = false` 這行指派。這是 JavaScript 為了讓 class 更接近傳統 OOP 語言而新增的真實功能（非純粹語法糖），在 2022 年才正式加入規範。

## 三種 class 內部寫法的對照

| 寫法                                        | 底層等價                                | 存放位置                       |
| ------------------------------------------- | --------------------------------------- | ------------------------------ |
| `constructor` 內的方法                      | 建構函式本體                            | 函式側                         |
| 一般方法（`increment`）                     | `UserCreator.prototype.increment = ...` | `prototype` 物件               |
| `static` 方法（`describe`）                 | `UserCreator.describe = ...`            | 函式物件側                     |
| Public instance field（`loggedIn = false`） | 建構時自動 `this.loggedIn = false`      | 實例物件自身（建構時自動指派） |

## 複習

### 在 class 內部定義方法與使用傳統 prototype 語法的主要差異是什麼？

在 class 中，方法直接列在 class 定義內（例如 increment、login），會被自動加入 prototype 物件。
傳統語法則需要對每個方法分別使用 `UserCreator.prototype.methodName` 逐一手動加入。

### 在 JavaScript class 中，`static` 關鍵字用於方法時有什麼作用？

`static` 關鍵字將方法直接加入函式物件本身（也就是類別本身），而不是加入 prototype 物件。這意味著該方法與整個類別相關，而非與由類別建立的實例相關。

### 在 JavaScript 中定義一個 class 時，底層實際上建立了什麼？

底層建立的是一個函式物件組合（function-object combo）。
class 語法是語法糖，它建立一個帶有 prototype 屬性的函式與其物件側。
constructor 成為函式定義，方法則被加入 prototype 物件。

### 在 class 中定義的方法，在底層的 JavaScript 結構中儲存在哪裡？

class 中定義的方法儲存在函式物件組合的 prototype 物件中。
這個 prototype 物件在 class 定義時會自動作為函式的屬性而建立。

### 存取 class 上的靜態方法時（例如 UserCreator.describe()），會發生什麼事？

靜態方法可以直接在函式物件本身上找到（不在 prototype 上）。
它無需建立類別的實例即可執行，且能存取函式物件本身，但無法存取各實例的專屬資料。

## 小測驗

<details>
<summary>JavaScript 的 class 語法本質上是什麼？</summary>
函式物件組合（function-object combo）模式的語法糖
</details>

<details>
<summary>在 class 內定義的 `increment` 和 `login` 等方法，儲存在哪裡？</summary>
儲存在函式物件組合的 prototype 物件中
</details>

<details>
<summary>在 class 的方法前加上 `static` 關鍵字，會有什麼效果？</summary>
將該方法直接加入類別的函式物件本身，而非加入 prototype
</details>

<details>
<summary>在 JavaScript 中從 class 建立新實例時，仍然需要什麼？</summary>
`new` 關鍵字
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
