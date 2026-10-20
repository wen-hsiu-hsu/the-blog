---
title: '用 Immer 處理不可變資料：在 produce 裡照常 push，原陣列不變'
description: '用 Immer 的 produce 改寫 push、update、pop：在回呼函數裡對 draft 做 push、指派、pop，Immer 在底層保證原陣列不變並回傳新陣列，並比較 Immutable.js 的差異。'
date: 2026-10-17
section: dev
category: Functional JavaScript First Steps
series: functional_javascript_first_steps
seriesTitle: 'Functional JavaScript First Steps'
order: 21
chapter: 'Immutability'
tags:
    - frontendMasters
    - functionalJavaScriptFirstSteps
    - JavaScript
    - Immutability
    - ImmutableDataStructure
---

# 用 Immer 處理不可變資料：在 produce 裡照常 push，原陣列不變

> [[20-immutable-array-operations-exercise|上一篇]]用展開運算子、`slice`、`map` 自己寫出不修改原陣列的 `push`、`pop`、`update`。這一篇回到[[19-immutable-data|不可變資料那篇]]留下的問題：JavaScript 沒有內建不可變資料結構，那要怎麼用現成的函式庫來處理？

## JavaScript 的陣列是可變的

JavaScript 的陣列是可變的，陣列的內容隨時可以被改掉。如果想要的是「資料一旦建立，就沒有人能再動它」的保證與信心，這就不太理想。

所以有一些 JavaScript 函式庫提供了這類資料結構，選擇很多，課程最後也附了更多連結。講師介紹其中一個很熱門的：**Immer**。

### Immer 的名字與「持久化」

Immer 在德文裡是「總是」的意思。這也帶到了常跟不可變資料結構一起出現的另一個詞：**持久化（persistence）**。持久化資料結構永遠不會改變，一旦建立，就像用 `const` 宣告一個字串，宣告完之後就沒有人能再改它。

Immer 只是其中一個選擇，還有很多其他函式庫，細節講師留給大家自己去讀文件。

## 用 Immer 照常寫 push

Immer 很酷的地方是，不必再做上一篇那些腦力體操，像是展開 `slice` 的結果、用 `map` 處理之類的。可以直接用 `array.push`。

講師自己先問：前面不是才說 `push` 會修改資料、很危險嗎？沒錯，在一般的 JavaScript 環境裡呼叫是這樣。但這裡是在一個回呼函數裡呼叫它，這個回呼函數是當成值傳進去的[[11-higher-order-functions|一級函數]]。

### produce 函數

Immer 匯出一個 `produce` 函數，運作方式跟前面許多函數式工具很像：

- **第一個參數**：一個陣列
- **第二個參數**：一個函數，負責「描述」想對這個陣列做哪些轉換，但這時還不會真的執行

這個函數的參數慣例上叫做 **`draft`**，意思是「要回傳的東西的草稿」。它一開始跟輸入的陣列一模一樣，接著就可以在函數裡隨意修改它。

底層則是由 Immer 用一些特殊的資料結構來管理不可變性，運作原理可以看 Immer 的文件網站，講師說那裡有一整篇部落格在講，很有意思。這呼應了[[19-immutable-data|不可變資料那篇]]提到的持久化資料結構：特殊的最佳化交給函式庫，寫程式的人不必自己處理。

### 寫起來像修改，其實被隔離了

這讓程式碼可以寫得像是在修改資料。但這個看起來像修改的動作被隔離在這個函數裡，底層可能根本不是真的修改。這些變更接著套用到舊陣列上，產生一個新陣列。

## 用 Immer 改寫三個函數

講師把上一篇的 `push`、`update`、`pop` 改寫成 Immer 的版本，只是當成範例，示範 JavaScript 裡的一種持久化資料結構、不可變資料實作能怎麼用。先從 Immer 匯入 `produce`：

```js
import { produce } from 'immer';
```

### push

上一篇的範例是固定 `push(4, original)`，這裡要改成在回呼函數裡把 `element` push 進 `draft`：

```js
// instead of myArray.push(element)
export function push(element, array) {
    return produce(array, (draft) => {
        draft.push(element);
    });
}
```

### update

`update` 不是 push，而是指派，所以改成 `draft[index] = value`：

```js
// instead of myArray[index] = value
export function update(index, value, array) {
    return produce(array, (draft) => {
        draft[index] = value;
    });
}
```

平常在 JavaScript 裡習慣的寫法全都一樣，只是在底層神奇地被轉成了不可變的操作。

### pop

`pop` 要多想一下。這裡要的不是原生 `myArray.pop()` 的行為，而是回傳一個除了被 pop 掉的元素以外、包含其他所有元素的陣列。做法是在 `draft` 上直接呼叫 `pop`：

