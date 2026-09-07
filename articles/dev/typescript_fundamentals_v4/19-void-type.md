---
title: 'TypeScript void 型別：為什麼回呼參數要用 void 而不是 undefined'
description: '用 push 方法實際回傳 number、卻能傳入型別是 void 的回呼參數為例，示範 () => undefined 為何報錯、() => void 卻能通過，說明 void 允許兩個值、跟只有一個成員的 unit type 不同，並釐清 void 當函式回傳型別與當回呼參數型別的語意差異。'
date: 2026-09-07
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 19
chapter: 'Type Queries, Callables & Constructables'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - VoidType
    - UnitType
    - LiteralTypes
---

# TypeScript void 型別：為什麼回呼參數要用 void 而不是 undefined

> [[18-callables|前面]] 用 call signature 描述了一個函式該接受什麼參數、回傳什麼型別。這一節專注在其中一種特殊的回傳型別：`void`。

## void 代表「請忽略這個回傳值」

一個回傳型別標註為 `void` 的函式：

```ts
function printFormattedJSON(obj: string[]) {
    console.log(JSON.stringify(obj, null, '  '));
}

const x = printFormattedJSON(['hello', 'world']);
// x 的型別：void
```

`void` 的意思是「這個函式的回傳值，意圖上就是要被忽略的」。JavaScript 語言本身也有 `void` 這個關鍵字，用在運算式前面代表「忽略這個運算式的求值結果」，概念上跟這裡的 `void` 型別是相通的：它明確傳達了「不要指望能從這裡拿到什麼有用的東西」的意圖。

## void 不是 unit type，它允許兩個值：void 本身跟 undefined

`void` 這個型別有一個特別之處：它不像 `null`、字面值型別那樣只允許單一個值（這種只有一個成員的型別稱為 unit type）。`void` 型別實際上允許兩個值：`void` 本身，以及 `undefined`。反過來說，如果一個型別標註成 `undefined`，就只能接受 `undefined` 這一個值，不能接受別的。

為什麼 `void` 要額外允許 `undefined`？因為一個函式如果沒有寫任何 `return` 陳述式，執行到結尾時實際上就是回傳了 `undefined`。要讓 `void` 這個型別能正確涵蓋「函式什麼都沒回傳」這種最常見的情況，它就必須把 `undefined` 也算進允許的範圍裡，否則絕大多數沒有明確 `return` 值的函式都會沒辦法通過 `void` 這個型別的檢查。

## 一個實際的對照：push 回傳的 number 為什麼能通過 void，卻通不過 undefined

用兩個幾乎一模一樣的函式來看這個差異：

```ts
function invokeInFourSeconds(callback: () => undefined) {
    setTimeout(callback, 4000);
}

function invokeInFiveSeconds(callback: () => void) {
    setTimeout(callback, 5000);
}

const values: number[] = [];
invokeInFourSeconds(() => values.push(4)); // 錯誤
invokeInFiveSeconds(() => values.push(4)); // 正確
```

`values.push(4)` 實際上會回傳一個 `number`（陣列推入元素後的新長度），這件事很容易被忽略。傳進 `invokeInFourSeconds` 時，它要求 callback 的回傳型別必須是 `undefined`，但 `push` 回傳的明明是一個 `number`，不是 `undefined` 這個特定值，於是型別檢查失敗。換成 `invokeInFiveSeconds`，它要求的回傳型別是 `void`，語意是「我不在乎你回傳什麼」，這時候不論 callback 實際回傳了什麼型別的值都能通過，因為呼叫端根本無意使用這個回傳值。

## 不要拿 void 定義變數

`void` 這個型別的意義幾乎只在「函式回傳值」這個語境下才有用，不建議拿它來宣告變數。它存在的目的正是要在「傳入一個帶有回傳值的函式當作 callback」跟「明確約束呼叫端不能使用這個回傳值」之間，提供一個有意義的限制：如果 callback 參數的型別標註成 `void`，即使實際傳進去的函式回傳了某個值，在使用這個 callback 的函式內部，也沒辦法真的把這個回傳值拿出來用，型別系統會直接擋下來，這正是希望達到的效果，避免呼叫端誤以為可以依賴這個回傳值。

## void 用在函式宣告的回傳型別，跟用在回呼參數的回傳型別，語意有微妙差異

`void` 在兩種情境下用法看起來很像，但語意上有一個細微卻值得留意的差異：

- 當 `void` 是一個**函式宣告本身**的回傳型別時，代表這個函式承諾不回傳任何有意義的東西，最多也就是回傳 `undefined`（例如完全沒有寫 `return`、只寫 `return;`，或是函式整個只是在做副作用）。
- 當 `void` 是**傳入的 callback 參數**的回傳型別時，代表這個 callback 本身可以自由回傳任何型別的值，但接收這個 callback 的函式，不會、也不能去使用這個回傳值。

兩者傳達的核心精神其實一致：都是在說「不要指望這裡有什麼有意義的回傳值可用」，只是套用的對象不同，一個限制的是函式自身的實作承諾，另一個限制的是呼叫端能不能消費傳進來的回傳值。

## 複習

### void 型別代表什麼意思？

`void` 代表這個函式的回傳值意圖上應該被忽略，不管實際上有沒有回傳值，呼叫端都不該依賴它。

### void 型別允許哪些值？這跟 unit type 有什麼不同？

`void` 允許兩個值：`void` 本身，以及 `undefined`。這跟只允許單一個值的 unit type（例如某個字面值型別）不同，`void` 不是 unit type，因為它涵蓋的集合裡有兩個成員。

### 為什麼 void 型別必須允許 undefined？

因為一個函式如果沒有明確寫 `return` 陳述式，執行到結尾時實際上就是回傳 `undefined`。如果 `void` 不允許 `undefined`，絕大多數沒有明確回傳值的函式都會無法通過型別檢查。

### 為什麼 Array.prototype.push 可以被當成回傳型別是 void 的 callback，卻不能當成回傳型別是 undefined 的 callback？

`push` 實際回傳的是一個 `number`（陣列的新長度），不是 `undefined` 這個特定值，所以無法滿足要求回傳 `undefined` 的型別；但 `void` 語意上代表「回傳值會被忽略」，允許 callback 回傳任何型別的值，因此 `push` 可以順利通過型別是 `void` 的參數要求。

## 小測驗

<details>
<summary>把 void 用在函式回呼（callback）的情境下，代表什麼意思？</summary>
忽略這個回呼的回傳值
</details>

<details>
<summary>為什麼 void 型別需要允許 undefined？</summary>
因為函式沒有明確 return 陳述式時，實際上就是回傳 undefined
</details>

<details>
<summary>當一個函式參數的型別標註為 void 時，在函式內部嘗試使用這個回呼的回傳值會發生什麼事？</summary>
型別系統會阻止這麼做
</details>

<details>
<summary>TypeScript 的 void 型別允許哪兩個值？</summary>
void 本身，以及 undefined
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
