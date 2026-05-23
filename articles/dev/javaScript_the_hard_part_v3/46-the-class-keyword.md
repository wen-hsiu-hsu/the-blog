---
title: 解法三的問題與 `class` 語法糖：解法四
description: 說明解法三遺漏 `new` 時的潛在錯誤與命名慣例的不嚴謹，並介紹 ES2015 的 `class` 語法如何在不改變底層機制的前提下，將建構函式與方法定義整合進同一個結構。
date: 2026-05-23
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 46
chapter: 'Classes & Prototypes (OOP)'
tags:
    - JavaScript
    - Class
    - Prototype
    - OOP
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# 解法三的問題與 `class` 語法糖：解法四

> 本章節建議從 [[37-object-oriented-javascript]] 開始閱讀

## 解法三的優缺點

`new` 關鍵字讓程式碼更簡潔，也是專業程式碼中的常見寫法。然而它存在兩個明顯的問題。

**問題一：忘記加 `new` 會出錯**

若呼叫建構函式時遺漏了 `new`，JavaScript 不會報錯，但行為完全錯誤。此時函式內的 `this` 不再指向自動建立的新物件，而是指向全域的 `window` 物件。`this.name = name` 就變成 `window.name = name`，屬性被悄悄加到全域，不會有任何警告。

**問題二：需要靠命名慣例傳遞使用規則**

為了告訴其他開發者「這個函式必須搭配 `new` 使用」，歷史上採用的做法是把函式名稱的**第一個字母大寫**，例如 `UserCreator`。這不影響 JavaScript 的執行，純粹是開發者之間的約定，本質上仍不夠嚴謹。

### 解法四：`class` 語法糖

解法三還有一個結構上的不直覺之處：建構函式本身和共用方法是分開定義的，先定義 `UserCreator` 函式，再另外把 `increment`、`login` 逐一加進 `UserCreator.prototype`。傳統 OOP 語言（如 Python、Java）不需要這樣做，所有東西都在同一個地方定義。

ES2015 引入的 `class` 語法解決了這個問題。它是**語法糖（syntactic sugar）**，底層機制與解法三完全相同，只是把建構函式和方法的定義整合進同一個結構裡：

```javascript
class UserCreator {
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
user1.increment();
```

`class` 內部的對應關係如下：

| `class` 寫法                       | 底層等價                                               |
| ---------------------------------- | ------------------------------------------------------ |
| `constructor(name, score) { ... }` | `function UserCreator(name, score) { ... }`            |
| `increment() { ... }`              | `UserCreator.prototype.increment = function() { ... }` |
| `login() { ... }`                  | `UserCreator.prototype.login = function() { ... }`     |

`constructor` 區塊就是原來的建構函式本體；`constructor` 以外的方法會被自動加入 `UserCreator.prototype`。底層完全沒有任何改變。

### 解法四的優缺點

**優點**：正在成為新標準；程式碼結構更接近 Python、Java 等傳統 OOP 語言，對熟悉其他語言的開發者更直覺。

**缺點**：多數開發者不理解它底層的運作方式，因此在面試中難以清楚說明。

## 複習

### 如果在包含 `this` 參照的建構函式呼叫時，沒有加上 `new` 關鍵字，會發生什麼事？

沒有 `new` 關鍵字時，不會自動建立物件，因此 `this` 會指向全域的 `window` 物件
（在嚴格模式下則為 `undefined`）。對 `this` 指派的屬性會被加到 `window` 物件上
（例如 `window.name`、`window.score`），造成非預期的副作用。

### 歷史上用什麼命名慣例來標示某個函式必須搭配 `new` 關鍵字使用？

慣例上，建構函式的首字母大寫（例如 `UserCreator` 而非 `userCreator`），
以此向其他開發者暗示這個函式需要搭配 `new` 關鍵字才能正確運作。

### 在 JavaScript 物件導向功能的情境下，「語法糖」是什麼意思？

語法糖是指不改變底層運作的語法，只是讓程式碼更容易閱讀和撰寫。
JavaScript 的 `class` 語法就是原型鏈建構函式模式的語法糖。

### 使用 `class` 語法時，定義在 class 主體內（`constructor` 以外）的方法，

實際上會被儲存在哪裡？

這些方法會被自動加入建構函式的 `prototype` 屬性中，
儲存在函式物件側的 prototype 物件上，讓所有實例都能透過原型鏈存取它們。

## 小測驗

<details>
<summary>若在建構函式中參照 `this` 卻沒有加上 `new` 關鍵字，會發生什麼事？</summary>
`this` 會指向 window 物件（在嚴格模式下為 undefined）
</details>

<details>
<summary>傳統上用什麼命名慣例來標示某個函式應搭配 `new` 關鍵字使用？</summary>
將函式名稱的第一個字母大寫
</details>

<details>
<summary>在 JavaScript class 的情境下，「語法糖」是什麼意思？</summary>
外觀更好看，但底層運作不變的語法
</details>

<details>
<summary>在 JavaScript class 中，`constructor` 區塊代表什麼？</summary>
用來建立並初始化物件的函式
</details>

<details>
<summary>在 class 中定義的方法（constructor 以外的部分），會被自動加到哪裡？</summary>
加入函式的 prototype 屬性中
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
