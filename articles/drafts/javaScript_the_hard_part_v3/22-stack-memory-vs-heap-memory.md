---
title: JavaScript 記憶體模型：原始型別、Stack 與 Heap、物件參考比較
description: 說明 JavaScript 原始型別與物件在記憶體中的儲存差異：原始型別直接存於 Stack，物件存於 Heap 並以參考存取。解析為何用 == 或 === 比較內容相同的兩個物件仍回傳 false，以及賦值複製的是參考而非物件本身。
date: 2026-05-11
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 22
chapter: 'Type Coercion & Metaprogramming'
tags:
    - JavaScript
    - ReferenceType
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# JavaScript 記憶體模型：原始型別、Stack 與 Heap、物件參考比較

## 問題的起點：比較兩個物件

假設有一個簡單的使用者驗證場景：將使用者提交的資料與儲存的資料進行比對，若相同則允許購買。

```javascript
const userStored = { name: 'Will', id: 105 };
const userSubmitted = { name: null, id: null };
// 使用者輸入後變為 { name: "Will", id: 105 }

function onSubmit() {
    if (userSubmitted == userStored) {
        // 允許提交
    }
}
```

使用者輸入正確的姓名與 ID 後，兩個物件的內容看起來完全一樣。直覺上，`userSubmitted == userStored` 應該回傳 `true`。但結果是 `false`。換成嚴格相等 `===` 也一樣是 `false`。問題不在強制轉換，而在物件在記憶體中的儲存方式。

## Stack 與 Heap：兩種不同的儲存區域

### 原始型別存在 Stack

目前課程中出現的 `7`、`"3"`、`true` 都是**原始型別（primitives）**。原始型別的特性是大小固定且單一，因此 JavaScript 可以將它們的值**直接存放**在宣告它們的記憶體位置，這個區域稱為 **Stack**。

當 Stack 上的變數之間做比較，比較的就是值本身，結果直觀且可預測。

### 物件存在 Heap

物件可以包含任意數量的屬性，大小不固定，因此無法直接存入 Stack。JavaScript 將物件的實際內容存放在另一塊彈性的記憶體區域，稱為 **Heap**。

變數本身並不儲存物件的內容，而是儲存一個**指向 Heap 中該物件所在位置的參考（reference）**，也可以理解為記憶體位址。

```
Stack                     Heap
userStored  → [參考 1001] → { name: "Will", id: 105 }
userSubmitted → [參考 1002] → { name: "Will", id: 105 }
```

## 為什麼物件比較永遠回傳 false

當執行 `userSubmitted == userStored` 或 `userSubmitted === userStored` 時，JavaScript 比較的不是兩個物件的**內容**，而是它們在 Heap 中的**記憶體位址**。

`userStored` 的位址是 1001，`userSubmitted` 的位址是 1002，兩者不同，所以無論這兩個物件的屬性內容多麼相同，比較結果永遠是 `false`。

## 賦值複製的是參考，不是物件本身

```javascript
const anotherLink = userStored;
```

這行程式碼看起來像是建立了 `userStored` 的備份，但實際上只是複製了 `userStored` 所持有的**參考（記憶體位址）**。`anotherLink` 和 `userStored` 現在指向 Heap 中的**同一個物件**。

因此：

```javascript
anotherLink === userStored; // true（同一個記憶體位址）
```

這不是備份，修改其中一個，另一個也會反映相同的變化。

## 比較物件內容：只能手動走訪

JavaScript 沒有內建的「深層物件比較」機制。若要比對兩個物件的內容是否相同，必須手動**走訪（traverse）** 物件的每個屬性，逐一取出其原始型別的值，在 Stack 層級進行比對。如果屬性值本身也是物件，則需要遞迴處理。

同理，若要真正複製一個物件（深複製，deep clone），也必須手動提取所有屬性並建立新的物件，而非直接賦值。

## 函式同樣存在 Heap

函式在 JavaScript 中是一級物件（first-class objects），因此它們也存放在 Heap 中，Stack 上的函式名稱同樣只是一個參考。在大多數情況下這個細節不影響程式邏輯，但在涉及物件比較時，理解「所有非原始型別都透過參考存取」這個原則就至關重要。

## 複習

### JavaScript 中，原始型別的值與物件在記憶體中的儲存方式有何不同？

原始型別的值（如數字、字串、布林值）會直接儲存在宣告它們的記憶體位置（Stack）。物件則儲存在一塊彈性的記憶體區域（Heap），變數本身只儲存一個指向該位置的參考（reference），而非物件本身。

### 為什麼在 JavaScript 中，用 `==` 或 `===` 比較兩個屬性完全相同的物件，結果會是 false？

比較物件時，JavaScript 比較的是它們的參考（記憶體位址），而非實際內容。即使兩個物件的屬性與值完全相同，它們仍佔據 Heap 中的不同位置，參考不同，因此比較結果為 false。

### 在 JavaScript 中，當執行 `backup = userStored` 這樣的物件變數賦值時，會發生什麼事？

複製的是指向物件的參考（記憶體位址），而非物件的內容。兩個變數此後指向記憶體中的同一個物件，透過其中一個變數所做的修改，也會反映在另一個變數上。這並不是建立物件的備份或副本。

### JavaScript 中的 Heap 是什麼？哪類資料儲存在那裡？

Heap 是一塊彈性的記憶體區域，用於儲存非原始型別的資料，包括物件、陣列和函式。它能容納大小不固定的資料結構。JavaScript 的變數不會直接儲存這些資料結構，而是持有指向它們在 Heap 中位置的參考。

## 小測驗

<details>
<summary>在 JavaScript 中，物件儲存在記憶體的哪個區域？</summary>
Heap
</details>

<details>
<summary>在 JavaScript 中，將一個物件變數賦值給另一個變數時，會發生什麼事？</summary>
複製的是指向物件的參考（記憶體位址）
</details>

<details>
<summary>為什麼用 === 比較兩個屬性完全相同的物件，結果是 false？</summary>
比較的是記憶體位置，而非物件內容
</details>

<details>
<summary>宣告一個物件變數時，JavaScript 的記憶體（Stack）中實際儲存的是什麼？</summary>
指向物件在 Heap 中位置的參考
</details>

<details>
<summary>JavaScript 中，函式儲存在記憶體的哪個區域？</summary>
Heap，與其他物件相同
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
