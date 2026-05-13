---
title: 'ToPrimitive 強制轉換與 `@@toPrimitive` 隱藏屬性'
description: 介紹 JavaScript 第四條強制轉換流程 ToPrimitive：當運算元為物件時如何透過 @@toPrimitive 隱藏屬性取得原始型別值，以及 hint 機制如何決定轉換目標，並以 Date 物件相減為核心範例說明。
date: 2026-05-12
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: JavaScript Hard Parts v3
order: 24
chapter: Type Coercion & Metaprogramming
tags:
    - JavaScript
    - TypeCoercion
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# ToPrimitive 強制轉換與 `@@toPrimitive` 隱藏屬性

## 對物件做數學運算？

[[23-date-objects|上一節]] 留下了一個懸而未解的問題：兩個 `Date` 物件都儲存在 Heap，只能透過參考存取，如何對它們做減法？

```javascript
const time1 = new Date(); // Jan 15 2027 00:00:00，[[DateValue]] = 1,800,000,000,000 ms
// 1 秒後
const time2 = new Date(); // Jan 15 2027 00:00:01，[[DateValue]] = 1,800,000,001,000 ms

if (time2 - time1 < 2000) {
    console.log('Accident?'); // 太快重複送出
}
```

直覺上這不可能成立，因為 `time2` 和 `time1` 都是物件，`-` 運算子對兩個記憶體位址做減法毫無意義。然而，這段程式碼確實能正確執行，並輸出 `"Accident?"`。背後的機制是第四種強制轉換流程：**ToPrimitive**。

## ToPrimitive 強制轉換

當數學運算子（如 `-`）的運算元是物件時，JavaScript 不會嘗試比較或計算它們的記憶體位址，而是觸發 **ToPrimitive 強制轉換**，嘗試將物件轉換為原始型別。

在數學運算的脈絡下，ToPrimitive 帶著「number」這個提示（hint）執行，即要求物件轉換為數字。轉換結果取決於物件本身是否有對應的轉換指令。

## `@@toPrimitive`：隱藏的轉換指令

JavaScript 在物件上尋找一個名為 `@@toPrimitive` 的隱藏屬性，其中儲存著「如何將這個物件轉換為原始型別」的函式邏輯。

`Date` 函式在建立物件時，會自動將 `@@toPrimitive` 隱藏屬性附加到回傳的物件上。這個屬性內的函式邏輯是：當被要求轉換為數字時，取出隱藏的 `[[DateValue]]`（自 Unix Epoch 起的毫秒數）並回傳。

執行過程如下：

```javascript
time2 - time1
  ↓ ToPrimitive（hint: number）
  ↓ 執行 time2 的 @@toPrimitive → 回傳 1,800,000,001,000
  ↓ 執行 time1 的 @@toPrimitive → 回傳 1,800,000,000,000
  ↓ 1,800,000,001,000 - 1,800,000,000,000 = 1,000
1,000 < 2000  →  true  →  "Accident?"
```

不只成功執行，還精準地取出了原本無法直接存取的隱藏屬性 `[[DateValue]]`，這是 ToPrimitive 機制帶來的額外能力。

## hint 決定轉換目標型別

ToPrimitive 在執行時會收到一個 hint 參數，告知應轉換為哪種原始型別：

- 數學運算子（`-`、`*` 等）傳入 hint `"number"`，物件轉換為數字
- 字串相關操作傳入 hint `"string"`，物件轉換為字串

`@@toPrimitive` 函式內部可以根據這個 hint 撰寫條件邏輯，決定回傳數字還是字串。

## `@@toPrimitive` 不是普通屬性

`@@toPrimitive` 是由 JavaScript 在 2015 年（ES6）才加入的特性，在此之前並非所有物件都有它。它不是一個普通的字串鍵屬性，無法透過 `obj.toPrimitive` 或 `obj["@@toPrimitive"]` 存取或設定。

這也引出了下一個問題：如果想在**自訂物件**上也定義 `@@toPrimitive` 的行為，應該如何做？由於它不是一般字串屬性名稱，就需要一種能夠表達「特殊、不會與一般屬性名稱衝突」的鍵值機制，而這正是 **Symbol** 存在的原因。

## 複習

### 當嘗試對兩個 Date 物件做減法時，ToPrimitive 強制轉換機制會做什麼？

ToPrimitive 會自動將兩個 Date 物件強制轉換為原始型別，具體而言是數字。對 Date 物件來說，轉換結果是其隱藏屬性 `[[DateValue]]` 的值，即自 Unix Epoch 起所經過的毫秒數，從而讓數學運算得以執行。

### `@@toPrimitive` 屬性是什麼？它如何讓物件的強制轉換成為可能？

`@@toPrimitive` 是一個隱藏屬性，其中儲存著說明如何將物件轉換為原始型別的函式邏輯。當對物件執行數學運算時，JavaScript 會自動尋找這個屬性並執行它，根據運算的性質將物件強制轉換為數字或字串。

### 若 `time1` 代表 2027 年 1 月 15 日午夜，`time2` 代表 1 秒後，以下程式碼的執行結果為何？

```javascript
if (time2 - time1 < 2000) {
    console.log('accident');
}
```

程式會在 console 輸出 `'accident'`。兩個 Date 物件被強制轉換為各自的毫秒時間戳記，差值為 1000 毫秒（1 秒），小於 2000 毫秒，條件成立。

### ToPrimitive 如何決定要將物件轉換為字串還是數字？

由所使用的運算子決定。數學運算子會傳入 hint `"number"`，觸發物件轉換為數字；其他情境則可能傳入 hint `"string"`，觸發轉換為字串。這個 hint 會作為引數傳入 ToPrimitive 函式。

### 當對兩個具有 `@@toPrimitive` 屬性的物件執行數學運算時，會發生什麼事？

JavaScript 觸發 ToPrimitive 強制轉換流程，對兩個物件分別執行 `@@toPrimitive` 函式，回傳原始型別的值（在數學運算下通常為數字），再對這些值進行運算。物件本身不會透過記憶體位址進行比較，而是透過強制轉換後的原始型別值進行運算。

## 小測驗

<details>
<summary>在 JavaScript 中對兩個 Date 物件做減法時，會發生什麼事？</summary>
JavaScript 透過 ToPrimitive 自動將它們強制轉換為數字
</details>

<details>
<summary>Date 物件上 `@@toPrimitive` 屬性的作用是什麼？</summary>
提供將物件轉換為原始型別的指令（函式邏輯）
</details>

<details>
<summary>在 `time2 - time1` 這個表達式中，是什麼觸發了 ToPrimitive 強制轉換？</summary>
減法運算子對物件執行數學運算
</details>

<details>
<summary>ToPrimitive 如何決定要轉換為字串還是數字？</summary>
由對物件所使用的運算子決定
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
