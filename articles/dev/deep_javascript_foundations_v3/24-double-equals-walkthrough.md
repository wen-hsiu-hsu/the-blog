---
title: '`==` 演算法逐步走讀：數字與陣列的比較案例'
description: '以 42 == [42] 為反面教材，完整走過 == 演算法的每一步，說明這個意外回傳 true 的結果是多個角落案例疊加的產物。並釐清核心結論：問題不在 == 或 ===，而在於這個比較本身就不合邏輯。'
date: 2026-06-06
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 24
chapter: 'Equality'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - EqualityComparison
    - TypeCoercion
---

# `==` 演算法逐步走讀：數字與陣列的比較案例

> 本文延續對 `==` 演算法的分析。前幾篇建立了演算法的整體結構，這篇用一個具體的「反面教材」案例，完整走過演算法的每一步，並從中釐清一個更重要的問題：`==` 有問題，還是比較本身有問題？

## 案例：數字與含單一元素的陣列

```javascript
var workshop1Count = 42;
var workshop2Count = [42];

if (workshop1Count == workshop2Count) {
    // Yep (hmm...)
}
```

這個比較竟然回傳 `true`，讓我們追蹤演算法的完整執行路徑：

```
// 步驟一：型別不同（Number vs Object），進入演算法
42 == [42]

// 步驟二：y 是 Object，呼叫 ToPrimitive([42])
//         陣列的 ToPrimitive 先呼叫 toString()
//         [42].toString() → "42"（陣列省略括號，前幾篇討論過）
42 == "42"

// 步驟三：x 是 Number，y 是 String
//         演算法偏好數字比較，對字串呼叫 ToNumber
//         ToNumber("42") → 42
42 === 42   // 型別現在相同，執行 ===

// 結果：true
```

## 為什麼這個結果是「意外」的

這個比較之所以回傳 `true`，成立的條件極為脆弱：

- 陣列裡只有一個元素（若有多個，`[42, 1].toString()` 是 `"42,1"`，無法轉為合法數字，結果會是 `NaN`，比較失敗）
- 陣列的 `toString` 剛好省略了括號
- 那個唯一元素剛好是合法數字格式

這不是語言的設計，而是多個角落案例碰巧疊加的產物。用「意外的巧合」來形容最為貼切。

## 最重要的結論：`===` 不是解藥

面對這種意外的比較，常見的反應是「那我換成 `===` 就安全了」。但 Kyle Simpson 的立場非常明確：

**`===` 只是掩蓋了問題，而不是解決問題。**

`===` 在這裡讓比較回傳 `false`，但你的程式碼仍然在比較一個數字和一個陣列。這個比較本身就不合邏輯，選哪個運算子都無法讓它變得合理。

真正的修正方向是：**讓比較本身有意義**——設計你的程式碼，讓進入這個比較的值是可以合理比較的型別。

> 演算法允許物件參與 `==` 比較，是有歷史背景的：在早期 JavaScript 中，開發者可能用 `new String("foo")` 建立一個字串物件，並期望它能與字串原始值做等值比較。`ToPrimitive` 讓物件在必要時降格為原始值，正是為了支援這個使用情境。

## 小結

`42 == [42]` 回傳 `true` 不是 `==` 的問題，而是這個比較根本不應該存在。走過演算法每一步之後，可以清楚看到整個過程：`ToPrimitive` 讓陣列字串化，`ToNumber` 讓字串數值化，最後做嚴格比較——每一步都遵循規則，但整體結果是無意義的巧合。`===` 無法修正這個根本問題，只有讓比較的型別本身合理，才是正確的解法。

## 複習

### 用雙等號（`==`）比較一個數字和一個含有該數字的陣列時，會發生什麼？

陣列被字串化（省略括號），使得 [42] 變成 "42"，接著再被強制轉型為數字進行比較，最終產生一個看似可行但實際上是意外巧合的相等結果。

### JavaScript 相等比較演算法中偏好哪種型別轉換方式？

數值轉換（numerification），也就是將字串轉換為數字，而非將數字轉換為字串。

### 在 JavaScript 中做出無意義的比較，主要問題是什麼？

問題在於比較本身，而非相等運算子（`==` 或 `===`）。關鍵是要確保比較的是相容的型別，讓比較有實際意義。

### 陣列在 ToPrimitive 轉換時會發生什麼？

陣列會將自身字串化，且省略括號，這可能導致意外的強制相等比較結果。

### 遇到型別比較問題時，建議採取什麼方式？

修正比較本身，確保比較的是相容的型別，而非依賴型別強制轉型或改用嚴格相等運算子來掩蓋問題。

## 小測驗

<details>
<summary>用雙等號（==）比較一個數字和一個含有該數字的陣列時，會發生什麼？</summary>
執行型別強制轉型，可能產生意外的相等結果
</details>

<details>
<summary>在雙等號比較數字和陣列的過程中，第一步是什麼？</summary>
將陣列轉換為原始值
</details>

<details>
<summary>陣列在型別強制轉型中的 ToPrimitive 通常會做什麼？</summary>
將陣列字串化
</details>

<details>
<summary>用雙等號比較兩種不同型別時，偏好哪種型別轉換？</summary>
數值轉換
</details>

<details>
<summary>遇到型別比較情境時，建議採取什麼方式？</summary>
做出在邏輯上合理的比較
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
