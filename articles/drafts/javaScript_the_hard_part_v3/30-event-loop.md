---
title: Event Loop：JavaScript 非同步執行的調度核心
description: 說明 Event Loop 的運作原理：它持續檢查 Call Stack 是否清空、全域程式碼是否執行完畢、Callback Queue 是否有待執行的函式，並在三個條件同時成立後才將回呼送上 Call Stack。同時整理 JavaScript 非同步執行模型的完整架構，包含 JavaScript 引擎、Web Browser APIs、Callback Queue 與 Event Loop 之間的分工。
date: 2026-05-15
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: JavaScript Hard Parts v3
order: 30
chapter: Asynchronous JavaScript & the event loop
tags:
    - JavaScript
    - EventLoop
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# Event Loop：JavaScript 非同步執行的調度核心

## 缺少的最後一塊拼圖

[[29-callback-queue|前面]] 已經建立了以下架構：JavaScript 引擎透過 Facade Function 觸發瀏覽器功能，背景工作完成後，回呼函式進入 Callback Queue 等待。但還剩一個問題沒有解答：

**JavaScript 怎麼知道 Call Stack 是否清空了？怎麼知道全域程式碼是否跑完了？又怎麼知道 Callback Queue 裡有東西在等？**

負責回答這三個問題的機制就是 **Event Loop**。

## Event Loop 的運作原理

Event Loop 位於 Callback Queue 與 Call Stack 之間，它的工作單純且不間斷：在每一個任務執行前，反覆確認以下條件：

1. Call Stack 是否完全清空？
2. 所有全域程式碼是否已執行完畢？
3. Callback Queue 中是否有待執行的函式？

只要上述三個條件同時成立，Event Loop 才會從 Callback Queue 取出函式，放入 Call Stack 執行。

## 以先前的程式碼確認 Event Loop 的行為

回顧這段程式碼：

```javascript
function printHello() {
    console.log('Hello');
}

function blockFor1Sec() {
    // 在 JavaScript 執行緒中阻塞 1 秒
}

setTimeout(printHello, 0);
blockFor1Sec();
console.log('Me first!');
```

Event Loop 在每個時間點的檢查結果如下：

| 時間點       | Call Stack 狀態                         | 全域程式碼                 | Callback Queue    | Event Loop 決定 |
| ------------ | --------------------------------------- | -------------------------- | ----------------- | --------------- |
| 0ms          | 空（setTimeout 為幻象函式，不佔 Stack） | 未完成                     | printHello 已入列 | 等待            |
| 1ms ~ 1000ms | blockFor1Sec 執行中                     | 未完成                     | printHello 等待   | 等待            |
| 1001ms       | 空                                      | 未完成（還有 console.log） | printHello 等待   | 等待            |
| 1001ms       | console.log 執行中                      | 未完成                     | printHello 等待   | 等待            |
| 1002ms       | 空                                      | **完成**                   | printHello 等待   | **取出並執行**  |

即使 `printHello` 在 0ms 就已就緒，也必須一路等到全域程式碼完整跑完，Event Loop 才會放行。

## 完整架構總覽

至此，JavaScript 的執行模型從最初的三個核心擴展為一個完整的非同步系統：

**JavaScript 引擎（同步核心）**

- Thread of Execution：單執行緒，同步逐行執行
- Memory：儲存變數與函式定義
- Call Stack：追蹤目前正在執行的函式

**瀏覽器環境（非同步後端）**

- Web Browser APIs：計時器、網路請求、DOM 等功能
- 幻象函式（Facade Functions）：外觀與用法如同一般 JavaScript 函式，但實際觸發的是瀏覽器功能

**兩者之間的橋樑**

- Callback Queue：存放背景工作完成後、等待執行的回呼函式
- Event Loop：持續檢查 Call Stack 與 Callback Queue，在條件滿足時將函式從佇列送上 Call Stack

## 為何規則如此嚴格？

允許回呼函式在任意時刻插入執行，會讓程式碼的執行順序變得完全不可預測。反之，**確保所有全域程式碼必須完整執行完畢**，才允許任何 Callback Queue 中的函式執行，保證了一個核心承諾：全域程式碼的執行不會在任何時間點被非同步的回呼打斷。

這條嚴格的規則，正是 JavaScript 在面對不可預測的外部世界時，維持自身可預測性的根本手段。

## 複習

### Event Loop 在 JavaScript 中的主要職責是什麼？

Event Loop 持續檢查三件事：（1）Call Stack 是否清空？（2）所有全域程式碼是否執行完畢？（3）Callback Queue 中是否有待執行的函式？它不斷重複這些檢查，以決定何時可以將 Callback Queue 中的函式移至 Call Stack 執行。

### 一個函式要從 Callback Queue 移至 Call Stack，必須同時滿足哪兩個嚴格條件？

Call Stack 必須完全清空，**且**所有全域程式碼必須執行完畢。只有當兩個條件同時成立時，Event Loop 才允許 Callback Queue 中的函式被執行。

### JavaScript 中的幻象函式（Facade Functions）是什麼？

幻象函式是外觀和行為看起來與一般 JavaScript 函式相同的函式（以括號呼叫、可傳入參數），但實際上觸發的是 Web Browser 功能或 Node 的後台功能。它們作為 JavaScript 與瀏覽器或 Node APIs 之間的介面。

### 如果一個瀏覽器功能立即完成，其對應的 callback function 可以立刻在 JavaScript 中執行嗎？

不行。即使背景工作立即完成，對應的 callback function 仍然必須被放入 Callback Queue 等待。在 Call Stack 清空且所有全域程式碼執行完畢之前，由 Event Loop 確認條件成立後，它才能執行。

### 為什麼 Callback Queue 在 JavaScript 的非同步執行模型中是必要的？

Callback Queue 的存在是為了維護 JavaScript 的可預測性。由於 JavaScript 只有單一執行緒，由背景工作觸發的函式需要一個有秩序的地方等待，而不是在不可預測的時刻直接執行。這確保了程式碼以受控且有序的方式運行。

## 小測驗

<details>
<summary>Event Loop 在 JavaScript 中的主要工作是什麼？</summary>
持續檢查 Call Stack 是否清空、全域程式碼是否執行完畢，以及 Callback Queue 中是否有待執行的函式
</details>

<details>
<summary>一個 callback 要從 Callback Queue 移至 Call Stack，需要滿足什麼條件？</summary>
Call Stack 必須清空，且所有全域程式碼必須執行完畢
</details>

<details>
<summary>JavaScript 中的幻象函式（Facade Functions）是什麼？</summary>
外觀看起來像 JavaScript 函式，但實際上觸發瀏覽器或 Node 後台功能的函式
</details>

<details>
<summary>背景工作完成後，callback function 在哪裡等待執行？</summary>
在 Callback Queue 中等待
</details>

<details>
<summary>一個立即完成的 callback function 可以立刻執行嗎？</summary>
不行，它仍然必須在 Callback Queue 中等待，直到 Call Stack 清空且全域程式碼執行完畢
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
