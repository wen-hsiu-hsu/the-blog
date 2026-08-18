---
title: 'TypeScript 遞迴型別：用 NestedNumbers 描述無限巢狀陣列，不再需要 interface 搭配寫法'
description: '用 number | NestedNumbers[] 這個自我參照的型別別名，示範如何描述可無限往下巢狀的數字陣列結構，說明型別別名處理右側定義的方式跟 JavaScript 運算式求值類似，並澄清現在不需要 interface 搭配 type alias，這種寫法之後會用來定義 JSON 型別。'
date: 2026-09-05
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 15
chapter: 'Interfaces and Type Aliases'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - RecursiveTypes
    - TypeAlias
    - UnionTypes
---

# TypeScript 遞迴型別：用 NestedNumbers 描述無限巢狀的數字陣列

> [[14-interface-extends-and-implements|前面]] 看的是 interface 之間用 `extends` 建立的繼承鏈。這一節要介紹另一種型別技巧：遞迴型別，接下來的練習會用到它。

## 動機：描述一個可以無限往下巢狀的陣列

假設要描述像這樣的一組值：

```ts
[3, 4, [5, 6, [7], 59], 221];
```

這是一個數字陣列，但裡面又可以塞進另一個數字陣列，那個數字陣列裡還可以再塞一層數字陣列，深度沒有限制。裡面每個元素若不是數字，就必須是同樣規則的巢狀數字陣列，不能塞進字串這種不相關的型別。要描述這種「深度不固定、但結構規則不變」的資料，需要用到遞迴型別。

## 用型別別名定義一個會參照自己的型別

遞迴型別的寫法出乎意料地直接：

```ts
type NestedNumbers = number | NestedNumbers[];
```

這句話讀起來是：「`NestedNumbers` 這個型別，可以是一個 `number`，也可以是一個裝著 `NestedNumbers` 的陣列。」這裡剛好用上型別別名能在最外層寫聯集型別的彈性，也就是 [[14-interface-extends-and-implements|前面提過]] interface 做不到的那件事。

## 型別別名的求值方式，跟 JavaScript 運算式類似

理解這句定義為什麼能成立，可以對照 JavaScript 賦值運算式的求值順序：寫下 `x = 5` 或 `x = someFunction()` 時，右側的值（或函式呼叫結果）會先被算出來，才會指派給左側的變數。型別別名的處理方式也遵循類似的邏輯：TypeScript 會先看等號右側的型別定義，這裡先看到「可以是 `number`，也可以是這個型別本身（此刻還在定義中）」，這部分先暫時擱著，接著才把整個定義結果命名成 `NestedNumbers`，最後這個名字自然就能在它自己的定義裡被引用，整個結構因此串接起來，等於允許數字，或是可以無限往下巢狀的數字陣列。

## 驗證這個型別確實能無限巢狀

用一個實際的值驗證這個型別的行為：

```ts
const val: NestedNumbers = [3, 4, [5, 6, [7], 59], 221];

if (typeof val !== 'number') {
    val.push(41); // 可以
    val.push([41]); // 也可以，還能繼續往下包一層陣列
    val.push('this will not work'); // 錯誤：字串不符合 NestedNumbers
}
```

可以反覆把 `41` 或包著 `41` 的陣列往裡面塞，不管疊多少層都合法，但塞進字串就會直接被 TypeScript 擋下來。連推入一個空陣列也是允許的，TypeScript 會盡量把它往合理的方向解讀，推斷這是一個空的數字陣列，一樣算是符合 `NestedNumbers` 的一種型態。

## 過去需要 interface 搭配 type alias，現在不用了

如果上網搜尋 TypeScript 遞迴型別的寫法，可能會看到比較舊的資料提到，早期的 TypeScript 版本要求把 interface 跟型別別名搭配使用，讓兩者互相參照才能實現遞迴型別。這個限制目前已經解除，現在單獨用型別別名就足以寫出遞迴型別，不再需要繞這個彎路。

這一節看到的 `NestedNumbers` 只是一個相對簡單、也偏抽象的示範，但接下來要嘗試描述 JSON 這種結構時，就會需要遞迴型別的技巧。

## 複習

### 什麼是遞迴型別？

遞迴型別是一種在自己的定義裡參照自己的型別，用來描述深度不固定、但結構規則保持一致的資料，例如可以無限往下巢狀的陣列。

### TypeScript 如何處理型別別名裡的遞迴定義？

TypeScript 會先看等號右側的型別定義，這個過程類似 JavaScript 運算式的求值順序：右側的值（或運算結果）會先被處理，再指派給左側的名字。型別別名的右側因此可以在定義過程中直接引用自己即將擁有的名字，讓型別能夠自我參照。

### `NestedNumbers` 這個型別具體允許哪些值？

允許一個單純的數字，或是一個裝著 `NestedNumbers`（也就是數字或更深一層巢狀陣列）的陣列，不允許數字以外的型別（例如字串）出現在結構裡的任何一層。

### 過去要寫出遞迴型別，需要用什麼技巧？現在還需要嗎？

過去需要讓 interface 跟型別別名互相參照才能實現遞迴型別。這個限制目前已經解除，單獨使用型別別名就足以定義遞迴型別。

## 小測驗

<details>
<summary>含有遞迴定義的型別別名，處理方式是如何運作的？</summary>
先求出等號右側的定義，跟 JavaScript 運算式的求值方式類似
</details>

<details>
<summary>處理巢狀資料結構時，遞迴型別的一個實際應用場合是什麼？</summary>
定義類似 JSON 這種深度巢狀的資料結構型別
</details>

<details>
<summary>什麼是 TypeScript 中的遞迴型別？</summary>
在自己的定義裡參照自己的型別
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
