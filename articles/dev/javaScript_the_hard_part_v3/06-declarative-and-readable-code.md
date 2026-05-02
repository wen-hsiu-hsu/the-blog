---
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 6
title: JavaScript 一級函式與高階函式（Higher-Order Function）入門
description: 說明 JavaScript 為何能將函式作為值傳遞，介紹一級物件（first-class objects）特性，以及 Higher-Order Function 與 Callback Function 的定義與差異。並以命令式與宣告式風格的對比，說明這些概念為何是理解 Promise 與非同步 JavaScript 的基礎。
date: 2026-04-25
section: dev
category: JavaScript Hard Parts v3
chapter: Callbacks & Higher Order functions
tags:
    - JavaScript
    - frontendMasters
    - javaScriptTheHardPartsV3
    - HigherOrderFunction
    - Closure
---

# JavaScript 一級函式與高階函式（Higher-Order Function）

## 為什麼函式可以被傳入另一個函式？

許多語言是不能把函式當作值傳遞的，而 JavaScript 之所以可以這麼做，因為函式在 JavaScript 中本質上是物件，只是額外具備可以被呼叫、執行的功能。

而這種函式能被視為變數的特性就會稱為這個程式語言擁有 **一級函式**

> JavaScript 支援「一級函式（first-class functions）」的特性，因為函式本質上是「一級物件（first-class objects）」——它們可以被賦值給變數、作為引數傳入，也可以作為回傳值輸出。

## 衍生的兩個核心概念

### Higher-Order Function（高階函式）

「接收函式作為參數」或「回傳函式作為輸出」的函式。

- 不需要特殊關鍵字，本質上與一般函式沒有差異
- **只是一個描述性術語**，用來稱呼這類行為的函式

### Callback Function（回呼函式）

「被傳入另一個函式」的那個函式。

```
copyArrayAndManipulate(array, multiplyBy2)
        ↑                        ↑
 Higher-Order Function      Callback Function
  （外層、接收函式）          （被傳入的函式）
```

> **關於「callback」這個名稱的注意事項：** 這個名稱容易讓人誤以為函式會「之後才被呼叫回來」。但實際上分兩種情況：
>
> - **同步情境**（如本例）：callback 在函式內部**立刻執行**
> - **非同步情境**（如事件監聽、fetch）：callback 才真正是「稍後才被呼叫」
>
> 因此 callback 在同步情境下也可以叫做 handler、transformation function、lambda function 等，名稱隨情境而異。

## Closure（閉包）- 回傳函式時產生的特性

當函式被作為**回傳值**從另一個函式輸出時，就會產生 **closure**

```javascript
function outer() {
  return function inner() { ... }  ← 回傳函式 → 產生 Closure
}
```

將在後續章節詳細說明。

## 這樣寫有什麼好處？

Higher-Order Function 與 Callback 讓程式碼從**命令式**走向**宣告式**：

| 風格                  | 說明               | 特點                                |
| --------------------- | ------------------ | ----------------------------------- |
| Imperative（命令式）  | 逐步說明「如何做」 | 明確但冗長：取元素、修改、push…     |
| Declarative（宣告式） | 描述「要什麼結果」 | 可讀性高：`map`、`filter`、`reduce` |

```javascript
// Imperative：說明每一步怎麼做
for (let i = 0; i < array.length; i++) {
    newArray.push(array[i] * 2);
}

// Declarative：描述你想要的結果
copyArrayAndManipulate(array, multiplyBy2);
```

為什麼這個概念很讚：

| 重要性               | 說明                                                                              |
| -------------------- | --------------------------------------------------------------------------------- |
| **程式碼品質**       | `map`、`filter`、`reduce` 是處理資料最符合 DRY 原則、最易讀的方式                 |
| **面試高頻考題**     | mid/senior 等級職缺的熱門考題                                                     |
| **非同步 JS 的基礎** | `Promise`、`async/await` 底層都建立在 callback 上；是理解非同步 JavaScript 的前提 |

## 複習

### 在 JavaScript 中，函式是「一級物件」(first-class objects) 是什麼意思？

JavaScript 中的函式就是物件，只是額外具備被呼叫、執行的能力。它們可以像任何其他物件一樣被使用，也就是說可以被賦值給變數、作為其他物件的屬性、作為引數傳入函式，以及作為函式的回傳值輸出。

### 什麼是 Higher-Order Function（高階函式）？

高階函式是能夠接收另一個函式作為輸入參數，或將另一個函式作為輸出值回傳的函式。它們本質上與一般函式沒有差異，不需要特殊關鍵字宣告。

### 什麼是 Callback Function（回呼函式）？

Callback function 是被傳入另一個函式作為輸入的函式。它也可以被稱為 handler、transformation function、argument function 或 lambda function。儘管名稱暗示它會「稍後才被呼叫回來」，但 callback function 可以直接在被傳入的函式內部立即執行。

### 將函式作為回傳值從另一個函式輸出，會產生什麼 JavaScript 特性？

Closure（閉包）。當一個函式被作為回傳值從另一個函式輸出時，就會產生 closure，這被認為是 JavaScript 中最深奧的特性之一。

### Declarative（宣告式）與 Imperative（命令式）程式風格有什麼差別？

命令式程式碼逐步描述「如何做」（例如取出每個元素、進行修改、使用 push）。宣告式程式碼則以更易讀的方式描述「想要什麼結果」。任何宣告式程式碼的底層，都必定有對應的命令式程式碼在執行實際邏輯。

## 小測驗

<details>
<summary>在 JavaScript 中，函式是「一級物件」是什麼意思？</summary>
函式就是物件，可以像任何其他物件一樣被使用，只是額外具備可被呼叫/執行的能力。
</details>

<details>
<summary>什麼是 Higher-Order Function（高階函式）？</summary>
接收另一個函式作為輸入，或將函式作為輸出值回傳的函式。
</details>

<details>
<summary>Higher-Order Function 在程式風格上帶來什麼好處？</summary>
讓程式碼更具宣告式風格，可讀性更高。
</details>

<details>
<summary>在非同步 JavaScript 的情境中，callback function 與同步高階函式中的 callback 有什麼差異？</summary>
非同步的 callback 會在稍後才被呼叫，而同步的 callback 則直接在函式內部立即執行。
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
