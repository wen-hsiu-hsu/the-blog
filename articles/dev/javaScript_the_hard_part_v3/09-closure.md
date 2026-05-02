---
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 9
title: JavaScript Closure（閉包）：原理與核心應用
description: 說明 JavaScript Closure（閉包）的運作原理：函式執行後本地記憶體為何清空、回傳函式如何讓資料得以持久保存，以及 Closure 如何成為 once、memoize、Module Pattern 與非同步回呼的基礎機制。
date: 2026-04-28
section: dev
category: JavaScript Hard Parts v3
chapter: Closure
tags:
    - JavaScript
    - Closure
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# JavaScript Closure（閉包）：原理與核心應用

## 為什麼 Closure 重要？

Closure 是 JavaScript 中最深奧、也最強大的概念之一。它是以下所有進階功能的根基：

| 功能 / 模式                  | 說明                               |
| ---------------------------- | ---------------------------------- |
| `once` 函式                  | 限制某函式只能被呼叫一次           |
| `memoize` 函式               | 快取運算結果，避免重複執行耗時運算 |
| Module Pattern               | JavaScript 的模組設計模式          |
| Iterators（迭代器）          | 每次呼叫回傳陣列的下一個元素       |
| Partial Application          | 函數式程式設計的核心技術           |
| 非同步回呼（Async Callback） | 確保回呼函式執行時仍能取得所需資料 |

## 回顧：函式執行的基本行為

在理解 Closure 之前，必須先確認函式的基本運作方式。

先看看以下程式碼

```javascript
function multiplyBy2(inputNumber) {
    const result = inputNumber * 2;
    return result;
}

const output = multiplyBy2(7);
const newOutput = multiplyBy2(10);
```

每次呼叫函式時，JavaScript 會：

1. **建立全新的執行環境（Execution Context）**，擁有獨立的本地記憶體（Local Memory）
2. 在本地記憶體中儲存該次執行所需的資料（例如 `inputNumber = 7`）
3. 函式執行完畢後，**本地記憶體全數刪除**，只留下 `return` 的值
4. 下一次呼叫（例如傳入 `10`）**完全從頭開始**，不記得上次傳入的是 `7`

這種「無記憶性」讓函式具有可預測性（predictability）。在程式碼任何地方呼叫 `multiplyBy2(7)`，結果永遠只取決於當下的輸入，不受過去影響。

## 核心問題：函式能不能「記住」東西？

### 現行限制

```
函式執行完畢 → 本地記憶體清空 → 下次呼叫重新開始
```

函式**無法**記住自己被呼叫過幾次，或上次執行時的中間資料

### 假設我們能突破這個限制

如果函式能在兩次執行之間**保留資料**，就能做到：

- 記錄自己已被呼叫幾次（實現 `once`）
- 快取上次的運算結果（實現 `memoize`）
- 在非同步環境中，保存回呼函式稍後執行所需的資料

這樣的持久記憶體將附加在**函式定義本身**旁邊，而非存在於某次執行的暫時空間中。

## Closure 的起點

Closure 的核心機制是：**從一個函式內部回傳另一個函式**。

- 這不是單純的 Higher-Order Function（接收函式作為參數）
- 而是**回傳函式**這個動作，使得被回傳的函式能「帶走」其出生環境的資料
- 後續章節將透過程式碼逐步展示這個機制如何運作

## 複習

### 函式執行完畢後，其本地記憶體（變數環境）會發生什麼事？

函式執行完畢後，其本地記憶體會被刪除，只保留回傳值。每次函式執行時，都會建立全新的執行環境與暫時性的本地記憶體，確保函式每次都從乾淨的狀態開始，不保留任何上次執行的記憶。

### Closure 能實現哪兩個實用的工具函式？

- `once` 函式：限制某函式最多只能被呼叫的次數。
- `memoize` 函式：儲存耗時運算的結果，當函式以相同輸入再次被呼叫時，直接回傳快取值，避免重複執行。

### Closure 與 JavaScript 的非同步回呼有什麼關係？

Closure 確保非同步回呼函式在最終被呼叫時，仍能取得所需的資料。例如，當從網路獲取資料（如取得影片清單）時，回呼函式在稍後執行時，能透過 Closure 存取到它所需的變數。

### 函式執行環境中的「變數環境（variable environment）」或「狀態（state）」是指什麼？

變數環境（又稱 state）是指函式執行期間，存放所有本地變數與資料的空間（即本地記憶體）。它包含函式執行過程中可存取的所有變數與內容。

### JavaScript 中哪些設計模式與功能依賴 Closure？

Closure 是以下功能的根基：Module Pattern（模組模式）、JavaScript 的內建模組、Iterators（迭代器，每次呼叫回傳陣列的下一個元素）、函數式程式設計中的 Partial Application（部分應用），以及 JavaScript 的非同步機制。

## 小測驗

<details>
<summary>函式執行完畢後，其本地記憶體會怎樣？</summary>
除了回傳值以外，其餘本地記憶體全數被刪除
</details>

<details>
<summary>函式執行環境中的「變數環境（variable environment）」是指什麼？</summary>
函式執行期間，用來儲存變數與資料的空間（即本地記憶體）
</details>

<details>
<summary>JavaScript 中哪個特性讓函式能在多次執行之間保留資料？</summary>
Closure（閉包）
</details>

<details>
<summary>`once` 函式透過 Closure 達成什麼目的？</summary>
限制某函式只能被呼叫一次（或特定次數）
</details>

<details>
<summary>`memoize` 函式帶來什麼好處？</summary>
避免重複執行已完成過的耗時運算，直接回傳快取的結果
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
