---
title: '函式宣告 vs 函式表達式：識別字屬於哪個範疇'
description: '說明函式宣告與函式表達式的關鍵差異：兩者的識別字歸屬範疇不同。函式宣告的識別字屬於外層封閉範疇，函式表達式的識別字屬於函式自身範疇且是唯讀的。以及判斷兩者的唯一標準。'
date: 2026-06-14
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 39
chapter: 'Scope & Function Expressions'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - Scope
  - FunctionExpression
---

# 函式宣告 vs 函式表達式：識別字屬於哪個範疇

> 本文延續範疇的討論。前幾篇建立了「函式宣告的識別字屬於外層封閉範疇」的基礎，這篇要看一個重要的對比：當函式以表達式的形式出現時，識別字的歸屬規則會有什麼不同。

## 函式宣告（Function Declaration）

```javascript
function teacher() { /* .. */ }
```

判斷方式：`function` 關鍵字是整個陳述式的**第一個詞**。

識別字 `teacher` 是一顆**紅色彈珠**，屬於外層封閉範疇（此處為全域範疇）。這是我們前幾篇一直在討論的行為。

## 函式表達式（Function Expression）

```javascript
var myTeacher = function anotherTeacher() {
    console.log(anotherTeacher);
};
```

判斷方式：`function` 關鍵字**不是**陳述式的第一個詞——前面有 `var myTeacher =`，這讓它成為一個表達式。

這裡有兩個識別字，歸屬規則完全不同：

- `myTeacher`：紅色彈珠，屬於全域範疇（因為 `var myTeacher` 是正式宣告）
- `anotherTeacher`：藍色彈珠，屬於**函式本身的範疇**（不是外層）

## 命名函式表達式的識別字有兩個特性

**只存在於自身範疇：** 無法從外部存取，試圖存取會拋出 ReferenceError。

**唯讀（read-only）：** 在函式內部也無法對 `anotherTeacher` 重新賦值，它是一個固定的參考，指向函式本身。

## 匿名函式表達式 vs 命名函式表達式

```javascript
// 匿名函式表達式（更常見）
var myTeacher = function() { /* .. */ };

// 命名函式表達式（Kyle Simpson 強烈推薦）
var myTeacher = function myTeacher() { /* .. */ };
```

匿名函式表達式在現代程式碼中極為普遍，但 Kyle Simpson 的立場非常明確：**無論任何情況，都應該優先使用命名函式表達式。** 這個建議的理由會在後續章節詳細展開。

## 小結

函式宣告的識別字屬於外層封閉範疇；函式表達式的識別字（若有命名）屬於函式自身的範疇，且是唯讀的。判斷一個函式是宣告還是表達式的標準只有一個：`function` 關鍵字是否是陳述式的第一個詞。

## 複習

### 函式宣告和函式表達式在彈珠顏色和範疇方面有什麼關鍵差異？

在函式宣告中，識別字以紅色彈珠的形式加入外層封閉範疇。在函式表達式中，識別字以藍色彈珠的形式加入其自身的範疇，且是唯讀的，無法從外部範疇存取。

### 什麼決定了一個函式是函式表達式？

如果 `function` 關鍵字不是陳述式的第一個詞，這個函式就被視為表達式。若函式被賦值給變數、跟在運算子後面，或被括號包住，它就是函式表達式。

### 匿名函式表達式和命名函式表達式有什麼差異？

匿名函式表達式沒有名稱，而命名函式表達式被給予了一個具體的名稱。儘管較不常見，命名函式表達式因為更清楚且易於除錯而被推薦使用。

### 當試圖在函式表達式的識別字所在範疇外部存取它時，會發生什麼？

在範疇外部嘗試存取函式表達式的識別字時，會拋出 ReferenceError，因為該識別字只存在於它被定義的範疇內。

### 命名函式表達式的識別字有哪兩個關鍵特性？

它以彈珠的形式加入函式自身的範疇（而非外層封閉範疇），且是唯讀的，無法被重新賦值。

## 小測驗

<details>
<summary>函式宣告和函式表達式的關鍵差異是什麼？</summary>
函式宣告將其識別字作為紅色彈珠加入外層封閉範疇
</details>

<details>
<summary>在命名函式表達式中，函式的識別字被加入到哪裡？</summary>
函式的識別字被加入到其自身的藍色範疇中
</details>

<details>
<summary>什麼使一個函式成為表達式而非宣告？</summary>
`function` 關鍵字不是陳述式的第一個詞
</details>

<details>
<summary>命名函式表達式有什麼獨特的特性？</summary>
命名函式表達式中的識別字是唯讀的
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記