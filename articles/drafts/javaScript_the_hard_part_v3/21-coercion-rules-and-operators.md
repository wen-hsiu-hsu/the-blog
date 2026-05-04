---
title: JavaScript 型別強制轉換三條路徑：ToNumber、ToString、ToBoolean
description: 整理 JavaScript 型別強制轉換的三條核心流程：ToNumber、ToString、ToBoolean，以及各運算子實際觸發的轉換路徑，建立可操作的心智模型。
date: 2026-05-10
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 21
chapter: 'Type Coercion & Metaprogramming'
tags:
    - JavaScript
    - TypeCoercion
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# JavaScript 型別強制轉換三條路徑：ToNumber、ToString、ToBoolean

## 三條強制轉換路徑

JavaScript 的所有自動型別強制轉換，最終都歸屬於三條流程。理解這三條路徑比死記每條規則更重要，具體細節可以查文件。

### ToNumber

將值強制轉換為數字：

| 原始值      | 轉換結果 |
| ----------- | -------- |
| `"3"`       | `3`      |
| `"-3"`      | `-3`     |
| `true`      | `1`      |
| `false`     | `0`      |
| `null`      | `0`      |
| `undefined` | `NaN`    |

`NaN`（Not a Number）值得特別說明：它的型別是 `number`，但不具有任何數值意義。這並非 JavaScript 的奇怪設計，而是來自 ISO 程式語言標準的通用概念，用來表示「這是一個數字型別的位置，但其中的值無法被解釋為有效數字」。

### ToString

將值強制轉換為字串。這條路徑相對直觀，基本上是將值以其在 console 中呈現的外觀包裹成字串：

| 原始值           | 轉換結果             |
| ---------------- | -------------------- |
| `5`              | `"5"`                |
| `-5`             | `"-5"`               |
| `true` / `false` | `"true"` / `"false"` |
| `null`           | `"null"`             |
| `undefined`      | `"undefined"`        |
| `NaN`            | `"NaN"`              |

### ToBoolean

將值強制轉換為 `true` 或 `false`。規則只需記住 **falsy 值**，其餘一律為 `true`：

**falsy 值**（轉換為 `false`）：`0`、`""`（空字串）、`null`、`undefined`、`NaN`

其他所有值皆轉換為 `true`。

### 各運算子與動作觸發的強制轉換對照

| 觸發來源                                 | 強制轉換流程                                         |
| ---------------------------------------- | ---------------------------------------------------- | -------------- | --------- |
| 數學運算子 `*`、`-`、`/`、`%`、`**`      | ToNumber                                             |
| 一元運算子（`+`、`-` 置於值前方）        | ToNumber                                             |
| `+`（加法）                              | ToString（除非兩側都是數字）                         |
| 關係運算子 `<`、`>`、`<=`、`>=`          | 先嘗試 ToNumber，不行則 ToString（Unicode 位置比較） |
| 寬鬆相等 `==`                            | 視情況向任意方向轉換（建議避免）                     |
| 條件判斷（`if`、`                        |                                                      | `、`&&`、`!`） | ToBoolean |
| 模板字面值 `` `${}` `` 與瀏覽器 API 輸入 | ToString                                             |

### 實務原則

這三條流程加上各自的觸發時機，構成了型別強制轉換的完整心智模型。個別邊界規則（如 `null == undefined` 為 `true`）並不需要記憶，在遇到問題時查文件或實驗即可。

真正需要內化的是：**盡量減少依賴運算子隱式觸發強制轉換**。在 DOM 邊界明確使用 `Number()`、一元 `+`、`String()` 或模板字面值，主動聲明型別意圖，讓程式碼行為可預測。

## 複習

### JavaScript 中有哪三條主要的強制轉換流程？

三條主要的強制轉換流程分別是：ToNumber（轉為數字）、ToString（轉為字串）與 ToBoolean（轉為布林值）。每條流程都可以由各種不同的運算子或動作自動觸發。

### `undefined` 轉換為數字時，結果是什麼？

`undefined` 轉換為數字時，結果是 `NaN`（Not a Number）。`NaN` 在 JavaScript 中的型別仍然是 `number`。

### `null` 轉換為數字時，結果是什麼？

`null` 轉換為數字時，結果是 `0`。

### 哪些值在轉換為布林值時會變成 `false`？

轉換為 `false` 的值（falsy 值）有：`null`、`undefined`、`NaN`、`0`，以及空字串 `""`。

### JavaScript 中，一元運算子（unary operator）會觸發哪種強制轉換？

一元運算子（`+` 或 `-` 置於值前方）會觸發 ToNumber 強制轉換。

## 小測驗

<details>
<summary>JavaScript 中有哪三條主要的強制轉換流程？</summary>
ToNumber（轉為數字）、ToString（轉為字串）、ToBoolean（轉為布林值）
</details>

<details>
<summary>`null` 轉換為數字時，結果是什麼？</summary>
0
</details>

<details>
<summary>哪些值在轉換為布林值時會變成 false？</summary>
null、undefined、NaN、0，以及空字串
</details>

<details>
<summary>JavaScript 中的 NaN（Not a Number）是什麼？</summary>
型別為 number 的一個值
</details>

<details>
<summary>JavaScript 中，一元加號運算子的作用是什麼？</summary>
將值強制轉換為數字（ToNumber）
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
