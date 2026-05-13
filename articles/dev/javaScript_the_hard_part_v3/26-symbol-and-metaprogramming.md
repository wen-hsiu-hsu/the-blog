---
title: hint 參數、Symbol 本質與元程式設計
description: 說明 JavaScript 引擎執行 @@toPrimitive 時自動傳入的 hint 參數機制，介紹 Symbol 作為半隱藏唯一識別符的設計動機，以及 Well-Known Symbols 如何讓開發者安全地覆寫語言內建行為，實現元程式設計。
date: 2026-05-13
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: JavaScript Hard Parts v3
order: 26
chapter: Type Coercion & Metaprogramming
tags:
    - JavaScript
    - Symbol
    - TypeCoercion
    - Metaprogramming
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# hint 參數、Symbol 本質與元程式設計

## hint：讓 `@@toPrimitive` 函式感知轉換目標

[[25-implement-toprimitive|上一節]]的 `coerce` 函式只回傳固定值 `105`，無法區分目標型別。實際上，JavaScript 在執行 `@@toPrimitive` 上的函式時，會**自動傳入一個 hint 參數**，告知目前的強制轉換目標是數字還是字串：

- 觸發 ToNumber 時（如一元 `+`、`Number()`），hint 為字串 `"number"`
- 觸發 ToString 時（如模板字面值 `` `${obj}` ``），hint 為字串 `"string"`
- 無法判斷時（如寬鬆相等 `==`），hint 為字串 `"default"`

因此 `@@toPrimitive` 函式可以在內部加入條件邏輯，根據 hint 回傳不同的值：

```javascript
function coerce(hint) {
    if (hint === 'string') {
        return 'user';
    }
    if (hint === 'number') {
        return 105;
    }
}

userStored[Symbol.toPrimitive] = coerce;
userSubmitted[Symbol.toPrimitive] =
    coerce +
        // 數值比較
        userStored ===
    +userSubmitted // 105 === 105 → true
    // 字串化
    `${userStored}`; // "user"
```

這讓開發者得以為同一個物件定義多套轉換規則，視情境彈性回傳最合適的原始型別值。

## Symbol 是什麼

Symbol 是 ES6（2015 年）引入的資料型別，設計目的是提供一種**無法被直接書寫、也不會與現有字串屬性衝突**的唯一識別符（unique identifier）。

JavaScript 內建了一個名為 `Symbol` 的物件，其中以普通字串標籤（如 `toPrimitive`）作為索引，存放對應的隱藏標籤（`@@toPrimitive`）。開發者無法直接書寫 `@@toPrimitive`，但可以透過 `Symbol.toPrimitive` 存取到它，再透過方括號記法將函式附加到物件上。

若嘗試在 console 中輸出 `Symbol.toPrimitive`，得到的只是字串化的描述（如 `Symbol(Symbol.toPrimitive)`），而非隱藏標籤本身。

## 為什麼不直接用普通字串屬性

假設 JavaScript 決定改用普通字串屬性 `toPrimitive` 作為強制轉換的查找目標，那麼在 2015 年之前，所有已在自己物件上定義了名為 `toPrimitive` 屬性的開發者，都會突然發現：JavaScript 引擎開始自動存取並執行他們的 `toPrimitive` 函式，觸發從未預期的行為。這是一個**破壞向下相容性（breaking change）**的設計，無法被接受。

Symbol 的半隱藏特性解決了這個問題。因為：

- `@@toPrimitive` 不是字串，不會與任何現有字串屬性發生命名衝突
- 使用 `for...in` 或 `Object.keys()` 遍歷物件屬性時，Symbol 屬性不會出現，不會被意外存取
- JavaScript 明確知道要去尋找這個特定的隱藏標籤，而不會誤觸開發者原有的同名字串屬性

## Well-Known Symbols 與元程式設計

JavaScript 內建了一組 Symbol，引擎本身明確認識並在特定時機查找它們，這些稱為 **Well-Known Symbols**（常見 Symbol）。`Symbol.toPrimitive` 是其中之一，此外還有控制迭代器行為的 `Symbol.iterator`、影響非同步功能的相關 Symbol、控制類別行為的 Symbol 等。

