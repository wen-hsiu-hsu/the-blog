---
title: 'TypeScript class 欄位、方法與靜態成員：從必須預先宣告到 static block 非同步初始化'
description: '用 Car 這個 class 示範 TypeScript 要求欄位必須預先宣告型別（不像 JavaScript 能動態掛屬性），方法的型別標註跟一般函式相同，並介紹靜態欄位/方法（this 是 class 本身而非實例）、類別欄位初始化器如何把邏輯搬出建構子，以及 static block 如何做非同步初始化。'
date: 2026-09-09
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 23
chapter: 'Classes & Type Guards'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - Classes
    - ClassFields
    - StaticMembers
    - ClassStaticSide
    - ClassFieldInitializers
    - StaticBlock
---

# TypeScript class 欄位、方法與靜態成員：從必須預先宣告到 static block 非同步初始化

## class 欄位必須預先宣告型別

在一般 JavaScript 裡，class 的實例屬性可以動態地隨時新增，不需要事先宣告。但 TypeScript 的目標之一是讓任何被傳遞的值都有明確的型別可循，這也延伸到 class 欄位上：

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

乍看之下這種寫法比較囉唆，`make`、`model`、`year` 這三個名字實際上出現了不只一次：一次在欄位宣告，一次在建構子參數，再各自在建構子內部賦值一次。後面章節會介紹一種叫做參數屬性（parameter properties）的語法，能大幅精簡掉這些重複的部分，這裡先看最基本的寫法。

## construct signature 會驗證建構子引數的順序

在一般 JavaScript 裡，呼叫建構子時如果不小心把引數順序弄反，往往要等到實際使用時才會發現問題，比如呼叫了一個根本不存在的方法（例如打錯字的 `activateTurnSignal`），或是把年份誤放進廠牌的位置。有了型別標註，class 本質上具備一個 [[20-constructables-function-overloads|construct signature]]，會在呼叫 `new Car(...)` 的當下就驗證引數的型別跟順序是否正確，把這類低級錯誤在編譯期就攔下來。

## 方法的型別標註跟一般函式相同

替 class 方法加上型別，用的規則跟前面替一般函式加上型別標註完全一樣：

```ts
class Car {
    // ...
    honk(duration: number): string {
        return `h${'o'.repeat(duration)}nk`;
    }
}
```

參數怎麼標註、選擇性參數怎麼處理，這些規則對方法來說都是一樣的，可以把 class 方法當成「掛在 class 上的一般函式」來理解，不需要另外學一套語法。

## 靜態欄位與方法：屬於 class 本身，不屬於任何實例

JavaScript 近幾年新增了靜態欄位（static field）這個語法，用來把欄位或方法直接掛在 class 本身，而不是掛在每個實例上：

```ts
class Car {
    static nextSerialNumber = 100;

    static generateSerialNumber() {
        return Car.nextSerialNumber++;
    }
    // ...
}
```

`nextSerialNumber` 這個欄位可以直接透過 `Car.nextSerialNumber` 存取，不需要先建立一個 `Car` 的實例，這正是「class 的靜態面」的意思，也就是建構子本身所在的那一側，跟一般實例屬性是分開的概念。同樣地，`generateSerialNumber` 也是一個靜態方法，直接掛在 `Car` 這個 class 上。

在靜態方法內部，`this` 的型別是 [[16-type-queries|`typeof Car`]]，代表的是 class 本身（也就是靜態面），跟 [[21-this-types|前面提到]] 實例方法裡 `this` 自動對應到執行個體的型別 `Car` 完全不同，兩者不要混淆：靜態方法裡的 `this` 指的是「掛在 class 本身上的東西」，而不是任何一台具體的車。

## 用類別欄位初始化器把邏輯搬出建構子

有了靜態方法之後，可以用它替一個實例欄位設定初始值：

```ts
class Car {
    static nextSerialNumber = 100;

    static generateSerialNumber() {
        return Car.nextSerialNumber++;
    }

    serialNumber = Car.generateSerialNumber();
    // ...
}
```

