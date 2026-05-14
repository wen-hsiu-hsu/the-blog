---
title: Callback Function 與 Web Browser APIs 的運作原理
description: 逐步拆解 `setTimeout` 在 JavaScript 引擎與瀏覽器之間的實際分工：說明 Facade Function 如何將計時工作外包給瀏覽器 Timer API，以及為何主執行緒不會等待計時完成，進而解釋非直覺的輸出順序。
date: 2026-05-14
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: JavaScript Hard Parts v3
order: 28
chapter: Asynchronous JavaScript & the event loop
tags:
    - JavaScript
    - CallbackFunction
    - WebAPI
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# Callback Function 與 Web Browser APIs 的運作原理

## JavaScript 引擎與瀏覽器環境的分工

JavaScript 引擎本身由三個核心部件組成：

| 元件                | 說明                       |
| ------------------- | -------------------------- |
| Memory              | 儲存變數與函式定義         |
| Thread of Execution | 單一、同步地逐行執行程式碼 |
| Call Stack          | 追蹤目前正在執行的函式     |

詳情可以參考 [[01-execution-context]] 與 [[02-call-stack]]

這三者之外，瀏覽器另外提供了 DOM、計時器（Timers）、網路存取（Network）、儲存空間（Storage）等功能。這些功能都存在於 JavaScript 引擎之外，並透過 **API（Application Programming Interface）** 的形式供 JavaScript 呼叫。

## 逐步追蹤：setTimeout 實際做了什麼

以下面的程式碼為例，逐步拆解每一個時間點發生的事情：

```javascript
function printHello() {
    console.log('Hello');
}

setTimeout(printHello, 1000);

console.log('Me first!');
```

### 第 1 步：宣告函式（0ms）

JavaScript 在記憶體中儲存 `printHello` 的函式定義。

### 第 2 步：呼叫 setTimeout（0ms）

`setTimeout` 接受兩個參數：

- **第一個參數**：callback function（要執行的程式碼），此處傳入 `printHello` 的參照
- **第二個參數**：延遲的毫秒數，此處為 `1000`

`setTimeout` 是一個**幻象函式（Facade Function）**，它在 JavaScript 這一側幾乎不做任何事，其真正的作用是在瀏覽器端啟動一個計時器（Timer）。計時器帶有兩份資訊：

- 計時長度：1000ms
- 完成後要執行的函式：`printHello`（以參照形式儲存）

計時器一旦在瀏覽器背景啟動，JavaScript 便立即結束這一行的工作，繼續往下執行。

### 第 3 步：執行 console.log（約 1ms）

JavaScript 的單執行緒繼續同步往下走，執行 `console.log("Me first!")`，輸出：

```
Me first!
```

此時全域程式碼執行完畢，但計時器仍在瀏覽器背景倒數。

### 第 4 步：計時器完成，執行回呼（1000ms）

1000ms 到期後，瀏覽器的計時器完成，`printHello` 被放入 Call Stack，JavaScript 為其建立新的執行環境，執行其中的 `console.log("Hello")`，輸出：

```
Hello
```

最終的輸出順序為：

```
Me first!
Hello
```

## 關鍵概念：為何執行順序不符合直覺？

許多人初次看到這段程式碼，會以為 JavaScript 必須先等計時器跑完再繼續。實際上，`setTimeout` 把計時工作完全外包給瀏覽器，JavaScript 的主執行緒從不停下來等待。

這正是幻象函式的本質，它的外觀與一般的 JavaScript 函式呼叫無異，但其真正觸發的工作發生在 JavaScript 引擎以外的瀏覽器層。計時器在背景獨立運行，完成後再透過特定機制（後續文章將介紹的 Callback Queue 與 Event Loop）把回呼函式送回 JavaScript 執行。

## 複習

### Web Browser 提供的功能（如 DOM、計時器、儲存空間、網路存取）與 JavaScript 引擎的關係是什麼？

這些功能存在於 JavaScript 引擎之外，屬於 Web Browser 的一部分。它們可以透過 API（Application Programming Interface，應用程式介面）從 JavaScript 中存取，但本身並不在 JavaScript 引擎內部運行。

### `setTimeout` 接受哪兩個參數？

第一個參數是 callback function（要執行的程式碼），第二個參數是執行前要延遲的毫秒數。

### 當 `setTimeout` 以 callback 和延遲時間被呼叫後，Web Browser 中會發生什麼事？

瀏覽器會啟動一個計時器，並帶有兩份資訊：延遲的毫秒數，以及計時完成後要執行的 callback function 的參照。計時器在背景倒數的同時，JavaScript 繼續執行後續的程式碼。

### 以下程式碼的 console 輸出順序為何？請說明原因。

```javascript
function printHello() {
    console.log('hello');
}
setTimeout(printHello, 1000);
console.log('me first');
```

輸出順序為先 'me first'，再 'hello'。原因是 `setTimeout` 把計時工作交給瀏覽器處理，JavaScript 主執行緒繼續同步往下執行。`console.log('me first')` 立即執行，而 `printHello` 則要等到 1000ms 計時完成後才會被執行。

## 小測驗

<details>
<summary>`setTimeout` 的計時功能實際上在哪裡執行？</summary>
在 Web Browser APIs 中執行
</details>

<details>
<summary>瀏覽器的計時器功能需要哪兩份資訊才能運作？</summary>
callback function 以及毫秒數
</details>

<details>
<summary>在 Web Browser 功能的脈絡中，API 這個縮寫代表什麼？</summary>
Application Programming Interface（應用程式介面）
</details>

<details>
<summary>JavaScript 主執行緒具有什麼特性？</summary>
單一（Single）且同步（Synchronous）
</details>

<details>
<summary>當 `setTimeout` 以 callback 和延遲時間被呼叫後，JavaScript 接下來會做什麼？</summary>
JavaScript 會立即繼續執行後續的程式碼
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
