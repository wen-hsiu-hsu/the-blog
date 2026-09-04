---
title: 'TypeScript 型別別名：取代冗長型別語法，用交集做子型別擴充，且比 interface 更有彈性'
description: '示範型別別名如何把冗長的內嵌物件型別與 tuple 聯集簡化成一個有語意的名字，可以像變數一樣匯入匯出、集中定義一處，編譯後會被完全抹除，並用交集型別做出類似繼承的擴充效果（如替 Date 加上 getDescription 方法），最後點出型別別名能承載任何型別，這點跟 interface 不同。'
date: 2026-09-04
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 13
chapter: 'Interfaces and Type Aliases'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - TypeAlias
    - IntersectionTypes
    - UnionTypes
    - Subtyping
---

# TypeScript 型別別名：用一個名字取代冗長型別語法，並用交集做子型別擴充

## 型別別名與 interface：給型別命名的兩種機制

TypeScript 提供兩種機制替型別命名，並讓型別能像 JavaScript 模組裡的值一樣透過 `import`、`export` 跨檔案使用：型別別名（type alias）與 interface。這一節先看型別別名。

## 動機：內嵌型別語法太吵，容易讓程式碼失去中心定義

回顧前面章節那個回傳 tuple 的函式，回傳型別直接寫成內嵌的物件與 tuple 型別，語法看起來相當雜亂。如果同一個型別要在五、六個函式裡重複出現，等於每個地方都要重新看懂一次這串語法，認知負擔直接翻倍。想像一整個處理使用者資訊的函式庫，這種寫法會散落在程式碼各處，沒有一個集中的定義位置。

這跟在 JavaScript 裡定義一個 class、之後到處引用它的做法完全不同：定義 class 時，程式碼裡永遠只有一個地方描述這個 class 長什麼樣子；但如果每個地方都各自內嵌寫出物件字面量加上方法，沒有集中定義，不同呼叫點的定義很容易慢慢彼此走樣。型別別名要解決的正是這個問題：把型別的形狀集中定義在一個地方，並享有匯入匯出的好處。

## 型別別名的基本語法

用一個代表金額的型別當例子：

```ts
type Amount = {
    currency: string;
    value: number;
};

function printAmount(amt: Amount) {
    console.log(amt);
    const { currency, value } = amt;
    console.log(`${currency} ${value}`);
}
```

`type Amount = ...` 這一行的右邊是型別，不是值：沒有逗號、用分號或換行分隔欄位，`string`、`number` 也是型別而不是實際的字串或數字。這是少數會在賦值語句右邊看到型別資訊的場合，而且編譯過程會把這整行語法完全清除，只留下純粹的 JavaScript，不會遺留在編譯後的程式碼裡。

定義好之後，任何原本該寫這個內嵌物件型別的地方，都可以直接換成 `Amount` 這個名字：

```ts
const donation: Amount = { currency: 'CAD', value: 300 };
printAmount(donation);
```

`donation` 這個物件並沒有在任何地方明確宣告「這是一個 `Amount`」，它就只是符合 `Amount` 這個型別要求的形狀而已，這正是 [[09-structural-vs-nominal-typing|前面]] 講過的結構型別特性：型別別名說到底只是一個既有型別的簡寫，沒有額外的形式要求。

## 型別別名能承載任何型別，這點 interface 做不到

型別別名的其中一項優勢，是它能承載 TypeScript 裡任何合法的型別，不只限於物件形狀：

```ts
type MightBeNull = string | null;
```

只要是一個型別，就可以給它一個名字，之後也能匯入匯出使用。後面會看到，interface 並不具備這種彈性，這是型別別名跟 interface 之間一個明確的差異。

## 用型別別名簡化複雜的聯集回傳型別

回顧 [[11-union-types|前一章節]] `maybeGetUserInfo` 那個函式，完整攤開的回傳型別是一長串巢狀的方括號跟大括號，讀起來很吃力。改用型別別名拆解之後：

