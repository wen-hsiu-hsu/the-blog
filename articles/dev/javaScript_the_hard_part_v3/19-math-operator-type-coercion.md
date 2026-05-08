---
title: 加法運算子的例外：型別強制轉換規則與手動控制
description: JavaScript 多數數學運算子都會觸發 ToNumber，但加法運算子（+）只要一側是字串，就會改觸發 ToString 並執行字串串接。本文整理各運算子的強制轉換規則差異，並示範如何用一元加號或 Number() 在 DOM 邊界手動控制型別。
date: 2026-05-08
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 19
chapter: 'Type Coercion & Metaprogramming'
tags:
    - JavaScript
    - TypeCoercion
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# 加法運算子的例外：型別強制轉換規則與手動控制

## 關係運算子也會觸發 ToNumber

JavaScript 的乘法運算子（`*`）遇到字串時，會自動觸發 ToNumber 強制轉換。這個行為同樣適用於**關係運算子（relational operators）**，例如小於符號 `<`。

```javascript
const price = 7;
let quantity; // DOM 傳入 "3"
const max = 10;
let total;

function onSubmit() {
    total = price * quantity;
    if (quantity < max) {
        // "3" < 10 → 3 < 10 → true
        console.log('All good!');
    }
}
```

當 JavaScript 執行 `quantity < max` 時，`quantity` 是字串 `"3"`，`max` 是數字 `10`。JavaScript 同樣觸發 ToNumber 強制轉換，將 `"3"` 轉為數字 `3`，再進行比較，得到 `true`。

## 加法運算子的陷阱：ToString 強制轉換

多數數學運算子行為一致，但**加法運算子（`+`）是重要的例外**。在下面的範例中，加入一個捐款欄位，同樣由 DOM 傳入字串：

```javascript
let quantity; // DOM 傳入 "3"
let donation; // DOM 傳入 "10"
let total;

function onSubmit() {
    total = price * quantity + donation;
    // 7 * "3" + "10"
    // → 21 + "10"
    // → "21" + "10"
    // → "2110"
}
```

執行過程拆解如下：

1. `price * quantity`：乘法觸發 ToNumber，`"3"` 轉為 `3`，得到 `21`（數字）
2. `21 + donation`：此時 `donation` 是字串 `"10"`，加法運算子偵測到其中一側是字串，**轉而觸發 ToString 強制轉換**，將數字 `21` 轉為字串 `"21"`
3. 兩個字串相加，執行字串串接（string concatenation），結果為 `"2110"`，而非預期的數字 `31`

這個行為的設計邏輯是：`+` 同時承擔「數值加法」與「字串串接」兩個角色，而字串串接的優先判斷讓它與其他數學運算子的行為產生分歧。

### 各運算子的強制轉換規則總整理

| 運算子                   | 強制轉換行為                                                                |
| ------------------------ | --------------------------------------------------------------------------- |
| `-`、`*`、`/`、`%`、`**` | 永遠觸發 ToNumber                                                           |
| `<`、`>`、`<=`、`>=`     | 永遠觸發 ToNumber                                                           |
| `+`                      | 兩側皆為數字才做數值加法；只要其中一側是字串，就觸發 ToString，改做字串串接 |

## 手動控制型別強制轉換

由於 `+` 的行為不可預測，在 DOM 邊界（DOM boundary）處理資料時，應主動手動觸發強制轉換，而非依賴運算子隱式觸發。

### 保證轉為數字，有兩種方式：

一元加號運算子（unary `+`）放在值的前方：

```javascript
total = +price * +quantity + +donation;
// → 7 * 3 + 10 = 31
```

或使用內建的 `Number()` 函式：

```javascript
total = Number(price) * Number(quantity) + Number(donation);
```

### 保證轉為字串，同樣有兩種方式：

使用 `String()` 函式，或用模板字面值（template literal）包裹：

```javascript
String(value)`${value}`;
```

透過手動觸發，可以在運算子執行數學前就確保所有值都是正確型別，讓程式行為變得明確可預測，不再依賴運算子在執行任務時「順帶」完成的隱式轉換。

## 複習

### 當 JavaScript 的乘法運算子遇到字串值時，會發生什麼事？

乘法運算子會自動觸發 ToNumber 強制轉換，在執行乘法之前先將字串轉為數字。例如，`"3" * 7` 會將 `"3"` 強制轉換為數字 `3`，最終得到 `21`。

### JavaScript 中的關係運算子（如小於 `<`）如何處理型別強制轉換？

關係運算子在比較值時會觸發 ToNumber 強制轉換。例如，當比較字串 `"3"` 是否小於數字 `10` 時，JavaScript 會先將 `"3"` 強制轉換為數字 `3`，再執行比較。

### 當加法運算子（`+`）的其中一個運算元是字串時，會觸發什麼型別強制轉換？

如果加號運算子任一側是字串，JavaScript 會自動觸發 ToString 強制轉換，而非 ToNumber。這會將兩個運算元都轉為字串，執行字串串接，而非數值加法。

### `21 + "10"` 在 JavaScript 中的結果是什麼？為什麼？

結果是字串 `"2110"`。由於其中一個運算元 `"10"` 是字串，JavaScript 對數字 `21` 執行 ToString 強制轉換，將其轉為字串 `"21"`，再將兩個字串串接起來，而非執行數值加法。

### 大多數數學運算子（減、乘、除、餘數、指數）在型別強制轉換上有什麼共同行為？

大多數數學運算子永遠會執行 ToNumber 強制轉換，在執行運算前先將字串運算元轉為數字。例外是加號運算子，只有在兩側都已經是數字的情況下，才執行正規的數值加法。

## 小測驗

<details>
<summary>在 JavaScript 中對一個以字串表示的數字使用乘法運算子時，會發生什麼事？</summary>
自動觸發 ToNumber 強制轉換
</details>

<details>
<summary>當加法運算子（`+`）的其中一個運算元是字串時，會觸發什麼型別強制轉換？</summary>
觸發 ToString 強制轉換
</details>

<details>
<summary>JavaScript 中哪些運算子永遠會觸發 ToNumber 強制轉換？</summary>
減法、乘法、除法、餘數（modulo）以及指數運算子
</details>

<details>
<summary>`21 + "10"` 在 JavaScript 中的結果是什麼？</summary>
"2110"
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