`serialNumber = Car.generateSerialNumber();` 這一行就是類別欄位初始化器：處理這個 class 時，會執行 `generateSerialNumber()`，並把回傳的值指派給 `serialNumber` 這個欄位。這在效果上等同於在建構子內部寫 `this.serialNumber = Car.generateSerialNumber();`，但寫成欄位初始化器的形式，能一眼就看出「這個欄位是什麼、初始值從哪裡來」，不用把這類設定邏輯全部塞進建構子裡，讓建構子維持乾淨。因為 `generateSerialNumber()` 回傳的本來就是 `number`，這裡也不需要額外幫 `serialNumber` 寫型別標註，TypeScript 能自動從初始值推斷出來。

## static block：在類別初始化階段跑設定邏輯

除了單一欄位的初始化器，最近的 JavaScript 跟 TypeScript 版本還加入了 static block，適合用在需要更複雜設定邏輯的情境，例如透過非同步的 API 呼叫取得初始的序號：

```ts
class Car {
    static nextSerialNumber = 100;

    static {
        fetch('https://api.example.com/serial-numbers')
            .then((response) => response.json())
            .then((data) => {
                Car.nextSerialNumber = data.nextSerialNumber;
            });
    }
    // ...
}
```

static block 會在 `Car` 這個 class 宣告處理完後不久就執行，不需要建立任何實例就會觸發，可以把它想成是「class 層級的設定邏輯」，跟建構子是「實例層級的設定邏輯」相互對應。

要注意的是，如果 static block 裡包含非同步操作（像上面的 `fetch`），這個 fetch 只是在類別求值時發送出去，並不會等待它完成才繼續往下走。如果程式邏輯需要確保序號真的抓到之後才能建立車輛實例，還需要額外設計一套「準備就緒」的機制來配合。

一個 class 裡可以宣告不只一個 static block，它們會按照撰寫的先後順序，由上到下依序執行，方便把不同用途的初始化邏輯分開撰寫。

## 複習

### TypeScript 的 class 欄位，跟一般 JavaScript 裡的物件屬性有什麼不同？

TypeScript 要求 class 欄位必須在使用之前明確宣告型別，不能像一般 JavaScript 那樣，隨時動態地把新屬性掛到一個實例上而不需要任何事先宣告。

### 什麼是靜態欄位？它跟一般實例欄位有什麼不同？

靜態欄位屬於 class 本身，而不是屬於任何一個實例，可以直接透過 class 名稱存取（例如 `Car.nextSerialNumber`），不需要先建立實例；一般實例欄位則必須透過某個具體的實例才能存取。

### 什麼是類別欄位初始化器？

類別欄位初始化器是一種在宣告 class 欄位的同時，直接指定初始值的寫法，可以是一個固定的值，也可以是呼叫某個方法取得的結果，能把原本要塞進建構子裡的設定邏輯搬出來，讓建構子維持簡潔。

### 什麼是 static block？它什麼時候會執行？

static block 是最近才加入 JavaScript 與 TypeScript 的語法，用來執行 class 層級的初始化邏輯，例如設定靜態欄位的初始值，甚至可以包含非同步操作。它會在 class 宣告被處理之後不久就執行，不需要建立任何實例就會觸發。

## 小測驗

<details>
<summary>class 方法跟 static 方法，最主要的差異是什麼？</summary>
static 方法是直接掛在 class 本身上呼叫，而不是掛在某個實例上
</details>

<details>
<summary>類別欄位初始化器的用途是什麼？</summary>
在建構子之外，直接替一個類別屬性設定初始值
</details>

<details>
<summary>在 TypeScript 中，對一個 class 使用 typeof 運算子，指的是什麼？</summary>
class 的靜態面，包含所有靜態欄位與靜態方法
</details>

<details>
<summary>TypeScript 的 class 為什麼要求欄位必須預先宣告？</summary>
因為 TypeScript 要求任何會被傳遞的值都必須有某種明確的型別定義
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
