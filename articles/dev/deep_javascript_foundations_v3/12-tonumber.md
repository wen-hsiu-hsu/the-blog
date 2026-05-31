---
title: '`ToNumber` 抽象操作：數值轉換的規則與陷阱'
description: '介紹 ToNumber 抽象操作的數值轉換規則：空字串轉 0 的設計缺陷、null 與 undefined 的不一致處理，以及物件與陣列透過 ToPrimitive 先字串化再數值化的轉換連鎖機制。'
date: 2026-05-31
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 12
chapter: 'Coercion'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - TypeCoercion
    - ToNumber
---

# `ToNumber` 抽象操作：數值轉換的規則與陷阱

> 本文延續[[11-tostring|上一篇]]對 `toString` 抽象操作的介紹。在理解了值如何被轉換為字串之後，這篇要看另一個方向：值如何被轉換為數字。`ToNumber` 的行為大部分符合直覺，但有幾個設計決策留下了至今仍在製造 bug 的角落案例。

## 字串的 `ToNumber`

字串轉數字的行為大多合理：

| 字串        | `ToNumber` 結果             |
| ----------- | --------------------------- |
| `""`        | `0` （角落案例，問題根源）  |
| `"0"`       | `0`                         |
| `"-0"`      | `-0`                        |
| `" 009 "`   | `9`（去除前後空白與前導零） |
| `"3.14159"` | `3.14159`                   |
| `"0."`      | `0`                         |
| `".0"`      | `0`                         |
| `"."`       | `NaN`                       |
| `"0xaf"`    | `175`（十六進位）           |

**空字串轉為 `0` 是這裡最值得關注的設計**。空字串代表的是「字串型別中沒有任何值」的狀態，合理的數值對應應該是 `NaN`（無效數字）。然而規格選擇了 `0`，這個決定是後續大量強制轉型問題的根本來源。

## 其他原始型別的 `ToNumber`

| 值          | `ToNumber` 結果 | 說明                       |
| ----------- | --------------- | -------------------------- |
| `false`     | `0`             | 歷史上來自位元的 false = 0 |
| `true`      | `1`             | 歷史上來自位元的 true = 1  |
| `null`      | `0`             | 設計上有爭議，應為 `NaN`   |
| `undefined` | `NaN`           | 終於用了 `NaN`             |

`false`/`true` 對應 `0`/`1` 在歷史脈絡下可以理解，但並非最佳選擇——兩者都應該是 `NaN` 才更具一致性。更明顯的不一致是 `null` 與 `undefined`：兩者都代表「沒有值」，`undefined` 得到 `NaN`，`null` 卻得到 `0`，沒有合理的解釋。

## 非原始型別（物件）的 `ToNumber`

對物件呼叫 `ToNumber` 時，會先觸發 `ToPrimitive`（帶 `"number"` 提示），也就是依序嘗試 `valueOf()` 再嘗試 `toString()`。

然而，陣列與普通物件的預設 `valueOf()` 只是回傳自身（`return this`），這等於回傳了一個非原始型別，演算法因此直接跳過 `valueOf()`，落到 `toString()`。

**結果是：對物件執行 `ToNumber`，實際上等同於先對它執行 `toString`，再把那個字串轉為數字。**

```javascript
// 陣列的 ToNumber 轉換鏈
[""]        // toString --> ""  --> 0
["0"]       // toString --> "0" --> 0
["-0"]      // toString --> "-0" --> -0
[null]      // toString --> ""  --> 0（null 在陣列 toString 中被省略）
[undefined] // toString --> ""  --> 0（undefined 同上）
[1,2,3]     // toString --> "1,2,3" --> NaN（不是合法數字）
[[[[]]]]    // toString --> ""  --> 0（層層展開後得到空字串）

// 普通物件
{}                           // toString --> "[object Object]" --> NaN
{ valueOf() { return 3; } } // valueOf() 回傳原始值 3 --> 3
```

`[null]` 與 `[undefined]` 轉為 `0` 的原因可以追溯到上一篇的結論：陣列的 `toString` 會靜默省略 `null` 和 `undefined`，產生空字串，而空字串轉數字得到 `0`。這條連鎖反應正是「空字串轉 `0`」這個設計缺陷的具體體現。

## 小結

`ToNumber` 的行為可以用一句話概括：**大多數情況合理，但幾個角落案例會在強制轉型中製造意外**。空字串轉 `0`、`null` 轉 `0`、以及物件先字串化再數值化的連鎖機制，是理解後續強制轉型章節的重要前提。

## 複習

### 空字串轉換為數字時會發生什麼？

空字串在轉換為數字時會變成 0。

### boolean 值透過 ToNumber 如何轉換為數字？

false 變成 0，true 變成 1。

### null 轉換為數字時會發生什麼？

null 變成 0。

### undefined 轉換為數字時會發生什麼？

undefined 變成 NaN。

### ToNumber 如何處理陣列的轉換？

陣列會先透過 toString 字串化（省略括號），再對該字串執行 ToNumber。空陣列、含 null 或 undefined 的陣列因字串化結果為空字串，最終得到 0；多元素陣列通常得到 NaN。

## 小測驗

<details>
<summary>使用 ToNumber 將空字串轉換為數字時，結果是什麼？</summary>
變成 0
</details>

<details>
<summary>ToNumber 將 boolean 值 false 轉換為數字時，結果是什麼？</summary>
0
</details>

<details>
<summary>使用 ToNumber 將含有 null 或 undefined 的陣列轉換為數字時，結果是什麼？</summary>
變成 0
</details>

<details>
<summary>對預設物件套用 ToNumber 的結果是什麼？</summary>
變成 NaN
</details>

<details>
<summary>將字串轉換為數字時，前後的空白字元會怎樣處理？</summary>
會被去除
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
