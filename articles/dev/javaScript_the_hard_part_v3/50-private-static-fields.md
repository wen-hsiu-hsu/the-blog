---
title: Private Static Fields：類別層級的私有共享資料
description: 介紹 private static fields 如何在類別層級儲存私有共享狀態，並以使用者數量上限為例說明其實際用途，最後整理四種 fields 的完整對照與課程總結。
date: 2026-05-25
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 50
chapter: 'Classes & Prototypes (OOP)'
tags:
    - JavaScript
    - OOP
    - Class
    - Prototype
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# Private Static Fields：類別層級的私有共享資料

## 從 Private Instance Fields 到 Private Static Fields

Private instance fields（如 `#score`）讓每個實例物件擁有自己的私有屬性，外部無法直接存取。Private static fields 則更進一步：它是附加在**類別本身**（即函式物件組合）上的私有資料，而非任何個別實例。

這種欄位的用途是儲存與整個類別相關的共享狀態，例如：追蹤目前已建立了多少個使用者物件。

## 實作範例：限制使用者數量上限

```javascript
class UserCreator {
    static #count = 0; // 私有靜態欄位，只有類別內部的方法能存取

    constructor(name, score) {
        if (UserCreator.#count >= 2) {
            throw Error('Max users reached');
        }
        this.name = name;
        this.score = score;
        UserCreator.#count++;
    }

    increment() {
        this.score++;
    }
}

const user1 = new UserCreator('Ari', 3); // count 變為 1
const user2 = new UserCreator('Jae', 5); // count 變為 2
const user3 = new UserCreator('Tam', 9); // Error: Max users reached
```

`static #count = 0` 在類別定義時，被儲存在 `UserCreator` 函式物件組合的私有屬性區段中。它不屬於任何實例，而是屬於整個類別。在 constructor 內部可以透過 `UserCreator.#count` 存取它，但在 constructor 外部的全域程式碼中嘗試 `UserCreator.#count` 則會報錯。

### 四種 Fields 的完整對照

| 欄位類型               | 語法範例                  | 存放位置                   | 外部可存取 |
| ---------------------- | ------------------------- | -------------------------- | ---------- |
| Public instance field  | `loggedIn = false`        | 每個實例物件上             | 可以       |
| Private instance field | `#score`                  | 每個實例的私有屬性區段     | 不行       |
| Public static method   | `static describe() {...}` | 類別函式物件本身           | 可以       |
| Private static field   | `static #count = 0`       | 類別函式物件的私有屬性區段 | 不行       |

### 課程總結：JavaScript 的原型本質

JavaScript 的物件導向功能，本質上始終建立在**原型鏈（prototype chain）** 之上。`class` 語法、`new` 關鍵字、以及各種 fields 特性，都是 JavaScript 為了更貼近傳統 OOP 語言（如 Java、Python）的寫作體驗而逐步疊加的工具。但它們底層的運作機制，始終是原型鏈。

## 複習

### 在 JavaScript 中使用 `new` 關鍵字搭配建構函式時，constructor 內的 `this` 會發生什麼事？

`this` 會被自動設為一個新的空物件。接著這個物件會自動獲得一個隱藏的 `__proto__` 連結，指向建構函式的 `prototype` 屬性，最後在函式執行結束時自動回傳這個物件。

### JavaScript 的原型繼承系統與其他語言的傳統物件導向繼承，在根本上有何不同？

JavaScript 使用原型鏈，物件透過隱藏的 `__proto__` 連結指向其他物件，以存取共用的方法與屬性。這與傳統 OOP 語言使用真正的類別有根本上的差異。JavaScript 的 `class` 語法只是建構在這套原型系統之上的語法糖。

### 在 JavaScript 中，不加 `new` 關鍵字與加了 `new` 關鍵字呼叫 class 建構函式，各自會發生什麼事？

不加 `new` 時，建構函式只是作為一般函式執行。加上 `new` 時，JavaScript 會自動建立一個空物件，將 `this` 設為該物件，建立指向建構函式 prototype 屬性的 `__proto__` 連結，最後自動回傳該物件。

## 小測驗

<details>
<summary>在 JavaScript class 的情境中，constructor 函式的職責是什麼？</summary>
當 class 以 new 關鍵字實例化時執行，負責設定物件的屬性
</details>

<details>
<summary>在 JavaScript class 中，沒有 static 關鍵字的方法會儲存在哪裡？</summary>
儲存在 class 的 prototype 屬性上
</details>

<details>
<summary>使用 `new` 關鍵字從 JavaScript class 建立實例時，它會自動做哪些事？</summary>
建立一個空物件，將其 __proto__ 設為 class 的 prototype，並自動回傳該物件
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