透過 Well-Known Symbols，開發者可以**手動覆寫 JavaScript 語言的預設內建行為**，讓隱式的語言機制變得顯式且可控，這就是**元程式設計（metaprogramming）**：用程式碼來控制程式語言本身的運作方式。

## 明確控制強制轉換的實務意義

整個型別強制轉換的學習旅程可歸結為一個原則：**明確（explicit）優於隱式（implicit）**。

每一個運算子、每一次 API 呼叫都可能觸發隱式強制轉換。有了清楚的心智模型，可以預測這些行為而不是被它們出乎意料地影響。在實務中，應：

- 在 DOM 邊界使用 `Number()`、一元 `+`、`String()` 等手動觸發轉換
- 在自訂物件上透過 `Symbol.toPrimitive` 明確定義強制轉換邏輯
- 優先使用 `===` 而非 `==`，避免隱式的多方向型別轉換

TypeScript 透過靜態型別系統自動化了許多這些規則，但理解 JavaScript 底層的強制轉換機制，仍然是有效使用這門語言的根基。

## 複習

### 當 JavaScript 引擎執行儲存在 `@@toPrimitive` 屬性上的函式時，會自動傳入什麼參數？

JavaScript 引擎會自動傳入關於目標型別的 hint 資訊，值為字串 `"number"` 或 `"string"`，取決於強制轉換的情境。這個參數（慣例上稱為 `hint`）讓函式能判斷應回傳數字還是字串。

### Symbol 資料型別在 JavaScript 中的用途為何？特別是在物件屬性方面。

Symbol 是唯一識別符，作為物件的半隱藏屬性使用。它讓 JavaScript 得以在不破壞向下相容性的前提下新增語言特性。由於 Symbol 無法直接以字串形式書寫，因此不會覆蓋開發者既有的同名字串屬性。

### 為什麼 JavaScript 不直接使用普通字串屬性 `toPrimitive`，而要改用 `@@toPrimitive` 這個 Symbol？

使用普通字串屬性會破壞向下相容性。許多開發者可能早已在自己的物件上定義了名為 `toPrimitive` 的屬性，用於自己的用途。若 JavaScript 開始自動存取這些屬性來執行內建的強制轉換行為，將導致從未預期這種情況的既有程式碼產生非預期的行為。

### JavaScript 中的 Well-Known Symbols（常見 Symbol）是什麼？

Well-Known Symbols 是 JavaScript 明確認識並用於控制各種語言行為的內建 Symbol。例如 `@@toPrimitive` 用於控制強制轉換，另有影響迭代器、非同步功能與類別行為的 Symbol。它們讓開發者能安全地覆寫語言的預設規則，實現元程式設計。

### 若一個物件定義了 `@@toPrimitive`，並在字串串接的情境下被使用，hint 參數會傳入什麼值？

hint 參數會傳入字串 `"string"`。這讓 `@@toPrimitive` 函式能在物件被強制轉換為字串型別時，回傳適當的字串表示值。

## 小測驗

<details>
<summary>JavaScript 中 Symbol 的用途為何？特別是在物件屬性方面。</summary>
建立半隱藏屬性，不會覆蓋開發者既有的程式碼，並確保向下相容性
</details>

<details>
<summary>當 JavaScript 自動執行儲存在 @@toPrimitive 上的函式時，會傳入什麼引數？</summary>
一個 hint 字串，指示目標型別（"number"、"string" 或 "default"）
</details>

<details>
<summary>對物件使用模板字面值進行字串化操作時，@@toPrimitive 函式的 hint 參數會收到什麼值？</summary>
字串 "string"
</details>

<details>
<summary>遍歷一個具有 Symbol 屬性的物件時，會發生什麼事？</summary>
遍歷一般屬性時找不到 Symbol 屬性
</details>

<details>
<summary>在 JavaScript Symbol 的脈絡下，元程式設計（metaprogramming）是什麼？</summary>
覆寫語言預設行為，並存取迭代器、非同步功能、強制轉換等內建特性的能力
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
