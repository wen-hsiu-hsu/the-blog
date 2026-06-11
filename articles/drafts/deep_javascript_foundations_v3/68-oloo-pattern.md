---
title: 'OLOO：物件連結物件的設計模式'
description: '介紹 OLOO（Objects Linked to Other Objects）模式，說明如何用純物件搭配 Object.create() 取代建構子函式、prototype 語法與 new 關鍵字，以及 Object.create() 的 polyfill 原理。'
date: 2026-06-28
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 68
chapter: 'Prototypes'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - PrototypeChain
  - OOP
---

# OLOO：物件連結物件的設計模式

> 本篇延續前幾篇對原型系統的討論。前幾篇建立了完整的原型鏈心智模型，並說明了原型風格的繼承寫法。本篇介紹 Kyle Simpson 提出的 OLOO 模式，主張直接使用物件連結，而非透過類別或建構子函式間接操作原型。

## 三種寫法的比較

在進入 OLOO 之前，先看我們已知的兩種表達同一組關係的不同方式。

**`class` 語法：**

```javascript
class Workshop {
  constructor(teacher) { this.teacher = teacher; }
  ask(question) { console.log(this.teacher, question); }
}

class AnotherWorkshop extends Workshop {
  speakUp(msg) { this.ask(msg); }
}

var JSRecentParts = new AnotherWorkshop("Kyle");
JSRecentParts.speakUp("Are classes getting better?");
// Kyle Are classes getting better?
```

**原型風格（class 底層的配管）：**

```javascript
function Workshop(teacher) { this.teacher = teacher; }
Workshop.prototype.ask = function(question) {
  console.log(this.teacher, question);
};

function AnotherWorkshop(teacher) { Workshop.call(this, teacher); }
AnotherWorkshop.prototype = Object.create(Workshop.prototype);
AnotherWorkshop.prototype.speakUp = function(msg) {
  this.ask(msg.toUpperCase());
};

var JSRecentParts = new AnotherWorkshop("Kyle");
JSRecentParts.speakUp("Isn't this ugly?");
// Kyle ISN'T THIS UGLY?
```

這兩種寫法表達的是同一個結構。差別只是 `class` 語法隱藏了那些建構子函式、`.prototype`、`new` 等細節。

## OLOO：Objects Linked to Other Objects

OLOO 的核心想法是：既然原型系統的真正力量來自「物件之間的連結」，那就直接建立物件和連結，不再假裝有類別。

```javascript
var Workshop = {
  setTeacher(teacher) {
    this.teacher = teacher;
  },
  ask(question) {
    console.log(this.teacher, question);
  }
};

var AnotherWorkshop = Object.assign(
  Object.create(Workshop),
  {
    speakUp(msg) {
      this.ask(msg.toUpperCase());
    }
  }
);

var JSRecentParts = Object.create(AnotherWorkshop);
JSRecentParts.setTeacher("Kyle");
JSRecentParts.speakUp("But isn't this cleaner?");
// Kyle BUT ISN'T THIS CLEANER?
```

在這個版本中：

- `Workshop` 是一個普通物件，不是函式，不是類別
- `AnotherWorkshop` 是一個連結到 `Workshop` 的普通物件
- `JSRecentParts` 是一個連結到 `AnotherWorkshop` 的普通物件

沒有 `.prototype`，沒有建構子函式，沒有 `new`。只有物件，以及 `Object.create()` 建立的連結。

`JSRecentParts.setTeacher("Kyle")` 沿原型鏈找到 `Workshop` 上的 `setTeacher`，透過 `this` 綁定把 `teacher` 屬性設置在 `JSRecentParts` 本身上。`this` 的四條規則在這裡一樣適用。

## `Object.create()` 的底層原理

`Object.create()` 是 ES5 新增的功能，由 Doug Crockford 提案加入語言。它的 pre-ES5 polyfill 清楚地揭示了它的運作方式：

```javascript
if (!Object.create) {
  Object.create = function(o) {
    function F() {}
    F.prototype = o;
    return new F();
  };
}
```

實作上只做三件事：建立一個空函式、設定它的 `prototype`、然後用 `new` 呼叫它取得連結好的物件。

這個 polyfill 說明了 OLOO 的本質：`Object.create()` 把所有開發者不想碰的細節（建構子函式、`.prototype`、`new`）全部隱藏在內部，只在程式碼層面留下乾淨的物件連結。

## OLOO 的意義

Kyle Simpson 認為，JavaScript 是真正物件導向的，那 OLOO 是最直接表達這個特性的方式。傳統的類別導向語言（Java、C++）把自己稱為「物件導向」，但它們的核心其實是「類別導向」。

JavaScript 可以不用任何類別就直接建立物件並連結它們，這在主流語言中極為罕見。OLOO 模式就是把這個能力直接呈現出來，而不是用類別的外衣包裹它。

## 複習

### OLOO 在 JavaScript 脈絡中代表什麼意思？

Objects Linked to Other Objects（物件連結物件）。

### `Object.create()` 如何在 JavaScript 中實現物件連結？

`Object.create()` 建立一個新物件，並將其原型連結到指定的物件，不需要使用建構子函式或 `new` 關鍵字，即可直接在物件之間建立連結。

### 傳統類別繼承與 OLOO 方式的主要差異是什麼？

OLOO 直接連結物件，去除了建構子函式、prototype 語法與 `new` 關鍵字的複雜性，同時維持相同的功能。

### OLOO 設計模式的主要目標是什麼？

透過純物件搭配 `Object.create()` 簡化物件建立與原型連結，讓 JavaScript 的物件導向程式設計更直接清晰。

### 在 OLOO 方式中，物件如何存取連結物件上的方法？

當物件本身沒有某個方法時，會沿原型鏈向上查找連結的物件，找到方法後透過呼叫點的 `this` 綁定，讓屬性設置在原始物件上。

## 小測驗

<details>
<summary>OLOO 在 JavaScript 物件建立的脈絡中代表什麼？</summary>
Objects Linked to Other Objects（物件連結物件）
</details>

<details>
<summary>OLOO 中用什麼 JavaScript 方法來連結物件？</summary>
Object.create()
</details>

<details>
<summary>OLOO 相較於傳統類別導向物件建立，提供了什麼關鍵優勢？</summary>
用 Object.create() 連結純物件，減少建構子函式與 new 的使用
</details>

<details>
<summary>在 OLOO 方式中，物件與傳統類別導向物件的差異是什麼？</summary>
物件直接相互連結，不需要建構子函式
</details>

<details>
<summary>OLOO 設計方式在 JavaScript 中的主要目標是什麼？</summary>
簡化物件建立與連結
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記