---
title: ToBoolean 強制轉換、寬鬆相等與嚴格相等
description: 介紹 JavaScript 第三種原始型別強制轉換 ToBoolean，說明 falsy 值的判斷邏輯，並透過捐款欄位範例，解析為何寬鬆相等（==）會因觸發 ToNumber 導致非預期結果，以及嚴格相等（===）如何避免這個問題。
date: 2026-05-09
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 20
chapter: 'Type Coercion & Metaprogramming'
tags:
    - JavaScript
    - TypeCoercion
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# ToBoolean 強制轉換、寬鬆相等與嚴格相等

## ToBoolean：第三種強制轉換

除了 ToNumber 與 ToString 之外，JavaScript 還有第三種原始型別強制轉換：**ToBoolean**。當一個值出現在條件判斷式（`if`）的位置時，JavaScript 會自動將該值強制轉換為布林值 `true` 或 `false`。

以驗證使用者是否填入有效數量為例：

```javascript
function onSubmit() {
    if (quantity) {
        // 繼續處理
    } else {
        console.log('請填入數量');
    }
}
```

`quantity` 可能來自 DOM，值為空字串 `""` 或數字 `0`（使用者未輸入或故意填零）。這兩個值在 ToBoolean 轉換下都會變成 `false`，因此可以用單一條件判斷式同時攔截這兩種無效情況，而不必分別比對。

**常見的 falsy 值**（會被 ToBoolean 轉換為 `false`）：`0`、`""`（空字串）、`null`、`undefined`、`NaN`、`false` 本身。

## 寬鬆相等（`==`）也會觸發強制轉換

ToBoolean 一刀切的行為有時並不適用。以捐款欄位（`donation`）為例：

- 使用者**主動填入 `0`**：代表不捐款，是合法的提交，應顯示「$0 捐款，沒問題」
- 使用者**尚未填入任何值**：欄位為空字串 `""`，應提示「要捐款嗎？」

若直接用 ToBoolean，`0` 和 `""` 都變成 `false`，無法區分兩者。

看起來用 `==` 比對是否為 `0` 應該能解決問題：

```javascript
if (donation == 0) {
    // 0 → 0，"" → 0
    console.log('0 donation, no problem');
} else {
    console.log('Want to donate?');
}
```

但這裡遇到了一個陷阱：**寬鬆相等（`==`）在比較前同樣會觸發型別強制轉換**。當其中一側是數字 `0` 時，JavaScript 對另一側觸發 ToNumber，空字串 `""` 被轉為數字 `0`，於是 `"" == 0` 的結果為 `true`。

這表示無論 `donation` 是 `0` 還是 `""`，都會進入「0 donation, no problem」的分支，永遠無法到達「Want to donate?」這條路。

## 嚴格相等（`===`）：不觸發任何強制轉換

JavaScript 提供了**嚴格相等運算子（`===`，triple equals）**來解決這個問題。它在比較時**不執行任何強制轉換**，直接比對值與型別：

```javascript
if (donation === 0) {
    // 不觸發強制轉換
    console.log('0 donation, no problem');
} else {
    console.log('Want to donate?');
}
```

在這個版本下：

- `donation` 為數字 `0`：`0 === 0` → `true`，進入「no problem」分支
- `donation` 為空字串 `""`：`"" === 0` → `false`（型別不同），進入「Want to donate?」分支

兩種情況終於可以被正確區分。

## 三種強制轉換與運算子總整理

| 強制轉換  | 觸發時機                                                  |
| --------- | --------------------------------------------------------- |
| ToNumber  | `*`、`-`、`/`、`%`、`**`、`<`、`>` 等，以及 `==` 某些情況 |
| ToString  | `+` 其中一側為字串時                                      |
| ToBoolean | 值出現在條件判斷位置（`if`、`while` 等）                  |

| 運算子            | 行為                                   |
| ----------------- | -------------------------------------- |
| `==`（寬鬆相等）  | 比較前觸發強制轉換，可能產生非預期結果 |
| `===`（嚴格相等） | 不觸發任何強制轉換，直接比對值與型別   |

在日常開發中，應優先使用 `===`，只有在完全清楚強制轉換規則且確有需要時，才考慮使用 `==`。

## 複習

### 在 JavaScript 中驗證數量欄位的使用者輸入時，哪兩個值最容易造成問題？

空字串和數字 `0` 最容易造成問題。空字串出現在使用者尚未輸入任何內容時，而 `0` 則可能出現在使用者明確填入零的情況下。根據不同的業務邏輯，這兩種情況都可能需要攔截，阻止提交。

### 當條件判斷式中出現 `0` 或空字串時，JavaScript 會如何處理？

JavaScript 會套用布林強制轉換（ToBoolean）。`0` 和空字串都會被轉換為 `false`，因此條件判斷式不會執行，程式會跳過 `if` 區塊，進入 `else` 或下一條陳述式。

### 在驗證捐款欄位時，為什麼需要區分 `0` 和空字串？

`0` 可能代表使用者刻意選擇不捐款（這是可接受的提交），而空字串則代表使用者尚未填寫欄位（此時應提示使用者做出決定）。

### JavaScript 中雙等號（`==`）與三等號（`===`）的差異是什麼？

雙等號（`==`，寬鬆相等）在比較前會進行型別強制轉換，將兩側的值轉換成相同型別再比較。三等號（`===`，嚴格相等）則完全不進行任何強制轉換，直接比對值與型別。

## 小測驗

<details>
<summary>在布林脈絡下，空字串在 JavaScript 中會被如何求值？</summary>
被強制轉換為 false
</details>

<details>
<summary>寬鬆相等運算子（==）比較 0 和空字串時，結果為何？</summary>
兩者被視為相等，因為空字串會被強制轉換為 0
</details>

<details>
<summary>為什麼應該優先使用嚴格相等運算子（===）而非寬鬆相等（==）？</summary>
因為它在比較時不會觸發型別強制轉換
</details>

<details>
<summary>條件判斷式接收到數字 0 時，JavaScript 會如何求值？</summary>
被強制轉換為 false
</details>

<details>
<summary>`0 === ""` 的結果是什麼？</summary>
false
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
