---
title: 'Mock 函式實戰：vi.fn() 記錄呼叫細節、mock Math.random 的風險與依賴注入'
description: '這篇示範用 vi.fn() 建立全新的 mock 函式，取代 spy 包住既有函式的做法，適合當 callback prop 驗證呼叫情形；也示範 mock Math.random 讓亂數測試可預期，但點出改動函式行為會讓測試失真的風險，並說明比起直接 mock 內建函式，用依賴注入傳入可控函式更安全。'
date: 2026-10-03
section: dev
category: Testing Fundamentals
series: testing_fundamentals
seriesTitle: 'Testing Fundamentals'
order: 21
chapter: 'Stubs, Spies, and Mocks'
tags:
    - frontendMasters
    - testingFundamentals
    - JavaScript
    - Vitest
    - TestDoubles
    - Mocks
    - MockFn
    - MockImplementation
    - DependencyInjection
    - MockCalls
    - ItOnly
---

# Mock 函式實戰：vi.fn() 記錄呼叫細節、mock Math.random 的風險與依賴注入

延續前一篇用 `vi.spyOn` 監看既有函式的做法，這篇改用另一種 test double：憑空生出一個全新的 mock 函式，並實際示範把 mock 跟 spy 合併使用時要注意的風險。

## Mock 函式：憑空生出一個假函式，而不是包住既有的

`vi.spyOn` 包住的是一個原本就存在的函式，`vi.fn()` 做的事情不同：它直接生出一個全新的、本來不存在的假函式，可以拿這個假函式去呼叫任何東西：

```javascript
const mockFn = vi.fn();
```

這個函式本身沒有真正的邏輯，重點在於它會記錄下自己被呼叫的情形：誰呼叫了它、呼叫幾次、呼叫時帶了什麼參數。最實用的場景是把它當成一個回呼函式傳進去，例如一個 React 元件透過 `onSubmit` 或 `onClick` 這類 prop 接收外部傳入的函式，這時候就能把 mock 函式當成這個 prop 傳進去，事後檢查它有沒有真的被呼叫、呼叫時帶的參數對不對、呼叫次數符不符合預期。

## Spy 加上自訂實作：換一顆假的 Math.random，小心失真的風險

Mock 跟 spy 也可以合在一起用：先用 `vi.spyOn` 盯住 `Math.random`，再用 `mockImplementation` 替換掉它原本的行為：

```javascript
const randomSpy = vi.spyOn(Math, 'random').mockImplementation(() => 0.5);

const result = Math.random();

expect(result).toBe(0.5);
```

原本 `Math.random()` 會回傳一個 `0` 到 `1` 之間隨機的值，換成固定回傳 `0.5` 之後，不管跑幾次測試，結果都會是同一個數字。這一步正是 mock 危險的地方：改動的不只是攔截、觀察，而是直接動手改變了一個函式原本的運作方式，測試會變得很穩定，但也可能因此跟現實脫節，變成「測試綠燈亮著，但完全不代表程式碼真的沒問題」。

用一句話簡化這兩者的差異：spy 讓原本的東西照樣執行，只是在旁邊多看一眼；mock 則是直接換成自己想要的行為。這種說法沒辦法應付測試術語的較真派，但日常使用已經很夠用。

## 用假的隨機數字，讓骰子測試變得可預期

把 `Math.random` 固定成 `0.5` 之後，原本依賴隨機數的骰子測試就變得可以重複驗證：不管跑一次還是跑一百萬次，結果都會是同一個值，不用再煩惱隨機性帶來的不穩定測試。不過這裡也該反問自己一個問題：這樣做真的比單純寫「回傳值應該是某個數字」這種寬鬆斷言多帶來多少價值？答案不一定，這也呼應了先前提過的警告：工具能做的事很多，不代表每件事都該做。

## 更推薦的做法：依賴注入，把隨機邏輯用參數傳進去

比起直接伸手進去 mock 掉 JavaScript 內建的 `Math.random`，更推薦的做法是延續前面提過的依賴注入精神：把負責產生隨機結果的函式，改成用參數傳進去，預設值才是 `Math.random`。像「擲骰子產生角色能力值」這種情境，可以把擲骰子的函式當成最後一個參數傳進角色建立的函式，測試裡就能傳入自己控制的假函式，不需要動到全域的 `Math.random`：

