---
title: 'TypeScript 參數屬性與 override：精簡建構子寫法，並用編譯期檢查抓出拼字錯誤與重構遺漏'
description: '示範用 public 等存取修飾詞寫在建構子參數前，一次完成欄位宣告與賦值的參數屬性語法，並用一個打錯字的 honk 方法示範 override 如何在編譯期抓出沒真的覆寫到基底類別方法的隱藏 bug，還能在重構改名時提早示警，搭配 noImplicitOverride 編譯器選項強制養成標註習慣。'
date: 2026-09-10
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 25
chapter: 'Classes & Type Guards'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - ParamProperties
    - OverrideKeyword
    - NoImplicitOverride
---

# TypeScript 參數屬性與 override：精簡建構子寫法，並用編譯期檢查抓出拼字錯誤與重構遺漏

> [[23-class-fields-and-methods|系列一開始介紹 class 欄位]] 時就提過，`make`、`model`、`year` 這幾個名字要重複寫上好幾次，這一節終於要兌現當時的承諾，介紹能大幅精簡這種寫法的參數屬性（param properties）。

## 動機：欄位名字重複寫了太多次

前面看過的寫法裡，`make`、`model`、`year` 這幾個名字，會在欄位宣告、建構子參數、建構子內部賦值裡各出現一次，變數名字被迫重複寫了三、四遍：

```ts
class Car {
    make: string;
    model: string;
    year: number;
    constructor(make: string, model: string, year: number) {
        this.make = make;
        this.model = model;
        this.year = year;
    }
}
```

## 參數屬性：在建構子參數前加上存取修飾詞

這裡的 `public` 跟 [[24-access-modifiers|前一篇提到]] 的存取修飾詞是同一組語法，只是這次是寫在建構子參數前面。參數屬性能把這整段精簡成一行：只要在建構子的參數前面加上 `public`（或其他存取修飾詞），TypeScript 就會自動用這個參數建立一個同名的 class 欄位，並在建構子執行時把傳入的值指派給它：

```ts
class Car {
    constructor(
        public make: string,
        public model: string,
        public year: number,
    ) {}
}

const myCar = new Car('Honda', 'Accord', 2017);
```

`public` 這個修飾詞出現在參數列表裡看起來有點奇怪，這種寫法只有建構子的參數才能使用，一般函式或方法的參數不能這樣寫。看一下這段程式碼編譯後的 JavaScript 就能理解它實際做了什麼：編譯器會建立三個同名、同型別的 class 欄位，並在建構子內部自動補上 `this.make = make;`、`this.model = model;`、`this.year = year;` 這幾行賦值程式碼，效果跟前面那段冗長的寫法完全一樣，只是省去了手動重複打三次名字的麻煩。因為「欄位名稱跟建構子參數名稱相同、並直接賦值」這種模式實在太常見，才特別為它設計了這種精簡語法，減少每個 class 裡都要重複出現的樣板程式碼。

## 建構子的初始化順序

使用欄位初始化器跟參數屬性時，有一個順序需要留意：如果 class 有 `extends` 一個 base class，建構子必須先呼叫 `super()`，`super()` 之前不能放任何其他程式碼。整體的初始化順序依序是：先執行 `super()`，接著處理參數屬性，然後才是其他一般的類別欄位初始化器，最後才會執行建構子裡 `super()` 呼叫之後那些自己寫的程式碼。

## override：確保子類別真的覆寫到了基底類別的方法

接下來看另一個近期加入 TypeScript 的關鍵字：`override`。先看一個容易發生的問題：

```ts
class Car {
    honk() {
        console.log('beep');
    }
}

class Truck extends Car {
    hoonk() {
        // 打錯字了，多了一個 o
        console.log('BEEP');
    }
}
```

`Truck` 原本的用意是想覆寫 `Car` 的 `honk` 方法，但因為打錯字，實際上定義了一個全新的、跟基底類別毫無關聯的 `hoonk` 方法。如果建立一個 `Truck` 的實例並呼叫 `honk()`，會呼叫到的其實是 `Car` 上原本那個方法，`Truck` 裡精心覆寫的邏輯完全沒有被執行到，而且在沒有額外提示的情況下，TypeScript 對這個問題完全無能為力，因為單看語法，`hoonk` 就只是一個合法的、全新的方法名稱而已。

