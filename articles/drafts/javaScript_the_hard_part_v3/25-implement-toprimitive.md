---
title: Symbol 與手動控制 ToPrimitive 強制轉換
description: 說明為何普通物件無法直接定義 @@toPrimitive 隱藏屬性，以及如何透過 Symbol.toPrimitive 搭配方括號記法手動介入強制轉換流程，實現元程式設計的核心概念。
date: 2026-05-12
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: JavaScript Hard Parts v3
order: 25
chapter: Type Coercion & Metaprogramming
tags:
    - JavaScript
    - TypeCoercion
    - Symbol
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# Symbol 與手動控制 ToPrimitive 強制轉換

## 對普通物件強制轉換的預設結果

上一節的 `Date` 物件能在數學運算中自動轉為毫秒數，是因為 JavaScript 在建立 `Date` 物件時已自動附加了 `@@toPrimitive` 隱藏屬性。然而，對於我們自己建立的普通物件，情況並非如此：

```javascript
const userStored = { name: 'Will', id: 105 };
const userSubmitted = { name: 'Will', id: 105 };

function onSubmit() {
    if (+userStored === +userSubmitted) {
        // NaN === NaN → false
    }
}
```

一元運算子 `+` 觸發 ToPrimitive（hint: number），但普通物件沒有 `@@toPrimitive` 指令，JavaScript 只能回傳預設值 `NaN`。而 `NaN !== NaN`，因為每個 `NaN` 都代表一段無法被解釋為數字的不同資料歷程，視為相等並不合理，這在許多語言中都是如此。因此比較結果為 `false`，無論兩個物件的內容多麼相同。

## 問題：無法直接寫入隱藏屬性

解決方案看起來清楚：定義一個轉換函式，並將它附加到物件的 `@@toPrimitive` 屬性上。

```javascript
function coerce() { return 105 }

// 這樣行不通：
userStored.@@toPrimitive = coerce   // 語法錯誤
userStored["@@toPrimitive"] = coerce  // 只是普通字串屬性，不是隱藏屬性
```

`@@toPrimitive` 不是一般的字串屬性名稱，無法手動拼寫出來。它是一個 JavaScript 引擎內部使用的特殊識別符，在程式碼層面無法直接書寫或存取。

## Symbol：能使用但不能直接書寫的標籤

JavaScript 提供了一個內建物件 `Symbol`，其中以普通字串標籤（如 `toPrimitive`）作為索引，存放著對應的隱藏標籤（`@@toPrimitive`）。透過 `Symbol.toPrimitive`，我們可以**參考**到這個隱藏標籤，再用方括號記法將其設定為物件的屬性：

```javascript
// Symbol 內建物件（示意）：
// Symbol: { toPrimitive: @@toPrimitive, ... }

userStored[Symbol.toPrimitive] = coerce;
userSubmitted[Symbol.toPrimitive] = coerce;
```

`Symbol.toPrimitive` 求值後得到的不是字串 `"toPrimitive"`，而是那個隱藏的 `@@toPrimitive` 標籤本身。透過方括號記法，JavaScript 以這個隱藏標籤作為屬性鍵，將 `coerce` 函式附加到物件上。

若嘗試 `console.log(Symbol.toPrimitive)`，不會看到 `@@toPrimitive`，只會得到一個字串化的描述 `Symbol(Symbol.toPrimitive)`。這個標籤存在、可被參考，但不能直接看到或手寫。

## 執行結果

設定好 `@@toPrimitive` 之後，整個流程如下：

```javascript
function coerce() {
    return 105;
}

userStored[Symbol.toPrimitive] = coerce;
userSubmitted[Symbol.toPrimitive] = coerce;

function onSubmit() {
    if (+userStored === +userSubmitted) {
        // 105 === 105 → true
    }
}
```

一元 `+` 觸發 ToPrimitive，JavaScript 在 `userStored` 與 `userSubmitted` 上各找到 `@@toPrimitive`，執行 `coerce` 函式，兩者都回傳 `105`。嚴格相等 `105 === 105` 回傳 `true`，驗證通過。

這就是**元程式設計（metaprogramming）** 的實際體現：透過 `Symbol.toPrimitive`，開發者得以手動介入 JavaScript 引擎在強制轉換時的內部流程，讓自訂物件在運算子作用下展現自訂的行為。

## 複習

### JavaScript 物件上的 `@@toPrimitive` 屬性有什麼用途？

`@@toPrimitive` 是一個隱藏屬性，其中儲存著一個函式，定義了當物件需要被強制轉換為原始型別（如數字或字串）時應該回傳什麼值。當 JavaScript 嘗試對物件執行強制轉換時，會檢查這個屬性並執行其中的函式，以決定對應的原始型別值。

### 如何在自訂的 JavaScript 物件上新增 `@@toPrimitive` 屬性？

無法直接書寫 `@@toPrimitive` 屬性。必須使用內建的 `Symbol.toPrimitive` 標籤搭配方括號記法：

```javascript
userStored[Symbol.toPrimitive] = coerceFunction;
```

這樣做會存取 `Symbol` 內建物件上儲存的隱藏標籤，並將自訂函式附加到物件的對應隱藏屬性上。

### 執行 `console.log(Symbol.toPrimitive)` 時，會看到什麼？

不會看到實際的隱藏標籤 `@@toPrimitive`，而是得到一個字串化的描述，顯示為 `Symbol(Symbol.toPrimitive)`。這個隱藏標籤無法在 console 中直接看到，但可以被參考與使用。

### 以下程式碼的比較結果為何？請說明原因。

```javascript
function coerce() {
    return 105;
}
userStored[Symbol.toPrimitive] = coerce;
userSubmitted[Symbol.toPrimitive] = coerce;
+userStored === +userSubmitted;
```

比較結果為 `true`。一元運算子（`+`）觸發 ToPrimitive 強制轉換流程。JavaScript 在兩個物件上各找到 `@@toPrimitive` 屬性，執行 `coerce` 函式，兩者皆回傳 `105`，比較式變為 `105 === 105`，結果為 `true`。

## 小測驗

<details>
<summary>在物件上手動新增 `@@toPrimitive` 屬性的正確語法是什麼？</summary>
object[Symbol.toPrimitive] = function
</details>

<details>
<summary>執行 `console.log(Symbol.toPrimitive)` 時會看到什麼？</summary>
字串化的描述，顯示為 Symbol(Symbol.toPrimitive)
</details>

<details>
<summary>在範例中，`coerce` 函式在物件比較時被呼叫，回傳值為何？</summary>
數字 105
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
