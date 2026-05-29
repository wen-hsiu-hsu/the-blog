---
title: '`==` 與 Boolean 的角落案例：永遠不要用 `== true` 或 `== false`'
description: '說明為什麼 == true 和 == false 是應該完全避免的模式：透過演算法追蹤，揭示空陣列與 false 意外相等、與 true 意外不相等的原因，並說明讓 if 條件自然觸發 ToBoolean 才是正確做法。'
date: 2026-06-07
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 25
chapter: 'Equality'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - TypeCoercion
    - EqualityComparison
---

# `==` 與 Boolean 的角落案例：永遠不要用 `== true` 或 `== false`

> 本文延續對 `==` 演算法角落案例的討論。[[24-double-equals-walkthrough|上一篇]]以數字與陣列的比較作為反面教材，這篇要聚焦在另一個同樣常見、同樣危險的模式：用 `== true` 或 `== false` 來做真值判斷。

## 直覺與現實的落差

假設我們想要確認 `workshopStudents` 是否是一個陣列，該怎麼做？請看以下範例程式碼：

```javascript
var workshopStudents = [];

if (workshopStudents) {          // Yep（正確，空陣列是 truthy）
if (workshopStudents == true) {  // Nope（反直覺，失敗了）
if (workshopStudents == false) { // Yep（更反直覺，竟然成立了）
```

## 演算法追蹤：為什麼 `== true` 失敗

```javascript
// 起點
[] == true

// 步驟一：y 是 Boolean，演算法第 7 條
// 對 Boolean 值呼叫 ToNumber：ToNumber(true) → 1
[] == 1

// 步驟二：x 是 Object，y 是 Number，演算法第 9 條
// 對陣列呼叫 ToPrimitive：[].toString() → ""
"" == 1

// 步驟三：x 是 String，y 是 Number，演算法第 5 條
// 對字串呼叫 ToNumber：ToNumber("") → 0
0 === 1   // false
```

## 演算法追蹤：為什麼 `== false` 成立

```javascript
// 起點
[] == false

// 步驟一：y 是 Boolean，ToNumber(false) → 0
[] == 0

// 步驟二：ToPrimitive([]) → ""
"" == 0

// 步驟三：ToNumber("") → 0
0 === 0   // true
```

空陣列透過這條轉換鏈最終等於 `0`，而 `false` 也轉為 `0`，所以兩者相等。這是一個無意義構造帶來的無意義結果。

## 核心規則：永遠不要 `== true` 或 `== false`

Kyle Simpson 的立場非常明確：**不存在任何情境，讓 `== true` 或 `== false` 比讓 `ToBoolean` 隱式發生更好**。

```javascript
// 這樣做，讓 if 自然觸發 ToBoolean
if (workshopStudents) { ... }

// 或者這樣，顯式但正確
if (Boolean(workshopStudents)) { ... }

// 絕對不要這樣做
if (workshopStudents == true) { ... }   // 充滿陷阱
if (workshopStudents == false) { ... }  // 同樣危險
```

隱式的 `ToBoolean`（通過 `if` 條件）是單純的查表操作，不觸發 `ToPrimitive`、`ToNumber` 或任何其他抽象操作。而 `== true`/`== false` 卻先觸發 Boolean 轉數字，再觸發一連串的轉型，最終產生反直覺的結果。

這是這門課中少數幾個 Kyle Simpson 認為「隱式絕對比顯式更好」的場景之一。

## 當你需要更精確的型別確認

如果你的情境不只是判斷「是否設定」，而需要確認具體型別，有幾種工具可以選擇：

- `typeof value === "string"`：判斷是否為字串
- `Array.isArray(value)`：判斷是否為陣列
- 鴨子定型（duck typing）：判斷某個方法是否存在
- 先做 truthy 檢查，再做型別確認

選哪種取決於情境：最理想的狀況是把可能的型別限制在最小範圍，讓後續的檢查盡可能簡單。

## 小結

`== true` 和 `== false` 是兩個應該從程式碼中完全消失的模式。演算法的執行路徑（Boolean 轉數字 → 陣列字串化 → 空字串轉 `0`）會把你帶到完全違反直覺的結果。讓 `if` 條件自然觸發 `ToBoolean`，是最簡單、最正確、也最沒有角落案例的做法。

## 複習

### 對陣列使用雙等號（`==`）與 true 比較時，會發生什麼？

對陣列使用雙等號與 true 比較時，陣列意外地變成空字串，再被轉換為數字（0 和 1），而 0 不等於 1，導致令人困惑的比較結果。

### 為什麼應該避免用雙等號與 true 或 false 比較？

沒有任何情境下，用雙等號與 true 或 false 比較會比隱式 Boolean 強制轉型更好，而且這樣做會導致意外且令人困惑的型別轉換與比較結果。

### 判斷陣列或變數是否為 truthy，建議採用什麼方式？

在 if 陳述式中使用隱式 Boolean 強制轉型，讓陣列或變數自然轉換為 Boolean 值，而不是顯式與 true 或 false 做比較。

### 驗證變數型別時，有哪些替代的型別檢查方式？

替代方式包括使用 typeof 運算子、鴨子定型（檢查特定方法是否存在），或使用 Array.isArray() 等工具函式來確認變數型別。

### 對變數型別與存在性的檢查，建議採取什麼方式？

偏好設計具有較小表面積、更少檢查的程式碼，將變數限制在特定的已知型別或狀態，而非使用複雜的型別檢查機制。

## 小測驗

<details>
<summary>判斷陣列是否為 truthy，建議採用什麼方式？</summary>
使用隱式 if 陳述式將陣列轉換為 boolean
</details>

<details>
<summary>用雙等號將陣列與 true 比較時，會發生什麼？</summary>
非原始型別的陣列會先被轉換為空字串
</details>

<details>
<summary>處理陣列的 boolean 判斷，建議採用什麼方式？</summary>
避免使用雙等號與 true 或 false 做比較
</details>

<details>
<summary>處理變數型別時，建議採取什麼方式？</summary>
設計具有較小、更受限表面積的程式碼
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
