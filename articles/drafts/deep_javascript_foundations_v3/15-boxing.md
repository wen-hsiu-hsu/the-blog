---
title: 'Boxing：原始值存取屬性背後的隱式轉型'
description: '說明 Boxing 的運作機制：當你在原始字串或數字上存取 .length 或呼叫方法時，JavaScript 會自動將原始值暫時包裝成對應的物件。這是一種隱式強制轉型，也是「所有東西都是物件」這個誤解的真正來源。'
date: 2026-06-02
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 15
chapter: 'Coercion'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - TypeCoercion
    - Boxing
---

# Boxing：原始值存取屬性背後的隱式轉型

> 本文延續強制轉型的討論。前幾篇說明了數字、字串、boolean 之間的轉型場景，這篇要解釋一個更基礎、更無所不在的隱式轉型：當你在原始值上存取屬性或呼叫方法時，JavaScript 在背後做了什麼。

## 什麼是 Boxing

```javascript
if (studentNameElem.value.length > 50) {
    console.log("Student's name too long.");
}
```

`studentNameElem.value` 是一個原始字串。原始值沒有屬性，理論上不能存取 `.length`。但這段程式碼正常運作，原因是 JavaScript 自動將原始字串暫時包裝（wrap）成對應的字串物件，讓屬性存取得以進行——這個行為就是 **Boxing**。

Boxing 是一種隱式強制轉型：JavaScript 偵測到你試圖在原始值上做物件操作，主動幫你把它轉換成物件形式，用完即丟。

## Boxing 是「所有東西都是物件」誤解的來源

Boxing 正是人們說「JavaScript 中所有東西都是物件」的根本原因：原始值可以表現得像物件，所以看起來像物件。但兩者有本質差異：

- 原始字串是原始值，型別是 `string`
- Boxing 後產生的是暫時的字串物件，用完後不保留

原始值透過 Boxing 能夠「行為像物件」，但它本身不是物件。

## Boxing 是隱式強制轉型中的無名英雄

另一個設計選擇是：當你對原始值存取屬性時，拋出錯誤（就像 Java 要求你先顯式建立物件）。JavaScript 選擇了更方便的路——自動 Boxing。這讓程式碼更簡潔，不需要為了呼叫一個方法先手動建立物件包裝。

Kyle Simpson 認為這是 JavaScript 被低估的優良設計之一。

## 型別轉換無可避免

這一節更大的論點是：型別轉換存在於所有程式語言中，沒有例外。在 JavaScript 中，無法真正「迴避強制轉型」——字串需要當作數字用、數字需要判斷 truthy/falsy、原始值需要存取方法，這些場景每天都在發生。

## 小結

Boxing 是 JavaScript 在原始值上存取屬性時自動執行的隱式強制轉型，讓原始值能夠暫時表現得像物件，但本質上它們並不是物件。這個機制解釋了「所有東西都是物件」這個誤解的來源，也再次印證了強制轉型無所不在的事實。

## 複習

### 什麼是 JavaScript 中的 Boxing？

Boxing 是一種隱式強制轉型，當你在原始值上存取屬性或方法時，JavaScript 會自動將該原始值轉換為對應的物件形式，讓那些原本不屬於原始型別的屬性和方法得以被存取。

### JavaScript 如何處理在原始值上存取屬性的情況？

JavaScript 會隱式地將原始值包裝（Boxing）成對應的物件，讓字串取得 length 或在原始值上呼叫方法成為可能。

### 型別轉換在程式語言中有什麼重要性？

所有程式語言都需要型別轉換，開發者終究必須處理型別轉換的需求，例如將字串轉為數字，或將數字轉為 boolean。

### 在 JavaScript 中對原始值呼叫方法時會發生什麼？

JavaScript 不會拋出錯誤，而是執行 Boxing，將原始值隱式轉換為對應的物件，從而允許方法呼叫和屬性存取。

### 能在原始值上存取屬性，是否代表 JavaScript 中所有東西都是物件？

不是。原始值可以透過 Boxing 表現得像物件，但它們本身並不是物件。這是一種便利的最佳化機制，讓屬性和方法的存取成為可能，而不需要改變值本身的型別。

## 小測驗

<details>
<summary>將原始值轉換為物件以存取其屬性的行為，稱為什麼？</summary>
Boxing
</details>

<details>
<summary>在 JavaScript 中存取原始值的屬性時，會發生什麼行為？</summary>
JavaScript 隱式地將原始值轉換為物件
</details>

<details>
<summary>JavaScript 如何處理程式中的型別轉換？</summary>
型別轉換在程式設計中是必然需要的
</details>

<details>
<summary>對原始字串存取 .length 時會發生什麼？</summary>
原始值被暫時轉換為物件
</details>

<details>
<summary>JavaScript 隱式強制轉型的主要目的是什麼？</summary>
讓在原始值上存取屬性更為便利
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
