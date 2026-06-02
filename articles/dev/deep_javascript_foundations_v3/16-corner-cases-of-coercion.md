---
title: '強制轉型的角落案例：所有問題的根源'
description: '整理 JavaScript 強制轉型中最常見的角落案例，追溯大多數 ToNumber 意外行為的共同根源——空字串轉為 0 的設計決策，並說明 boolean 轉數字在鏈式比較運算子中製造的表面正確但實際錯誤的問題。'
date: 2026-06-02
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 16
chapter: 'Coercion'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - TypeCoercion
    - NaN
---

# 強制轉型的角落案例：所有問題的根源

> 本文延續對強制轉型的討論。前幾篇建立了各抽象操作的基礎，這篇要聚焦在最容易產生 bug 的角落案例，並追溯它們共同的根源。

## 所有語言都有角落案例

JavaScript 的強制轉型常被拿來製作「JavaScript 很糟糕」的影片，但這是選擇性視角，C++、Python 等語言同樣有型別轉換的角落案例。每一個需要處理型別轉換的系統都必然存在邊界情況，JavaScript 並不特殊，只是這些案例更常被拿出來討論。

## 角落案例總覽

```javascript
Number(''); // 0      OOPS！
Number('  \t\n'); // 0      OOPS！
Number(null); // 0      OOPS！
Number(undefined); // NaN
Number([]); // 0      OOPS！
Number([1, 2, 3]); // NaN
Number([null]); // 0      OOPS！
Number([undefined]); // 0      OOPS！
Number({}); // NaN

String(-0); // "0"    OOPS！
String(null); // "null"
String(undefined); // "undefined"
String([null]); // ""     OOPS！
String([undefined]); // ""     OOPS！

Boolean(new Boolean(false)); // true   OOPS！
```

觀察這份清單，你會發現標有 OOPS 的案例幾乎都指向同一個根源。

## 萬惡根源：空字串轉為 `0`

`ToNumber` 在轉換字串前，會先去除前後所有的空白字元（包括空格、`\t`、`\n` 等），才對剩餘內容做數值轉換。這意味著：

```javascript
// 使用者在表單中沒有輸入任何內容
studentsInput.value = '';
Number(studentsInput.value); // 0   OOPS！

// 使用者只輸入了空白
studentsInput.value = '   \t\n';
Number(studentsInput.value); // 0   OOPS！
```

空字串代表「字串型別中不存在任何值」，理應轉換為 `NaN`。然而規格選擇了 `0`，這個單一決策造成了上方清單中大多數的 OOPS：`[null]`、`[undefined]`、`[]` 都是因為先被 `toString` 轉成空字串，再被 `ToNumber` 轉成 `0`。

## Boolean 物件包裝的陷阱

```javascript
Boolean(new Boolean(false)); // true   OOPS！
```

`new Boolean(false)` 建立的是一個物件（boolean 物件的包裝），而物件不在 falsy 清單上，`ToBoolean` 不做任何轉換，直接回傳 `true`。這再次印證了前面的警告：永遠不要用 `new` 搭配 `String`、`Number`、`Boolean`。

## Boolean 轉數字導致的比較陷阱

`true` 轉數字得到 `1`，`false` 得到 `0`。這個設計在鏈式比較運算子中會製造表面正確但實際上是意外的結果：

```javascript
1 < 2 < 3; // true（看起來對，但原因是意外）
```

實際執行步驟：

```javascript
1 < 2 < 3;
// true < 3
// 1 < 3      （true 被轉為 1）
// true        （僥倖正確）
```

換個方向，意外就暴露了：

```javascript
3 > 2 > 1; // false   OOPS！
```

執行步驟：

```javascript
3 > 2 > 1;
// true > 1
// 1 > 1      （true 被轉為 1）
// false
```

`1 < 2 < 3` 回傳 `true` 不是因為 JavaScript 理解數學上的連鎖不等式，而是一個純粹的意外。程式建立在意外巧合上，不是好的基礎。

## 小結

JavaScript 強制轉型的角落案例大多可以追溯到「空字串轉為 `0`」這個原始設計決策。理解這條連鎖路徑，空白字串被去除後變空字串，空字串變 `0`，就能解釋大部分令人困惑的 `ToNumber` 行為。而 boolean 轉數字的問題則在鏈式比較中製造了表面正確但實際錯誤的邏輯，是另一個需要格外小心的陷阱。

## 複習

### 空字串或只有空白字元的字串在 JavaScript 中被轉換為數字時，會發生什麼？

結果為 0。ToNumber 操作會先去除前後的空白字元，因此所有空白字串最終都會產生 0。

### 在 JavaScript 中使用鏈式比較運算子時，有什麼出乎意料的行為？

在 `1 < 2 < 3` 這樣的表達式中，結果為 true，但並非出於數學邏輯，而是因為 `1 < 2` 先被求值為 true（再轉為 1），然後 1 與 3 比較才得到 true。這是一個意外巧合，而非預期行為。

### 用原始值 `false` 建構 Boolean 物件時，會發生什麼？

用 `new Boolean(false)` 建構的 Boolean 物件會表現為 truthy，因為 JavaScript 不會對物件執行原始值轉換，而是直接檢查它是否在 falsy 清單上——而物件不在清單上，所以是 truthy。

### JavaScript 中與型別轉換相關的角落案例有哪些？

最常見的角落案例涉及數字轉換，例如空字串、空白字串、null、undefined 轉為數字，以及 boolean 值被意外強制轉換為數字等情境。

### JavaScript 中比較運算子行為出乎意料的例子是什麼？

在表達式 `3 > 2 > 1` 中，結果為 false。因為 `3 > 2` 先被求值為 true，接著 `true > 1` 等同於 `1 > 1`，結果為 false。

## 小測驗

<details>
<summary>空字串在 JavaScript 中被轉換為數字時，結果是什麼？</summary>
變成 0
</details>

<details>
<summary>JavaScript 中表達式 `1 < 2 < 3` 的結果是什麼？</summary>
因型別強制轉型而回傳 true
</details>

<details>
<summary>用原始值 `false` 建構 Boolean 物件時，會有什麼行為？</summary>
它會表現為 truthy
</details>

<details>
<summary>JavaScript 在將空白字串轉換為數字時，如何處理？</summary>
去除空白後轉換為 0
</details>

<details>
<summary>boolean 隱式強制轉換為數字在 JavaScript 中有什麼問題？</summary>
可能在比較運算中產生出乎意料的結果
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
