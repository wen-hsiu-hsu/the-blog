---
title: '解法三：`new` 關鍵字與函式的雙重身份'
description: '介紹 `new` 關鍵字如何自動化物件建立、原型連結與回傳三個步驟，以及函式在 JavaScript 中同時具備函式與物件兩種身份，並說明 `prototype` 屬性與 `[[prototype]]` 的差異。'
date: 2026-05-22
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 44
chapter: 'Classes & Prototypes (OOP)'
tags:
    - JavaScript
    - Prototype
    - OOP
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# 解法三：`new` 關鍵字與函式的雙重身份

> 本章節建議從 [[37-object-oriented-javascript]] 開始閱讀

## `new` 關鍵字自動化了什麼

解法二需要在每次建立物件時重複寫三段固定樣板：建立空物件、建立原型連結、回傳物件。`new` 關鍵字正是為了消除這三個步驟而存在。在呼叫函式前加上 `new`，JavaScript 會自動完成：

1. 建立一個新的空物件
2. 將該物件的 `[[prototype]]` 連結到共用的函式儲存處
3. 將該物件自動回傳出去

## 函式的雙重身份

為了理解 `new` 把函式連結到哪個「共用函式儲存處」，需要先認識 JavaScript 中一個重要的特性：**函式同時也是物件**。

```javascript
function multiplyBy2(num) {
    return num * 2;
}

multiplyBy2.stored = 5; // 以物件形式，加入屬性
multiplyBy2(3); // 以函式形式呼叫，回傳 6
multiplyBy2.stored; // 以物件形式，讀取屬性，得到 5
multiplyBy2.prototype; // {}，一個空物件
```

使用括號 `()` 呼叫時，存取的是它的函式行為；使用點記法存取屬性時，存取的是它的物件行為。兩種行為互不干擾。

## `prototype`：函式物件的內建屬性

所有函式在宣告時，JavaScript 會自動在它的物件側加上一個名為 `prototype` 的屬性，其預設值是一個**空物件**。

這個 `prototype` 屬性與之前提到的隱藏屬性 `[[prototype]]` 是完全不同的兩件事：

|                  | 說明                                                           |
| ---------------- | -------------------------------------------------------------- |
| `[[prototype]]`  | 每個物件上的**隱藏**屬性，指向它的原型物件，是原型鏈的實際連結 |
| `函式.prototype` | 函式物件側的**公開**屬性，是一個空物件，用來存放共用方法       |

## `new` 如何使用 `prototype`

當我們使用 `new` 呼叫 `userCreator` 時，JavaScript 自動建立的那個新物件，其 `[[prototype]]` 會被連結到 **`userCreator.prototype`** 這個物件。因此，只要把共用方法放進 `userCreator.prototype`，所有透過 `new userCreator()` 建立的物件就能透過原型鏈存取它們。

我們將在下一節說明怎麼透過 `new` 來處理相同的狀況

## 複習

### 在 JavaScript 中，`new` 關鍵字搭配建構函式呼叫時，會自動完成哪三件事？

`new` 關鍵字會自動完成：

1. 建立一個新物件
2. 將該物件透過原型鏈連結到共用的函式儲存處
3. 將新建立的物件從函式中自動回傳

### 使用 `new` 關鍵字搭配建構函式時，用什麼關鍵字來指向自動建立的物件？

使用 `this` 關鍵字來指向 `new` 自動建立的物件。

### JavaScript 中函式的雙重身份是什麼？

JavaScript 中的函式同時也是物件。
以括號呼叫時，存取的是它的函式行為。
以點記法存取屬性時，存取的是它的物件行為，可以像一般物件一樣對它新增或讀取屬性。

### JavaScript 中所有函式在其物件側自動擁有什麼屬性？其預設值為何？

所有函式在其物件側都自動擁有一個 `prototype` 屬性，預設值為一個空物件。

## 小測驗

<details>
<summary>使用 `new` 關鍵字時，用什麼關鍵字來指向自動建立的物件？</summary>
this
</details>

<details>
<summary>JavaScript 中所有函式在其物件形式上自動擁有什麼屬性？</summary>
prototype
</details>

<details>
<summary>在 JavaScript 中，以物件形式存取函式屬性時，使用什麼記法？</summary>
點記法（Dot Notation）
</details>

<details>
<summary>新宣告的函式，其 prototype 屬性的預設值是什麼？</summary>
一個空物件
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
