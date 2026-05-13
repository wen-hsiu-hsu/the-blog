---
title: Promises、Async 與 Event Loop：為什麼 JavaScript 需要非同步機制
description: 說明 JavaScript 單執行緒同步執行模型的限制，以及耗時任務如何造成阻塞問題。介紹瀏覽器提供的 Web APIs（`setTimeout`、`fetch` 等）本質上是 Facade Functions，並預告 Event Loop 與 Callback Queue 的排程機制。
date: 2026-05-13
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: JavaScript Hard Parts v3
order: 27
chapter: 'Asynchronous JavaScript & the event loop'
tags:
    - JavaScript
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# Promises、Async 與 Event Loop：為什麼 JavaScript 需要非同步機制

這個章節將會包含以下四個核心主題：

- **Promises**：ES6 最重要的特性之一
- **Asynchronicity（非同步性）**：讓動態網頁應用成為可能的關鍵機制
- **Event Loop**：JavaScript 的優先排程系統（triage）
- **Microtask queue、Callback queue 與 Web Browser APIs**

## JavaScript 的執行模型回顧

在進入非同步之前，必須先確認 JavaScript 的基本執行特性。以下面的程式碼為例：

```javascript
const num = 3;

function multiplyBy2(inputNumber) {
    const result = inputNumber * 2;
    return result;
}

const output = multiplyBy2(num);
const newOutput = multiplyBy2(10);
```

JavaScript 執行這段程式碼時，必須完整進入 `multiplyBy2` 的執行環境、完成計算並取得回傳值後，才會繼續執行下一行。它不會在等待 `multiplyBy2` 的同時跳去執行其他事情。

這反映出 JavaScript 兩個核心特性：

- **Single-threaded（單執行緒）**：同一時間只有一個指令在執行
- **Synchronously executed（同步執行）**：每一行程式碼依照出現順序依序執行

## 問題：同步模型遇上耗時任務

現代網頁應用往往需要與外部伺服器溝通，例如向 TikTok 的伺服器請求影片連結。這類網路請求可能耗費數百毫秒。若 JavaScript 以同步方式等待回應，後續所有程式碼都必須暫停執行：

```javascript
const videos = getVideos('http://tiktok.com/will/1');
// 🚫 等待 350ms，請求送達 TikTok 伺服器

displayVideos(videos);
// 必須等 videos 取得後才能執行

// 其他程式碼
console.log('I want to runnnn!');
```

挑戰在於：我們需要等待 `videos` 資料回來才能呼叫 `displayVideos`，但在等待期間，其他所有程式碼（包括 `console.log`）都無法執行。

## setTimeout 能解決問題嗎？

直覺上可能會想到使用 `setTimeout` 來延遲執行：

```javascript
function printHello() {
    console.log('Hello');
}

// 延遲 1000ms 後執行 printHello
setTimeout(printHello, 1000);

console.log('Me first!');
```

若按照 JavaScript 的同步執行模型推理，應該要先等 1000ms 讓計時完成，再執行 `printHello`，最後才跑 `console.log("Me first!")`，輸出順序應為：

```
Hello
Me first!
```

但實際結果卻是：

```
Me first!
Hello
```

更令人困惑的是，即使把延遲設為 **0 毫秒**，結果依然相同：

```javascript
setTimeout(printHello, 0);
console.log('Me first!');
// 輸出：Me first! → Hello
```

這說明光靠「執行緒、記憶體、Call Stack」三者組成的傳統 JavaScript 模型，已經無法解釋實際的執行行為。

## JavaScript 並非獨立運行

JavaScript 實際上執行於瀏覽器或 Node.js 環境之中，這些宿主環境提供了許多 JavaScript 本身並不具備的功能。JavaScript 引擎的核心三元件為：

| 元件                           | 說明                           |
| ------------------------------ | ------------------------------ |
| Thread of Execution            | 逐行執行程式碼的執行緒         |
| Memory（Variable Environment） | 儲存應用程式當下所有資料的空間 |
| Call Stack                     | 追蹤目前正在執行哪個函式       |

僅靠這三者不足以支撐現代網頁應用，必須加入以下新元件：

- **Web Browser APIs / Node APIs（後台功能）**
- **Promises**
- **Event Loop**
- **Callback Queue（Task Queue）**
- **Microtask Queue**

## Web Browser 提供的功能（不屬於 JavaScript 本身）

瀏覽器環境提供了大量 JavaScript 本身並不內建的能力，包括：

| 功能             | JavaScript 中的存取標籤                    |
| ---------------- | ------------------------------------------ |
| DOM              | `document`                                 |
| 計時器（Timers） | `setTimeout` / `setInterval`               |
| 網路請求         | `fetch`（舊版為 `XMLHttpRequest` / `XHR`） |
| Console          | `console`                                  |
| Local Storage    | `localStorage`                             |
| IndexedDB        | `indexedDB`                                |
| Service Workers  | Service Worker API                         |
| 攝影機 / 麥克風  | Web APIs                                   |

這些看起來像是 JavaScript 函式，實際上是**幻象函式（Facade Functions）**，它們的外表像是在做 JavaScript 的工作，但本質上是觸發了 JavaScript 執行環境之外的瀏覽器層級功能。

例如，`setTimeout` 在 JavaScript 這一側幾乎什麼都不做，它真正啟動的是瀏覽器內建的計時器功能，計時完成後再透過特定機制把回呼函式送回 JavaScript 執行。這正是為何 0ms 延遲的 `setTimeout` 仍然會在同步程式碼後才執行，其背後的排程機制即是 **Event Loop** 與 **Callback Queue**，這些將在後續章節中詳細展開。

## 複習

### 為什麼以下程式碼即使延遲設定為 0 毫秒，仍然不會在「me first」之前印出「hello」？

```javascript
function printHello() {
    console.log('hello');
}
setTimeout(printHello, 0);
console.log('me first');
```

儘管延遲設定為 0 毫秒，`setTimeout` 本質上是一項 Web Browser 功能，運作於 JavaScript 正規執行模型之外。這段程式碼說明了 JavaScript 的單執行緒模型（執行緒、記憶體、Call Stack）並不足以解釋非同步行為。實際的執行順序是由 Callback Queue 與 Event Loop 等額外元件所決定的。

## 小測驗

<details>
<summary>為什麼在 JavaScript 中等待網路請求會造成問題？</summary>
網路請求會阻塞所有其他程式碼的執行
</details>

<details>
<summary>下列哪一項並非 JavaScript 本身的功能，而是瀏覽器提供的功能？</summary>
DOM
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