```javascript
const rollDice = vi.fn(() => 15);

// ...把 rollDice 當成最後一個參數，傳進角色建立函式...

expect(character.strength).toBe(15);
```

## 用 mock.calls 檢查函式實際被呼叫的細節

除了確認回傳結果，傳進去的 `rollDice` 本身也是一個 mock 函式，可以拿來檢查它有沒有被用預期的方式呼叫。這裡用到的 `toHaveBeenCalledWith`、`toHaveBeenCalledTimes`，正是前一篇驗證 spy 時用過的同一組 matcher，只是這次驗證對象換成了 mock 函式。以擲骰子產生六項能力值（力量、智力、敏捷、體質、智慧、魅力）為例，`rollDice` 應該要被呼叫六次，每次都帶著「擲 4 顆 6 面骰」這組參數：

```javascript
expect(rollDice).toHaveBeenCalledWith(4, 6);
expect(rollDice).toHaveBeenCalledTimes(6);
```

`vi.fn()` 建立出來的函式，本身就帶著一個 `.mock` 物件，把每一次呼叫的細節都記錄下來，`mock.calls` 存放的是每次呼叫時帶的參數：

```javascript
console.log(rollDice.mock.calls);
// [[4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6]]
```

這種依賴注入的寫法，好處是不用去動任何全域內建的東西，透過觀察傳進去的這個「小小科學儀器」，就能知道被測試的程式碼實際上是怎麼使用它的，同時又完全不影響真實環境裡 `Math.random` 原本的行為。

## 順帶一提：it.only 別不小心 commit 上去

示範過程中提到一個常見地雷：`it.only` 這個寫法會讓測試執行器只跑這一個測試，其他測試全部跳過。這在開發階段很方便，可以先專心盯著一個測試除錯，但千萬別不小心把 `.only` 留在程式碼裡就 commit 上去，不然等於悄悄關掉了其他所有測試。

## 複習

### Spy 和 mock 函式在測試裡有什麼差異？

Spy 讓原本的函式照樣執行，同時在旁邊記錄它的呼叫情形；mock 函式則可以完全取代原本的函式，換成自訂的實作

### 使用 mock 函式時，可以追蹤到哪些關鍵資訊？

Mock 函式可以追蹤它被呼叫的次數、呼叫時帶的參數、回傳的值，也能用來驗證測試裡實際的使用情形

### 為什麼會想在測試裡 mock Math.random()？

Mock 掉 Math.random() 可以用固定的值取代原本的隨機行為，讓測試場景變得穩定、可預期，確保測試結果每次都能重現

### 呼叫過後，該怎麼檢查一個 mock 函式的使用情形？

可以用 mock.calls 看到每一次呼叫記錄下的參數，用 mock.results 看到每一次呼叫的回傳值，也能用 mock.calls.length 確認被呼叫了幾次

### 處理外部依賴時，有什麼建議的做法？

建議用依賴注入，把函式或依賴以參數的形式傳進去，這樣測試時要替換、mock 這些外部行為都會更容易

## 小測驗

<details>
<summary>在測試裡使用 mock 函式的主要目的是什麼？</summary>
用一個可控制的實作，取代真正的函式，作為測試用途
</details>

<details>
<summary>當 spy 監看 Math.random 並提供自訂實作時，可以做到什麼？</summary>
可以把這個函式的行為換成一個可預期的固定輸出
</details>

<details>
<summary>Spy 跟 mock 最關鍵的差異是什麼？</summary>
Spy 是觀察原本的函式，mock 則是直接取代函式的行為
</details>

<details>
<summary>使用 mock 函式時，還能額外取得哪些資訊？</summary>
函式被呼叫的次數、傳入的參數，以及回傳值
</details>

<details>
<summary>處理外部依賴時，有什麼建議的做法？</summary>
用依賴注入傳入可控制的函式
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Testing Fundamentals](https://master.dev/courses/testing/) 課程筆記