```ts
type UserInfoOutcomeError = ['error', Error];
type UserInfoOutcomeSuccess = ['success', { name: string; email: string }];
type UserInfoOutcome = UserInfoOutcomeError | UserInfoOutcomeSuccess;

function maybeGetUserInfo(): UserInfoOutcome {
    // ...
}
```

把滑鼠移到 `UserInfoOutcome` 上，看到的提示會清楚得多，因為現在有了能直接表達意義的名字，而不是一長串結構語法。這就像是不再對別人講解「怎麼組裝一支手錶」，而是直接告訴對方「現在幾點」，把結構性的細節封裝起來，只留下有語意的名字。這跟替變數取一個能傳達用途的名稱是同一回事，只是這裡取名字的對象換成了型別本身，可以把型別別名想成「型別版的變數」。

## 用交集型別做出類似繼承的擴充效果

型別別名之間也可以互相組合，做出類似繼承的效果，雖然嚴格來說這不是真正的繼承，做法是透過 [[12-intersection-types|前一篇]] 介紹過的交集型別，在既有型別的基礎上疊加額外的要求。假設有個情境是幫某些 `Date` 加上一個 `getDescription` 方法，不是所有日期都需要這個方法，只有特別標記過的日期才有：

```ts
type SpecialDate = Date & {
    getDescription(): string;
};

const newYearsEve: SpecialDate = Object.assign(new Date(), {
    getDescription: () => "New Year's Eve!",
});
```

`SpecialDate` 的定義是「一個 `Date`，並且額外具備 `getDescription` 方法」。建立出來的 `newYearsEve` 型別提示乾淨清楚，它同時擁有 `Date` 原本所有的方法（例如 `getFullYear`），也具備新增的 `getDescription`。可以把這個關係想成 `SpecialDate` 是 `Date` 的子型別：任何需要 `Date` 的地方，都能放心傳入一個 `SpecialDate`，因為它符合 `Date` 要求的一切，只是額外多了一項「必須有 `getDescription` 方法」的要求，讓它成為一個範圍更窄、但描述更精確的型別。

## 複習

### 型別別名主要解決的問題是什麼？

解決冗長、內嵌的型別語法散落在程式碼各處、缺乏集中定義的問題。透過型別別名，可以把型別的形狀定義在一個地方，並給它一個有語意的名字，之後可以在多處重複使用，也能透過匯入匯出跨模組共享。

### 型別別名的語法特色是什麼？

用 `type 名稱 = 型別定義` 的語法宣告，等號右邊放的是型別而不是值，這是少數會在賦值語句右邊看到型別資訊的場合。編譯過程會把這整行語法完全抹除，不會出現在編譯後的 JavaScript 裡。

### 如何用型別別名建立類似繼承的擴充效果？

透過交集型別把既有型別跟一個描述額外要求的物件型別結合起來，例如 `type SpecialDate = Date & { getDescription(): string }`，這樣建立出來的新型別會同時具備原本型別的所有能力，並額外多出一項要求，可以視為原本型別的子型別。

### 型別別名相較於 interface 有什麼獨特的優勢？

型別別名可以承載 TypeScript 裡任何合法的型別，不只限於物件形狀，例如聯集型別、tuple，甚至是原始型別的聯集（如 `string | null`），這種彈性是 interface 所不具備的。

## 小測驗

<details>
<summary>相較於 interface，型別別名有什麼獨特的能力？</summary>
可以承載 TypeScript 中任何合法定義的型別
</details>

<details>
<summary>TypeScript 中的交集型別是什麼？</summary>
一種把多個型別結合在一起，同時要求具備各自屬性與要求的方式
</details>

<details>
<summary>定義複雜型別時，型別別名帶來什麼好處？</summary>
透過賦予型別語意上的名字，降低理解上的認知負擔
</details>

<details>
<summary>型別別名在編譯過程中會發生什麼事？</summary>
會從編譯後的輸出中完全被抹除
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
