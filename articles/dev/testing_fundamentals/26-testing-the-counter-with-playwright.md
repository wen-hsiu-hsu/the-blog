---
title: 'Playwright 測 Accident Counter：locator 是惰性的，光呼叫不等於有驗證'
description: '這篇用 Playwright 測試熟悉的 Accident Counter app，示範 page.goto 搭配無障礙查詢也能用在整個頁面上；也拆解一個容易被忽略的細節：單純呼叫 page.getByTestId() 不會真的查 DOM，locator 是惰性的，要真正做出動作或搭配斷言才會觸發檢查。'
date: 2026-10-05
section: dev
category: Testing Fundamentals
series: testing_fundamentals
seriesTitle: 'Testing Fundamentals'
order: 26
chapter: 'End-To-End Testing'
tags:
    - frontendMasters
    - testingFundamentals
    - JavaScript
    - Playwright
    - EndToEndTesting
    - BrowserAutomation
    - Locators
    - ToBeVisible
    - Actionability
---

# Playwright 測 Accident Counter：locator 是惰性的，光呼叫不等於有驗證

延續前一篇對 Playwright 的概觀介紹，這篇換成系列前面一直在用的 Accident Counter（天數計數器）app，實際示範怎麼幫它寫一個端對端測試。

## 跑 Playwright 測試前，開發伺服器要先起來

跟單元測試不同，Playwright 測試的前提是應用程式本身得先跑起來，才有東西可以測。如果是純前端的用戶端應用程式，這件事很容易在測試一開始就用程式自動處理掉；比較麻煩的是牽涉到網路請求的情境，這部分有兩種模擬方式，之後會再另外討論。

## test.beforeEach 導向頁面，這招放哪個頁面都通用

用 `test.beforeEach` 讓每個測試開始前，瀏覽器都先導向要測試的頁面：

```javascript
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
});
```

`page.goto` 這個做法放到任何頁面都通用：使用者設定頁、首頁，甚至是一個純靜態的行銷網站都可以，因為 Playwright 操作的終究是一個真的瀏覽器。而且這裡用的查詢方式，跟前面 Testing Library 那幾篇一直在練習的無障礙查詢（`getByRole`、`getByTestId` 這些）完全相同，前面練的那些工夫，這裡直接派上用場。

## 光是找到元素就是一種驗證，但要留意 locator 其實是惰性的

接著示範怎麼確認畫面上有計數器這個元素，再找到增加按鈕並點擊它：

```javascript
test('it has a counter', async ({ page }) => {
    page.getByTestId('counter-count');
    const incrementButton = page.getByRole('button', { name: /increment/i });

    await incrementButton.click();
});
```

這裡呼應了前面在 Testing Library 學到的概念：`getByRole`、`getByTestId` 這類查詢方法，如果找不到對應的元素就會讓測試失敗，所以光是能找到一個元素，本身就是一種驗證，不一定需要額外寫斷言。

不過這裡有個容易被忽略的細節：Playwright 的查詢方法（像 `page.getByTestId`）回傳的是一個 locator，它本身是惰性的，單純呼叫它、沒有把結果存起來、也沒有對它做任何動作或斷言，並不會讓 Playwright 真的去查詢 DOM。也就是說，上面這段程式碼裡第一行的 `page.getByTestId('counter-count');`，實際上什麼也沒驗證到，不管這個元素存不存在，這一行都不會讓測試失敗。真正會觸發 Playwright 去尋找、等待這個元素的，是後面接著對它做的動作或斷言，例如把它存進變數、再用 `expect` 斷言它是否可見：

```javascript
test('it has a counter', async ({ page }) => {
    const count = page.getByTestId('counter-count');
    const incrementButton = page.getByRole('button', { name: /increment/i });

    await expect(count).toBeVisible();
    await incrementButton.click();
});
```

## 點擊按鈕本身就是一種隱性驗證

至於後面的 `incrementButton.click()`，倒是確實發揮了隱性驗證的效果：`.click()` 是一個動作，Playwright 會實際嘗試找到這個按鈕、等待它變成可以互動的狀態才點擊下去，如果這個按鈕真的找不到或沒辦法點擊，這個動作本身就會讓測試失敗。差別就在這裡：單純呼叫一個查詢方法、放著不用，跟真正對它採取動作或斷言，是兩件不一樣的事，只有後者才會讓 Playwright 真的去檢查這個元素的狀態。

## 零重構、零 mock，直接測真正在跑的 app

整段測試下來，沒有重構任何程式碼，也沒有 mock 任何東西，就是直接開一個瀏覽器、跑過真正在運作的應用程式。代價當然是速度比單元測試慢得多，但換來的是完全不用去想該怎麼把程式碼拆開才方便測試。

## 工具沒有誰比誰好，端看要解決什麼問題

這不是「哪個工具比較好」的問題，更像是手上有一整組刀具，面對不同的情境，適合用的那一把刀也不一樣。覺得自己能放心重構程式碼、把東西拆開來測，單元測試會很好用；暫時不想或沒辦法動那些程式碼，Playwright 這種端對端測試就是另一個選項。這跟前一篇提到的，單元測試跟端對端測試是互補而非取代的關係一致。

## 複習

### 在 Playwright 測試裡，要導向特定頁面會用什麼方法？

用 page.goto() 方法導向特定的頁面

### 在 Playwright 裡該怎麼找到一個元素來測試？

可以用像 getByTestId() 這類方法，搭配特定的 test id 屬性，例如 page.getByTestId('counter-count')。Playwright 也提供其他定位元素的方法，像 getByRole()、getByText()、getByLabel()，適合不同的使用情境

### 透過 Playwright 找到元素，可以做到什麼基本的驗證？

可以驗證某個元素是否存在於頁面上，如果找不到這個元素，測試就會失敗

### 在 Playwright 裡該怎麼對一個元素執行點擊動作？

對找到的元素呼叫 .click() 方法，例如 incrementButton.click()

### Playwright 的端對端測試跟單元測試比起來，有什麼不同？

Playwright 測試比較慢，但能進行完整的瀏覽器互動，也不需要寫複雜的 mock 或重構程式碼

## 小測驗

<details>
<summary>在 Playwright 測試裡，用什麼方法導向特定頁面？</summary>
page.goto()
</details>

<details>
<summary>即使沒有明確寫斷言，Playwright 測試能提供什麼基本的驗證？</summary>
確認某個元素確實存在於頁面上
</details>

<details>
<summary>在 Playwright 裡，通常用什麼方法模擬使用者互動？</summary>
click()
</details>

<details>
<summary>在 Playwright 裡，如果用 getByTestId() 找元素卻找不到，會發生什麼事？</summary>
測試會自動失敗
</details>

<details>
<summary>跟單元測試相比，用 Playwright 做端對端測試有什麼關鍵優點？</summary>
不需要 mock 依賴，也不需要重構程式碼
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Testing Fundamentals](https://master.dev/courses/testing/) 課程筆記
