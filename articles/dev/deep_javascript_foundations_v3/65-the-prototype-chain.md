---
title: '原型鏈：物件之間的連結機制'
description: '從零開始逐步建立原型系統的完整心智圖：Object.prototype、函式的 prototype 屬性、new 建立的連結、原型鏈的查找，以及 constructor 與 dunderproto 的真實本質。'
date: 2026-06-27
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 65
chapter: 'Prototypes'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - PrototypeChain
  - OOP
  - ClassSyntax
  - ThisKeyword
---

# 原型鏈：物件之間的連結機制

> 本篇延續[[64-prototypes|上一篇]]對「連結 vs 複製」的討論。上一篇確立了 JavaScript 的原型系統是連結操作，而非複製操作。本篇逐步建立原型系統的完整物件關係圖，說明 `Object.prototype`、`prototype` 屬性、`new` 的連結行為，以及原型鏈的查找機制。

## 程式執行前的世界

在任何程式碼執行之前，JavaScript 引擎就已經建立了幾個關鍵實體。

首先是 `Object` 函式：這是內建的基礎函式，也是 `Object.keys`、`Object.values` 等工具方法的命名空間。

與它並存的是 `Object.prototype`：一個極其重要的物件，是 JavaScript 中所有非原始型別的最終原型。`toString`、`valueOf` 等基礎方法都存在於此。

這兩者之間有兩個屬性互相指向：

- `Object.prototype` 屬性：從 `Object` 函式指向 `Object.prototype` 物件
- `constructor` 屬性：從 `Object.prototype` 指回 `Object` 函式

## 定義函式時發生的事

```javascript
function Workshop(teacher) {
  this.teacher = teacher;
}
Workshop.prototype.ask = function(question) {
  console.log(this.teacher, question);
};
```

當第 1 行宣告 `Workshop` 函式時，JavaScript 同時建立了兩個實體：

1. `Workshop` 函式本身
2. 一個空物件，稱為 `Workshop.prototype`

兩者之間同樣存在雙向的屬性：

- `Workshop.prototype` 屬性：從 `Workshop` 函式指向 `Workshop.prototype` 物件
- `constructor` 屬性：從 `Workshop.prototype` 指回 `Workshop` 函式

此外，`Workshop.prototype` 與 `Object.prototype` 之間存在一條隱藏的連結（後文的 dunderproto 會說明這條連結）。

第 4 行在 `Workshop.prototype` 上新增了 `ask` 方法。此時 `Workshop.prototype` 物件上有了一個 `ask` 屬性。

## `new` 的四個步驟與連結的建立

接著我們執行以下程式碼：

```javascript
var deepJS = new Workshop("Kyle");
var reactJS = new Workshop("Suzy");
```

以 `new Workshop("Kyle")` 為例，`new` 依序執行四件事：

1. 建立一個全新的空物件
2. 將這個新物件連結到 `Workshop.prototype`（這就是那條隱藏的連結）
3. 以這個新物件作為 `this`，呼叫 `Workshop` 函式，執行 `this.teacher = teacher`，將 `teacher` 屬性直接寫在新物件上
4. 回傳這個新物件，賦值給 `deepJS`

完成後，`deepJS` 是一個只有 `teacher` 屬性的物件，它本身**沒有** `ask` 方法。`reactJS` 也是同樣的過程，只是 `teacher` 值不同。

## 原型鏈的查找

我們透過前面產生出來的 `deepJS` 來嘗試執行 `ask` 方法：

```javascript
deepJS.ask("Is 'prototype' a class?");
// Kyle Is 'prototype' a class?
```

`deepJS` 上沒有 `ask` 屬性。JavaScript 不會就此停止，而是沿著連結往上查找：

1. 在 `deepJS` 上找不到 `ask`
2. 沿著隱藏連結走到 `Workshop.prototype`
3. 在 `Workshop.prototype` 上找到了 `ask`

找到 `ask` 之後，呼叫它時 `this` 的值由**呼叫點**決定。呼叫點是 `deepJS.ask(...)`，因此 `this` 指向 `deepJS`，`this.teacher` 就是 `deepJS` 上的 `"Kyle"`。

這正是原型系統的核心優勢：一個方法定義在 `Workshop.prototype` 上，可以被無數個實例共享，而每次呼叫時 `this` 都正確指向各自的實例。

## `constructor` 的本質

接著說明 `constructor` 屬性：

```javascript
deepJS.constructor === Workshop; // true
```

`deepJS` 上沒有 `constructor` 屬性。JavaScript 沿原型鏈查找，到 `Workshop.prototype` 時找到了 `constructor`，它指向 `Workshop` 函式。

