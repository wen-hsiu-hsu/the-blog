---
title: '`Object.prototype`：原型鏈的頂端'
description: '說明 `Object.prototype` 作為原型鏈頂端的角色，以及 `hasOwnProperty` 等內建方法如何透過原型鏈被所有物件存取，並釐清 `[[prototype]]` 與 `Object.prototype` 這兩個容易混淆的命名。'
date: 2026-05-21
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 42
chapter: 'Classes & Prototypes (OOP)'
tags:
    - JavaScript
    - Prototype
    - OOP
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# `Object.prototype`：原型鏈的頂端

> 本章節建議從 [[37-object-oriented-javascript]] 開始閱讀

## hasOwnProperty 在哪裡？

承接[[41-prototypes-and-object-create|前一節]]的架構，假設我們想確認 `user1` 是否確實擁有 `score` 這個屬性，可以這樣呼叫：

```javascript
user1.hasOwnProperty('score');
```

但 `hasOwnProperty` 並不在 `user1` 上，也不在 `userFunctionStore` 上，那它從哪裡來？

## 原型鏈的完整結構

JavaScript 中所有物件在建立時，都會自動獲得一個隱藏的 `[[prototype]]` 屬性。對於一般物件（未使用 `Object.create` 指定原型的情況），這個屬性預設指向一個 JavaScript 內建物件上名為 `prototype` 的屬性，即 **`Object.prototype`**。

`Object.prototype` 本身是一個物件，其中存放了許多所有物件都應能存取的內建方法，例如 `hasOwnProperty`、`toString` 等。`Object.prototype` 的 `[[prototype]]` 則指向 `null`，這就是原型鏈的終點。

因此，以本節的範例來說，查找 `user1.hasOwnProperty('score')` 時，JavaScript 的完整查找路徑如下：

```
user1
  → [[prototype]] → userFunctionStore（找不到 hasOwnProperty）
      → [[prototype]] → Object.prototype（找到！執行它）
          → [[prototype]] → null（鏈的終點）
```

`userFunctionStore` 作為一個普通物件，其 `[[prototype]]` 預設就已指向 `Object.prototype`，因此即使我們在 `user1` 和 `userFunctionStore` 之間插入了自訂的原型層，仍然不會失去對 `Object.prototype` 上內建方法的存取能力。

## `[[prototype]]` 與 `prototype` 的命名問題

這裡有一個容易混淆的命名：

- **`[[prototype]]`**：每個物件上的隱藏屬性，指向它的原型物件。可透過舊式的 `__proto__` 直接存取，但這是一個幾乎已被棄用的遺留 API。
- **`Object.prototype`**：JavaScript 內建物件 `Object` 上的一個普通屬性（key 就是字串 `"prototype"`），其值是那個存放內建方法的物件。

兩者名稱相近卻是不同層次的概念，是 JavaScript 規範中命名不夠直覺的地方之一。

## 複習

### 可以用什麼方法來確認物件是否直接擁有某個屬性（而非繼承而來）？

可以使用 `hasOwnProperty()` 方法來確認物件是否直接擁有某個屬性，
而不是從原型鏈繼承而來的。

### 當在物件自身上找不到某個屬性或方法時，JavaScript 會去哪裡查找？

JavaScript 會透過物件的隱藏屬性 `[[prototype]]` 前往其原型物件查找。
若在原型物件上仍找不到，便繼續沿原型鏈向上查找，
直到抵達 Object.prototype 或 null 為止。

### 什麼是 Object.prototype？它在 JavaScript 中為何重要？

Object.prototype 是一個內建物件，其中包含許多實用方法（例如 hasOwnProperty），
JavaScript 中所有物件預設都能透過原型鏈存取這些方法。
它位於大多數物件的原型鏈頂端。

### 當 JavaScript 在 Object.prototype 上也找不到某個屬性時，會發生什麼事？

當 JavaScript 在 Object.prototype 上也找不到屬性時，
便抵達了 null，也就是原型鏈的終點。
此時屬性查找失敗，回傳 undefined。

### 使用 Object.create() 建立的物件與原型鏈之間的關係是什麼？

使用 Object.create() 時，新建立物件的隱藏屬性 `[[prototype]]` 會指向
傳入作為引數的那個物件，而不是直接指向 Object.prototype。
這樣可以建立自訂的原型鏈，同時仍能透過鏈向上存取 Object.prototype 上的方法。

## 小測驗

<details>
<summary>JavaScript 中 `hasOwnProperty` 方法的作用是什麼？</summary>
用來確認某個屬性是否直接存在於物件自身上
</details>

<details>
<summary>在使用者物件上呼叫 `hasOwnProperty` 時，這個方法最終在哪裡被找到？</summary>
在 Object.prototype 上
</details>

<details>
<summary>JavaScript 用來參照物件原型的隱藏屬性叫什麼名稱？</summary>
`[[prototype]]`
</details>

<details>
<summary>當 JavaScript 在物件上找不到某個屬性時，會做什麼？</summary>
沿著原型鏈向上查找
</details>

<details>
<summary>userFunctionStore 的 prototype 屬性預設指向哪裡？</summary>
Object.prototype
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
