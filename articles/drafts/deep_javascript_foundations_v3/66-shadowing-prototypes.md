---
title: '原型遮蔽（Shadowing）與顯式偽多型'
description: '說明在原型鏈上定義同名屬性產生的遮蔽現象，以及在沒有 class 系統的情況下嘗試實現相對多型時，必須付出的醜陋代價。'
date: 2026-06-27
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 66
chapter: 'Prototypes'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - PrototypeChain
  - OOP
---

# 原型遮蔽（Shadowing）與顯式偽多型

> 本篇延續[[65-the-prototype-chain|上一篇]]對原型鏈的討論。上一篇說明了屬性查找如何沿原型鏈向上搜尋。本篇探討當原型鏈的不同層級出現同名屬性時，遮蔽（shadowing）現象如何產生，以及在沒有 `class` 語法的情況下嘗試實現多型會遇到什麼問題。

## 遮蔽（Shadowing）

當在物件本身和它的原型上同時存在同名屬性時，較低層級（物件本身）的屬性會遮蔽較高層級（原型上）的同名屬性。

```javascript
function Workshop(teacher) {
  this.teacher = teacher;
}
Workshop.prototype.ask = function(question) {
  console.log(this.teacher, question);
};

var deepJS = new Workshop("Kyle");

deepJS.ask = function(question) {
  this.ask(question.toUpperCase());
};

deepJS.ask("Oops, is this infinite recursion?");
```

第 10 行直接在 `deepJS` 物件上新增了一個 `ask` 方法，與 `Workshop.prototype` 上的 `ask` 同名。此時 `deepJS` 本身有 `ask`，原型上也有 `ask`，形成遮蔽。

當呼叫 `deepJS.ask(...)` 時，先在 `deepJS` 上找到了 `ask`，因此直接呼叫它，不會往上查找原型。

## 遮蔽的問題：無法實現相對多型

第 11 行試圖在新的 `ask` 內部呼叫「原型上的那個 ask」。但 `this.ask` 中的 `this` 由呼叫點決定，呼叫點是第 14 行的 `deepJS.ask(...)`，因此 `this` 指向 `deepJS`。

`this.ask` 再次找到的是 `deepJS` 本身的 `ask`，也就是正在執行的這個函式本身，於是陷入無限遞迴。`this.ask` 在這裡無法充當 `super`，它不是相對多型的參照。

## 顯式偽多型（Explicit Pseudo Polymorphism）

要從 `deepJS` 往上走一層原型鏈，可以使用 dunderproto：

```javascript
deepJS.ask = function(question) {
  this.__proto__.ask.call(this, question.toUpperCase());
};

deepJS.ask("Is this fake polymorphism?");
// Kyle IS THIS FAKE POLYMORPHISM?
```

`this.__proto__` 指向 `Workshop.prototype`，在那裡可以找到原始的 `ask` 方法。但不能直接呼叫 `this.__proto__.ask(...)`，因為那樣 `this` 會指向 `Workshop.prototype` 而非 `deepJS`。必須用 `.call(this, ...)` 強制把 `this` 指定為 `deepJS`。

Kyle Simpson 稱這個做法為**顯式偽多型（explicit pseudo polymorphism）**：不是真正的相對多型，只是在硬幹。

這個做法還有更深的問題：如果原型鏈再多一層，就需要兩個 `__proto__`：

```javascript
this.__proto__.__proto__.ask.call(this, ...);
```

每多一層繼承，就多一個 `__proto__`，程式碼愈寫愈脆弱且難以維護。

## 複習

### 當原型鏈的不同層級有同名方法時，會發生什麼事？

發生遮蔽（shadowing）：較低層級（物件本身）的方法會被優先找到並呼叫，較高層級（原型上）的同名方法被遮蔽。

### 嘗試用 `this.__proto__.methodName` 存取父層方法時，會出現什麼問題？

直接呼叫 `this.__proto__.methodName(...)` 時，`this` 上下文會指向原型物件，而非原本的實例，因此必須搭配 `.call(this, ...)` 強制修正上下文。

### 在原型繼承中遮蔽方法的核心挑戰是什麼？

在沒有 `class` 系統的情況下，沒有乾淨的方式實現相對多型。只能使用 `this.__proto__.method.call(this, ...)` 這種顯式偽多型，且每多一層原型鏈就需要再多一個 `__proto__`。

### 如果需要存取原型鏈上更高層的方法，會發生什麼事？

需要串接多個 `__proto__`，例如 `this.__proto__.__proto__.method.call(this)`，原型鏈愈深，程式碼愈脆弱。

## 小測驗

<details>
<summary>使用 `this.dunderproto.ask` 存取原型鏈上的方法時，有什麼問題？</summary>
`this` 的上下文會變成 `Workshop.prototype`，而非原始實例
</details>

<details>
<summary>在原型繼承中覆寫方法時，用什麼技術實現多型行為？</summary>
方法遮蔽（method shadowing）
</details>

<details>
<summary>在多層原型鏈中存取父層方法時，會產生什麼問題？</summary>
每多一層就需要多串接一個 `.dunderproto`
</details>

<details>
<summary>在原型繼承中手動存取父層方法的做法被稱為什麼？</summary>
顯式偽多型（explicit pseudo polymorphism）
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記