這讓 `deepJS.constructor === Workshop` 成立，看起來像是 `deepJS` 是由 `Workshop` 「建構」的。但這只是一種敘事上的安排，用來維持類別系統的假象，並非真正有意義的連結。

## Dunderproto：存取原型鏈的入口

```javascript
deepJS.__proto__ === Workshop.prototype; // true
Object.getPrototypeOf(deepJS) === Workshop.prototype; // true
```

`__proto__` 讀作 dunderproto（double underscore proto 的縮寫）。它的外觀像是一個屬性，但實際上是定義在 `Object.prototype` 上的一個 **getter 函式**。

當存取 `deepJS.__proto__` 時，發生的事情是：

1. `deepJS` 上沒有 `__proto__` 屬性
2. 沿原型鏈往上找到 `Workshop.prototype`，也沒有
3. 繼續往上找到 `Object.prototype`，找到了一個名為 `__proto__` 的 getter 函式
4. 呼叫這個 getter，呼叫點是 `deepJS`，所以 `this` 指向 `deepJS`
5. getter 從 `this`（也就是 `deepJS`）內部讀取隱藏的原型連結，回傳 `Workshop.prototype`

這裡 `this` 的綁定規則一樣適用，即使沒有括號，getter 的呼叫仍然是一次函式呼叫，`this` 由呼叫點決定。

`Object.getPrototypeOf(deepJS)` 是存取相同連結的標準方式，結果等同於 dunderproto，但語意更清晰。

## 複習

### `Object.prototype` 在 JavaScript 中的用途是什麼？

所有非原始型別最終都連結到 `Object.prototype`，它包含 `toString`、`valueOf` 等基礎工具方法，是整個語言物件體系的根基。

### JavaScript 中的原型鏈（prototype chain）是什麼？

原型鏈是物件之間的內部連結機制。當在一個物件上找不到某個屬性時，JavaScript 會沿著連結往上查找下一個物件，直到找到為止。

### 在原型鏈上找到方法後呼叫它時，`this` 如何決定？

`this` 由呼叫點決定，而非由方法被找到的位置決定。即使方法是從原型鏈上找到的，呼叫它時 `this` 仍指向發起呼叫的物件。

### JavaScript 原型系統中的 `constructor` 屬性有什麼作用？

`constructor` 是一個命名上的安排，從 prototype 物件指回建立它的函式，目的是製造類別系統存在的假象，在原型系統中並無更深的語意意義。

### `deepJS.constructor` 指向什麼？

指向 `Workshop`，因為 `Workshop.prototype` 上有 `constructor` 屬性，而它指向 `Workshop` 函式。

### `__proto__` 的別名是什麼？

dunderproto（double underscore proto 的縮寫）。

### 存取 `deepJS` 的 dunderproto 時，JavaScript 會依序在哪裡查找？

先在 `deepJS` 本身，找不到後到 `Workshop.prototype`，再找不到才到 `Object.prototype`。

### `Object.prototype.__proto__` 實際上是什麼？

一個 getter 函式，不是普通的資料屬性。

### 呼叫 `__proto__` 的 getter 時，`this` 的上下文由什麼決定？

由呼叫點決定，在 `deepJS.__proto__` 的情況下，呼叫點是 `deepJS`，所以 `this` 指向 `deepJS`。

## 小測驗

<details>
<summary>JavaScript 中 `prototype` 屬性的主要用途是什麼？</summary>
為物件繼承建立一個參考連結點
</details>

<details>
<summary>在 JavaScript 中使用 `new` 關鍵字呼叫函式時，會發生什麼事？</summary>
建立空物件、連結到另一個物件、以 `this` 指向新物件呼叫函式、並回傳該物件
</details>

<details>
<summary>JavaScript 中的原型鏈是什麼？</summary>
透過連結的原型逐層查找屬性的機制
</details>

<details>
<summary>呼叫一個方法時，`this` 的值由什麼決定？</summary>
方法的呼叫點
</details>

<details>
<summary>JavaScript 原型系統中 `constructor` 屬性的用途是什麼？</summary>
製造類別系統存在的假象
</details>

<details>
<summary>double underscore proto 屬性的術語名稱是什麼？</summary>
dunderproto
</details>

<details>
<summary>存取物件上不存在的屬性時，JavaScript 接下來會去哪裡找？</summary>
物件的原型
</details>

<details>
<summary>`constructor` 屬性通常指向什麼？</summary>
建立該物件的函式
</details>

<details>
<summary>透過 dunderproto 存取屬性時，實際上發生了什麼？</summary>
呼叫了一個 getter 函式
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記