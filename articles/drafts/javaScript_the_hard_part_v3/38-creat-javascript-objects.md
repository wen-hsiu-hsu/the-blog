---
title: Object Literal、Dot Notation、Object.create：三種建立物件的方式
description: 介紹封裝的核心概念，並以測驗遊戲為例，示範三種在 JavaScript 中建立物件的方式：物件字面值、點記法與 Object.create()，同時說明各自的特性與適用情境。
date: 2026-05-19
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 38
chapter: 'Classes & Prototypes (OOP)'
tags:
    - JavaScript
    - OOP
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# Object Literal、Dot Notation、Object.create：三種建立物件的方式

## 封裝（Encapsulation）：把資料與功能放在一起

物件讓我們能夠把資料與操作該資料的功能放在同一個地方，這個原則稱為**封裝（encapsulation）**。封裝的核心價值在於：當我需要對某個使用者的分數進行操作時，相關的功能就在該物件上，不需要在十萬行程式碼中搜索。

開發者的目標是能夠透過點記法（dot notation），直接在物件的右側呼叫功能：

```javascript
user1.increment();
```

這一行語法展示了 OOP 的核心理念：功能與資料共存，且透過點記法直接存取

## 方法（Method）

儲存在物件內的函式有一個專屬名稱，叫做**方法（method）**。方法與一般函式的差異在於它隸屬於某個物件，讓我們能確保功能只被用在正確的資料上。

## 三種建立物件的方式

### 1. 物件字面值（Object Literal）

最直接的方式，在宣告時一次性定義所有屬性與方法：

```javascript
const user1 = {
    name: 'Ari',
    score: 3,
    increment: function () {
        user1.score++;
    },
};

user1.increment(); // user1.score -> 4
```

### 2. 點記法（Dot Notation）

先宣告一個空物件，再逐一透過點記法加入屬性與方法：

```javascript
const user2 = {};

user2.name = 'Jae';
user2.score = 5;
user2.increment = function () {
    user2.score++;
};
```

### 3. Object.create()

傳入 `null` 作為引數，會建立一個乾淨的空物件，再逐一加入屬性：

```javascript
const user3 = Object.create(null);

user3.name = 'Tam';
user3.score = 9;
user3.increment = function () {
    user3.score++;
};
```

`Object.create()` 目前看起來與點記法效果相似，但它對於後續的原型鏈控制有更精細的作用，在接下來的章節中會發揮關鍵角色。

### 現有方法的問題

上面三種方式雖然都達成了封裝的目標，但每個使用者物件都各自儲存了一份 `increment` 函式的完整定義。若系統中有一千個使用者，記憶體中就會有一千份內容完全相同的函式定義，這顯然是一種浪費，與「高效能」的目標相違背。後續文章將會透過原型鏈的原理來修正這個問題。

## 複習

### 儲存在物件內的函式叫什麼？

方法（Method）

### 課程中提到哪三種建立物件的方式？

1. 物件字面值（Object Literal）：直接定義物件並包含所有屬性
2. 點記法（Dot Notation）：先宣告空物件，再逐一加入屬性
3. Object.create() 方法

### 使用點記法建立物件時，第一步是什麼？

宣告一個空物件，再透過點記法逐一加入屬性

### 呼叫物件上的方法使用什麼語法？

在物件右側使用點記法，例如：`object.methodName()`

### 使用 `Object.create()` 並傳入 `null` 作為引數時，會發生什麼？

建立一個空物件，之後可以再逐一加入屬性

## 小測驗

<details>
<summary>儲存在物件內的函式叫什麼？</summary>
方法（Method）
</details>

<details>
<summary>`user1.increment()` 這個語法在物件導向程式設計中代表什麼？</summary>
透過點記法呼叫 user1 物件上的方法
</details>

<details>
<summary>直接在程式碼中定義物件，例如 `const user1 = {name: 'RE', score: 3}`，這種方式的術語是什麼？</summary>
物件字面值（Object Literal）
</details>

<details>
<summary>課程中提到哪三種建立物件的方式？</summary>
物件字面值（Object Literal）、點記法（Dot Notation）、Object.create()
</details>

<details>
<summary>使用 `Object.create(null)` 建立物件時，記憶體中最初儲存的是什麼？</summary>
一個空物件
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
