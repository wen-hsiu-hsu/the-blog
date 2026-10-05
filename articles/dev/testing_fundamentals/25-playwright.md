---
title: 'Playwright 入門：啟動真瀏覽器模擬使用者操作整個網站，跑端對端測試補足單元測試看不到的地方'
description: '這篇介紹端對端測試工具 Playwright：它直接開一個真瀏覽器操作整個網站，跟只測單一元件的 Testing Library 不同；示範待辦清單 app 的測試範例，說明 --ui 模式怎麼看互動時間軸、挑選擇器，也點出 Playwright 比單元測試重、慢、容易偶發失敗，但能先拿到整體覆蓋率。'
date: 2026-10-05
section: dev
category: Testing Fundamentals
series: testing_fundamentals
seriesTitle: 'Testing Fundamentals'
order: 25
chapter: 'End-To-End Testing'
tags:
    - frontendMasters
    - testingFundamentals
    - JavaScript
    - Playwright
    - EndToEndTesting
    - BrowserAutomation
    - UIMode
---

# Playwright 入門：啟動真瀏覽器模擬使用者操作整個網站，跑端對端測試補足單元測試看不到的地方

進入新的章節「End-To-End Testing」，前面幾篇一直在討論怎麼把程式碼拆開來，讓單元測試更好寫。這篇換個角度：如果程式碼就是沒辦法乾淨地拆開呢？

## 不是每個程式碼庫都拆得乾淨，這沒什麼好丟臉的

現實是，時間常常不夠，程式碼也會隨著時間慢慢劣化，沒有人能拿到半年的時間把整個系統的耦合都解開重寫。即使是講師自己公開的程式碼庫，裡面也一樣有沒拆乾淨、不太想讓人細看的角落，業界也流傳過上萬行、塞滿各種邏輯的使用者控制檔案這種誇張案例。目標從來不是把每一行都拆成完美解耦、100% 覆蓋率的函式，而是盡量把壓力降到可以接受的程度：有些函式真的拆不出去，拆不出去也沒關係。這也是為什麼除了前面幾篇一直在談的單元測試，還需要另一套策略，來應付那些暫時沒辦法、或不值得花時間拆開的程式碼。

## Playwright 是什麼：開一個真的瀏覽器，操作整個網站

Playwright 做的事情很直接：啟動一個真的瀏覽器（Chrome、Firefox，甚至 Safari），把它導向要測試的網站，然後像真人使用者一樣在上面點擊、輸入、瀏覽。另一個類似的工具是 Cypress，兩者選一個順手的用即可，這系列課程選擇介紹 Playwright。

前面幾篇用 Testing Library 寫的元件測試，寫法其實跟 Playwright 看起來很像，這不是巧合，是 Testing Library 刻意設計成這樣。差別在於，Testing Library 測試的是把單一元件掛載到一個模擬出來的 DOM 環境裡，速度快、很適合驗證單一元件，但往往看不到整個應用程式串起來的樣子；Playwright 則是真的把整個網站載入一個真實瀏覽器裡跑一遍，涵蓋的範圍是整個使用者體驗，但相對重、相對慢。

## 一份實際的 Playwright 測試長什麼樣子

示範用的是一個本機跑起來的待辦清單（to-do list）應用程式，畫面上可以新增任務、把任務拖動排序、把它打勾標記完成。對應的 Playwright 測試檔案如下：

```javascript
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
});

test('it should load the page', async ({ page }) => {
    await expect(page).toHaveTitle('Task List');
});

test('it should add a task', async ({ page }) => {
    const input = page.getByLabel('Create Task');
    const submit = page.getByRole('button', { name: 'Create Task' });

    await input.fill('Learn Playwright');
    await submit.click();

    const heading = await page.getByRole('heading', { name: 'Learn Playwright' });

    await expect(heading).toBeVisible();
});
```

`test.beforeEach` 確保每個測試開始前，瀏覽器都先導向這個應用程式的網址。第一個測試只是單純確認頁面的標題符合預期。第二個測試則示範了一次完整的使用者操作：找到標籤為「Create Task」的輸入欄位跟同名的按鈕，在欄位裡填入文字、點擊按鈕，然後確認畫面上出現了一個內容對應剛剛輸入文字的標題，代表這個任務真的新增成功了。`getByLabel`、`getByRole` 這些查詢方法，跟前面用 Testing Library 時用的幾乎一模一樣。

