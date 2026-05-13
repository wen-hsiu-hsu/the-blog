---
title: '`new` 關鍵字的完整執行流程'
description: 逐步拆解 `new` 關鍵字在呼叫建構函式時自動完成的三個步驟，並與解法二的手動流程對照，說明底層的原型鏈機制分毫未變。
date: 2026-05-23
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 45
chapter: 'Classes & Prototypes (OOP)'
tags:
    - JavaScript
    - Prototype
    - OOP
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# `new` 關鍵字的完整執行流程

> 本章節建議從 [[37-object-oriented-javascript]] 開始閱讀

## 宣告函式的同時發生了什麼

在 JavaScript 中，宣告任何一個函式時，它同時也是一個物件。這個物件側自動帶有一個名為 `prototype` 的屬性，其預設值是一個空物件。這不是隱藏的 `[[prototype]]`，而是一個可以直接用點記法存取的公開屬性。

```javascript
function userCreator(name, score) {
    this.name = name;
    this.score = score;
}

// 宣告後，userCreator 的物件側已自動存在：
// userCreator.prototype  →  {}
```

這個 `userCreator.prototype` 就是 `new` 關鍵字會使用的「共用函式儲存處」，所以我們直接把方法加進去：

```javascript
userCreator.prototype.increment = function () {
    this.score++;
};
userCreator.prototype.login = function () {
    console.log('login');
};

const user1 = new userCreator('Ari', 3);
user1.increment();
```

## `new` 的逐步執行流程

以 `new userCreator("Ari", 3)` 為例，`new` 依序自動完成以下三件事：

**第一步：建立空物件，並將其指派給 `this`**

`new` 在函式的本地記憶體中自動建立一個空物件，並將它賦予隱式參數 `this`。函式內所有對 `this` 的屬性指派，都會作用在這個物件上。

**第二步：設定 `[[prototype]]` 連結**

這個自動建立的空物件，其隱藏的 `[[prototype]]` 會被自動設定為指向 `userCreator.prototype`。這樣一來，所有放在 `userCreator.prototype` 上的方法，這個物件都能透過原型鏈存取。

**第三步：自動回傳物件**

函式執行完畢後，`new` 自動將 `this`（那個已加入屬性的物件）回傳出去，存入 `user1`。不需要寫 `return`。

## 與解法二的對照

| 步驟         | 解法二（手動）                                      | 解法三（`new` 自動化）           |
| ------------ | --------------------------------------------------- | -------------------------------- |
| 建立物件     | `const newUser = Object.create(userFunctionStore)`  | 自動（`this`）                   |
| 指派屬性     | `newUser.name = name`                               | `this.name = name`（仍需手動）   |
| 設定原型連結 | 由 `Object.create()` 設定，指向 `userFunctionStore` | 自動指向 `userCreator.prototype` |
| 回傳物件     | `return newUser`                                    | 自動回傳                         |

底層機制完全相同，只是三個固定步驟被 `new` 這三個字母全部包辦了。

## 呼叫方法的查找流程不變

執行 `user1.increment()` 時，查找流程與解法二完全一致：

1. 在 `user1` 自身上找 `increment`，找不到。
2. 沿 `[[prototype]]` 前往 `userCreator.prototype`，找到 `increment`。
3. 建立執行環境，`this` 自動設為 `user1`，執行 `this.score++`。

`new` 關鍵字讓程式碼更簡潔，但底層的原型鏈機制分毫未變。

## 複習

### 在 JavaScript 中，一個函式宣告後會同時具備哪兩種身份？

函式宣告後，同時成為一個函式，也是一個物件。

### 每個函式在其物件側自動擁有什麼屬性？其初始值為何？

每個函式在其物件側都自動擁有 `prototype` 屬性，初始值為一個空物件。

### 存取函式的物件屬性與執行函式，在語法上的區別是什麼？

使用點記法（例如 functionName.property）存取的是物件側
使用括號（例如 functionName()）執行的是函式側。

### 在使用 `new` 關鍵字的情境下，函式內的 `this` 指向什麼？

`this` 指向 `new` 關鍵字在呼叫函式時自動建立的那個空物件。

## 小測驗

<details>
<summary>JavaScript 中每個函式自動同時具備哪兩種身份？</summary>
函式（function）和物件（object）
</details>

<details>
<summary>使用 `new` 關鍵字呼叫函式時，第一件自動完成的事是什麼？</summary>
建立一個空物件
</details>

<details>
<summary>使用 `new` 關鍵字時，函式內的 `this` 指向什麼？</summary>
自動建立的空物件
</details>

<details>
<summary>以 `new` 建立的物件，其隱藏屬性 `[[prototype]]` 會自動指向哪裡？</summary>
建構函式的 prototype 屬性
</details>

<details>
<summary>若建構函式中沒有明確的 return 語句，`new` 關鍵字在函式結束時會自動做什麼？</summary>
自動回傳自動建立的那個物件
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
