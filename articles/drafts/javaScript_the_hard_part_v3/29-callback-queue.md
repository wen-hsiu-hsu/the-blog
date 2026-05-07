---
title: Callback Queue 與執行規則：非同步回呼如何回到 JavaScript
description: 說明 Callback Queue（Task Queue）的運作機制與嚴格的執行條件：來自 Web Browser APIs 的回呼函式不會直接回到 Call Stack，而是進入佇列等候，直到所有全域程式碼執行完畢後才能執行。並以 `setTimeout(fn, 0)` 搭配同步阻塞函式的範例，逐步拆解實際的輸出順序。
date: 2026-05-14
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 29
chapter: 'Asynchronous JavaScript & the event loop'
tags:
    - JavaScript
    - CallbackQueue
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# Callback Queue 與執行規則：非同步回呼如何回到 JavaScript

JavaScript 是一個高度可預測的環境，同步執行意味著每一行程式碼的執行順序都是確定的。然而，一旦開始與瀏覽器外部功能互動（如計時器、網路請求），外部世界的不確定性就會介入，回應可能快、可能慢、也可能永遠不來。為了保住 JavaScript 的可預測性，必須有一套嚴格的規則來管理「外部工作完成後，如何安全地回到 JavaScript 執行」。

## Callback Queue 登場

以下面的程式碼為例：

```javascript
function printHello() {
    console.log('Hello');
}

function blockFor1Sec() {
    // 在 JavaScript 執行緒中阻塞整整 1 秒（如複雜的 for loop）
}

setTimeout(printHello, 0);
blockFor1Sec();
console.log('Me first!');
```

### 0ms：宣告兩個函式

`printHello` 與 `blockFor1Sec` 的函式定義被存入全域記憶體。

### 0ms：呼叫 setTimeout

`setTimeout` 作為幻象函式，在瀏覽器端啟動一個 **0ms 計時器**，並附帶 `printHello` 的函式參照作為完成後要執行的回呼。

**0ms 計時器幾乎立刻完成。** 那麼 `printHello` 應該馬上被放回 Call Stack 執行嗎？

答案是否定的。`printHello` 不會直接回到 Call Stack，而是被放入一個新的結構：**Callback Queue（又稱 Task Queue）**，在那裡等候。

### 1ms：執行 blockFor1Sec

JavaScript 繼續往下同步執行，呼叫 `blockFor1Sec()`，將其加入 Call Stack，建立新的執行環境，並在 JavaScript 主執行緒中連續運算整整 1000ms。

在這 1000ms 期間，`printHello` 雖然早已在 Callback Queue 中等待，但它完全無法插隊，因為 Call Stack 並非空的。

### 1001ms：blockFor1Sec 結束

`blockFor1Sec` 從 Call Stack 中彈出，回到全域。此時 Call Stack 雖然空了，但全域程式碼尚未執行完畢。

**`printHello` 仍然不能執行。**

### 1001ms：執行 console.log

JavaScript 繼續執行全域程式碼的最後一行：

```
Me first!
```

### 1002ms：全域程式碼執行完畢，printHello 終於執行

所有全域程式碼跑完後，Call Stack 清空，JavaScript 才從 Callback Queue 中取出 `printHello`，加入 Call Stack，建立新的執行環境，輸出：

```
Hello
```

## 核心規則：Callback Queue 的執行條件

這個執行順序並非巧合，而是由一條嚴格的規則決定的：

> **Callback Queue 中的函式，必須等到所有全域程式碼執行完畢、Call Stack 完全清空後，才能被取出並加入 Call Stack 執行。**

這條規則看似嚴苛，但它保障了 JavaScript 的根本可預測性：全域程式碼永遠會完整跑完，不會在任意時刻被非同步的回呼函式打斷。無論 Callback Queue 中有多少函式在等待，它們都只能在全域執行結束後才有機會運行。

負責監控「Call Stack 是否清空、Callback Queue 是否有待執行的函式」，並決定何時把回呼送上 Call Stack 的機制，就是 **Event Loop**，這將在後續文章中說明。

## 複習

### 當 `setTimeout` 的延遲設定為 0 毫秒時，它的 callback 會立刻被放到 Call Stack 上執行嗎？

不會。即使延遲為 0 毫秒，callback function 也不會直接進入 Call Stack，而是被放入 Callback Queue（又稱 Task Queue）等候，直到所有全域程式碼執行完畢後，才能被加入 Call Stack 執行。

### Callback Queue（Task Queue）是什麼？它在 JavaScript 執行模型中的作用是什麼？

Callback Queue 是外部世界（例如 Web Browser 功能）與 JavaScript 引擎之間的介面。來自非同步操作、已準備好執行的函式會被放入此佇列，等候所有全域程式碼執行完畢後，才能被加入 Call Stack 執行。

### Web Browser APIs 是什麼？它們與 JavaScript 執行的關係是什麼？

Web Browser APIs（API 為 Application Programming Interface 的縮寫）是由瀏覽器提供、存在於 JavaScript 執行環境之外的功能。它們讓 JavaScript 得以使用計時器、網路請求、DOM 操作等瀏覽器能力。`setTimeout` 等函式是幻象函式（Facade Functions），作為 JavaScript 與這些瀏覽器功能之間的介面。

### 決定 Callback Queue 中的函式何時可以執行的嚴格規則是什麼？

Callback Queue 中的函式必須等到所有全域程式碼執行完畢、Call Stack 完全清空後，才能被加入 Call Stack 執行。這意味著，即使一個 callback 立即就緒（例如 0ms 計時器），它也必須等候所有同步的全域程式碼執行完成後才能運行。

### 當 `setTimeout` 以函式和延遲值被呼叫時，會發生什麼事？請描述 JavaScript 與瀏覽器之間的流程。

`setTimeout` 被呼叫時，它把函式定義（不是呼叫它）和延遲值傳給瀏覽器的計時器功能。瀏覽器在背景啟動計時器。計時器完成後，該函式被放入 Callback Queue（不是直接放到 Call Stack），在那裡等候所有全域程式碼執行完畢後才能運行。

## 小測驗

<details>
<summary>Callback Queue（Task Queue）在 JavaScript 中的作用是什麼？</summary>
它存放來自 Web Browser APIs 的函式，等候所有全域程式碼執行完畢後才能執行
</details>

<details>
<summary>在程式碼範例中，`printHello` 的「Hello」和全域程式碼的「Me first」，哪一個先被輸出到 console？</summary>
「Me first」
</details>

<details>
<summary>在 JavaScript 中呼叫 `setTimeout` 時會發生什麼事？</summary>
它在 Web Browser 中觸發一個計時器，並儲存要稍後執行的 callback function
</details>

<details>
<summary>Callback Queue 中的函式可以被執行的基本規則是什麼？</summary>
只有在 Call Stack 清空且所有全域程式碼執行完畢後，才能執行
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