## 用 --ui 模式看互動時間軸、挑選擇器

直接用 `npx playwright test` 執行，會在背景叫出瀏覽器跑完整套測試、產出報告。但加上 `--ui` 這個參數會打開一個更好用的介面：不只能在裡面執行所有測試，還能看到一條完整的操作時間軸，點擊事件發生的那一刻畫面上哪個元素被標示出來，也能前後切換，看看那個時間點之前、之後畫面分別是什麼樣子。

這個介面也會像 Testing Playground 那樣，針對畫面上的元素建議合適的查詢方式：可以用 placeholder 文字找、也可以用 label 文字找，諸如此類。自動建議的選擇器不一定是最好的，還是得自己判斷，但作為起點已經很有幫助。

## E2E 測試的代價，跟它真正適合的場合

這類測試又重又慢，跑起來也比單元測試容易出現偶發性的不穩定。它也不會以任何有意義的方式出現在程式碼覆蓋率報告上。但它最大的價值在於：完全不需要先把程式碼拆開、重構成容易單元測試的樣子，就能先確認整個應用程式沒有被徹底弄壞，而且跑一遍的速度比真人操作還快。如果光是「要開始拆分程式碼」這個念頭就讓人壓力很大，這種測試反而是一個很好的起點，不會逼著馬上去動那些盤根錯節的程式碼。

示範過程中也提到一個還沒解決的問題：目前這幾個測試之間，應用程式的狀態並沒有在每次測試之間清乾淨，這會是另外要處理的課題。

## 單元測試跟端對端測試是互補，不是取代

單元測試快、回饋精準，測試失敗時幾乎可以直接看出是哪一行出了問題。端對端測試慢、重，失敗時不一定能一眼看出問題出在哪，但它驗證的是真人使用者實際走一遍整個應用程式時，體驗是否正常。兩者要解決的問題不一樣，該用哪一種，取決於當下真正在意的是什麼。

## 複習

### Playwright 主要的用途是什麼？

Playwright 是一個測試工具，會啟動一個真正的瀏覽器（Chrome、Firefox、Safari），導向一個網站，模擬使用者的互動，藉此測試網頁應用程式的功能是否正常

### Playwright 跟單元測試有什麼不同？

Playwright 是透過啟動一個真正的瀏覽器，對整個應用程式進行端對端測試，而單元測試則是快速、獨立地測試個別元件或函式

### 使用 Playwright 測試有什麼優點？

Playwright 能快速驗證整個應用程式，提供視覺化的互動時間軸，支援多種瀏覽器，也能模擬跨越整個應用程式的複雜使用者互動

### Playwright 測試時能做到哪些互動？

Playwright 可以導向網頁、點擊按鈕、輸入文字，用 placeholder 或 label 這類不同的查詢方式找到並操作頁面元素，也能驗證頁面內容與行為是否符合預期

### 用 Playwright 測試複雜的應用程式，有什麼關鍵好處？

Playwright 能幫忙確認應用程式沒有被徹底弄壞，而且不需要花大量時間重構程式碼就能取得測試覆蓋，對測試複雜或歷史悠久的應用程式特別有用

## 小測驗

<details>
<summary>Playwright 測試跟單元測試有什麼差異？</summary>
Playwright 測試比較慢，但能提供整個應用程式的覆蓋範圍
</details>

<details>
<summary>Playwright 通常能測試哪些瀏覽器？</summary>
Chrome、Firefox、Safari
</details>

<details>
<summary>使用 Playwright 測試有什麼關鍵優點？</summary>
能快速驗證整個應用程式的功能是否正常
</details>

<details>
<summary>Playwright 在測試時是怎麼跟網頁應用程式互動的？</summary>
透過啟動一個瀏覽器、導向網站，並模擬使用者的互動
</details>

<details>
<summary>跟端對端瀏覽器測試相比，單元測試有什麼關鍵優點？</summary>
執行速度更快，也能提供更即時的回饋
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Testing Fundamentals](https://master.dev/courses/testing/) 課程筆記
