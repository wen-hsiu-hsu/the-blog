---
title: Private Instance Fields：真正的封裝
description: 說明為何需要私有欄位來防止外部直接修改物件屬性，介紹 `#` 符號的語法，以及 private instance fields 如何透過獨立的 private element properties 實現真正的封裝。
date: 2026-05-25
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 49
chapter: 'Classes & Prototypes (OOP)'
tags:
    - JavaScript
    - OOP
    - Class
    - Prototype
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# Private Instance Fields：真正的封裝

## 為什麼需要私有欄位

目前為止，物件上的屬性雖然與方法放在一起，但並不意味著它們無法被外部直接存取。任何人都可以在全域程式碼中直接寫：

```javascript
user1.score++;
```

在十萬行的程式碼庫中，這是一個潛在的風險：其他開發者可能在不知情的狀況下繞過既定的操作介面，直接修改資料，造成難以追蹤的錯誤。

理想的做法是強制規定：`score` 只能透過 `increment` 方法來修改，任何直接存取都應該被阻擋。這正是 **private instance fields** 的用途，也是 OOP 中「封裝」這個概念最徹底的實現。

## 語法：`#` 符號

在 class 內部，於屬性名稱前加上 `#` 即可宣告私有欄位：

```javascript
class UserCreator {
    #score; // 宣告私有欄位

    constructor(name, score) {
        this.name = name;
        this.#score = score; // 使用 this.#score 存取
    }

    increment() {
        this.#score++;
    }
    login() {
        this.loggedIn = true;
    }
}

const user1 = new UserCreator('Ari', 3);
user1.increment();
// user1.#score 現在為 4，只能從 increment 方法存取
```

在 `constructor` 外部嘗試 `user1.#score++` 會直接拋出錯誤。

## 底層機制：Private Element Properties

Private instance fields 並非語法糖，而是對 JavaScript 底層真實的擴充。`#score` 不會被加入物件的一般屬性列表中，而是存放在一個獨立的隱藏區段，稱為 **private element properties**。

這個區段只有在同一個 class 定義內的方法（如 `increment`）才能存取。當 `increment` 執行 `this.#score++` 時，JavaScript 確認這個方法是在定義了 `#score` 的同一個 class 內宣告的，才允許存取。

在 Chrome DevTools 的 console 中可以看到私有欄位的值（以便除錯），但在一般的 JavaScript 執行環境中無法直接讀取或修改。

## 與 Public Instance Field 的對比

| 特性         | Public Instance Field | Private Instance Field     |
| ------------ | --------------------- | -------------------------- |
| 語法         | `loggedIn = false`    | `#score`                   |
| 外部可讀寫   | 可以                  | 不行，會報錯               |
| 方法內可存取 | 可以                  | 可以                       |
| 儲存位置     | 一般屬性              | Private element properties |

## 複習

### 在物件導向程式設計中，私有欄位的目的是什麼？

私有欄位防止開發者從物件外部直接存取或修改物件屬性。它們確保屬性只能透過指定的方法來修改，在大型程式碼庫中維持可預測的操作模式，並防止意外的修改。

### 如何在 JavaScript class 中宣告一個私有欄位？

在 class 定義內，於屬性名稱前加上井字號（#）即可宣告私有欄位。例如：`#score` 就建立了一個私有的 score 欄位。

### 在 JavaScript 中，私有欄位儲存在物件的哪裡？

私有欄位儲存在一個獨立的隱藏、不可存取的屬性區段中，稱為 private element properties。它們不存放在物件的一般屬性中，因此無法從 class 方法外部存取。

### 當像 `increment()` 這樣的方法在物件實例上被呼叫時（例如 `user1.increment()`），

該方法在哪裡被找到？

該方法存放在 prototype 物件上。JavaScript 引擎透過隱藏的 `__proto__` 屬性沿原型鏈查找，在 prototype 上找到共用的方法。

## 小測驗

<details>
<summary>私有欄位在物件導向程式設計中的目的是什麼？</summary>
防止從物件方法外部直接存取物件屬性
</details>

<details>
<summary>在 JavaScript 中，用什麼符號來宣告 class 中的私有欄位？</summary>
井字號（#）
</details>

<details>
<summary>私有欄位儲存在物件的哪個位置？</summary>
儲存在一個獨立的隱藏、不可存取的屬性區段，稱為 private element properties
</details>

<details>
<summary>以下哪個語句正確示範了在 class 方法內存取私有欄位？</summary>
`this.#score++`
</details>

<details>
<summary>在大型程式碼庫中，為什麼要防止直接修改物件屬性？</summary>
為了強制開發者使用可預測的操作模式，並防止意外的修改
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
