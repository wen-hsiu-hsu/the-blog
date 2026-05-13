---
title: '方法內的巢狀函式與箭頭函式的 `this` 綁定'
description: '說明為何普通函式在方法內部被呼叫時 `this` 會跑掉，並比較 `that = this` 這個舊式 hack 與箭頭函式的詞法綁定如何各自解決問題，最後整理解法二的優缺點。'
date: 2026-05-22
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 43
chapter: 'Classes & Prototypes (OOP)'
tags:
    - JavaScript
    - Prototype
    - OOP
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# 方法內的巢狀函式與箭頭函式的 `this` 綁定

> 本章節建議從 [[37-object-oriented-javascript]] 開始閱讀

## 問題：方法內部呼叫普通函式時，`this` 會跑掉

承接[[42-hasownproperty-and-object-prototype|前一節]]，當我們在 `increment` 方法內再定義並呼叫一個普通函式 `add1` 時，問題就出現了：

```javascript
const userFunctionStore = {
    increment: function () {
        function add1() {
            this.score++;
        }
        add1();
    },
};
```

執行 `user2.increment()` 時：

1. 進入 `increment` 的執行環境，`this` 被自動設為 `user2`（點左側的物件）。
2. 宣告 `add1` 函式並立刻呼叫它。
3. 進入 `add1` 的執行環境，此時 `add1` 不是以 `物件.方法()` 的形式被呼叫，沒有點的左側可以參照，因此 `this` 預設指向全域物件 `window`。
4. `this.score++` 變成 `window.score++`，試圖對一個不存在的全域屬性加一，完全不是我們想要的結果。

## 舊的解法：`that = this`

在箭頭函式出現之前，開發者的慣用解法是在呼叫子函式之前，先把 `this` 的值存進一個普通變數：

```javascript
increment: function() {
  const that = this
  function add1() { that.score++ }
  add1()
}
```

`that` 透過閉包保留了 `increment` 執行時的 `this` 值（即 `user2`），子函式內改用 `that` 存取即可。這個做法雖然有效，但被廣泛認為是一個難看的 hack。

## 正確(現在的)解法：箭頭函式的 `this`

箭頭函式解決了這個問題。它的 `this` 不由呼叫方式決定，而是由**定義時所在的執行環境**決定，也就是詞法作用域（lexical scope）的邏輯：

```javascript
const userFunctionStore = {
    increment: function () {
        const add1 = () => {
            this.score++;
        };
        add1();
    },
};
```

當 `add1` 以箭頭函式定義時，它的 `this` 在定義的瞬間就被綁定為當下的 `this`，也就是 `increment` 被呼叫時的 `this`：即 `user2`。之後不管 `add1` 以什麼形式被呼叫，`this` 永遠是 `user2`。

| 函式類型               | `this` 的決定方式                               |
| ---------------------- | ----------------------------------------------- |
| 普通函式（`function`） | 由呼叫時點左側的物件決定；若無點，則為 `window` |
| 箭頭函式（`=>`）       | 由定義時所在執行環境的 `this` 決定（詞法綁定）  |

需要注意的是，箭頭函式適合作為方法**內部**的子函式，但不適合作為方法本身。若把 `increment` 改成箭頭函式，它就無法在呼叫時正確捕捉點左側的物件作為 `this`，反而會把定義時的 `this` 固定下來。

## 解法二的總結

使用原型鏈的解法二在技術上是完整且有效的：

**優點**：高效能，所有使用者物件共用一份方法；完全能達成封裝與可推理的目標。

**缺點**：每次建立物件都需要手動寫 `Object.create()`、逐一加入屬性、最後 `return`，雖然只是幾個字，卻不夠直覺，也不是 JavaScript 的慣用寫法。

這個重複的樣板正是下一個解法要消除的，也就是 `new` 關鍵字自動化了這整個過程。

## 複習

### 當一個函式以物件方法的形式被呼叫時，會自動建立的隱含參數是什麼？

隱含參數是 `this`，它會被自動設為呼叫該方法時點（.）左側的物件。

### 當一個普通函式被定義並在方法內部呼叫（非箭頭函式語法）時，該內部函式中的 `this` 會指向什麼？

內部函式中的 `this` 會指向全域物件（在瀏覽器中為 window），而不是呼叫外層方法的那個物件。

### 箭頭函式中的 `this` 與普通函式有何不同？

箭頭函式的 `this` 採詞法綁定，設為箭頭函式被定義時所在執行環境的 `this` 值，而不是由函式的呼叫方式來決定。

### 在以下程式碼中，add1 函式內的 `this` 會指向什麼？

```javascript
increment: function() {
  const add1 = () => {
    this.score++;
  };
  add1();
}
```

`this` 會指向呼叫 increment 的那個物件，因為箭頭函式會保留其定義時所在執行環境的 `this` 值。

## 小測驗

<details>
<summary>箭頭函式執行時，如何決定 `this` 的指向？</summary>
使用箭頭函式被定義時所在執行環境的 `this` 值
</details>

<details>
<summary>在箭頭函式出現之前，開發者用什麼方式來保留巢狀函式中正確的 `this` 指向？</summary>
在巢狀函式之前宣告 `that = this`，再於子函式中使用 that
</details>

<details>
<summary>使用點記法呼叫物件上的方法（例如 user2.increment()）時，會發生什麼事？</summary>
建立一個新的執行環境，並將 `this` 設為點左側的物件
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
