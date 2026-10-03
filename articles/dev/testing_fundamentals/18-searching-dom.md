---
title: 'Testing Library 查詢方法全貌：get、getAll、find 的差異與無障礙友善選擇器'
description: '這篇整理 Testing Library 除了 getByRole、getByTestId 外的查詢方法：用 findByAltText 找圖片、getByLabelText 靠標籤定位輸入框，並說明 get 找到多個結果會報錯、getAll 回傳陣列，find 則靠輪詢等待元素出現，處理延遲渲染的時機問題。'
date: 2026-10-01
section: dev
category: Testing Fundamentals
series: testing_fundamentals
seriesTitle: 'Testing Fundamentals'
order: 18
chapter: 'Testing the DOM'
tags:
    - frontendMasters
    - testingFundamentals
    - JavaScript
    - Vitest
    - TestingLibrary
    - Accessibility
    - ByLabelText
    - ByAltText
    - ByPlaceholderText
    - AsyncQueries
---

# Testing Library 查詢方法全貌：get、getAll、find 的差異與無障礙友善選擇器

前面幾篇已經用過 `getByRole`、`getByTestId` 這兩種查詢方式，這篇補齊 Testing Library 裡其他之後會陸續用到的選擇器，順便整理 `get`、`getAll`、`find` 這三種查詢方法之間的差異。

## 針對圖片與表單欄位的專用選擇器

除了角色跟 test id 之外，`screen` 底下還有幾個針對特定情境設計的查詢方法：

- `findByAltText`：找有 `alt` 屬性的圖片時很好用
- `getByLabelText`：只要知道欄位對應的 `label` 文字是什麼，就能直接找到那個輸入框，不需要另外替它加 test id。例如 label 寫著「street address」，就能靠這段文字直接拿到對應的輸入欄位
- `getByPlaceholderText`：找有 placeholder 文字的元素

placeholder 這個選項雖然堪用，但講師特別提醒，如果在意的是仰賴輔助工具的使用者，更好的做法是替欄位加上一個視覺上隱藏、但螢幕報讀器讀得到的 label，而不是只靠 placeholder 撐著。這點也呼應了先前提過的螢幕報讀器優先思維：查詢方式本身會反過來影響開發者怎麼寫標記，如果測試依賴 `findByPlaceholderText` 才找得到欄位，某種程度上也代表這個欄位本身在無障礙上留了一個缺口。

## get 與 getAll：找不到、找到一個、找到多個，各自的行為

`get` 系列的查詢方法會立刻從 DOM 裡尋找目標，行為很明確：只會拿到唯一一個符合條件的元素，如果同時有超過一個元素符合，會直接拋出錯誤。這個特性有時候反而有用，等於順帶驗證了頁面上不會不小心同時存在兩個一樣的東西。

如果本來就預期會有多個符合條件的元素，改用 `getAll` 就能拿到一個陣列。不管是 `getByLabelText`、`getByPlaceholderText`、`getByRole`、`getByTestId`、`getByText`、`getByTitle`，都有對應的 `getAll` 版本可以用。

## find：非同步版本的 get，專門處理「畫面還沒跑出來」的情況

`get` 系列方法會立刻去 DOM 裡查詢，如果測試當下元素確實已經掛載在頁面上，這樣完全沒問題。但畫面不一定總是在測試斷言的那一刻就緒，`find` 系列方法正是為了解決這個時機問題而設計的：它回傳的是一個 promise，會在背景輪詢，持續嘗試尋找目標元素，直到找到為止或是超過設定的等待時間才 reject。

講師提到預設的等待時間大概是幾百毫秒，不過也坦言這個數字是憑印象講的；後面小測驗提到的正確答案其實是 1 秒。不管確切數字是多少，重點在於這個等待時間是可以設定的，多數情況下用預設值就夠用。

這種「畫面可能還沒跑出來，但應該很快就會出現」的情境，常見於畫面有動畫效果、或是需要先打一次 API 拿到資料才會渲染出對應內容的場景，跟前一篇用 `act()` 處理重新渲染時機的問題屬於同一類麻煩，只是各自處理的層面不同：`act()` 確保互動之後 DOM 已經穩定下來，`find` 則是在查詢元素這一步本身就內建了等待與重試的機制。如果一個元素確定不會出現在頁面上，用 `find` 反而會讓測試白白等上一段設定好的逾時時間才失敗，這種情況下用會立即回報結果的 `get` 系列方法更划算。

## 複習

### get 和 getAll 在 Testing Library 裡有什麼差異？

get 會尋找單一元素，如果符合條件的結果超過一個就會拋出錯誤；getAll 則會把所有符合條件的元素都找出來

### find 方法有什麼獨特之處？

find 是 get 的非同步版本，會在設定好的逾時時間內（預設為 1 秒）持續輪詢、等待元素出現在頁面上，超過時間才會讓測試失敗

### Testing Library 裡有哪些常用的查詢方式？

常見的查詢方式包括 ByAltText（找有 alt 文字的圖片）、ByLabel（靠 label 文字找到對應的輸入欄位）、ByPlaceholder（找有 placeholder 文字的元素）、ByRole（依 ARIA role 尋找）、ByTestId（依 test id 尋找）、ByText（找包含特定文字的元素）、ByTitle（依 title 屬性尋找）。這些查詢方式都可以搭配 get、getAll、find 一起使用

### 為什麼會想用 findBy 系列方法，而不是 getBy 系列？

當一個元素可能因為 API 請求、動畫或其他非同步流程，還沒有立刻出現在頁面上時，findBy 系列方法能讓測試耐心等它出現，而不是立刻判定失敗

### getBy 和 findBy 查詢在 React Testing Library 裡有什麼差異？

getBy 查詢會立刻去 DOM 裡尋找元素，找不到就直接拋出錯誤；findBy 查詢則是非同步的，會在設定好的逾時時間內（預設 1 秒）持續輪詢，這在元素會因為 API 請求、動畫或其他非同步流程才出現時特別有用

## 小測驗

<details>
<summary>Testing Library 裡的「get」跟「find」選擇器，關鍵差異是什麼？</summary>
get 會立刻從 DOM 裡取出元素，find 則是非同步的，會等待元素出現
</details>

<details>
<summary>Testing Library 裡，哪個查詢方法適合用來找圖片？</summary>
findByAltText
</details>

<details>
<summary>Testing Library 裡「find」選擇器的預設逾時時間是多久？</summary>
1 秒
</details>

<details>
<summary>getByLabelText 這個選擇器，對測試表單欄位來說好用在哪裡？</summary>
不需要額外的 test id，只要靠欄位關聯的 label 文字，就能找到對應的輸入欄位
</details>

<details>
<summary>當 getBy 查詢在 DOM 裡找到超過一個符合的元素時，會發生什麼事？</summary>
會拋出錯誤
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Testing Fundamentals](https://master.dev/courses/testing/) 課程筆記
