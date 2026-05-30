---
title: '基本物件：JavaScript 的內建建構函式'
description: '介紹 ECMAScript 規格書中的 Fundamental Objects（基本物件）：哪些應搭配 new 建構（Date、RegExp、Error 等）、哪些絕對不該用 new（String、Number、Boolean），以及後者作為強制轉型函式的正確用途。'
date: 2026-05-30
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 9
chapter: 'Types'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - TypeCoercion
---

# 基本物件：JavaScript 的內建建構函式

> 本文是第一支柱「型別與強制轉型」的收尾章節。前幾篇聚焦在原始型別與特殊值，這裡要介紹另一類存在於語言中的工具：基本物件（Fundamental Objects）。它們不是原始型別，而是語言提供的內建建構函式，部分有合理的使用場景，部分則應刻意迴避。

## 名稱的演變

這類工具在不同年代有不同的稱呼：

- 舊稱：Built-In Objects（內建物件）、Native Functions（原生函式）
- 現稱：**Fundamental Objects（基本物件）**，這是目前 ECMAScript 規格書採用的術語

理解這個術語對閱讀規格書有直接幫助。

## 可搭配 `new` 建構的基本物件

以下這些基本物件在需要時應搭配 `new` 關鍵字使用：

- `Object()`
- `Array()`
- `Function()`
- `Date()`
- `RegExp()`
- `Error()`

其中最常實際用到的是 `new Date()`，原因是 JavaScript 沒有日期字面量（date literal），想建立一個日期物件，`new Date()` 是唯一的方式：

```javascript
var yesterday = new Date('March 6, 2019');
yesterday.toUTCString();
// "Wed, 06 Mar 2019 06:00:00 GMT"
```

## 絕對不應該用 `new` 的三個基本物件

`String()`、`Number()`、`Boolean()` 雖然技術上可以搭配 `new` 使用，但這樣做會建立出物件形式的字串、數字、布林值，而非原始型別的值，這幾乎在任何情況下都是錯誤的選擇。

```javascript
// 不要這樣做
var s = new String('hello'); // 建立的是字串物件，非原始字串
typeof s; // "object"，而非 "string"
```

**正確的用法是把它們當作函式（不加 `new`）呼叫**，功能是將任何值強制轉型為對應的原始型別。這在強制轉型（coercion）的情境中非常實用，後續章節會深入討論：

```javascript
var myGPA = String(transcript.gpa);
// 將數值轉換為字串 "3.54"
```

## 兩類基本物件的對比

| 類別              | 包含                                                     | 使用方式                         |
| ----------------- | -------------------------------------------------------- | -------------------------------- |
| 應搭配 `new` 使用 | `Object`、`Array`、`Function`、`Date`、`RegExp`、`Error` | `new Date()` 等                  |
| 只應作為函式使用  | `String`、`Number`、`Boolean`                            | `String(value)` 等，絕不加 `new` |

## 小結

基本物件是 JavaScript 物件導向特性中「類 Java 風格」的遺留設計。理解它們的存在是必要的，但使用方式需要謹慎區分：`Date`、`RegExp`、`Error` 等有合理的建構用途，而 `String`、`Number`、`Boolean` 的價值在於作為強制轉型的函式，而非作為建構函式。

## 複習

### JavaScript 中哪些基本物件應該使用 `new` 關鍵字來建構？

Object、Array、Function、Date、RegExp（正規表達式）、Error

### 哪三個基本物件應該作為函式而非建構函式使用？

String、Number、Boolean

### String、Number、Boolean 作為函式使用時，主要的用途是什麼？

將任何值強制轉型為各自對應的原始型別

### 為什麼 `new Date()` 建構函式被認為是有用的？

因為 JavaScript 沒有日期字面量，`new Date()` 是建立日期物件的唯一方式

### 使用 String 函式進行型別轉換的範例是什麼？

將 JSON 物件中的數值（如 GPA）轉換為其字串表示，例如 String(transcript.gpa) 回傳 "3.54"

## 小測驗

<details>
<summary>JavaScript 中哪些基本物件通常應該使用 `new` 關鍵字來建構？</summary>
Object、Array、Function、Date、RegExp、Error
</details>

<details>
<summary>String、Number、Boolean 作為函式使用時，主要用途是什麼？</summary>
將值轉換為各自對應的原始型別
</details>

<details>
<summary>為什麼 `new Date()` 被認為是有用的基本物件建構方式？</summary>
因為 JavaScript 沒有日期字面量
</details>

<details>
<summary>目前用來描述 JavaScript 內建物件的常用術語是什麼？</summary>
基本物件（Fundamental Objects）
</details>

<details>
<summary>String、Number、Boolean 在 JavaScript 中應該如何使用？</summary>
作為函式進行型別強制轉型，而不是作為建構函式使用
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
