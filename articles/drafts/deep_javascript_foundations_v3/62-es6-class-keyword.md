---
title: 'ES6 `class` 語法：繼承、`super` 與 `this` 綁定的陷阱'
description: '介紹 ES6 class 語法的基本用法、extends 繼承與 super 相對多型。說明 class 方法傳遞為 callback 時同樣會遺失 this 綁定，以及用箭頭函式「修復」這個問題所帶來的自我矛盾代價。'
date: 2026-06-26
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 62
chapter: 'Objects'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - ThisKeyword
  - class
---

# ES6 `class` 語法：繼承、`super` 與 `this` 綁定的陷阱

> 本篇進入 ES6 `class` 語法。前幾篇已建立了 `this` 四種綁定規則的完整框架。`class` 語法是疊加在原型系統之上的語法糖，但 `this` 的綁定規則在 `class` 中完全一樣適用，並帶來一些值得注意的陷阱。

## ES6 `class` 的基本語法

```javascript
class Workshop {
  constructor(teacher) {
    this.teacher = teacher;
  }
  ask(question) {
    console.log(this.teacher, question);
  }
}

var deepJS = new Workshop("Kyle");
var reactJS = new Workshop("Suzy");

deepJS.ask("Is 'class' a class?");
// Kyle Is 'class' a class?

reactJS.ask("Is this class OK?");
// Suzy Is this class OK?
```

幾個值得注意的語法細節：

- 方法之間不需要逗號分隔
- `constructor` 是可選的，定義時用來初始化實例狀態
- 可以定義多個方法，直接寫在 `class` 本體中
- `class` 除了作為陳述式，也可以是表達式，甚至是匿名的（雖然 Kyle Simpson 認為不應該這樣做）

## `extends` 繼承與 `super`

### 基本繼承

```javascript
class Workshop {
  constructor(teacher) {
    this.teacher = teacher;
  }
  ask(question) {
    console.log(this.teacher, question);
  }
}

class AnotherWorkshop extends Workshop {
  speakUp(msg) {
    this.ask(msg);
  }
}

var JSRecentParts = new AnotherWorkshop("Kyle");
JSRecentParts.speakUp("Are classes getting better?");
// Kyle Are classes getting better?
```

`extends` 讓子類別繼承父類別的方法。`AnotherWorkshop` 不需要重新定義 `ask`，透過 `this.ask(msg)` 即可使用繼承來的方法。

### `super`：相對多型

```javascript
class AnotherWorkshop extends Workshop {
  ask(msg) {
    super.ask(msg.toUpperCase());
  }
}

var JSRecentParts = new AnotherWorkshop("Kyle");
JSRecentParts.ask("Are classes super?");
// Kyle ARE CLASSES SUPER?
```

當子類別定義了與父類別同名的方法（覆寫/shadowing），可以用 `super.methodName()` 呼叫父類別版本，這就是**相對多型（relative polymorphism）**。

Kyle Simpson 指出，這是 `class` 語法超越「純粹語法糖」的地方之一：在 ES6 之前，JavaScript 沒有對等的相對多型機制。

## `class` 方法同樣會遺失 `this` 綁定

許多開發者以為 `class` 語法會自動處理 `this` 綁定問題，但實際上並非如此。

```javascript
class Workshop {
  constructor(teacher) {
    this.teacher = teacher;
  }
  ask(question) {
    console.log(this.teacher, question);
  }
}

var deepJS = new Workshop("Kyle");

setTimeout(deepJS.ask, 100, "Still losing 'this'?");
// undefined Still losing 'this'?
```

`class` 的方法就像一般函式，傳遞為 callback 時同樣會遺失 `this` 綁定。這一點與其他傳統類別導向語言（如 Java、C#）不同，JavaScript 並未自動綁定方法。

### 常見的「修復」方式與其代價

為了解決這個問題，社群中流行一種做法：在 `constructor` 中用箭頭函式覆寫方法。

```javascript
class Workshop {
  constructor(teacher) {
    this.teacher = teacher;
    this.ask = question => {
      console.log(this.teacher, question);
    };
  }
}

var deepJS = new Workshop("Kyle");

setTimeout(deepJS.ask, 100, "Is 'this' fixed?");
// Kyle Is 'this' fixed?
```

`this` 確實不再遺失了，但 Kyle Simpson 對這個做法提出嚴厲批評：

**問題一：方法從原型移到了實例上**

`class` 的設計假設方法存在於原型（prototype）上，由所有實例共享。將方法寫在 `constructor` 中並賦值給 `this.ask`，意味著每次 `new Workshop()` 都會產生一份獨立的 `ask` 函式副本，附加在各自的實例上。

**問題二：自我矛盾的設計**

使用 `class` 是為了獲得動態、彈性的 `this` 系統。但為了「修復」 `this` 遺失問題而把方法硬綁定，等於主動放棄了這個動態性。最終的結果，只是用更複雜、更脆弱的方式，做出一個效果更差的閉包模組。

Kyle Simpson 的立場是：如果你真的不需要動態 `this`，直接使用模組模式（閉包）才是正確的工具。如果你使用 `class` 卻把所有方法都硬綁定，你付出了 `class` 系統的全部語法複雜度，卻沒有得到任何好處。

## `class` 系統的適當使用場景

Kyle Simpson 並非完全否定 `class`，他的立場是：

- `class` 在真正需要**多層繼承、多型與 `super`** 時是有意義的工具
- 問題在於絕大多數使用 `class` 的開發者，最後都走向完全切斷動態彈性的做法，得到的只是一個功能退化的模組

## 複習

### JavaScript 中的 class 是什麼，如何定義？

class 是使用 `class` 關鍵字定義物件類型的方式，可包含 constructor 和方法。class 可帶或不帶 `extends` 子句，方法之間不需要逗號分隔。

### 在 JavaScript 中如何建立 class 的實例？

使用 `new` 關鍵字加上類別名稱，例如 `new ClassName()`，這會建立一個可存取類別方法與 constructor 的物件。

### JavaScript class 中的 `extends` 關鍵字有什麼作用？

`extends` 讓子類別繼承父類別的方法與屬性。子類別可以直接使用繼承的方法，也可以定義新方法或覆寫既有方法。

### JavaScript class 中的 `super` 關鍵字用途是什麼？

`super` 讓子類別能夠參照並呼叫父類別的方法，在子類別與父類別有同名方法時，可實現相對多型。

### 將 class 的方法作為 callback 傳遞時，`this` 綁定會發生什麼事？

class 的方法不會自動維持 `this` 綁定，傳遞為 callback 時會遺失原始上下文，可能需要使用箭頭函式或 `.bind()` 等明確綁定技術。

## 小測驗

<details>
<summary>在 JavaScript 中定義 class 使用哪個關鍵字？</summary>
class
</details>

<details>
<summary>在 JavaScript class 語法中，哪個關鍵字可以讓子類別參照父類別的方法？</summary>
super
</details>

<details>
<summary>將 class 的方法傳遞給 setTimeout 時，方法的綁定會發生什麼事？</summary>
方法會遺失其 `this` 綁定
</details>

<details>
<summary>在 JavaScript class 中，方法如何定義？</summary>
方法定義之間不需要逗號分隔
</details>

<details>
<summary>`extends` 關鍵字在 JavaScript class 中的作用是什麼？</summary>
讓一個 class 繼承另一個 class
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記