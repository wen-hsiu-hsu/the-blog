---
title: '巢狀範疇 (Nested Scope)：向外查找的完整鏈'
description: '介紹三層巢狀範疇的查找機制：函式宣告的識別字屬於其外層封閉範疇、參數等同於函式範疇內的正式宣告，以及來源參考查找失敗時永遠拋出 ReferenceError。'
date: 2026-06-14
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 38
chapter: 'Scope'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - Scope
  - LexicalScope
---

# 巢狀範疇 (Nested Scope)：向外查找的完整鏈

> 本文延續範疇查找機制的討論。前幾篇示範了單層與兩層的範疇互動，這篇要進一步看三層巢狀範疇，以及當查找在所有可存取範疇中都失敗時會發生什麼。

## 範例程式碼

```javascript
var teacher = "Kyle";

function otherClass() {
    var teacher = "Suzy";

    function ask(question) {
        console.log(teacher, question);
    }

    ask("Why?");
}

otherClass();
ask("???");   // ReferenceError
```

## 編譯階段：三層巢狀範疇

| 宣告                             | 顏色 | 原因                                         |
| -------------------------------- | ---- | -------------------------------------------- |
| `var teacher`（第 1 行）         | 紅色 | 在全域範疇                                   |
| `function otherClass`（第 3 行） | 紅色 | 識別字建立於其所在的封閉範疇（全域）         |
| `var teacher`（第 4 行）         | 藍色 | 在 `otherClass` 的範疇內                     |
| `function ask`（第 6 行）        | 藍色 | 識別字建立於其所在的封閉範疇（`otherClass`） |
| 參數 `question`（第 6 行）       | 綠色 | 參數等同於在函式範疇內的正式宣告             |

關鍵規則：**函式宣告的識別字屬於其外層封閉範疇，而非函式本身的範疇。** `ask` 這顆彈珠是藍色的，因為它是在 `otherClass` 的範疇中被宣告的。

參數與 `var` 宣告具有相同的地位——`question` 在編譯期就被視為 `ask` 範疇內的正式識別字（綠色彈珠），概念上等同於進入函式時將引數賦值給參數。

## 執行階段：第 7 行的跨範疇查找

`console.log(teacher, question)` 需要查找兩個識別字：

**`question`（來源位置）**

引擎：「綠色桶子（ask 的範疇），來源參考，`question`，你認識嗎？」 範疇管理器：「認識，給你綠色彈珠。」→ 取出值 `"Why?"`。

**`teacher`（來源位置）**

引擎：「綠色桶子，來源參考，`teacher`，你認識嗎？」 範疇管理器：「不認識。」

往外一層：

引擎：「藍色桶子（otherClass 的範疇），來源參考，`teacher`，你認識嗎？」 範疇管理器：「認識，給你藍色彈珠。」→ 取出值 `"Suzy"`。

範疇鏈可以無限往外延伸，直到全域範疇為止。如果抵達全域範疇仍找不到，就會拋出 ReferenceError。

## 第 14 行：來源查找失敗

```javascript
ask("???");   // ReferenceError: ask is not defined
```

`ask` 雖然存在於程式中，但它是藍色彈珠，屬於 `otherClass` 的範疇。從全域範疇無法存取到它。

引擎：「全域範疇，來源參考，`ask`，你認識嗎？」 範疇管理器：「不認識。」→ **ReferenceError**。

## 目標參考 vs 來源參考的失敗行為差異

這裡有個重要的細節，在前一篇已提過，這裡再次確認：

- **來源參考查找失敗**：無論在嚴格或非嚴格模式，都拋出 ReferenceError
- **目標參考查找失敗**：非嚴格模式下自動創建全域變數；嚴格模式下拋出 ReferenceError

一旦啟用嚴格模式，兩者行為完全一致，都拋出 ReferenceError，目標與來源的區分就不那麼重要了。

## 小結

巢狀範疇的查找是一條從內往外的鏈：先找當前範疇，找不到就往外一層，可以無限延伸直到全域範疇。函式宣告的識別字屬於外層封閉範疇，參數等同於在函式範疇內的宣告。來源參考查找失敗永遠是 ReferenceError，這是理解詞彙範疇最重要的邊界行為之一。

## 複習

### 當一個範疇巢狀在另一個範疇內時，會發生什麼？

範疇可以像桶子套桶子一樣層層巢狀，形成多層級的範疇解析機制。JavaScript 在查找變數參考時，會從最內層範疇往外逐層搜尋。

### 在範疇解析中，彈珠的顏色由什麼決定？

彈珠代表變數，不同顏色代表它們被宣告的範疇。紅色彈珠代表在全域範疇宣告的變數，藍色代表在函式範疇宣告，綠色代表在更內層的函式範疇宣告。

### JavaScript 如何在巢狀範疇中查找變數參考？

JavaScript 先在當前範疇查找變數，若找不到則往外一層繼續查找，如此遞迴向外直到找到為止。若在所有可存取的範疇中都找不到，則拋出 ReferenceError。

### 當參數被傳入函式時，會發生什麼？

傳入的參數會在函式範疇中建立一個識別字，概念上類似於被賦予對應的值，並建立一顆對應範疇顏色的彈珠。

## 小測驗

<details>
<summary>範疇解析在查找變數時是如何運作的？</summary>
先檢查當前範疇，找不到再往外層移動
</details>

<details>
<summary>函式參數在範疇方面是如何處理的？</summary>
它們在其所在的本地範疇中建立識別字
</details>

<details>
<summary>函式宣告在範疇方面是如何處理的？</summary>
它們的識別字建立於其外層封閉範疇中
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記