```js
// instead of myArray.pop();
export function pop(array) {
    return produce(array, (draft) => {
        draft.pop();
    });
}
```

講師原本想在呼叫 `pop` 之後再 `return draft`，但其實不需要。Immer 會拿這份 `draft` 替我們回傳，所以三個回呼函數裡都不用寫 `return`。

測試跟上一篇一樣，可以自己看看。這裡只是示範這個 API 怎麼用。

## Immer 與 Immutable.js

Immer 只是其中一種做法，但很多人很喜歡它。也有其他 API 完全不同的方案，例如 Facebook 推出的 **Immutable.js**。

- **Immutable.js**：底層做的是同一件事，但使用方式差很多，要記得一律把陣列建立成它專用的不可變陣列
- **Immer**：可以當作一切都是一般的 JavaScript 陣列，由它在背後確保沒有東西被修改

## 小結

如果要大量寫函數式程式，就會發現每次都複製一整份來避免修改有多慢，這時多半會想用不可變資料。這正是[[19-immutable-data|不可變資料那篇]]提到的複製成本問題，而 JavaScript 生態系裡已經有現成的解決方案。

## 複習

### 處理不可變資料時，JavaScript 的陣列有什麼問題？

JavaScript 的陣列是可變的，建立之後內容還能被修改，因此很難保證資料的完整性、防止預期外的修改。

### Immer 是什麼？它怎麼幫忙管理 JavaScript 裡的不可變性？

Immer 是一個函式庫，提供 `produce` 函數，在底層管理不可變性，讓開發者能操作不可變資料結構。程式碼可以寫得像在修改資料，實際上卻是建立新的不可變資料結構。

### Immer 的 produce 函數裡，輸入參數慣例上叫什麼名字？

慣例上叫 `draft`。它一開始是輸入資料的一模一樣的副本，可以在函數裡操作它，同時維持不可變性。

### Immer 處理修改的方式，跟傳統的 JavaScript 陣列方法有什麼不同？

Immer 把修改隔離在回呼函數裡，並用精巧的資料結構建立新的陣列或物件，不修改原本的資料。所以開發者可以用 `push`、指派這些熟悉的修改寫法，同時維持不可變性。

### Immer 跟 Immutable.js 這類不可變資料函式庫有什麼不同？

Immer 讓開發者操作一般的 JavaScript 陣列與物件，不可變性的魔法在背後完成；Immutable.js 這類函式庫則需要使用特殊的陣列型別，以及另一套操作不可變資料的 API。

### 處理陣列時，Immer 提供的關鍵好處是什麼？

程式碼可以寫得像在修改資料，同時維持不可變性。

### 函數式程式設計裡的「持久化資料結構」指的是什麼？

一旦建立就永遠不會改變的資料結構。

## 小測驗

<details>
<summary>處理不可變資料時，JavaScript 的陣列有什麼問題？</summary>
JavaScript 的陣列是可變的，建立之後內容還能被修改，因此很難保證資料的完整性、防止預期外的修改
</details>

<details>
<summary>Immer 是什麼？它怎麼幫忙管理 JavaScript 裡的不可變性？</summary>
Immer 是一個函式庫，提供 <code>produce</code> 函數，在底層管理不可變性，讓開發者能操作不可變資料結構。程式碼可以寫得像在修改資料，實際上卻是建立新的不可變資料結構
</details>

<details>
<summary>Immer 的 <code>produce</code> 函數裡，輸入參數慣例上叫什麼名字？</summary>
慣例上叫 <code>draft</code>。它一開始是輸入資料的一模一樣的副本，可以在函數裡操作它，同時維持不可變性
</details>

<details>
<summary>Immer 處理修改的方式，跟傳統的 JavaScript 陣列方法有什麼不同？</summary>
Immer 把修改隔離在回呼函數裡，並用精巧的資料結構建立新的陣列或物件，不修改原本的資料。所以開發者可以用 <code>push</code>、指派這些熟悉的修改寫法，同時維持不可變性
</details>

<details>
<summary>Immer 跟 Immutable.js 這類不可變資料函式庫有什麼不同？</summary>
Immer 讓開發者操作一般的 JavaScript 陣列與物件，不可變性的魔法在背後完成；Immutable.js 這類函式庫則需要使用特殊的陣列型別，以及另一套操作不可變資料的 API
</details>

<details>
<summary>處理陣列時，Immer 提供的關鍵好處是什麼？</summary>
程式碼可以寫得像在修改資料，同時維持不可變性
</details>

<details>
<summary>函數式程式設計裡的「持久化資料結構」指的是什麼？</summary>
一旦建立就永遠不會改變的資料結構
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Functional JavaScript First Steps, v2](https://frontendmasters.com/courses/functional-first-steps-v2/) 課程筆記
