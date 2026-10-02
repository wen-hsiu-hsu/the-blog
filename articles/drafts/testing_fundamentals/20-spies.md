---
title: 'Spy 實戰：用 vi.spyOn 監看 console.log，驗證回傳值抓不到的副作用有沒有發生'
description: '用 vi.spyOn 監看 console.log，示範 spy 不像 mock 會取代原函式，而是在旁邊觀察呼叫次數與參數，搭配 toHaveBeenCalled、toHaveBeenCalledWith、toHaveBeenCalledTimes 驗證回傳值裡看不到的副作用，例如避免 API 被打太多次。'
date: 2026-10-02
section: dev
category: Testing Fundamentals
series: testing_fundamentals
seriesTitle: 'Testing Fundamentals'
order: 20
chapter: 'Stubs, Spies, and Mocks'
tags:
    - frontendMasters
    - testingFundamentals
    - JavaScript
    - Vitest
    - TestDoubles
    - Spies
    - SpyOn
    - ToHaveBeenCalled
    - SideEffects
---

# Spy 實戰：用 vi.spyOn 監看 console.log，驗證回傳值抓不到的副作用有沒有發生

延續前一篇對 Test Double 的概念介紹，這篇實際動手示範 mock 跟 spy 的差別，並聚焦在 spy 怎麼用。

## Mock 跟 Spy，濃縮成一句話的差異

Mock 是一個打算拿來當替身的函式，直接取代原本要呼叫的東西。Spy 則保留原本的函式不動，只是在外面包上一層，用來在旁邊觀察它的呼叫情形。

## 用 vi.spyOn 監看 console.log

要用到 `vi` 這個工具，可以直接 import，也可以在 Vitest 設定裡打開 globals 選項，讓 `vi` 變成全域變數不用另外 import。講師自己習慣在每個測試檔案裡都明確 import，主要是因為這樣編輯器的型別提示（IntelliSense）比較準，但兩種寫法都可以：

```javascript
import { vi } from 'vitest';

const logSpy = vi.spyOn(console, 'log');
```

`vi.spyOn` 的意思是，拿一個既有的函式，這裡是 `console` 物件上的 `log` 方法，告訴 Vitest 不要改動它原本的行為，只是想在旁邊盯著它，之後可以回頭確認它有沒有被呼叫過。

## Spy 不改變任何行為，只負責在旁邊觀察

包上 spy 之後的 `console.log`，還是原本認識的那個 `console.log`，呼叫它一樣會正常印出東西：

```javascript
console.log('hello');
```

差別在於，spy 會在真正執行 `console.log` 之前，先攔截這次呼叫並記錄一筆，之後就可以拿這筆紀錄去做斷言：

```javascript
expect(logSpy).toHaveBeenCalled();
```

如果 `console.log` 沒有真的被呼叫過，這個斷言就會失敗。這代表不管是要寫到 canvas 上、跳出一個 alert，還是單純呼叫 `console.log`，只要想確認的是「這個副作用有沒有真的發生」，spy 都能派上用場。

## 用 toHaveBeenCalledWith 確認呼叫時帶的參數對不對

光確認「有沒有被呼叫」有時候不夠，還會想知道呼叫的時候到底帶了什麼參數進去：

```javascript
expect(logSpy).toHaveBeenCalledWith('hello');
```

Spy 完全不會取代或修改原本的函式，它做的事情純粹是在旁邊觀察：如果一個函式帶有某種呼叫外部世界的副作用、但這個副作用不會反映在回傳值裡，spy 就是用來確認這個副作用確實按照預期發生過的工具。

## 也能拿來確認呼叫次數，例如避免 API 被打太多次

除了確認有沒有被呼叫、呼叫時帶了什麼參數，spy 也能拿來確認一個函式被呼叫了幾次，例如擔心某個函式不小心把 API 打了太多次：

```javascript
expect(logSpy).toHaveBeenCalledTimes(1);
```

這幾個 matcher 本質上都是同一件事的不同切角：確保那些沒辦法從回傳值裡直接看到的副作用，真的照著預期的方式被觸發了。

## 複習

### Mock 跟 spy 在測試裡的差異是什麼？

Mock 是取代原本函式的替身函式，spy 則是保留原本的函式不動，額外具備觀察並追蹤它的呼叫情形跟參數的能力

### 該怎麼用 vi.spyOn() 觀察一個函式在測試中的行為？

用 vi.spyOn() 包住一個既有的函式（例如 console.log），可以追蹤它的呼叫次數、呼叫時帶的參數，同時確保它原本的行為完全不受影響

### 搭配 spy 可以用哪些方法驗證函式的呼叫情形？

可以用 toHaveBeenCalled()、toHaveBeenCalledTimes()、toHaveBeenCalledWith() 這類方法，驗證函式被呼叫的次數，以及呼叫時帶的參數

### Spy 在測試裡主要用在什麼場景？

Spy 特別適合用來驗證副作用，例如確認一個函式有沒有被呼叫、呼叫了幾次、呼叫時帶了什麼參數，尤其是那些會跟 API、log 這類外部系統互動的函式

### Spy 跟直接取代一個函式有什麼不同？

Spy 不會取代或改變原本函式的實作，而是包住它，在維持原本行為的同時，也能追蹤並觀察它的呼叫情形

## 小測驗

<details>
<summary>在測試裡使用 vi.spyOn 的主要目的是什麼？</summary>
追蹤副作用與方法呼叫情形
</details>

<details>
<summary>使用 spy 時，可以驗證關於方法呼叫的哪些資訊？</summary>
以上皆是
</details>

<details>
<summary>使用 spy 的主要優點是什麼？</summary>
可以檢查回傳值裡看不到的副作用
</details>

<details>
<summary>Mock 跟 spy 在測試裡最主要的差異是什麼？</summary>
Mock 是取代函式的替身，spy 則是包住既有函式、額外加上觀察能力
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Testing Fundamentals](https://master.dev/courses/testing/) 課程筆記
