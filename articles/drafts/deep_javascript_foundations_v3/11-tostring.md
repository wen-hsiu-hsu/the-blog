---
title: '`toString` 抽象操作：值的字串化規則與角落案例'
description: '介紹 toString 抽象操作的字串化規則，包含負零說謊、陣列省略方括號、null 與 undefined 被靜默省略等角落案例，以及物件預設輸出 [object Object] 的來源與覆寫方式。'
date: 2026-05-31
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 11
chapter: 'Coercion'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - ToString
    - TypeCoercion
---

# `toString` 抽象操作：值的字串化規則與角落案例

> 本文延續[[10-abstract-operations|上一篇]]對抽象操作的介紹。`ToPrimitive` 處理的是「非原始型別如何轉為原始型別」，而 `toString` 則是更具體的下一層：將任意值轉換為字串形式。看起來直觀，但細節裡藏著幾個值得特別記住的異常行為。

## `toString` 的基本行為

`toString` 抽象操作接受任意值，回傳它的字串表示。大多數情況下結果符合直覺：

| 值          | `toString` 結果          |
| ----------- | ------------------------ |
| `null`      | `"null"`                 |
| `undefined` | `"undefined"`            |
| `true`      | `"true"`                 |
| `false`     | `"false"`                |
| `0`         | `"0"`                    |
| `-0`        | `"0"` （角落案例，說謊） |
| `1.23`      | `"1.23"`                 |

負零再次出現說謊的情形：`toString(-0)` 回傳 `"0"`，負號被靜默丟棄。

## 非原始型別呼叫 `toString`

當 `toString` 作用在物件上時，會觸發 `ToPrimitive`（帶 `"string"` 提示），也就是先嘗試 `toString()`，再嘗試 `valueOf()`。

### 陣列的 `toString`：省略括號的奇異設計

陣列有內建的 `toString`，行為是序列化陣列內容，但**省略了方括號**：

```javascript
[].toString(); // ""（空字串，不是 "[]"）
[1, 2, 3].toString(); // "1,2,3"（不是 "[1,2,3]"）
[1, null, 3].toString(); // "1,,3"（null 和 undefined 被直接省略，僅保留逗號位置）
[1, undefined, 3].toString(); // "1,,3"
```

兩個值得注意的設計決策：

**省略括號**：空陣列字串化後得到空字串，無法與其他可字串化為空字串的值做區分。

**null 與 undefined 的省略**：陣列中的 `null` 和 `undefined` 在字串化時不會以 `"null"` 或 `"undefined"` 表示，而是被略去，但逗號位置仍保留。這與直接對 `null` 做 `toString` 得到 `"null"` 的行為形成不一致。

這類邊界行為使陣列的字串化不適合在程式邏輯中依賴，最多只適合在開發者工具的輸出中使用。

### 物件的 `toString`：`[object Object]`

普通物件的預設 `toString` 回傳 `"[object Object]"`：

```javascript
({}).toString(); // "[object Object]"
```

這個格式中，`Object` 是所謂的 **string tag**，代表物件的型別標識。

有趣的是：陣列省略了方括號，物件卻加上了方括號，這兩個設計方向完全相反，很難找到一致的理由。

### 自訂 `toString` 與 string tag

可以用兩種方式覆寫物件的字串表示：

**覆寫 `toString` 方法**：完全自訂回傳的字串內容

```javascript
var obj = {
    toString() {
        return 'X';
    },
};
String(obj); // "X"
```

**覆寫 string tag**（ES6 Symbol）：只修改 `[object ...]` 中間的標識文字

```javascript
var obj = {
    [Symbol.toStringTag]: 'MyCustomType',
};
Object.prototype.toString.call(obj); // "[object MyCustomType]"
```

實務上，在 debug 時覆寫 `toString` 讓物件輸出 `JSON.stringify` 的結果，比看到 `[object Object]` 有意義得多。

## 小結

`toString` 抽象操作在大多數情況下行為直觀，但陣列的兩個特殊行為（省略括號、靜默省略 `null`/`undefined`）與負零的謊言，是三個需要特別記住的角落案例。物件的預設 `[object Object]` 輸出可透過覆寫 `toString` 或 string tag 來自訂，但這屬於元程式設計範疇，日常程式碼中並不常見。

## 複習

### toString 抽象操作的功能是什麼？

接受任意值並回傳該值的字串表示形式。

### 空陣列的預設 toString 行為是什麼？

回傳空字串（""），而非 "[]"。

### 預設的 toString 方法如何處理陣列中的 null 和 undefined？

null 和 undefined 會被省略，不以 "null" 或 "undefined" 表示，但其逗號位置仍會保留。

### 普通物件的預設 toString 輸出是什麼？

回傳 `'[object Object]'`，其中 'Object' 是預設的 string tag。

## 小測驗

<details>
<summary>對含有 null 或 undefined 的陣列呼叫 toString 會發生什麼？</summary>
null 和 undefined 會從字串表示中被省略
</details>

<details>
<summary>普通物件的預設 toString 表示是什麼？</summary>
[object Object]
</details>

<details>
<summary>如何覆寫物件的預設字串表示？</summary>
使用 toString tag Symbol（Symbol.toStringTag）或直接覆寫 toString 方法
</details>

<details>
<summary>toString 抽象操作的功能是什麼？</summary>
將值轉換為其字串表示形式
</details>

<details>
<summary>toString 對負零有什麼特殊行為？</summary>
回傳字串 '0'，負號被靜默省略
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
