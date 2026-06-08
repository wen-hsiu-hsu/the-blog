---
title: '箭頭函式：不是萬能替代品'
description: '說明為什麼箭頭函式不應該被當作所有函式的通用替代品：作為匿名函式，它繼承了所有匿名函式表達式的問題。整理何時可以接受用箭頭函式，以及唯一合理的例外場景。'
date: 2026-06-15
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 41
chapter: 'Scope & Function Expressions'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - ArrowFunction
  - FunctionExpression
---

# 箭頭函式：不是萬能替代品

> 本文延續命名函式表達式的討論。[[40-naming-function-expressions|前一篇]]建立了「函式都應該有名稱」的論點，這篇要把同樣的邏輯應用到近年最受歡迎的語法特性上：箭頭函式。

## 箭頭函式的本質：匿名函式表達式

```javascript
// 箭頭函式
var ids = people.map(person => person.id);

// 命名函式表達式（等效但有名稱）
var ids = people.map(function getId(person) {
    return person.id;
});
```

箭頭函式是匿名的。上一篇已經建立了為什麼匿名函式表達式是不好的選擇，箭頭函式繼承了所有相同的問題：沒有可靠的自我參考、stack trace 中顯示 anonymous、以及讀者必須閱讀函式體才能理解意圖。

`person => person.id` 的意圖，對某些人來說可能「看起來很明顯」，但它仍然需要推斷。相比之下，`getId` 這個名稱直接說明了目的，不需要讀程式碼。

## 「但我可以把箭頭函式賦值給變數」

有人提出折衷方案：

```javascript
// 賦值給變數，得到「名稱」
var getId = person => person.id;
var ids = people.map(getId);
```

這確實讓 `getId` 出現在 stack trace 的名稱推斷中，但有一個問題：如果你已經要寫 `var getId = ...`，函式宣告的字元數實際上更少或相近：

```javascript
// 變數 + 箭頭函式（使用 const 更多字元）
const getId = person => person.id;

// 函式宣告（更少字元，且更語意清楚）
function getId(person) { return person.id; }
```

而且，**大多數箭頭函式的使用場景是作為 callback 直接傳入**（如 `.map`、`.then`），在這種情況下根本無法觸發名稱推斷，只能顯示 anonymous。

## Promise 鏈中的選擇

```javascript
// 箭頭函式版本（常見但有問題）
getPerson()
    .then(person => getData(person.id))
    .then(renderData);

// 命名函式表達式（改善可讀性）
getPerson()
    .then(function getDataFrom(person) {
        return getData(person.id);
    })
    .then(renderData);

// 更好：拉出來成為函式宣告，鏈本身只引用名稱
getPerson()
    .then(getDataFrom)
    .then(renderData);
```

Kyle Simpson 坦承他個人不喜歡 Promise 鏈的可讀性，認為它很像早年 jQuery 的風格問題。他傾向把函式拉出來作為命名宣告，讓鏈本身只是名稱的序列，不在鏈中寫任何函式定義。

## 箭頭函式語法的複雜度

「箭頭函式語法簡單」是個誤解。它實際上有大約 15 種不同的語法變體，圍繞括號、大括號、回傳值等細節存在大量角落案例。語法越短，角落案例就越複雜。

## 唯一的例外：詞彙 `this`

Kyle Simpson 的立場不是完全禁止箭頭函式，而是不建議把它們當作所有函式的通用替代品。他明確保留了唯一一個合理的使用場景：**箭頭函式的詞彙 `this` 行為**，這會在課程後續討論 `this` 關鍵字時詳細說明。

## 小結

箭頭函式受歡迎的主要原因是「少打字」，但更少的字元不等於更好的可讀性。作為匿名函式，它們繼承了所有匿名函式表達式的問題，且在最常見的 callback 使用場景中無法受益於名稱推斷。除了詞彙 `this` 這個特定用途外，函式宣告或命名函式表達式始終是更好的選擇。

## 複習

### 根據課程討論，箭頭函式的主要批評是什麼？

箭頭函式是匿名的，缺乏描述性名稱，讀者必須閱讀函式體才能理解其用途，這降低了程式碼的可讀性。

### 定義函式時，建議用什麼方式取代箭頭函式？

使用具有描述性名稱的函式宣告，清楚傳達函式的用途。

### 為什麼講師建議不要為了簡潔而使用箭頭函式？

更簡潔的程式碼不等於更易讀的程式碼，而且使用箭頭函式定義函式，尤其是搭配 const 時，實際上可能需要更多字元。

### 箭頭函式語法有什麼複雜性？

箭頭函式語法大約有 15 種不同的變體，可能引入複雜的角落案例。

### 課程討論中提到的不使用箭頭函式的唯一例外是什麼？

箭頭函式的詞彙 `this` 行為，這將在課程後續部分詳細討論。

## 小測驗

<details>
<summary>根據課程討論，什麼比使用箭頭函式更好？</summary>
使用具有描述性名稱的函式宣告
</details>

<details>
<summary>課程討論對程式碼簡潔性有什麼看法？</summary>
更簡潔的程式碼不等於更易讀的程式碼
</details>

<details>
<summary>課程中提到的箭頭函式唯一例外是什麼？</summary>
它們的詞彙 this 行為
</details>

<details>
<summary>課程討論指出在 map() 等函式呼叫中使用箭頭函式有什麼問題？</summary>
它們使理解函式用途變得更困難
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記