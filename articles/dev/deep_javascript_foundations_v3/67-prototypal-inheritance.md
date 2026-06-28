---
title: '原型繼承：`Object.create()` 與跨鏈方法查找'
description: '說明如何用 Object.create() 建立原型鏈上的繼承連結，以及跨多層原型鏈呼叫方法時，this 綁定始終由最初的呼叫點決定。'
date: 2026-06-28
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 67
chapter: 'Prototypes'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - PrototypeChain
  - OOP
---

# 原型繼承：`Object.create()` 與跨鏈方法查找

> 本篇延續前兩篇對原型鏈的討論。前篇說明了單層原型鏈的查找機制，以及遮蔽造成的多型困境。本篇展示如何在不使用 `class` 語法的情況下，透過 `Object.create()` 建立多層原型鏈繼承。

## 原型風格的繼承：完整程式碼

```javascript
function Workshop(teacher) {
  this.teacher = teacher;
}
Workshop.prototype.ask = function(question) {
  console.log(this.teacher, question);
};

function AnotherWorkshop(teacher) {
  Workshop.call(this, teacher);
}
AnotherWorkshop.prototype = Object.create(Workshop.prototype);
AnotherWorkshop.prototype.speakUp = function(msg) {
  this.ask(msg.toUpperCase());
};

var JSRecentParts = new AnotherWorkshop("Kyle");

JSRecentParts.speakUp("Is this inheritance?");
// Kyle IS THIS INHERITANCE?
```

這段程式碼是 `class` 語法底層「配管」的完整呈現。在真實開發中幾乎不會這樣寫，但理解它是理解 `class` 如何運作的基礎。

## `Object.create()`：ES5 的兩步驟工具

第 11 行的 `Object.create(Workshop.prototype)` 是整段程式碼的關鍵。

`Object.create()` 只做兩件事，而且這兩件事正好對應 `new` 演算法的前兩步：

1. 建立一個全新的空物件
2. 將這個新物件連結到指定的物件

所以 `Object.create(Workshop.prototype)` 的效果是：建立一個空物件，並讓它的原型連結指向 `Workshop.prototype`。這個新物件接著被指定給 `AnotherWorkshop.prototype`，取代了原本預設的 `AnotherWorkshop.prototype`。

沒有第 11 行，`AnotherWorkshop.prototype` 只會連結到 `Object.prototype`，`Workshop.prototype` 上的方法就不在查找路徑上，繼承就斷了。

## 多層原型鏈的查找

建立完成後，物件間的連結關係如下：

```javascript
JSRecentParts
  └─ prototype → AnotherWorkshop.prototype（有 speakUp）
                   └─ prototype → Workshop.prototype（有 ask）
                                    └─ prototype → Object.prototype
```

當執行 `JSRecentParts.speakUp(...)` 時：

1. `JSRecentParts` 本身沒有 `speakUp`，往上找
2. `AnotherWorkshop.prototype` 有 `speakUp`，找到了，呼叫它，`this` 指向 `JSRecentParts`
3. `speakUp` 內呼叫 `this.ask(...)`，`JSRecentParts` 本身沒有 `ask`，往上找
4. `AnotherWorkshop.prototype` 也沒有 `ask`，繼續往上找
5. `Workshop.prototype` 有 `ask`，找到了，呼叫它，`this` 仍然指向 `JSRecentParts`

無論方法在原型鏈的哪一層被找到，`this` 始終由最初的呼叫點決定。呼叫點是 `JSRecentParts.speakUp(...)`，`this` 就是 `JSRecentParts`，這個綁定在整個查找過程中從未改變。

## 複習

### `Object.create()` 在 JavaScript 中做了什麼？

它做兩件事：①建立一個全新的空物件；②將這個物件連結到另一個指定的物件。這對應 `new` 演算法的前兩個步驟。

### 當呼叫一個物件本身不存在的方法時，原型鏈如何運作？

JavaScript 會從物件本身開始，沿著原型鏈逐層往上查找，直到找到該方法或到達鏈的終點為止。

### 透過原型鏈呼叫方法時，`this` 的上下文由什麼決定？

`this` 永遠由最初的呼叫點決定，與方法在原型鏈上的哪一層被找到無關。

### `Object.create(Workshop.prototype)` 在原型繼承中有什麼用途？

建立一個新物件，並將其原型連結到 `Workshop.prototype`，從而在兩個建構子的 prototype 之間建立繼承關係。

### JavaScript 如何解析跨原型鏈的方法呼叫？

從原始物件開始查找，若找不到則沿原型鏈往上，逐一檢查每個連結的 prototype，直到找到方法或鏈結束為止。

## 小測驗

<details>
<summary>`Object.create()` 在 JavaScript 中做了什麼？</summary>
建立一個新的空物件並將其連結到另一個物件
</details>

<details>
<summary>在原型繼承中，當方法在當前物件上找不到時，如何解析？</summary>
沿原型鏈向上查找
</details>

<details>
<summary>當方法在原型鏈上被找到時，`this` 上下文由什麼決定？</summary>
最初呼叫該方法的物件（呼叫點）
</details>

<details>
<summary>在原型繼承中若不使用 `Object.create()`，會發生什麼事？</summary>
原型鏈斷裂，繼承失效
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記