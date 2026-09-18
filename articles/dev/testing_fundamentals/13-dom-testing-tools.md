---
title: 'DOM 測試工具：Node 裡沒有瀏覽器，用 JSDOM 或 HappyDOM 假裝有一個真瀏覽器'
description: '講師 Steve Kinney 說明測試其實在 Node 裡執行、根本沒有 DOM 可用，因此需要 JSDOM 或 HappyDOM 在 Node 裡重建瀏覽器 API；並比較兩者準確度與效能的取捨，說明這種做法介於純函式測試與真正啟動瀏覽器之間，也示範怎麼在 vitest 設定裡切換 environment。'
date: 2026-09-18
section: dev
category: Testing Fundamentals
series: testing_fundamentals
seriesTitle: 'Testing Fundamentals'
order: 13
chapter: 'Testing the DOM'
tags:
    - frontendMasters
    - testingFundamentals
    - JavaScript
    - Vitest
    - DOMTesting
    - JSDOM
    - HappyDOM
---

# DOM 測試工具：Node 裡沒有瀏覽器，用 JSDOM 或 HappyDOM 假裝有一個真瀏覽器

## 測試其實不是在瀏覽器裡跑的

前端工程師的日常工作大多圍繞著瀏覽器，但截至目前為止寫的所有測試，其實都不是在瀏覽器裡執行的，而是跑在 Node 裡。Node 確實能執行 JavaScript，但它終究不是瀏覽器，沒有瀏覽器提供的那些 API，其中就包含 DOM。也就是說，Node 環境裡本來就沒有 DOM 可以操作，照理說根本沒辦法測試任何跟 DOM 相關的程式碼。

## 用 JSDOM 或 HappyDOM 在 Node 裡假裝有 DOM

解決方式很直接：騙過去。有幾套函式庫專門在 Node 環境裡重新實作瀏覽器的 API，讓 `document.querySelector`、`window` 這類原本只存在瀏覽器裡的東西，在 Node 裡也能用。用 Jest 的話，JSDOM 是內建的；用 Vitest 則可以在 JSDOM 跟 HappyDOM 之間選一個。

JSDOM 是比較早出現的方案，把整套 DOM 規格用 JavaScript 重新實作了一遍，把瀏覽器的各種 API 補回 Node 環境裡。HappyDOM 則是比較新、比較輕量的替代方案。兩者的取捨很單純：HappyDOM 比較小、比較快，涵蓋一般常見的情境（例如把 DOM 節點塞進文件、確認它有沒有出現）綽綽有餘；JSDOM 比較龐大、比較重，但實作更貼近真實規格，遇到比較刁鑽的邊界案例時比較靠得住。Steve 坦言自己選 HappyDOM 純粹是因為喜歡這個名字，選哪一個其實都可以。

## 不是真瀏覽器：準確度與效能的取捨

不管選哪一套，都要記得這終究不是真正的瀏覽器，沒辦法抓到特定瀏覽器（例如 Safari 或 Firefox）獨有的行為差異，畢竟它只是一個規格上盡量相容的模擬實作。

效能上也有代價：與其什麼都不做，用一套完整模擬 DOM 的環境去跑測試，本來就會比純粹跑 JavaScript 邏輯慢一些。但這個代價幾乎感覺不到，真正會拖慢開發節奏的，反而是測試套件本身跑得太久，導致大家乾脆減少執行測試的頻率。不管測試需要多久，開發者還是會盯著 PR 上的檢查狀態，等到全部變成綠燈才安心，這個等待的心理成本比多出來的那幾毫秒執行時間實際得多。

## 適用場景：介於純函式測試與整個瀏覽器之間

如果要測試的只是一個接收兩個數字或字串、回傳運算結果的函式，不需要用到這些工具。但如果程式碼牽涉到操作 DOM，理論上也可以選擇啟動一整個瀏覽器來測，畢竟前面幾篇提過，透過瀏覽器實際導覽頁面的測試很有價值。問題是啟動一整個瀏覽器、載入整個頁面，只為了驗證某個字串有沒有正確改變，成本未免太高。

JSDOM 或 HappyDOM 剛好填補了這個中間地帶：不需要真的把整個應用程式在瀏覽器裡跑起來，也能驗證「這段程式碼會不會正確操作 DOM」，很適合用來測試單一元件、確認某個事件監聽器有沒有正確掛上去，這類介於單純函式邏輯與完整瀏覽器整合測試之間的情境。

## 在 Vitest 裡切換測試環境

Vitest 預設的測試環境是 `node`，只要把設定改成 `happy-dom` 或 `jsdom`，測試執行時就會連帶載入對應的 DOM 模擬環境：

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'happy-dom',
    },
});
```

把 `environment` 換成 `'jsdom'`，就會改用 JSDOM 這套模擬環境。

另外一個常用設定是 `globals`。Vitest 預設要求手動從套件裡匯入 `describe`、`expect`、`it` 這些函式；而 Jest 則是把這些函式全域掛在環境裡，不用匯入就能直接使用。把 Vitest 的 `globals` 設定打開，就能讓 Vitest 的行為更貼近 Jest，不用每個測試檔案都手動匯入這些函式。

## 複習

### 為什麼以 Node 為基礎的測試預設無法存取 DOM？

Node 可以執行 JavaScript，但沒有像 DOM 這樣的瀏覽器 API。因為 Node 本身不是瀏覽器，缺少測試 DOM 相關程式碼所需的瀏覽器功能，這正是 JSDOM、HappyDOM 這類工具存在的原因，它們的用途就是在 Node 環境裡模擬出 DOM

### 有哪兩套函式庫可以在 Node 裡模擬瀏覽器 API 來進行測試？

JSDOM 與 HappyDOM 都能在 Node 環境裡重新實作瀏覽器 API，讓 DOM 測試得以進行

### 使用 JSDOM 或 HappyDOM 這類函式庫，主要的好處是什麼？

這些函式庫能在不用啟動完整瀏覽器的情況下測試跟 DOM 相關的程式碼，讓測試更快、更有效率，同時提供符合規格的瀏覽器 API 替代實作

### 該怎麼設定 Vitest 使用 DOM 模擬環境？

在 Vitest 的設定裡，把 `environment` 這個字串從 `'node'` 改成 `'happy-dom'` 或 `'jsdom'` 即可

### 使用 JSDOM、HappyDOM 這類 DOM 模擬函式庫，有什麼取捨要考慮？

這些函式庫會帶來一些額外的效能負擔，也不是真正瀏覽器的完全複製品，但這個效能影響通常感覺不出來，實務上依然很適合用來測試跟 DOM 互動的程式碼

## 小測驗

<details>
<summary>在 Node 裡測試跟 DOM 相關的程式碼，主要的限制是什麼？</summary>
Node 缺少瀏覽器 API 與 DOM 的實作
</details>

<details>
<summary>哪些函式庫能在 Node 環境裡提供 DOM 的 JavaScript 實作、用於測試？</summary>
JSDOM 與 HappyDOM
</details>

<details>
<summary>使用 DOM 模擬函式庫的主要優點是什麼？</summary>
比啟動完整瀏覽器執行測試的速度更快
</details>

<details>
<summary>在 Vitest 裡，哪個設定選項能切換 DOM 模擬環境？</summary>
environment 這個參數
</details>

<details>
<summary>DOM 模擬函式庫適合用在什麼樣的情境？</summary>
測試單一元件與事件監聽器
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Testing Fundamentals](https://master.dev/courses/testing/) 課程筆記