`override` 關鍵字就是用來解決這個問題：加上 `override`，等於明確宣告「這個方法應該要覆寫基底類別裡的同名方法」，TypeScript 會驗證基底類別裡確實存在這個名字的方法：

```ts
class Truck extends Car {
    override hoonk() {
        // 編譯錯誤：基底類別裡沒有叫 hoonk 的成員，是不是想寫 honk？
        console.log('BEEP');
    }
}
```

加上 `override` 之後，TypeScript 會直接報錯，提示基底類別裡沒有 `hoonk` 這個成員，甚至會主動提示是不是想打 `honk`。把拼字改正確之後，錯誤就會消失。

## override 也能在重構時抓出問題

`override` 帶來的保護不只發生在最初撰寫的當下，重構基底類別時也一樣有效。假設之後把 `Car` 的 `honk` 方法改名，任何子類別裡標了 `override` 的對應方法都會立刻報錯，提示這個覆寫已經找不到對應的基底方法了，直接點出這個重構還沒有處理完、遺漏了某些地方要一併修改。

## 用 noImplicitOverride 強制養成標註習慣

`override` 這個保護能發揮作用的前提，是開發者確實記得加上這個關鍵字，但這件事很容易被遺忘，尤其是當基底類別的方法是後來才新增的、子類別原本就已經有一個同名方法存在的情況。可以在 `tsconfig.json` 裡開啟 `noImplicitOverride`：

```json
{
    "compilerOptions": {
        "noImplicitOverride": true
    }
}
```

開啟這個選項之後，只要子類別裡的方法名稱剛好跟基底類別的方法相同，卻沒有加上 `override` 關鍵字，TypeScript 就會主動報錯，要求補上這個關鍵字，強制養成一致使用 `override` 的習慣。不過要注意，這個機制沒辦法處理「一開始就打錯字」的情況：如果一開始命名的方法名稱本身就是筆誤，或者本來就是刻意想定義一個名稱不同的新方法，TypeScript 沒有辦法從語法上判斷這是不是開發者原本的意圖。但只要一開始把方法名稱寫對、養成搭配 `override` 的習慣，這個機制就能在後續大量的重構情境裡，持續發揮抓錯的效果，是讓重構變得更安全的實用工具。

## 複習

### 什麼是參數屬性？它解決了什麼問題？

參數屬性是在建構子參數前面加上存取修飾詞（例如 `public`）的語法，讓 TypeScript 自動建立同名的 class 欄位，並在建構子執行時把參數值指派給它。它解決的問題是原本欄位宣告、建構子參數、建構子內部賦值要重複寫好幾次同一個名字的冗長寫法。

### override 關鍵字的作用是什麼？

`override` 用來明確宣告一個子類別方法應該覆寫基底類別裡的同名方法，TypeScript 會驗證基底類別裡確實存在這個名字的方法。如果拼字錯誤或基底類別的方法已經被改名、刪除，TypeScript 會直接在編譯期報錯，避免子類別意外定義出一個跟基底類別毫無關聯的新方法。

### noImplicitOverride 這個編譯器選項的用途是什麼？

開啟後，只要子類別的方法名稱剛好跟基底類別的方法相同、卻沒有加上 `override` 關鍵字，TypeScript 就會主動報錯，強制開發者一致使用 `override`，幫助建立起可靠的覆寫檢查習慣。

## 小測驗

<details>
<summary>什麼編譯器選項能幫助強制一致使用 override 關鍵字？</summary>
noImplicitOverride
</details>

<details>
<summary>在建構子裡使用參數屬性時，會自動完成什麼事？</summary>
建立跟建構子參數同名的 class 欄位，並把參數值指派給它
</details>

<details>
<summary>public 這個關鍵字可以用在參數屬性語法裡的什麼地方？</summary>
只能用在建構子的參數列表裡
</details>

<details>
<summary>TypeScript class 中參數屬性的用途是什麼？</summary>
用一個宣告同時建立 class 欄位，並自動把建構子引數指派給它
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
